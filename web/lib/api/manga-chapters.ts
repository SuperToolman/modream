/**
 * 漫画章节 API 服务
 */

import { http } from '@/lib/http';
import type { MangaChapter, OptimizedChapterImageListResponse } from '@/types/manga';

export const mangaChaptersApi = {
  /**
   * 获取漫画的所有章节
   * @param mangaId 漫画 ID
   * @returns 章节列表（按章节号排序）
   */
  async getByMangaId(mangaId: number): Promise<MangaChapter[]> {
    return await http.get<MangaChapter[]>(`/manga_chapter/${mangaId}/chapters`);
  },

  /**
   * 获取章节的所有图片列表（优化版本）
   * @param mangaId 漫画 ID
   * @param chapterId 章节 ID
   * @returns 优化的图片列表响应
   */
  async getImages(mangaId: number, chapterId: number): Promise<OptimizedChapterImageListResponse> {
    return await http.get<OptimizedChapterImageListResponse>(
      `/manga_chapter/${mangaId}/${chapterId}/images`
    );
  },

  /**
   * 获取章节的单个图片 URL
   * @param mangaId 漫画 ID
   * @param chapterId 章节 ID
   * @param imageIndex 图片索引
   * @returns 图片 URL
   */
  getImageUrl(mangaId: number, chapterId: number, imageIndex: number): string {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    return `${baseURL}/manga_chapter/${mangaId}/${chapterId}/images/${imageIndex}`;
  },

  /**
   * 获取章节漫画的封面 URL
   *
   * **注意：** 此接口总是返回第一章的第一张图片作为封面，不需要传递 chapterId
   *
   * @param mangaId 漫画 ID
   * @param width 缩略图宽度（默认 200）
   * @param height 缩略图高度（默认 300）
   * @param quality 图片质量 0-100（默认 85）
   * @returns 封面 URL
   */
  getCoverUrl(
    mangaId: number,
    width: number = 200,
    height: number = 300,
    quality: number = 85
  ): string {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    return `${baseURL}/manga_chapter/${mangaId}/cover?width=${width}&height=${height}&quality=${quality}`;
  },
};

