"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroui/shared-icons";
import {
  SettingsIcon,
  HomeIcon,
  MessageIcon,
  NotificationIcon,
  BookmarkIcon,
  UserIcon,
  SearchIcon,
} from "@/components/icons";

interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface MenuGroup {
  label: string;
  children: MenuItem[];
  icon?: React.ReactNode;
}

export const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const isSSR = useIsSSR();

  // 菜单配置
  const menuGroups: MenuGroup[] = [
    {
      label: 'Modream Web Settings',
      icon: <HomeIcon size={18} />,
      children: []
    },
    {
      label: '用户首选项',
      icon: <UserIcon size={18} />,
      children: [
        {
          label: '显示',
          href: '/setting/display',
          icon: <SearchIcon size={16} />
        }
      ]
    },
    {
      label: 'Modream Server',
      icon: <SettingsIcon size={18} />,
      children: [
        {
          label: '控制台',
          href: '/setting/dashboard',
          icon: <HomeIcon size={16} />
        },
        {
          label: '通用',
          href: '/setting/general',
          icon: <SettingsIcon size={16} />
        },
        {
          label: '媒体库',
          href: '/setting/librarysetup',
          icon: <BookmarkIcon size={16} />
        },
        {
          label: '网络',
          href: '/setting/network',
          icon: <MessageIcon size={16} />
        },
        {
          label: '数据库',
          href: '/setting/database',
          icon: <NotificationIcon size={16} />
        },
        {
          label: '日志',
          href: '/setting/logs',
          icon: <SearchIcon size={16} />
        }
      ]
    },
    {
      label: 'Drive',
      icon: <BookmarkIcon size={18} />,
      children: []
    },
    {
      label: '高级',
      icon: <SettingsIcon size={18} />,
      children: []
    }
  ];

  // 展开状态管理
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Modream Server']) // 默认展开 Modream Server
  );

  // 切换菜单组展开状态
  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  // 检查菜单项是否激活
  const isMenuItemActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // 根据主题确定颜色方案
  const isDark = theme === 'dark' && !isSSR;

  // 主题相关的样式配置
  const themeStyles = {
    background: isDark
      ? 'bg-gray-900 rounded-2xl'
      : 'bg-gray-50 rounded-2xl',

    groupButton: isDark
      ? 'text-gray-200 hover:bg-gray-800'
      : 'text-gray-700 hover:bg-gray-100',

    groupButtonActive: isDark
      ? 'text-blue-400'
      : 'text-blue-600',

    menuItem: isDark
      ? 'text-gray-300 hover:bg-gray-800'
      : 'text-gray-600 hover:bg-gray-100',

    menuItemActive: isDark
      ? 'bg-blue-600/20 text-blue-400 '
      : 'bg-blue-50 text-blue-600',

    divider: isDark ? 'bg-gray-700' : 'bg-gray-200',
  };

  return (
    <div className={clsx(
      "sidebar-wrap h-full w-64 overflow-y-auto transition-colors duration-300",
      themeStyles.background
    )}>
      {/* 菜单组 */}
      <div className="py-4 flex flex-col">
        {menuGroups.map((group, index) => {
          const isExpanded = expandedGroups.has(group.label);
          const hasChildren = group.children.length > 0;
          const hasActiveChild = group.children.some(child => isMenuItemActive(child.href));

          return (
            <div key={index}>
              {/* 一级菜单 */}
              <button
                onClick={() => hasChildren && toggleGroup(group.label)}
                disabled={!hasChildren}
                className={clsx(
                  "w-full px-4 py-2 text-left font-medium transition-all duration-300 flex items-center justify-between gap-2",
                  hasChildren ? "cursor-pointer" : "cursor-default opacity-60",
                  hasActiveChild ? themeStyles.groupButtonActive : themeStyles.groupButton,
                  !hasChildren && "opacity-50"
                )}
              >
                <div className="flex items-center gap-2 flex-1">
                  {group.icon && (
                    <span className="flex-shrink-0 transition-colors duration-300">
                      {group.icon}
                    </span>
                  )}
                  <span>{group.label}</span>
                </div>
                {hasChildren && (
                  <ChevronDownIcon
                    className={clsx(
                      "w-4 h-4 flex-shrink-0 transition-transform duration-300",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </button>

              {/* 二级菜单 - 带过渡动画 */}
              <div
                className={clsx(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isExpanded && hasChildren ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="bg-opacity-50">
                  {group.children.map((child, childIndex) => {
                    const isActive = isMenuItemActive(child.href);
                    return (
                      <button
                        key={childIndex}
                        onClick={() => child.href && router.push(child.href)}
                        className={clsx(
                          "w-full px-8 py-2 text-left text-sm transition-all duration-200 flex items-center gap-2",
                          isActive ? themeStyles.menuItemActive : themeStyles.menuItem
                        )}
                      >
                        {child.icon && (
                          <span className="flex-shrink-0">
                            {child.icon}
                          </span>
                        )}
                        <span>{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 分隔线 */}
              {index < menuGroups.length - 1 && (
                <div className={clsx("my-2 mx-4 h-px", themeStyles.divider)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};