/**
 * API 统一导出文件
 *
 * 为了保持向后兼容性，这个文件重新导出所有模块化的 API
 *
 * 使用方式：
 *
 * 方式 1：使用统一的 api 对象（推荐）
 * import { api } from '@/lib/api';
 * api.auth.login(...)
 * api.user.updateUser(...)
 * api.video.getVideoList(...)
 * api.mediaLibraries.getAll(...)
 *
 * 方式 2：直接导入具体模块
 * import { authApi, userApi, videoApi, media_librariesApi } from '@/lib/api';
 * authApi.login(...)
 * userApi.updateUser(...)
 * videoApi.getVideoList(...)
 * media_librariesApi.getAll(...)
 */

// 导出所有 API 模块和统一的 API 对象
export { authApi, userApi, videoApi, settingsApi, commonApi, media_librariesApi, api } from './api/index';

// 导出所有类型
export type * from '@/types/dto';
