"use client";

import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { useRouter, usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, MessageIcon, NotificationIcon, BookmarkIcon, UserIcon, SettingsIcon } from "./icons"


// 侧边栏菜单项配置
const sidebarItems = [
  {
    id: 'home',
    icon: HomeIcon,
    label: '首页',
    color: 'default' as const,
    href: '/'
  },
  {
    id: 'search',
    icon: SearchIcon,
    label: '搜索',
    color: 'default' as const,
    href: '/search'
  },
  {
    id: 'messages',
    icon: MessageIcon,
    label: '消息',
    color: 'default' as const,
    href: '/messages'
  },
  {
    id: 'notifications',
    icon: NotificationIcon,
    label: '通知',
    color: 'default' as const,
    href: '/notice'
  },
  {
    id: 'bookmarks',
    icon: BookmarkIcon,
    label: '书签',
    color: 'default' as const,
    href: '/bookmarks'

  },
  {
    id: 'profile',
    icon: UserIcon,
    label: '个人资料',
    color: 'default' as const,
    href: '/profile'
  },
];

const bottomItems = [
  {
    id: 'settings',
    icon: SettingsIcon,
    label: '设置',
    color: 'default' as const,
    href: '/setting/dashboard'
  },
];

export const Sidebar = () => {
  // 获取路由和当前路径
  const router = useRouter();
  const pathname = usePathname();

  // 获取当前主题
  const { theme } = useTheme();
  const isSSR = useIsSSR();

  // 根据当前路径确定激活的菜单项
  const getActiveItem = () => {
    // 检查底部菜单项（优先级更高，因为 /setting 是特殊路由）
    const bottomItem = bottomItems.find(item => {
      if (item.href === '/') {
        return pathname === '/';
      }
      // 对于 /setting 路由，检查是否以 /setting 开头
      if (item.href.startsWith('/setting')) {
        return pathname.startsWith('/setting');
      }
      return pathname.startsWith(item.href);
    });
    if (bottomItem) return bottomItem.id;

    // 检查主菜单项
    const mainItem = sidebarItems.find(item => {
      if (item.href === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(item.href);
    });
    if (mainItem) return mainItem.id;

    return 'home'; // 默认值
  };

  const activeItem = getActiveItem();

  // 根据主题确定颜色方案
  const isDark = theme === 'dark' && !isSSR;

  // 主题相关的样式配置
  const themeStyles = {
    // 侧边栏背景渐变
    background: isDark
      ? 'bg-gradient-to-b from-gray-800 to-gray-900'
      : 'bg-gradient-to-b from-pink-400 to-pink-500',

    // 按钮文字颜色
    buttonText: isDark ? 'text-gray-300' : 'text-white',

    // 悬停背景色
    hoverBg: isDark ? 'hover:bg-gray-700/50' : 'hover:bg-white/20',

    // 激活状态样式
    activeButton: isDark
      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
      : 'bg-white text-pink-500 shadow-md',

    // 分隔线颜色
    divider: isDark ? 'bg-gray-600/50' : 'bg-white/30',
  };

  return (
    <aside className={clsx(
      "fixed left-0 top-0 h-full w-16 shadow-lg z-30 flex flex-col transition-colors duration-300",
      themeStyles.background
    )}>
      {/* 顶部区域 */}
      <div className="flex-1 flex flex-col items-center py-4 space-y-2">
        {/* 返回按钮 */}
        <Tooltip content="返回" placement="right">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className={clsx(
              "transition-all duration-200",
              themeStyles.buttonText,
              themeStyles.hoverBg
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Button>
        </Tooltip>

        {/* 分隔线 */}
        <div className={clsx("w-8 h-px my-2", themeStyles.divider)} />

        {/* 主要菜单项 */}
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;

          return (
            <Tooltip key={item.id} content={item.label} placement="right">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className={clsx(
                  "transition-all duration-200",
                  isActive
                    ? clsx(themeStyles.activeButton, "scale-110")
                    : clsx(themeStyles.buttonText, themeStyles.hoverBg, "hover:scale-105")
                )}
                onPress={() => router.push(item.href)}
              >
                <IconComponent size={18} />
              </Button>
            </Tooltip>
          );
        })}
      </div>

      {/* 底部区域 */}
      <div className="flex flex-col items-center pb-4 space-y-2">
        {/* 分隔线 */}
        <div className={clsx("w-8 h-px my-2", themeStyles.divider)} />

        {/* 底部菜单项 */}
        {bottomItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;

          return (
            <Tooltip key={item.id} content={item.label} placement="right">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className={clsx(
                  "transition-all duration-200",
                  isActive
                    ? clsx(themeStyles.activeButton, "scale-110")
                    : clsx(themeStyles.buttonText, themeStyles.hoverBg, "hover:scale-105")
                )}
                onPress={() => router.push(item.href)}
              >
                <IconComponent size={18} />
              </Button>
            </Tooltip>
          );
        })}
      </div>
    </aside>
  );
};
