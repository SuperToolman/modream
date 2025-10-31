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
    ChapterSelector
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
    const [showControls, setShowControls] = useState(true);

    // 图片缩放
    const { zoom, setZoom } = useImageZoom();

    // 全屏切换
    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
        setShowControls(true);
    };

    // 使用键盘导航 Hook
    useKeyboardNavigation({
        readingMode,
        isFullscreen,
        onPrevPage: handlePrevPage,
        onNextPage: handleNextPage,
        onToggleFullscreen: toggleFullscreen,
    });

    // 控制栏自动隐藏
    useEffect(() => {
        if (isFullscreen) {
            const timer = setTimeout(() => {
                setShowControls(false);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            setShowControls(true);
        }
    }, [isFullscreen, currentPage]);

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

    // 获取当前页的图片 URL（useMangaData 已经生成了正确的 URL）
    const currentImage = images[currentPage - 1];
    const currentImageUrl = currentImage?.url;

    return (
        <div className={`${
            isFullscreen
                ? 'fixed inset-0 z-50 bg-black flex flex-col'
                : 'fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col'
        }`}>
            {/* 章节选择器（仅章节漫画显示） */}
            {manga?.has_chapters && chapters.length > 0 && !isFullscreen && (
                <div className="fixed top-16 left-0 right-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                    <ChapterSelector
                        chapters={chapters}
                        currentChapter={currentChapter}
                        onChapterChange={handleChapterChange}
                    />
                </div>
            )}

            {/* 右侧悬浮控制面板 */}
            <ReadingControls
                currentPage={currentPage}
                totalPages={images.length}
                readingMode={readingMode}
                isFullscreen={isFullscreen}
                showControls={showControls}
                zoom={zoom}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                onModeChange={setReadingMode}
                onToggleFullscreen={toggleFullscreen}
                onBack={() => router.push(`/content/mangas/${mangaId}`)}
                onZoomChange={setZoom}
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
                            onShowControls={() => setShowControls(true)}
                            onHideControls={() => setShowControls(false)}
                        />
                    )}
                </div>
            </div>



            {/* 鼠标移动检测 - 显示/隐藏控制面板 */}
            {readingMode !== 'scroll' && (
                <div
                    className="fixed inset-0 z-30"
                    onMouseMove={() => setShowControls(true)}
                    onMouseLeave={() => isFullscreen && setShowControls(false)}
                />
            )}
        </div>
    );
}