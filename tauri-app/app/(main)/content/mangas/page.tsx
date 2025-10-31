'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@heroui/react';
import MangaCard from '@/components/cards/manga-card';
import ResponsiveGrid from '@/components/layouts/responsive-grid';
import { api } from '@/lib/api';
import { preloadPriority } from '@/lib/imagePreloader';
import type { Manga } from '@/types/manga';

const PAGE_SIZE = 50;

export default function Mangas() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载漫画列表
  useEffect(() => {
    const loadMangas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.mangas.getPaginated({
          page_index: currentPage,
          page_size: PAGE_SIZE,
        });
        setMangas(response.items || []);
        setTotalPages(response.total_pages || 1);

        // 预加载首屏图片
        if (response.items && response.items.length > 0) {
          const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
          // 使用 manga.cover 字段（已根据漫画类型存储了正确的路径）
          const imageUrls = response.items
            .filter(item => item.cover) // 过滤掉没有 cover 的漫画
            .map(item =>
              `${baseURL}${item.cover}?width=200&height=300&quality=85`
            );

          // 异步预加载，不阻塞页面渲染
          preloadPriority(imageUrls, 4).catch(err => {
            console.warn('图片预加载出错:', err);
          });
        }
      } catch (err: any) {
        console.error('加载漫画失败:', err);
        setError(err.message || '加载漫画失败');
      } finally {
        setLoading(false);
      }
    };

    loadMangas();
  }, [currentPage]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">加载失败: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* 漫画网格容器 - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : mangas.length > 0 ? (
          <div className="p-8 pb-32">
            <ResponsiveGrid minItemWidth={240} gap={24}>
              {mangas.map((manga, index) => {
                // 构建完整的 cover URL
                // 使用 manga.cover 字段（已根据漫画类型存储了正确的路径）
                const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
                const coverUrl = manga.cover
                  ? `${baseURL}${manga.cover}?width=200&height=300&quality=85`
                  : undefined;

                // 前 4 个卡片设置为优先加载（首屏）
                const isPriority = index < 4;

                return (
                  <MangaCard
                    key={manga.id}
                    id={String(manga.id)}
                    title={manga.title}
                    cover_url={coverUrl}
                    page_count={manga.page_count}
                    author_id={manga.author_id}
                    author_name={undefined} // 后端暂未提供，预留扩展
                    priority={isPriority}
                  />
                );
              })}
            </ResponsiveGrid>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-gray-500">暂无漫画</div>
          </div>
        )}
      </div>

      {/* 分页组件 - 固定在内容区域底部 */}
      {totalPages > 1 && (
        <div className="rounded-2xl absolute bottom-0 left-0 right-0 flex justify-center py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 shadow-lg z-40">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            color="primary"
          />
        </div>
      )}
    </div>
  );
}