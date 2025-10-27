/**
 * 缓存管理工具
 * 
 * 功能：
 * 1. 管理浏览器缓存
 * 2. 管理 HTTP 图片缓存
 * 3. 管理 LocalStorage 缓存
 * 4. 提供缓存统计和清理功能
 */

import { http } from './http';

/**
 * 获取所有缓存统计
 */
export function getCacheStats() {
  const imageStats = http.getImageCacheStats();

  return {
    images: {
      count: imageStats.size,
      size: formatBytes(imageStats.totalSize),
      urls: imageStats.urls,
    },
    localStorage: {
      size: formatBytes(getLocalStorageSize()),
      items: localStorage.length,
    },
  };
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
  console.log('🧹 开始清除所有缓存...');

  // 1. 清除 HTTP 图片缓存
  http.clearImageCache();

  // 2. 清除 LocalStorage
  localStorage.clear();
  console.log('✅ LocalStorage 已清空');

  // 3. 清除 SessionStorage
  sessionStorage.clear();
  console.log('✅ SessionStorage 已清空');

  // 4. 清除浏览器缓存（如果支持）
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
      console.log('✅ 浏览器缓存已清空');
    });
  }

  console.log('✅ 所有缓存已清空');
}

/**
 * 清除图片缓存
 */
export function clearImageCache() {
  http.clearImageCache();
  console.log('✅ 图片缓存已清空');
}

/**
 * 清除特定 URL 的缓存
 */
export function clearCacheByUrl(url: string) {
  http.clearImageCacheByUrl(url);
}

/**
 * 获取 LocalStorage 大小
 */
function getLocalStorageSize(): number {
  let size = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      size += localStorage[key].length + key.length;
    }
  }
  return size;
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 打印缓存统计信息
 */
export function printCacheStats() {
  const stats = getCacheStats();
  console.group('📊 缓存统计');
  console.log('图片缓存:', stats.images);
  console.log('LocalStorage:', stats.localStorage);
  console.groupEnd();
}

/**
 * 监听缓存变化（用于调试）
 */
export function watchCacheChanges() {
  if (typeof window === 'undefined') return;

  // 监听 LocalStorage 变化
  window.addEventListener('storage', (e) => {
    console.log('💾 LocalStorage 已变化:', e.key, e.newValue);
  });

  console.log('👁️ 缓存监听已启用');
}

