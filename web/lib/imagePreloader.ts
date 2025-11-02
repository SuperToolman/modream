/**
 * 图片预加载工具函数
 * 
 * 简单易用的图片预加载方案
 */

// 全局缓存
const preloadCache = new Set<string>();

/**
 * 预加载单个图片
 * @param url 图片 URL
 * @returns Promise<boolean> 是否加载成功
 */
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    // 如果已经加载过，直接返回
    if (preloadCache.has(url)) {
      resolve(true);
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      preloadCache.add(url);
      console.log(`✅ 图片预加载成功: ${url}`);
      resolve(true);
    };
    
    img.onerror = () => {
      console.warn(`⚠️ 图片预加载失败: ${url}`);
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * 批量预加载图片
 * @param urls 图片 URL 数组
 * @returns Promise<number> 成功加载的图片数量
 */
export async function preloadImages(urls: string[]): Promise<number> {
  const results = await Promise.all(
    urls.map(url => preloadImage(url))
  );
  return results.filter(Boolean).length;
}

/**
 * 预加载前 N 个图片（用于首屏优化）
 * @param urls 图片 URL 数组
 * @param count 预加载数量
 */
export async function preloadPriority(
  urls: string[],
  count: number = 4
): Promise<void> {
  const priorityUrls = urls.slice(0, count);
  console.log(`🔄 预加载前 ${count} 个图片...`);
  await preloadImages(priorityUrls);
  console.log(`✅ 首屏图片预加载完成`);
}

/**
 * 检查图片是否已加载
 * @param url 图片 URL
 */
export function isImageLoaded(url: string): boolean {
  return preloadCache.has(url);
}

/**
 * 清空预加载缓存
 */
export function clearPreloadCache(): void {
  preloadCache.clear();
  console.log('🗑️ 预加载缓存已清空');
}

/**
 * 获取缓存统计
 */
export function getPreloadStats(): {
  cached: number;
  urls: string[];
} {
  return {
    cached: preloadCache.size,
    urls: Array.from(preloadCache),
  };
}

