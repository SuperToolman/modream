/**
 * 漫画 API 服务
 */

import { http } from '@/lib/http';
import type { Manga, MangaPaginationResponse, MangaPaginationRequest, MangaImage, OptimizedImageListResponse } from '@/types/manga';

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
   * @deprecated 推荐直接使用 manga.page_count 和 getImageUrl() 生成图片列表，避免额外的 API 调用
   */
  async getImages(id: number): Promise<MangaImage[]> {
    // 后端返回的是优化格式：{ count: number, url_template: string }
    const response = await http.get<OptimizedImageListResponse>(`/manga/${id}/images`);

    // 将优化格式转换为 MangaImage[] 数组
    if (response && typeof response.count === 'number' && response.url_template) {
      const images: MangaImage[] = [];
      for (let i = 0; i < response.count; i++) {
        images.push({
          index: i,
          path: '', // 路径信息不需要，前端只使用 URL
          url: response.url_template.replace('{index}', i.toString()),
        });
      }
      return images;
    }

    return [];
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

