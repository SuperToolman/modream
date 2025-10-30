import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 标准响应数据类型（后端统一格式）
export interface ApiResponse<T = any> {
  status_code: number;
  message: string;
  data?: T;
  is_notice?: boolean | 'info' | 'warning' | 'error' | 'success';
  is_write_log?: boolean;
}

// 请求配置类型
export interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  retryCount?: number;
}

// 错误类型
export interface ApiError {
  code: number;
  message: string;
  details?: any;
  notificationType?: 'info' | 'warning' | 'error' | 'success';
}

// 图片缓存存储
const imageCache = new Map<string, { data: Blob; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 天

class HttpClient {
  private instance: AxiosInstance;
  private baseURL: string;
  private timeout: number;

  constructor() {
    // 根据环境设置基础URL
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    this.timeout = 300000; // 5分钟超时（创建媒体库需要扫描文件，可能需要较长时间）

    // 创建axios实例
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 设置拦截器
    this.setupInterceptors();
  }

  // 设置请求和响应拦截器
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证token
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加请求ID用于追踪
        config.headers['X-Request-ID'] = this.generateRequestId();

        console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
          params: config.params,
          data: config.data,
        });

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ [${response.status}] ${response.config.url}`, response.data);

        // 检查是否是自定义响应格式
        const data = response.data;
        if (data && typeof data === 'object' && 'status_code' in data) {
          // 自定义响应格式处理
          const customResponse = data as ApiResponse;

          // 如果状态码表示错误，抛出错误
          if (customResponse.status_code >= 400) {
            const error: ApiError = {
              code: customResponse.status_code,
              message: customResponse.message,
              details: customResponse,
              notificationType: this.getNotificationType(customResponse.is_notice),
            };

            // 触发通知事件
            if (customResponse.is_notice !== false) {
              this.triggerNotification(error);
            }

            return Promise.reject(error);
          }

          // 成功响应，触发成功通知（如果配置了）
          if (customResponse.is_notice === 'success') {
            this.triggerNotification({
              code: customResponse.status_code,
              message: customResponse.message,
              notificationType: 'success',
            });
          }
        }

        return response;
      },
      (error: AxiosError) => {
        const url = error.config?.url || 'unknown';
        const method = error.config?.method?.toUpperCase() || 'unknown';
        const status = error.response?.status || 'unknown';
        const responseData = error.response?.data;

        console.error(`❌ [${method}] ${url} [${status}]`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: responseData,
          message: error.message,
        });

        return this.handleError(error);
      }
    );
  }

  // 获取token
  private getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    // 从 Cookie 中获取 token（中间件可以读取）
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        return decodeURIComponent(value);
      }
    }

    return null;
  }

  // 生成请求ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // 获取通知类型
  private getNotificationType(isNotice?: boolean | string): 'info' | 'warning' | 'error' | 'success' {
    if (typeof isNotice === 'string') {
      if (['info', 'warning', 'error', 'success'].includes(isNotice)) {
        return isNotice as 'info' | 'warning' | 'error' | 'success';
      }
    }
    return 'info';
  }

  // 触发通知事件
  private triggerNotification(error: ApiError): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('api-notification', {
        detail: {
          type: error.notificationType || 'error',
          code: error.code,
          message: error.message,
          title: `[${error.code}] ${error.message}`,
        },
      });
      window.dispatchEvent(event);
    }
  }

  // 错误处理
  private handleError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      code: error.response?.status || 0,
      message: '网络请求失败',
      details: error.response?.data,
    };

    // 首先尝试从后端响应中获取错误信息
    const responseData = error.response?.data as any;
    if (responseData) {
      // 如果是自定义响应格式
      if (responseData.message) {
        apiError.message = responseData.message;
      }
      // 如果有其他错误字段
      if (responseData.error) {
        apiError.message = responseData.error;
      }
      if (responseData.msg) {
        apiError.message = responseData.msg;
      }
    }

    // 根据状态码处理不同错误
    switch (error.response?.status) {
      case 400:
        if (!apiError.message || apiError.message === '网络请求失败') {
          apiError.message = '请求参数错误';
        }
        break;
      case 401:
        apiError.message = '未授权，请重新登录';
        this.handleUnauthorized();
        break;
      case 403:
        if (!apiError.message || apiError.message === '网络请求失败') {
          apiError.message = '权限不足';
        }
        break;
      case 404:
        if (!apiError.message || apiError.message === '网络请求失败') {
          apiError.message = '请求的资源不存在';
        }
        break;
      case 405:
        if (!apiError.message || apiError.message === '网络请求失败') {
          apiError.message = '请求方法不允许（Method Not Allowed）';
        }
        break;
      case 500:
        if (!apiError.message || apiError.message === '网络请求失败') {
          apiError.message = '服务器内部错误';
        }
        break;
      case 502:
        if (!apiError.message || apiError.message === '网络请求失败') {
          apiError.message = '网关错误';
        }
        break;
      case 503:
        if (!apiError.message || apiError.message === '网络请求失败') {
          apiError.message = '服务不可用';
        }
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          apiError.message = '请求超时';
        } else if (error.message === 'Network Error') {
          apiError.message = '网络连接失败';
        }
    }

    // 触发通知事件
    this.triggerNotification(apiError);

    return Promise.reject(apiError);
  }

  // 处理未授权
  private handleUnauthorized() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // 可以在这里添加跳转到登录页的逻辑
      // window.location.href = '/login';
    }
  }

  // 提取响应数据
  private extractData<T>(response: AxiosResponse<any>): T {
    const data = response.data;

    // 如果是自定义响应格式（有 status_code 字段）
    if (data && typeof data === 'object' && 'status_code' in data) {
      return data.data as T;
    }

    // 否则假设是标准 ApiResponse 格式
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data as T;
    }

    // 直接返回响应数据
    return data as T;
  }

  // 获取完整 URL
  private getFullUrl(url: string): string {
    return url.startsWith('http') ? url : `${this.baseURL}${url}`;
  }

  // 检查是否是图片 URL
  private isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url) || url.includes('/cover');
  }

  // 从缓存获取图片
  private getImageFromCache(url: string): Blob | null {
    const cached = imageCache.get(url);
    if (!cached) return null;

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      imageCache.delete(url);
      return null;
    }

    return cached.data;
  }

  // 保存图片到缓存
  private saveImageToCache(url: string, data: Blob): void {
    imageCache.set(url, {
      data,
      timestamp: Date.now(),
    });
    console.log(`💾 图片已缓存: ${url}`);
  }

  // GET请求
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const fullUrl = this.getFullUrl(url);

    // 如果是图片请求，检查缓存
    if (this.isImageUrl(url)) {
      const cached = this.getImageFromCache(fullUrl);
      if (cached) {
        console.log(`✅ 从缓存加载图片: ${url}`);
        return cached as any;
      }
    }

    const response = await this.instance.get<any>(url, {
      ...config,
      // 图片请求返回 blob
      ...(this.isImageUrl(url) && { responseType: 'blob' }),
    });

    // 如果是图片，保存到缓存
    if (this.isImageUrl(url) && response.data instanceof Blob) {
      this.saveImageToCache(fullUrl, response.data);
    }

    return this.extractData<T>(response);
  }

  // POST请求
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.instance.post<any>(url, data, config);
    return this.extractData<T>(response);
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.instance.put<any>(url, data, config);
    return this.extractData<T>(response);
  }

  // DELETE请求
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.instance.delete<any>(url, config);
    return this.extractData<T>(response);
  }

  // PATCH请求
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.instance.patch<any>(url, data, config);
    return this.extractData<T>(response);
  }

  // 上传文件
  async upload<T = any>(url: string, file: File, config?: RequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.instance.post<any>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });

    return this.extractData<T>(response);
  }

  // 下载文件
  async download(url: string, filename?: string, config?: RequestConfig): Promise<void> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    });

    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // 设置token
  setToken(token: string, persistent: boolean = false) {
    if (typeof window === 'undefined') {
      return;
    }

    // 设置 Cookie（中间件可以读取）
    // 如果 persistent 为 true，设置 7 天过期
    // 否则设置为会话 Cookie（浏览器关闭时删除）
    const maxAge = persistent ? 7 * 24 * 60 * 60 : undefined;
    const expires = maxAge ? new Date(Date.now() + maxAge * 1000).toUTCString() : '';

    document.cookie = `token=${encodeURIComponent(token)}; path=/; ${expires ? `expires=${expires};` : ''} SameSite=Lax`;

    console.log('✅ Token 已保存到 Cookie');
  }

  // 清除token
  clearToken() {
    if (typeof window === 'undefined') {
      return;
    }

    // 删除 Cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';

    console.log('✅ Token 已从 Cookie 中删除');
  }

  // 获取原始axios实例（用于特殊需求）
  getInstance(): AxiosInstance {
    return this.instance;
  }

  // 清除所有图片缓存
  clearImageCache(): void {
    imageCache.clear();
    console.log('🗑️ 图片缓存已清空');
  }

  // 清除特定图片缓存
  clearImageCacheByUrl(url: string): void {
    const fullUrl = this.getFullUrl(url);
    imageCache.delete(fullUrl);
    console.log(`🗑️ 已清除缓存: ${url}`);
  }

  // 获取缓存统计
  getImageCacheStats(): {
    size: number;
    urls: string[];
    totalSize: number;
  } {
    let totalSize = 0;
    const urls: string[] = [];

    imageCache.forEach((value, key) => {
      urls.push(key);
      totalSize += value.data.size;
    });

    return {
      size: imageCache.size,
      urls,
      totalSize,
    };
  }
}

// 创建并导出实例
export const http = new HttpClient();

// 所有类型已通过 interface 和 class 导出
