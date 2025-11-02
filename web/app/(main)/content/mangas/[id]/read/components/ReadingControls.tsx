'use client';

import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";
import type { MangaChapter } from '@/types/manga';

interface ReadingControlsProps {
    currentPage: number;
    totalPages: number;
    readingMode: 'single' | 'double' | 'scroll';
    isFullscreen: boolean;
    showControls: boolean;
    zoom: number;
    onPrevPage: () => void;
    onNextPage: () => void;
    onModeChange: (mode: 'single' | 'double' | 'scroll') => void;
    onToggleFullscreen: () => void;
    onBack: () => void;
    onZoomChange: (zoom: number) => void;
    // 章节相关（可选）
    hasChapters?: boolean;
    chapters?: MangaChapter[];
    currentChapter?: MangaChapter | null;
    onPrevChapter?: () => void;
    onNextChapter?: () => void;
}

export function ReadingControls({
    currentPage,
    totalPages,
    readingMode,
    isFullscreen,
    showControls,
    zoom,
    onPrevPage,
    onNextPage,
    onModeChange,
    onToggleFullscreen,
    onBack,
    onZoomChange,
    hasChapters = false,
    chapters = [],
    currentChapter = null,
    onPrevChapter,
    onNextChapter,
}: ReadingControlsProps) {
    // 计算当前章节索引
    const currentChapterIndex = currentChapter && chapters.length > 0
        ? chapters.findIndex(c => c.id === currentChapter.id)
        : -1;
    return (
        <div
            className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            <div
                className="flex flex-col gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
            >
                {/* 返回按钮 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onBack}
                    title="返回详情"
                    className="w-8 h-8 min-w-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Button>

                {/* 章节切换按钮（仅章节漫画显示） */}
                {hasChapters && chapters.length > 0 && (
                    <>
                        {/* 分隔线 */}
                        <div className="h-px bg-gray-300 dark:bg-gray-600 my-1"></div>

                        {/* 上一章 */}
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            isDisabled={currentChapterIndex <= 0}
                            onPress={onPrevChapter}
                            title={`上一章${currentChapterIndex > 0 ? `: ${chapters[currentChapterIndex - 1]?.title}` : ''}`}
                            className="w-8 h-8 min-w-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </Button>

                        {/* 章节信息显示 */}
                        <div className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-1 px-1 w-8">
                            <div className="leading-tight text-[10px]">章节</div>
                            <div className="leading-tight">{currentChapterIndex + 1}</div>
                            <div className="text-gray-400 dark:text-gray-600 text-[10px]">/</div>
                            <div className="leading-tight">{chapters.length}</div>
                        </div>

                        {/* 下一章 */}
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            isDisabled={currentChapterIndex >= chapters.length - 1}
                            onPress={onNextChapter}
                            title={`下一章${currentChapterIndex < chapters.length - 1 ? `: ${chapters[currentChapterIndex + 1]?.title}` : ''}`}
                            className="w-8 h-8 min-w-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </Button>

                        {/* 分隔线 */}
                        <div className="h-px bg-gray-300 dark:bg-gray-600 my-1"></div>
                    </>
                )}

                {/* 页码显示 */}
                <div className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-1 px-1 w-8">
                    <div className="leading-tight">{currentPage}</div>
                    <div className="text-gray-400 dark:text-gray-600 text-[10px]">/</div>
                    <div className="leading-tight">{totalPages}</div>
                </div>

                {/* 上一页 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    isDisabled={currentPage <= 1}
                    onPress={onPrevPage}
                    title="上一页 (← 或 A)"
                    className="w-8 h-8 min-w-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </Button>

                {/* 下一页 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    isDisabled={currentPage >= totalPages}
                    onPress={onNextPage}
                    title="下一页 (→ 或 D)"
                    className="w-8 h-8 min-w-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </Button>

                {/* 单页模式 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant={readingMode === 'single' ? 'solid' : 'light'}
                    className={`w-8 h-8 min-w-8 rounded-full ${
                        readingMode === 'single'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onPress={() => onModeChange('single')}
                    title="单页模式"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth={2} />
                    </svg>
                </Button>

                {/* 双页模式 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant={readingMode === 'double' ? 'solid' : 'light'}
                    className={`w-8 h-8 min-w-8 rounded-full ${
                        readingMode === 'double'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onPress={() => onModeChange('double')}
                    title="双页模式"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="8" height="16" rx="2" strokeWidth={2} />
                        <rect x="13" y="4" width="8" height="16" rx="2" strokeWidth={2} />
                    </svg>
                </Button>

                {/* 滚动模式 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant={readingMode === 'scroll' ? 'solid' : 'light'}
                    className={`w-8 h-8 min-w-8 rounded-full ${
                        readingMode === 'scroll'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onPress={() => onModeChange('scroll')}
                    title="滚动模式"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </Button>

                {/* 全屏按钮 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onToggleFullscreen}
                    title={isFullscreen ? '退出全屏 (F)' : '全屏 (F)'}
                    className="w-8 h-8 min-w-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    {isFullscreen ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5m11 5.5V4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5m11-5.5v4.5m0-4.5h4.5m-4.5 0l5.5 5.5" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V4a1 1 0 011-1h3m0 0l-3 3m3-3v0M21 7V4a1 1 0 00-1-1h-3m0 0l3 3m-3-3v0M3 17v3a1 1 0 001 1h3m0 0l-3-3m3 3v0M21 17v3a1 1 0 01-1 1h-3m0 0l3-3m-3 3v0" />
                        </svg>
                    )}
                </Button>

                {/* 分隔线 */}
                <div className="h-px bg-gray-300 dark:bg-gray-600 my-1"></div>

                {/* 放大按钮 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => onZoomChange(Math.min(200, zoom + 10))}
                    title="放大 (Ctrl + 滚轮向上)"
                    className="w-8 h-8 min-w-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <MagnifyingGlassPlusIcon className="w-4 h-4" />
                </Button>

                {/* 缩放滑块 */}
                <div className="h-24 flex items-center justify-center py-2">
                    <Slider
                        key="manga-zoom-slider"
                        id="manga-zoom-slider"
                        size="sm"
                        step={10}
                        minValue={50}
                        maxValue={200}
                        value={zoom}
                        onChange={(value) => onZoomChange(value as number)}
                        orientation="vertical"
                        className="h-full"
                        aria-label="图片缩放"
                        name="manga-zoom"
                    />
                </div>

                {/* 缩小按钮 */}
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => onZoomChange(Math.max(50, zoom - 10))}
                    title="缩小 (Ctrl + 滚轮向下)"
                    className="w-8 h-8 min-w-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                    <MagnifyingGlassMinusIcon className="w-4 h-4" />
                </Button>

                {/* 缩放百分比 */}
                <div className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-1 px-1 w-8">
                    <div className="leading-tight text-[10px]">{zoom}%</div>
                </div>
            </div>
        </div>
    );
}

