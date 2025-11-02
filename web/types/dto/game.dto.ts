import { z } from 'zod';

/**
 * 游戏 DTO 定义
 * 包含所有游戏相关的数据传输对象和验证规则
 * 
 * 对应后端：application/src/dto/game.rs
 */

// ==================== 游戏基础信息 ====================

/**
 * 游戏信息 DTO
 * 对应后端的 GameInfo 结构
 */
export const GameInfoSchema = z.object({
  id: z.number().int().describe('游戏 ID'),
  create_time: z.string().describe('创建时间'),
  update_time: z.string().describe('更新时间'),
  title: z.string().min(1).describe('游戏标题'),
  sub_title: z.string().optional().nullable().describe('游戏子标题'),
  covers: z.array(z.string()).optional().nullable().describe('游戏封面列表'),
  version: z.string().optional().nullable().describe('游戏版本'),
  root_path: z.string().describe('游戏根目录'),
  start_paths: z.array(z.string()).describe('启动路径列表'),
  start_path_default: z.string().optional().nullable().describe('默认启动路径'),
  start_item_count: z.number().int().describe('启动项数量'),
  description: z.string().describe('游戏描述'),
  release_date: z.string().describe('游戏发行时间'),
  developer: z.string().optional().nullable().describe('开发商'),
  publisher: z.string().optional().nullable().describe('发行商'),
  tabs: z.array(z.string()).optional().nullable().describe('游戏标签'),
  platform: z.string().optional().nullable().describe('游戏平台'),
  byte_size: z.number().int().describe('游戏字节大小'),
  formatted_size: z.string().describe('格式化后的文件大小'),
  media_library_id: z.number().int().describe('所属媒体库 ID'),
});

export type GameInfo = z.infer<typeof GameInfoSchema>;

// ==================== 游戏列表请求 ====================

/**
 * 游戏分页请求参数
 */
export const GamePaginationRequestSchema = z.object({
  page_index: z.number().int().min(1).default(1).describe('页码（从 1 开始）'),
  page_size: z.number().int().min(1).max(100).default(20).describe('每页数量'),
}).partial();

export type GamePaginationRequest = z.infer<typeof GamePaginationRequestSchema>;

/**
 * 游戏分页响应
 */
export const GamePaginationResponseSchema = z.object({
  page_index: z.number().int().describe('当前页码'),
  page_size: z.number().int().describe('每页数量'),
  total: z.number().int().describe('总记录数'),
  total_pages: z.number().int().describe('总页数'),
  items: z.array(GameInfoSchema).describe('游戏列表'),
});

export type GamePaginationResponse = z.infer<typeof GamePaginationResponseSchema>;

// ==================== 创建游戏请求 ====================

/**
 * 创建游戏请求 DTO
 */
export const CreateGameRequestSchema = z.object({
  title: z.string().min(1).max(200).describe('游戏标题'),
  sub_title: z.string().optional().describe('游戏子标题'),
  covers: z.string().optional().describe('游戏封面列表（JSON 数组）'),
  version: z.string().optional().describe('游戏版本'),
  root_path: z.string().min(1).describe('游戏根目录'),
  start_paths: z.string().describe('启动路径列表（JSON 数组）'),
  start_path_default: z.string().optional().describe('默认启动路径'),
  start_item_count: z.number().int().min(0).describe('启动项数量'),
  description: z.string().describe('游戏描述'),
  release_date: z.string().describe('游戏发行时间'),
  developer: z.string().optional().describe('开发商'),
  publisher: z.string().optional().describe('发行商'),
  tabs: z.string().optional().describe('游戏标签（JSON 数组）'),
  platform: z.string().optional().describe('游戏平台'),
  byte_size: z.number().int().min(0).describe('游戏字节大小'),
  media_library_id: z.number().int().describe('所属媒体库 ID'),
});

export type CreateGameRequest = z.infer<typeof CreateGameRequestSchema>;

// ==================== 扫描游戏请求 ====================

/**
 * 扫描游戏请求 DTO
 */
export const ScanGamesRequestSchema = z.object({
  path: z.string().min(1).describe('要扫描的路径'),
  providers: z.string().min(1).describe('游戏数据库提供者列表（如 "IGDB,DLSITE,STEAMDB"）'),
  media_library_id: z.number().int().describe('所属媒体库 ID'),
});

export type ScanGamesRequest = z.infer<typeof ScanGamesRequestSchema>;

// ==================== 启动游戏请求 ====================

/**
 * 启动游戏请求 DTO
 */
export const LaunchGameRequestSchema = z.object({
  start_path: z.string().optional().describe('启动路径（可选，如果不提供则使用默认启动路径）'),
});

export type LaunchGameRequest = z.infer<typeof LaunchGameRequestSchema>;

// ==================== 更新默认启动路径请求 ====================

/**
 * 更新默认启动路径请求 DTO
 */
export const UpdateDefaultStartPathRequestSchema = z.object({
  start_path_default: z.string().min(1).describe('默认启动路径'),
});

export type UpdateDefaultStartPathRequest = z.infer<typeof UpdateDefaultStartPathRequestSchema>;

// ==================== 验证函数 ====================

/**
 * 验证游戏信息响应
 */
export function validateGameInfo(data: unknown) {
  return GameInfoSchema.safeParse(data);
}

/**
 * 验证游戏分页响应
 */
export function validateGamePaginationResponse(data: unknown) {
  return GamePaginationResponseSchema.safeParse(data);
}

/**
 * 验证创建游戏请求
 */
export function validateCreateGameRequest(data: unknown) {
  return CreateGameRequestSchema.safeParse(data);
}

/**
 * 验证扫描游戏请求
 */
export function validateScanGamesRequest(data: unknown) {
  return ScanGamesRequestSchema.safeParse(data);
}

