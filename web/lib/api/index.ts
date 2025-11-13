/**
 * API 模块统一导出
 *
 * 使用方式：
 * import { authApi, userApi, videoApi, settingsApi, commonApi, media_librariesApi } from '@/lib/api';
 *
 * // 或者使用统一的 api 对象
 * import { api } from '@/lib/api';
 * api.auth.login(...)
 * api.user.updateUser(...)
 * api.video.getVideoList(...)
 * api.settings.getUserSettings(...)
 * api.common.getCategories(...)
 * api.mediaLibraries.getAll(...)
 */

// 导入各个模块
import { authApi } from './auth';
import { userApi } from './user';
import { videoApi } from './video';
import { settingsApi } from './settings';
import { commonApi } from './common';
import { media_librariesApi } from './media_libraries';
import { mangasApi } from './mangas';
import { mangaChaptersApi } from './manga-chapters';
import { gamesApi } from './games';
import { moviesApi } from './movies';
import { photosApi } from './photos';

// 导出各个模块
export { authApi } from './auth';
export { userApi } from './user';
export { videoApi } from './video';
export { settingsApi } from './settings';
export { commonApi } from './common';
export { media_librariesApi } from './media_libraries';
export { mangasApi } from './mangas';
export { mangaChaptersApi } from './manga-chapters';
export { gamesApi } from './games';
export { moviesApi } from './movies';
export { photosApi } from './photos';

// 创建统一的 API 对象
export const api = {
  auth: authApi,
  user: userApi,
  video: videoApi,
  settings: settingsApi,
  common: commonApi,
  mediaLibraries: media_librariesApi,
  mangas: mangasApi,
  mangaChapters: mangaChaptersApi,
  games: gamesApi,
  movies: moviesApi,
  photos: photosApi,
};

