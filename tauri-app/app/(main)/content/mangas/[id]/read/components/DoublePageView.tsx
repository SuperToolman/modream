'use client';

import { Image } from "@heroui/image";

interface DoublePageViewProps {
    currentImageUrl: string | undefined;
    prevImageUrl: string | undefined;
    currentPage: number;
    isFullscreen: boolean;
    zoom: number;
}

export function DoublePageView({
    currentImageUrl,
    prevImageUrl,
    currentPage,
    isFullscreen,
    zoom,
}: DoublePageViewProps) {
    return (
        <div className={`w-full h-screen flex justify-center items-center ${isFullscreen ? 'pt-4 pb-4' : 'pt-20 pb-4'}`}>
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <div
                    className="h-full flex items-center justify-center gap-0"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                >
                    {/* 左页 */}
                    {currentPage > 1 && prevImageUrl && (
                        <div className="h-full flex items-center justify-end">
                            <Image
                                alt={`第${currentPage - 1}页`}
                                src={prevImageUrl}
                                className="h-full object-contain"
                                removeWrapper
                                isBlurred
                            />
                        </div>
                    )}

                    {/* 右页 */}
                    <div className="h-full flex items-center justify-start">
                        <Image
                            alt={`第${currentPage}页`}
                            src={currentImageUrl}
                            className="h-full object-contain"
                            removeWrapper
                            isBlurred
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

