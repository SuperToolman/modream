/**
 * 电影 API 服务
 */

import { http } from '@/lib/http';
import type { Movie, MoviePaginationResponse, MoviePaginationRequest } from '@/types/movie';

// 电影数据缓存
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const movieDataCache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟缓存

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
  const entry = movieDataCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    movieDataCache.delete(key);
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
  movieDataCache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 数据已缓存: ${key}`);
}

/**
 * 清除所有电影数据缓存
 */
export function clearMoviesCache(): void {
  movieDataCache.clear();
  console.log('🗑️ 电影数据缓存已清空');
}

export const moviesApi = {
  /**
   * 获取电影分页列表
   * @param params 分页参数
   * @returns 电影分页响应
   */
  async getPaginated(params: MoviePaginationRequest = {}): Promise<MoviePaginationResponse> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 20;

    // 检查缓存
    const cacheKey = getCacheKey('/movies', { pageIndex, pageSize });
    const cached = getFromCache<MoviePaginationResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // 请求数据
    const data = await http.get<MoviePaginationResponse>(
      `/movies?page_index=${pageIndex}&page_size=${pageSize}`
    );

    // 存入缓存
    saveToCache(cacheKey, data);
    return data;
  },

  /**
   * 获取单个电影详情
   * @param id 电影 ID
   * @returns 电影详情
   */
  async getById(id: number): Promise<Movie> {
    return await http.get<Movie>(`/movies/${id}`);
  },

  /**
   * 根据媒体库 ID 获取电影列表
   * @param mediaLibraryId 媒体库 ID
   * @returns 电影列表
   */
  async getByMediaLibraryId(mediaLibraryId: number): Promise<Movie[]> {
    return await http.get<Movie[]>(`/media-libraries/${mediaLibraryId}/movies`);
  },

  /**
   * 删除电影
   * @param id 电影 ID
   */
  async delete(id: number): Promise<void> {
    await http.delete(`/movies/${id}`);
    // 清除缓存，因为电影已删除
    clearMoviesCache();
  },

  /**
   * 获取电影视频流 URL
   * @param id 电影 ID
   * @returns 视频流 URL
   */
  getVideoUrl(id: number): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    return `${apiUrl}/movies/${id}/video`;
  },
};

