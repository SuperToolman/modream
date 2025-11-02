'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { mangasApi } from '@/lib/api/mangas';
import {
    ReadingControls,
    SinglePageView,
    DoublePageView,
    ScrollView,
    LoadingState,
    ErrorState,
} from './components';
import {
    useMangaData,
    usePageNavigation,
    useKeyboardNavigation,
    useScrollDetection,
    useImageZoom
} from './hooks';

export default function Read() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const mangaId = parseInt(params.id as string, 10);
    const currentPageParam = parseInt(searchParams.get('page') || '1');
    const chapterIdParam = searchParams.get('chapter') ? parseInt(searchParams.get('chapter')!, 10) : null;

    // 使用自定义 Hooks
    const { manga, chapters, currentChapter, images, loading, error, setCurrentChapter } = useMangaData({
        mangaId,
        chapterId: chapterIdParam,
    });
    const { currentPage, setCurrentPage, handlePrevPage, handleNextPage } = usePageNavigation({
        mangaId,
        initialPage: currentPageParam,
        totalPages: images.length,
    });

    // 本地状态
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [readingMode, setReadingMode] = useState<'single' | 'double' | 'scroll'>('single');

    // 图片缩放
    const { zoom, setZoom } = useImageZoom();

    // 全屏切换
    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

    // 使用键盘导航 Hook
    useKeyboardNavigation({
        readingMode,
        isFullscreen,
        onPrevPage: handlePrevPage,
        onNextPage: handleNextPage,
        onToggleFullscreen: toggleFullscreen,
    });

    // 使用滚动检测 Hook
    useScrollDetection({
        readingMode,
        currentPage,
        totalPages: images.length,
        mangaId,
        onPageChange: setCurrentPage,
    });

    // 加载状态
    if (loading) {
        return <LoadingState />;
    }

    // 错误状态
    if (error || !manga || images.length === 0) {
        return (
            <ErrorState
                error={error || '无法加载漫画数据'}
                mangaId={mangaId}
                onBack={() => router.push(`/content/mangas/${mangaId}`)}
            />
        );
    }

    // 章节切换处理
    const handleChapterChange = (chapter: typeof currentChapter) => {
        if (chapter) {
            setCurrentChapter(chapter);
            setCurrentPage(1);
            router.push(`/content/mangas/${mangaId}/read?chapter=${chapter.id}&page=1`);
        }
    };

    // 上一章
    const handlePrevChapter = () => {
        if (!currentChapter || chapters.length === 0) return;
        const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
        if (currentIndex > 0) {
            handleChapterChange(chapters[currentIndex - 1]);
        }
    };

    // 下一章
    const handleNextChapter = () => {
        if (!currentChapter || chapters.length === 0) return;
        const currentIndex = chapters.findIndex(c => c.id === currentChapter.id);
        if (currentIndex < chapters.length - 1) {
            handleChapterChange(chapters[currentIndex + 1]);
        }
    };

    // 获取当前页的图片 URL（useMangaData 已经生成了正确的 URL）
    const currentImage = images[currentPage - 1];
    const currentImageUrl = currentImage?.url;

    return (
        <div className={`${
            isFullscreen
                ? 'fixed inset-0 z-50 bg-black flex flex-col'
                : 'fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col'
        }`}>
            {/* 右侧悬浮控制面板 */}
            <ReadingControls
                currentPage={currentPage}
                totalPages={images.length}
                readingMode={readingMode}
                isFullscreen={isFullscreen}
                showControls={true}
                zoom={zoom}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                onModeChange={setReadingMode}
                onToggleFullscreen={toggleFullscreen}
                onBack={() => router.push(`/content/mangas/${mangaId}`)}
                onZoomChange={setZoom}
                hasChapters={manga?.has_chapters}
                chapters={chapters}
                currentChapter={currentChapter}
                onPrevChapter={handlePrevChapter}
                onNextChapter={handleNextChapter}
            />

            {/* 主要阅读区域 */}
            <div
                data-scroll-container
                className={`w-full h-full ${readingMode === 'scroll' ? 'overflow-y-auto' : 'flex items-center justify-center overflow-hidden'}`}
            >
                <div className={`w-full h-full ${readingMode === 'scroll' ? '' : 'flex items-center justify-center'}`}>
                    {readingMode === 'single' ? (
                        <SinglePageView
                            imageUrl={currentImageUrl}
                            currentPage={currentPage}
                            totalPages={images.length}
                            isFullscreen={isFullscreen}
                            zoom={zoom}
                            onPrevPage={handlePrevPage}
                            onNextPage={handleNextPage}
                        />
                    ) : readingMode === 'double' ? (
                        <DoublePageView
                            currentImageUrl={currentImageUrl}
                            prevImageUrl={currentPage > 1 ? images[currentPage - 2]?.url : undefined}
                            currentPage={currentPage}
                            isFullscreen={isFullscreen}
                            zoom={zoom}
                        />
                    ) : (
                        <ScrollView
                            images={images}
                            mangaId={mangaId}
                            isFullscreen={isFullscreen}
                            zoom={zoom}
                            mangaTitle={manga?.title}
                            getImageUrl={(_, index) => images[index]?.url || ''}
                            onShowControls={() => {}}
                            onHideControls={() => {}}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}