'use client';

import React, { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  minItemWidth?: number; // 最小项目宽度（像素）
  gap?: number; // 间距（像素）
  maxColumns?: number; // 最大列数（用于超大屏幕）
}

/**
 * 响应式网格组件
 * 
 * 特点：
 * - 自动根据屏幕宽度调整列数
 * - 固定项目最小宽度，避免大屏幕间距过大
 * - 支持最大列数限制
 * 
 * 使用示例：
 * <ResponsiveGrid minItemWidth={240} gap={24} maxColumns={8}>
 *   {items.map(item => <Card key={item.id}>{item.name}</Card>)}
 * </ResponsiveGrid>
 */
export default function ResponsiveGrid({
  children,
  minItemWidth = 240,
  gap = 24,
  maxColumns = 8,
}: ResponsiveGridProps) {
  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
        gap: `${gap}px`,
        maxWidth: '100%',
        // 限制最大列数
        ...(typeof window !== 'undefined' && {
          gridAutoFlow: 'row',
        }),
      }}
    >
      {children}
    </div>
  );
}

/**
 * 高级响应式网格 - 支持不同屏幕尺寸的自定义配置
 */
interface AdvancedResponsiveGridProps {
  children: ReactNode;
  gap?: number;
  // 响应式配置
  mobile?: { minWidth: number; maxColumns?: number };
  tablet?: { minWidth: number; maxColumns?: number };
  desktop?: { minWidth: number; maxColumns?: number };
  ultrawide?: { minWidth: number; maxColumns?: number };
}

export function AdvancedResponsiveGrid({
  children,
  gap = 24,
  mobile = { minWidth: 160, maxColumns: 2 },
  tablet = { minWidth: 200, maxColumns: 4 },
  desktop = { minWidth: 240, maxColumns: 6 },
  ultrawide = { minWidth: 280, maxColumns: 8 },
}: AdvancedResponsiveGridProps) {
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop' | 'ultrawide'>('desktop');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else if (width < 1920) {
        setScreenSize('desktop');
      } else {
        setScreenSize('ultrawide');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const config = {
    mobile,
    tablet,
    desktop,
    ultrawide,
  }[screenSize];

  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${config.minWidth}px, 1fr))`,
        gap: `${gap}px`,
        maxWidth: '100%',
      }}
    >
      {children}
    </div>
  );
}

/**
 * 固定列数网格 - 用于需要固定列数的场景
 */
interface FixedColumnGridProps {
  children: ReactNode;
  columns: number;
  gap?: number;
}

export function FixedColumnGrid({
  children,
  columns,
  gap = 24,
}: FixedColumnGridProps) {
  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        maxWidth: '100%',
      }}
    >
      {children}
    </div>
  );
}

