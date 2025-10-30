/**
 * 漫画相关类型定义
 */

// 漫画信息
export interface Manga {
  id: number;
  title: string;
  description: string | null;
  path: string;
  page_count: number;
  byte_size: number;
  manga_type_string: string;
  author_id: number | null;
  media_library_id: number;
  cover: string;
  create_time: string;
  update_time: string;
}

// 漫画分页响应
export interface MangaPaginationResponse {
  page_index: number;
  page_size: number;
  total: number;
  total_pages: number;
  items: Manga[];
}

// 漫画分页请求参数
export interface MangaPaginationRequest {
  page_index?: number;
  page_size?: number;
}

// 漫画图片信息
export interface MangaImage {
  index: number;
  path: string;
  url: string;
}

// 漫画图片列表响应
export interface MangaImagesResponse {
  status_code: number;
  message: string;
  data: MangaImage[];
  is_notice: boolean;
  is_write_log: boolean;
}

// 优化的图片列表响应（后端返回格式）
export interface OptimizedImageListResponse {
  count: number;
  url_template: string;
}

