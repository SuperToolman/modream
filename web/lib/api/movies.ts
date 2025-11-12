/**
 * 电影 API 服务
 */

import { http } from '@/lib/http';
import type { Movie, MoviePaginationResponse, MoviePaginationRequest } from '@/types/movie';

export const moviesApi = {
  /**
   * 获取电影分页列表
   * @param params 分页参数
   * @returns 电影分页响应
   */
  async getPaginated(params: MoviePaginationRequest = {}): Promise<MoviePaginationResponse> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 20;
    return await http.get<MoviePaginationResponse>(
      `/movies?page_index=${pageIndex}&page_size=${pageSize}`
    );
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

