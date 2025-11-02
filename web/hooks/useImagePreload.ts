/**
 * 图片预加载 Hook
 * 
 * 功能：
 * 1. 预加载首屏图片
 * 2. 使用 Intersection Observer 智能预加载即将进入视口的图片
 * 3. 缓存已加载的图片
 * 4. 处理加载失败的情况
 */

import { useEffect, useRef, useCallback } from 'react';

interface PreloadOptions {
  // 预加载首屏图片数量
  priorityCount?: number;
  // 提前多少像素预加载（Intersection Observer 的 rootMargin）
  preloadMargin?: string;
  // 是否启用预加载
  enabled?: boolean;
}

// 全局缓存已加载的图片
const loadedImages = new Set<string>();

export function useImagePreload(
  imageUrls: string[],
  options: PreloadOptions = {}
) {
  const {
    priorityCount = 4,
    preloadMargin = '200px',
    enabled = true,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const preloadedRef = useRef<Set<string>>(new Set());

  // 预加载单个图片
  const preloadImage = useCallback((url: string) => {
    if (!url || loadedImages.has(url) || preloadedRef.current.has(url)) {
      return;
    }

    preloadedRef.current.add(url);

    const img = new Image();
    img.onload = () => {
      loadedImages.add(url);
      console.log(`✅ 图片预加载成功: ${url}`);
    };
    img.onerror = () => {
      console.warn(`⚠️ 图片预加载失败: ${url}`);
    };
    img.src = url;
  }, []);

  // 预加载首屏图片（优先级高）
  useEffect(() => {
    if (!enabled) return;

    // 预加载前 N 个图片
    imageUrls.slice(0, priorityCount).forEach(url => {
      preloadImage(url);
    });
  }, [imageUrls, priorityCount, enabled, preloadImage]);

  // 使用 Intersection Observer 智能预加载
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 创建 Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-src');
            if (url) {
              preloadImage(url);
            }
          }
        });
      },
      {
        rootMargin: preloadMargin,
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enabled, preloadMargin, preloadImage]);

  // 返回 observer 用于观察图片元素
  return {
    observer: observerRef.current,
    preloadImage,
    isLoaded: (url: string) => loadedImages.has(url),
  };
}

/**
 * 使用示例：
 * 
 * const imageUrls = mangas.map(m => buildCoverUrl(m.cover));
 * const { observer } = useImagePreload(imageUrls);
 * 
 * // 在 JSX 中
 * <img
 *   ref={el => el && observer?.observe(el)}
 *   data-src={coverUrl}
 *   src={coverUrl}
 * />
 */

