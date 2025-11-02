import { z } from 'zod';

/**
 * 媒体库 DTO 定义
 * 包含所有媒体库相关的数据传输对象和验证规则
 */

// ==================== 媒体库类型定义 ====================

/**
 * 媒体库类型枚举
 */
export const LibraryTypeEnum = z.enum([
  '电影', '视频', '音乐', '电视节目', '有声读物', '书籍', '游戏', '漫画', '音乐视频', '照片', '混合内容'
]);

export type LibraryType = z.infer<typeof LibraryTypeEnum>;

/**
 * 媒体库源类型
 */
export const LibrarySourceEnum = z.enum(['local', 'webdav']);

export type LibrarySource = z.infer<typeof LibrarySourceEnum>;

// ==================== 媒体库基础信息 ====================

/**
 * 媒体库信息 DTO
 * 表示系统中的媒体库对象
 * 匹配后端实际返回的数据格式
 */
export const MediaLibrarySchema = z.object({
  id: z.number().or(z.string()).describe('媒体库 ID'),
  title: z.string().min(1).describe('媒体库名称'),
  type: LibraryTypeEnum.describe('媒体库类型'),
  source: LibrarySourceEnum.describe('媒体库源类型'),
  paths_json: z.string().describe('媒体库路径 JSON 字符串'),
  cover: z.string().optional().describe('媒体库封面路径'),
  item_count: z.number().int().nonnegative().optional().describe('媒体项目数量'),
  last_scanned: z.string().optional().describe('最后扫描时间'),
  create_time: z.string().describe('创建时间'),
  update_time: z.string().describe('更新时间'),
  config: z.record(z.string(), z.any()).optional().describe('类型特定的配置（JSON 对象）'),
});

export type MediaLibrary = z.infer<typeof MediaLibrarySchema>;

// ==================== 媒体库列表 ====================

/**
 * 媒体库列表响应 DTO
 * 后端直接返回媒体库数组
 */
export const MediaLibraryListResponseSchema = z.array(MediaLibrarySchema);
export type MediaLibraryListResponse = z.infer<typeof MediaLibraryListResponseSchema>;

// ==================== 本地媒体库 ====================

/**
 * 创建本地媒体库请求 DTO
 */
export const CreateLocalLibraryRequestSchema = z.object({
  title: z.string().min(1, '名称不能为空').max(100, '名称最多 100 个字符'),
  source: z.literal('local'),
  type: LibraryTypeEnum,
  paths_json: z.string().min(1, '至少需要选择一个文件夹'),
  config: z.record(z.string(), z.any()).optional().describe('类型特定的配置（JSON 对象）'),
});

export type CreateLocalLibraryRequest = z.infer<typeof CreateLocalLibraryRequestSchema>;

// ==================== WebDAV 媒体库 ====================

/**
 * 创建 WebDAV 媒体库请求 DTO
 */
export const CreateWebDAVLibraryRequestSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称最多 100 个字符'),
  type: LibraryTypeEnum,
  url: z.string().url('URL 格式不正确'),
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
  path: z.string().optional().describe('WebDAV 路径'),
  config: z.record(z.string(), z.any()).optional().describe('类型特定的配置（JSON 对象）'),
});

export type CreateWebDAVLibraryRequest = z.infer<typeof CreateWebDAVLibraryRequestSchema>;

// ==================== 媒体库更新 ====================

/**
 * 更新媒体库请求 DTO
 */
export const UpdateMediaLibraryRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: LibraryTypeEnum.optional(),
  cover: z.string().url().optional(),
}).strict();

export type UpdateMediaLibraryRequest = z.infer<typeof UpdateMediaLibraryRequestSchema>;

