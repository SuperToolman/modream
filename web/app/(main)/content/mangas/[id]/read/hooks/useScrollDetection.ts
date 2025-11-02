import { useEffect, useCallback, useRef } from 'react';

interface UseScrollDetectionProps {
    readingMode: 'single' | 'double' | 'scroll';
    currentPage: number;
    totalPages: number;
    mangaId: number;
    onPageChange: (page: number) => void;
}

export function useScrollDetection({
    readingMode,
    currentPage,
    totalPages,
    mangaId,
    onPageChange,
}: UseScrollDetectionProps) {
    const prevReadingMode = useRef(readingMode);

    // 滚动到指定页面（滚动模式）
    const scrollToPage = useCallback((pageNumber: number) => {
        if (readingMode !== 'scroll') return;

        const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLElement;
        if (!scrollContainer) return;

        const scrollPercentage = (pageNumber - 1) / Math.max(totalPages - 1, 1);
        const targetScrollTop = scrollPercentage * (scrollContainer.scrollHeight - scrollContainer.clientHeight);

        scrollContainer.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
    }, [readingMode, totalPages]);

    // 使用 Intersection Observer 检测当前可见的图片
    useEffect(() => {
        if (readingMode !== 'scroll') return;

        const observer = new IntersectionObserver(
            (entries) => {
                // 找到最可见的图片（intersection ratio 最大的）
                let mostVisibleEntry = entries[0];
                let maxRatio = 0;

                entries.forEach(entry => {
                    if (entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        mostVisibleEntry = entry;
                    }
                });

                if (mostVisibleEntry && mostVisibleEntry.intersectionRatio > 0.3) {
                    const imageIndex = parseInt(mostVisibleEntry.target.getAttribute('data-page-index') || '0');
                    const newPage = imageIndex + 1;

                    if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
                        onPageChange(newPage);
                        // 更新URL
                        const newUrl = `/content/mangas/${mangaId}/read/?page=${newPage}`;
                        window.history.replaceState({}, '', newUrl);
                    }
                }
            },
            {
                root: document.querySelector('[data-scroll-container]'),
                rootMargin: '-20% 0px -20% 0px',
                threshold: [0.1, 0.3, 0.5, 0.7, 0.9]
            }
        );

        // 观察所有图片
        const imageElements = document.querySelectorAll('[data-page-index]');
        imageElements.forEach(img => observer.observe(img));

        return () => {
            observer.disconnect();
        };
    }, [readingMode, currentPage, totalPages, mangaId, onPageChange]);

    // 切换阅读模式时同步页面位置（只在模式切换时触发）
    useEffect(() => {
        // 只有当模式从非滚动切换到滚动时才自动滚动
        if (readingMode === 'scroll' && prevReadingMode.current !== 'scroll') {
            setTimeout(() => {
                scrollToPage(currentPage);
            }, 100);
        }
        prevReadingMode.current = readingMode;
    }, [readingMode, scrollToPage, currentPage]);
}

