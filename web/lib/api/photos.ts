import { http } from '../http';
import type {
  Photo,
  PhotoDetail,
  PhotoAlbum,
  PhotoPaginationRequest,
  PhotoPaginationResponse
} from '@/types/photo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// 照片数据缓存（参考 http.ts 的图片缓存设计）
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const photoDataCache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟缓存（数据缓存时间较短，确保数据新鲜度）

/**
 * 生成缓存键
 */
function getCacheKey(endpoint: string, params?: any): string {
  return `${endpoint}:${JSON.stringify(params || {})}`;
}

/**
 * 从缓存获取数据
 */
function getFromCache<T>(key: string): T | null {
  const entry = photoDataCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    photoDataCache.delete(key);
    console.log(`🗑️ 缓存已过期: ${key}`);
    return null;
  }

  console.log(`✅ 从缓存加载数据: ${key}`);
  return entry.data as T;
}

/**
 * 保存数据到缓存
 */
function saveToCache<T>(key: string, data: T): void {
  photoDataCache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 数据已缓存: ${key}`);
}

/**
 * 清除所有照片数据缓存
 */
export function clearPhotosCache(): void {
  photoDataCache.clear();
  console.log('🗑️ 照片数据缓存已清空');
}

/**
 * 获取缓存统计信息
 */
export function getPhotosCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: photoDataCache.size,
    keys: Array.from(photoDataCache.keys())
  };
}

export const photosApi = {
  /**
   * 获取照片分页列表
   * @param params 分页参数
   * @returns 照片分页响应
   */
  async getPaginated(params: PhotoPaginationRequest = {}): Promise<PhotoPaginationResponse> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 50;

    // 检查缓存
    const cacheKey = getCacheKey('/photos', { pageIndex, pageSize });
    const cached = getFromCache<PhotoPaginationResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // 请求数据
    const data = await http.get<PhotoPaginationResponse>(
      `/photos?page_index=${pageIndex}&page_size=${pageSize}`
    );

    // 存入缓存
    saveToCache(cacheKey, data);
    return data;
  },

  /**
   * 获取单个照片详情（包含 EXIF）
   * @param id 照片 ID
   * @returns 照片详情
   */
  async getById(id: number): Promise<PhotoDetail> {
    return await http.get<PhotoDetail>(`/photos/${id}`);
  },

  /**
   * 根据媒体库 ID 获取照片列表
   * @param mediaLibraryId 媒体库 ID
   * @param params 分页参数
   * @returns 照片分页响应
   */
  async getByMediaLibraryId(
    mediaLibraryId: number, 
    params: PhotoPaginationRequest = {}
  ): Promise<PhotoPaginationResponse> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 50;
    return await http.get<PhotoPaginationResponse>(
      `/media-libraries/${mediaLibraryId}/photos?page_index=${pageIndex}&page_size=${pageSize}`
    );
  },

  /**
   * 获取收藏的照片列表
   * @param params 分页参数
   * @returns 照片分页响应
   */
  async getFavorites(params: PhotoPaginationRequest = {}): Promise<PhotoPaginationResponse> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 50;

    // 检查缓存
    const cacheKey = getCacheKey('/photos/favorites', { pageIndex, pageSize });
    const cached = getFromCache<PhotoPaginationResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // 请求数据
    const data = await http.get<PhotoPaginationResponse>(
      `/photos/favorites?page_index=${pageIndex}&page_size=${pageSize}`
    );

    // 存入缓存
    saveToCache(cacheKey, data);
    return data;
  },

  /**
   * 根据标签获取照片列表
   * @param tag 标签名称
   * @param params 分页参数
   * @returns 照片列表
   */
  async getByTag(tag: string, params: PhotoPaginationRequest = {}): Promise<Photo[]> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 50;
    return await http.get<Photo[]>(
      `/photos/tag/${encodeURIComponent(tag)}?page_index=${pageIndex}&page_size=${pageSize}`
    );
  },

  /**
   * 切换照片收藏状态
   * @param id 照片 ID
   * @returns 更新后的照片信息
   */
  async toggleFavorite(id: number): Promise<Photo> {
    const result = await http.put<Photo>(`/photos/${id}/favorite`);
    // 清除缓存，因为收藏状态已改变
    clearPhotosCache();
    return result;
  },

  /**
   * 删除照片
   * @param id 照片 ID
   */
  async delete(id: number): Promise<void> {
    await http.delete(`/photos/${id}`);
    // 清除缓存，因为照片已删除
    clearPhotosCache();
  },

  /**
   * 获取照片原图 URL
   * @param id 照片 ID
   * @returns 图片 URL
   */
  getImageUrl(id: number): string {
    return `${API_BASE_URL}/api/photos/${id}/image`;
  },

  /**
   * 获取照片缩略图 URL
   * @param id 照片 ID
   * @returns 缩略图 URL
   */
  getThumbnailUrl(id: number): string {
    return `${API_BASE_URL}/api/photos/${id}/thumbnail`;
  },

  /**
   * 获取所有相册
   * @returns 相册列表
   */
  async getAllAlbums(): Promise<PhotoAlbum[]> {
    return await http.get<PhotoAlbum[]>('/albums');
  },

  /**
   * 获取单个相册详情
   * @param id 相册 ID
   * @returns 相册详情
   */
  async getAlbumById(id: number): Promise<PhotoAlbum> {
    return await http.get<PhotoAlbum>(`/albums/${id}`);
  },

  /**
   * 获取相册中的照片列表
   * @param albumId 相册 ID
   * @param params 分页参数
   * @returns 照片分页响应
   */
  async getPhotosByAlbum(
    albumId: number, 
    params: PhotoPaginationRequest = {}
  ): Promise<PhotoPaginationResponse> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 50;
    return await http.get<PhotoPaginationResponse>(
      `/albums/${albumId}/photos?page_index=${pageIndex}&page_size=${pageSize}`
    );
  },
};

