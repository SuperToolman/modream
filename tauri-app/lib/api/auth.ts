/**
 * 认证相关 API
 * 处理用户登录、注册、登出等认证功能
 */

import { http } from '../http';
import * as DTOs from '@/types/dto';
import { validateLoginResponse } from '../validators';

// 类型别名
type LoginRequest = DTOs.LoginRequest;
type LoginResponse = DTOs.LoginResponse;
type RegisterRequest = DTOs.RegisterRequest;
type User = DTOs.User;

/**
 * 认证 API 服务
 */
export const authApi = {
  /**
   * 用户登录
   * @param data 登录请求数据
   * @returns 登录响应（包含 token 和用户信息）
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await http.post<LoginResponse>('/auth/login', data);

    // 调试：打印实际响应
    console.log('📦 Login Response:', response);

    // 验证响应数据
    const validation = validateLoginResponse(response);
    if (!validation.success || !validation.data) {
      console.error('❌ Validation Error:', validation.error);
      console.error('❌ Response Structure:', JSON.stringify(response, null, 2));
      throw new Error(`登录响应验证失败: ${validation.error}`);
    }

    // 登录成功后保存token
    if (validation.data.token) {
      http.setToken(validation.data.token, true); // 持久化保存
    }

    return validation.data;
  },

  /**
   * 用户注册
   * @param data 注册请求数据
   * @returns 用户信息
   */
  async register(data: RegisterRequest): Promise<User> {
    return await http.post<User>('/auth/register', data);
  },

  /**
   * 用户登出
   * 清除本地保存的 token
   */
  async logout(): Promise<void> {
    await http.post('/auth/logout');
    http.clearToken();
  },

  /**
   * 获取当前用户信息
   * @returns 当前登录用户的信息
   */
  async getCurrentUser(): Promise<User> {
    return await http.get<User>('/auth/me');
  },
};

// 导出类型
export type { LoginRequest, LoginResponse, RegisterRequest, User };

