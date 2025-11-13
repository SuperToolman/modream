/**
 * 照片相关类型定义
 */

// 照片信息
export interface Photo {
  id: number;
  create_time: string;
  update_time: string;
  path: string;
  byte_size: number;
  formatted_size: string;
  resolution: string | null;
  extension: string | null;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  hash: string | null;
  is_deleted: boolean;
  is_favorite: boolean;
  tags: string[] | null;
  media_library_id: number;
}

// 照片 EXIF 信息
export interface PhotoExif {
  camera_make: string | null;
  camera_model: string | null;
  software: string | null;
  f_number: number | null;
  exposure_time: string | null;
  iso_speed: number | null;
  focal_length: number | null;
  focal_length_in_35mm: number | null;
  lens_make: string | null;
  lens_model: string | null;
  flash: string | null;
  white_balance: string | null;
  exposure_mode: string | null;
  exposure_program: string | null;
  metering_mode: string | null;
  scene_capture_type: string | null;
  date_time_original: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_altitude: number | null;
  image_width: number | null;
  image_height: number | null;
  orientation: number | null;
  color_space: string | null;
  resolution_unit: string | null;
  x_resolution: number | null;
  y_resolution: number | null;
  has_gps: boolean;
  has_thumbnail: boolean;
}

// 照片详细信息（包含 EXIF）
export interface PhotoDetail extends Photo {
  exif: PhotoExif | null;
}

// 照片相册信息
export interface PhotoAlbum {
  id: number;
  name: string;
  description: string | null;
  cover_photo_id: number | null;
  sort_order: number;
  is_system_album: boolean;
  is_private: boolean;
  created_time: string;
  updated_time: string;
  photo_count: number | null;
}

// 照片分页响应
export interface PhotoPaginationResponse {
  page_index: number;
  page_size: number;
  total: number;
  total_pages: number;
  items: Photo[];
}

// 照片分页请求参数
export interface PhotoPaginationRequest {
  page_index?: number;
  page_size?: number;
}

// 视图模式
export type PhotoViewMode = 'grid' | 'masonry' | 'list';

// 排序方式
export type PhotoSortBy = 'date' | 'name' | 'size' | 'favorite';

