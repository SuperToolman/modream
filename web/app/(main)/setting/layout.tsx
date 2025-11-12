'use client';

import { Sidebar } from './components/sidebar';
import { useTheme } from 'next-themes';
import { useIsSSR } from '@react-aria/ssr';
import clsx from 'clsx';

export default function SettingLayout({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const isSSR = useIsSSR();
    const isDark = theme === 'dark' && !isSSR;

    // 主题样式
    const themeStyles = {
        contentBg: isDark
            ? 'bg-gray-900'
            : 'bg-gray-50',
    };

    return (
        <div className='flex gap-4 w-full flex-1 h-full'>
            {/* 左侧 Sidebar - 固定宽度 */}
            <div className='w-64 min-h-0 overflow-y-auto flex-shrink-0'>
                <Sidebar />
            </div>

            {/* 右侧内容区域 - 占据剩余空间 */}
            <div className={clsx(
                'flex-1 min-h-0 overflow-y-auto rounded-2xl p-6 transition-colors duration-300',
                themeStyles.contentBg,
            )}>
                {children}
            </div>
        </div>
    )
}