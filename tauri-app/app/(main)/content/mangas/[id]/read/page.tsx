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
    ErrorState
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

    // 使用自定义 Hooks
    const { manga, images, loading, error } = useMangaData(mangaId);
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

    // 获取当前页的图片 URL
    const currentImage = images[currentPage - 1];
    const currentImageUrl = currentImage ? mangasApi.getImageUrl(mangaId, currentImage.index) : undefined;

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
                            prevImageUrl={currentPage > 1 ? mangasApi.getImageUrl(mangaId, images[currentPage - 2]?.index || 0) : undefined}
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
                            getImageUrl={mangasApi.getImageUrl}
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