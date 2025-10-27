/**
 * 漫画 API 服务
 */

import { http } from '@/lib/http';
import type { Manga, MangaPaginationResponse, MangaPaginationRequest, MangaImage, MangaImagesResponse } from '@/types/manga';

export const mangasApi = {
  /**
   * 获取漫画分页列表
   * @param params 分页参数
   * @returns 漫画分页响应
   */
  async getPaginated(params: MangaPaginationRequest = {}): Promise<MangaPaginationResponse> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 10;
    return await http.get<MangaPaginationResponse>(
      `/manga?page_index=${pageIndex}&page_size=${pageSize}`
    );
  },

  /**
   * 获取单个漫画详情
   * @param id 漫画 ID
   * @returns 漫画详情
   */
  async getById(id: number): Promise<Manga> {
    return await http.get<Manga>(`/manga/${id}`);
  },

  /**
   * 获取漫画的所有图片列表
   * @param id 漫画 ID
   * @returns 漫画图片列表
   */
  async getImages(id: number): Promise<MangaImage[]> {
    // http.get 会自动提取 response.data.data，所以这里 response 就是 MangaImage[]
    const response = await http.get<MangaImage[]>(`/manga/${id}/images`);
    return Array.isArray(response) ? response : [];
  },

  /**
   * 获取漫画的单个图片 URL
   * @param mangaId 漫画 ID
   * @param imageIndex 图片索引
   * @returns 图片 URL
   */
  getImageUrl(mangaId: number, imageIndex: number): string {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    return `${baseURL}/manga/${mangaId}/images/${imageIndex}`;
  },
};

