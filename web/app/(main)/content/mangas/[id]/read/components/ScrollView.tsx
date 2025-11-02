'use client';

import { Image } from "@heroui/image";
import type { MangaImage } from '@/types/manga';

interface ScrollViewProps {
    images: MangaImage[];
    mangaId: number;
    isFullscreen: boolean;
    zoom: number;
    mangaTitle?: string;
    getImageUrl: (mangaId: number, imageIndex: number) => string;
    onShowControls: () => void;
    onHideControls: () => void;
}

export function ScrollView({
    images,
    mangaId,
    isFullscreen,
    zoom,
    mangaTitle,
    getImageUrl,
    onShowControls,
    onHideControls,
}: ScrollViewProps) {
    return (
        <div
            className={`w-full h-full ${isFullscreen ? 'pt-4 pb-4' : 'pt-20 pb-4'}`}
            onMouseMove={onShowControls}
            onMouseLeave={() => isFullscreen && onHideControls()}
        >
            <div
                className="flex flex-col items-center px-4 h-full"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
                {images.map((image, index) => (
                    <div
                        key={image.index}
                        className="w-full max-w-4xl flex justify-center"
                        data-page-index={index}
                    >
                        <Image
                            alt={`第${index + 1}页`}
                            src={getImageUrl(mangaId, image.index)}
                            className="w-full h-auto object-contain"
                            removeWrapper
                            isBlurred
                        />
                    </div>
                ))}

                {/* 底部提示信息 */}
                <div className="w-full flex flex-col items-center gap-4 py-8 pb-16">
                    {/* 分隔线 */}
                    <div className="w-32 h-px bg-gray-300 dark:bg-gray-600"></div>

                    {/* 提示文字 */}
                    <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            已阅读完毕
                        </div>
                        {mangaTitle && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                {mangaTitle}
                            </div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-600">
                            共 {images.length} 页
                        </div>
                    </div>

                    {/* 装饰图标 */}
                    <div className="text-gray-300 dark:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

