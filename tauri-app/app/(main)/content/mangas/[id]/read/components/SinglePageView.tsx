'use client';

import { Image } from "@heroui/image";

interface SinglePageViewProps {
    imageUrl: string | undefined;
    currentPage: number;
    totalPages: number;
    isFullscreen: boolean;
    zoom: number;
    onPrevPage: () => void;
    onNextPage: () => void;
}

export function SinglePageView({
    imageUrl,
    currentPage,
    totalPages,
    isFullscreen,
    zoom,
    onPrevPage,
    onNextPage,
}: SinglePageViewProps) {
    return (
        <div className={`w-full h-screen flex justify-center items-center ${isFullscreen ? 'pt-4 pb-4' : 'pt-20 pb-4'}`}>
            <div className="relative group w-full h-full flex items-center justify-center overflow-hidden">
                <div
                    className="h-full flex items-center justify-center"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                >
                    <Image
                        alt={`第${currentPage}页`}
                        src={imageUrl}
                        className="h-full max-w-full object-contain"
                        removeWrapper
                        isBlurred
                    />
                </div>

                {/* 页面导航热区 */}
                <div className="absolute inset-0 flex">
                    <div
                        className="w-1/2 h-full cursor-pointer flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={onPrevPage}
                    >
                        {currentPage > 1 && (
                            <div className="bg-black/50 text-white p-2 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div
                        className="w-1/2 h-full cursor-pointer flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={onNextPage}
                    >
                        {currentPage < totalPages && (
                            <div className="bg-black/50 text-white p-2 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

