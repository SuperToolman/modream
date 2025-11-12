/**
 * 电影相关类型定义
 */

// 电影信息
export interface Movie {
  id: number;
  create_time: string;
  update_time: string;
  title: string;
  original_title: string | null;
  description: string | null;
  path: string;
  byte_size: number;
  formatted_size: string;
  extension: string | null;
  duration: number;
  formatted_duration: string;
  width: number;
  height: number;
  resolution: string | null;
  release_date: string | null;
  rating: number;
  votes: number;
  genres: string[] | null;
  actors: string[] | null;
  directors: string[] | null;
  writers: string[] | null;
  producers: string[] | null;
  tags: string[] | null;
  poster_urls: string[] | null;
  cover: string | null;
  media_library_id: number;
}

// 电影分页响应
export interface MoviePaginationResponse {
  page_index: number;
  page_size: number;
  total: number;
  total_pages: number;
  items: Movie[];
}

// 电影分页请求参数
export interface MoviePaginationRequest {
  page_index?: number;
  page_size?: number;
}

