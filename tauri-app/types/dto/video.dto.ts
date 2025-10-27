import { z } from 'zod';

/**
 * 视频 DTO 定义
 * 包含所有视频相关的数据传输对象和验证规则
 */

// ==================== 视频基础信息 ====================

/**
 * 视频信息 DTO
 * 表示系统中的视频对象
 */
export const VideoSchema = z.object({
  id: z.string().describe('视频 ID'),
  title: z.string().min(1).describe('视频标题'),
  description: z.string().optional().describe('视频描述'),
  thumbnail: z.string().url().describe('缩略图 URL'),
  duration: z.string().describe('视频时长'),
  views: z.string().describe('观看次数'),
  uploader: z.string().describe('上传者'),
  uploadTime: z.string().datetime().describe('上传时间'),
  url: z.string().url().optional().describe('视频 URL'),
  tags: z.array(z.string()).optional().describe('标签'),
  category: z.string().optional().describe('分类'),
});

export type Video = z.infer<typeof VideoSchema>;

// ==================== 视频列表相关 ====================

/**
 * 视频列表查询参数 DTO
 */
export const VideoListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1).describe('页码'),
  pageSize: z.number().int().positive().max(100).optional().default(20).describe('每页数量'),
  category: z.string().optional().describe('分类'),
  keyword: z.string().optional().describe('搜索关键词'),
  sortBy: z.enum(['latest', 'popular', 'views']).optional().default('latest').describe('排序方式'),
});

export type VideoListParams = z.infer<typeof VideoListParamsSchema>;

/**
 * 视频列表响应 DTO
 */
export const VideoListResponseSchema = z.object({
  videos: z.array(VideoSchema),
  total: z.number().int().describe('总数'),
  page: z.number().int().describe('当前页码'),
  pageSize: z.number().int().describe('每页数量'),
  totalPages: z.number().int().describe('总页数'),
});

export type VideoListResponse = z.infer<typeof VideoListResponseSchema>;

// ==================== 视频创建/更新 ====================

/**
 * 创建视频请求 DTO
 */
export const CreateVideoRequestSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多 200 个字符'),
  description: z.string().max(2000, '描述最多 2000 个字符').optional(),
  url: z.string().url('视频 URL 格式不正确'),
  thumbnail: z.string().url('缩略图 URL 格式不正确').optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export type CreateVideoRequest = z.infer<typeof CreateVideoRequestSchema>;

/**
 * 更新视频请求 DTO
 */
export const UpdateVideoRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  thumbnail: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
}).strict();

export type UpdateVideoRequest = z.infer<typeof UpdateVideoRequestSchema>;

// ==================== 视频上传 ====================

/**
 * 视频上传响应 DTO
 */
export const VideoUploadResponseSchema = z.object({
  url: z.string().url().describe('视频 URL'),
});

export type VideoUploadResponse = z.infer<typeof VideoUploadResponseSchema>;

/**
 * 视频上传元数据 DTO
 */
export const VideoUploadMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export type VideoUploadMetadata = z.infer<typeof VideoUploadMetadataSchema>;

// ==================== 视频搜索 ====================

/**
 * 视频搜索请求 DTO
 */
export const VideoSearchRequestSchema = z.object({
  keyword: z.string().min(1, '搜索关键词不能为空'),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
  category: z.string().optional(),
  sortBy: z.enum(['latest', 'popular', 'views']).optional().default('latest'),
});

export type VideoSearchRequest = z.infer<typeof VideoSearchRequestSchema>;

// ==================== 热门/最新视频 ====================

/**
 * 热门视频请求参数 DTO
 */
export const PopularVideosParamsSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(10).describe('返回数量'),
});

export type PopularVideosParams = z.infer<typeof PopularVideosParamsSchema>;

/**
 * 最新视频请求参数 DTO
 */
export const LatestVideosParamsSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(10).describe('返回数量'),
});

export type LatestVideosParams = z.infer<typeof LatestVideosParamsSchema>;

