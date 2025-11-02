import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
    readingMode: 'single' | 'double' | 'scroll';
    isFullscreen: boolean;
    onPrevPage: () => void;
    onNextPage: () => void;
    onToggleFullscreen: () => void;
}

export function useKeyboardNavigation({
    readingMode,
    isFullscreen,
    onPrevPage,
    onNextPage,
    onToggleFullscreen,
}: UseKeyboardNavigationProps) {
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        // 滚动模式下只处理全屏快捷键
        if (readingMode === 'scroll') {
            if (event.key === 'f' || event.key === 'F') {
                onToggleFullscreen();
            } else if (event.key === 'Escape' && isFullscreen) {
                onToggleFullscreen();
            }
            return;
        }

        // 单页/双页模式下的快捷键
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                onPrevPage();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
            case ' ':
                onNextPage();
                break;
            case 'f':
            case 'F':
                onToggleFullscreen();
                break;
            case 'Escape':
                if (isFullscreen) {
                    onToggleFullscreen();
                }
                break;
        }
    }, [readingMode, isFullscreen, onPrevPage, onNextPage, onToggleFullscreen]);

    // 鼠标滚轮翻页（单页/双页模式）
    const handleWheel = useCallback((event: WheelEvent) => {
        if (readingMode === 'scroll') return;

        event.preventDefault();
        if (event.deltaY > 0) {
            onNextPage();
        } else if (event.deltaY < 0) {
            onPrevPage();
        }
    }, [readingMode, onPrevPage, onNextPage]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    useEffect(() => {
        if (readingMode === 'scroll') return;

        document.addEventListener('wheel', handleWheel, { passive: false });
        return () => document.removeEventListener('wheel', handleWheel);
    }, [handleWheel, readingMode]);
}

