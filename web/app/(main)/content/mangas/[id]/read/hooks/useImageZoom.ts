import { useState, useEffect, useCallback } from 'react';

interface UseImageZoomProps {
    initialZoom?: number;
    minZoom?: number;
    maxZoom?: number;
    step?: number;
}

export function useImageZoom({
    initialZoom = 100,
    minZoom = 50,
    maxZoom = 200,
    step = 10,
}: UseImageZoomProps = {}) {
    const [zoom, setZoom] = useState(initialZoom);

    const handleZoomChange = useCallback((newZoom: number) => {
        const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
        setZoom(clampedZoom);
    }, [minZoom, maxZoom]);

    // Ctrl + 滚轮缩放
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            // 只有按住 Ctrl 键时才处理缩放
            if (!event.ctrlKey) return;

            // 阻止默认的页面缩放行为和翻页行为
            event.preventDefault();
            event.stopPropagation();

            // 根据滚轮方向调整缩放
            const delta = event.deltaY > 0 ? -step : step;
            setZoom(prev => {
                const newZoom = prev + delta;
                return Math.max(minZoom, Math.min(maxZoom, newZoom));
            });
        };

        // 添加事件监听器，使用 passive: false 以允许 preventDefault
        // 使用 capture: true 确保在其他监听器之前捕获事件
        document.addEventListener('wheel', handleWheel, { passive: false, capture: true });

        return () => {
            document.removeEventListener('wheel', handleWheel, { capture: true });
        };
    }, [step, minZoom, maxZoom]);

    return {
        zoom,
        setZoom: handleZoomChange,
    };
}

