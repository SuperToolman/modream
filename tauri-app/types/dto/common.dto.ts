import { z } from 'zod';

/**
 * 通用 DTO 定义
 * 包含所有通用的数据传输对象和验证规则
 */

// ==================== API 响应 ====================

/**
 * 通用 API 成功响应 DTO
 * 匹配后端统一响应格式
 */
export const ApiSuccessResponseSchema = z.object({
  status_code: z.number().int().describe('状态码'),
  message: z.string().describe('响应消息'),
  data: z.unknown().optional().describe('响应数据'),
  is_notice: z.boolean().or(z.enum(['info', 'warning', 'error', 'success'])).optional().describe('是否显示通知'),
  is_write_log: z.boolean().optional().describe('是否写入日志'),
});

export type ApiSuccessResponse<T = unknown> = z.infer<typeof ApiSuccessResponseSchema> & {
  data?: T;
};

/**
 * 通用 API 错误响应 DTO
 * 匹配后端统一响应格式
 */
export const ApiErrorResponseSchema = z.object({
  status_code: z.number().int().describe('错误码'),
  message: z.string().describe('错误消息'),
  data: z.unknown().optional().describe('错误详情'),
  is_notice: z.boolean().or(z.enum(['info', 'warning', 'error', 'success'])).optional().describe('是否显示通知'),
  is_write_log: z.boolean().optional().describe('是否写入日志'),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// ==================== 分页 ====================

/**
 * 分页参数 DTO
 */
export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1).describe('页码'),
  pageSize: z.number().int().positive().max(100).optional().default(20).describe('每页数量'),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

/**
 * 分页响应 DTO
 */
export const PaginationResponseSchema = z.object({
  page: z.number().int().describe('当前页码'),
  pageSize: z.number().int().describe('每页数量'),
  total: z.number().int().describe('总数'),
  totalPages: z.number().int().describe('总页数'),
  hasNextPage: z.boolean().describe('是否有下一页'),
  hasPreviousPage: z.boolean().describe('是否有上一页'),
});

export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;

// ==================== 排序 ====================

/**
 * 排序参数 DTO
 */
export const SortParamsSchema = z.object({
  sortBy: z.string().optional().describe('排序字段'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc').describe('排序顺序'),
});

export type SortParams = z.infer<typeof SortParamsSchema>;

// ==================== 统计信息 ====================

/**
 * 统计信息 DTO
 */
export const StatsSchema = z.object({
  totalVideos: z.number().int().describe('总视频数'),
  totalUsers: z.number().int().describe('总用户数'),
  totalViews: z.number().int().describe('总观看数'),
});

export type Stats = z.infer<typeof StatsSchema>;

// ==================== 健康检查 ====================

/**
 * 健康检查响应 DTO
 */
export const HealthCheckResponseSchema = z.object({
  status: z.string().describe('状态'),
  timestamp: z.string().datetime().describe('时间戳'),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// ==================== 分类 ====================

/**
 * 分类列表响应 DTO
 */
export const CategoriesResponseSchema = z.array(z.string());

export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;

// ==================== 文件上传 ====================

/**
 * 文件上传响应 DTO
 */
export const FileUploadResponseSchema = z.object({
  url: z.string().url().describe('文件 URL'),
  filename: z.string().optional().describe('文件名'),
  size: z.number().int().optional().describe('文件大小'),
  mimeType: z.string().optional().describe('MIME 类型'),
});

export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;

// ==================== 消息响应 ====================

/**
 * 消息响应 DTO
 */
export const MessageResponseSchema = z.object({
  message: z.string().describe('消息内容'),
  success: z.boolean().describe('是否成功'),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;

