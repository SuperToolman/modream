'use client';

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { FolderIcon, CloudIcon } from "@/components/icons";

// 媒体库类型定义
type LibraryType =
  | "电影"
  | "视频"
  | "音乐"
  | "电视节目"
  | "有声读物"
  | "书籍"
  | "游戏"
  | "漫画"
  | "音乐视频"
  | "照片"
  | "混合内容";

export type LibrarySource = "local" | "webdav";

interface LoadingLibraryCarProps {
  title: string;
  type: LibraryType;
  source: LibrarySource;
  message: string;
  isSuccess?: boolean;
  isError?: boolean;
}

/**
 * 创建中的媒体库卡片组件
 * 基于 LibraryCar 组件，保持相同的样式和布局
 */
export const LoadingLibraryCar = ({
  title,
  type,
  source,
  message,
  isSuccess = false,
  isError = false,
}: LoadingLibraryCarProps) => {
  const { theme } = useTheme();
  const isSSR = useIsSSR();
  const isDark = theme === 'dark' && !isSSR;

  // 获取类型对应的颜色
  const getTypeColor = (type: LibraryType) => {
    const colorMap: Record<LibraryType, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
      "电影": "primary",
      "视频": "primary",
      "音乐": "secondary",
      "电视节目": "warning",
      "有声读物": "success",
      "书籍": "success",
      "游戏": "danger",
      "漫画": "primary",
      "音乐视频": "secondary",
      "照片": "primary",
      "混合内容": "default",
    };
    return colorMap[type] || "default";
  };

  // 获取源图标
  const getSourceIcon = () => {
    return source === "local" ? <FolderIcon size={16} /> : <CloudIcon size={16} />;
  };

  // 获取源标签文本
  const getSourceLabel = () => {
    return source === "local" ? "本地" : "WebDAV";
  };

  const themeStyles = {
    background: isDark ? 'bg-gray-900' : 'bg-white',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    hoverBg: isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
    shadow: isDark ? 'shadow-md shadow-black/20' : 'shadow-md shadow-black/10',
  };

  // 根据状态确定边框颜色
  const getBorderColor = () => {
    if (isSuccess) return 'border-green-500';
    if (isError) return 'border-red-500';
    return 'border-blue-500';
  };

  return (
    <Card
      className={clsx(
        "w-full max-w-sm transition-all duration-300",
        themeStyles.background,
        themeStyles.shadow,
        "border-2",
        getBorderColor()
      )}
      radius="lg"
    >
      <CardBody className="p-0 relative">
        {/* 封面图片容器 - 显示加载动画 */}
        <div className={clsx(
          "relative aspect-video overflow-hidden rounded-t-lg flex items-center justify-center",
          isSuccess ? "bg-green-100 dark:bg-green-900/20" :
          isError ? "bg-red-100 dark:bg-red-900/20" :
          "bg-blue-100 dark:bg-blue-900/20"
        )}>
          {/* 加载动画 / 成功 / 失败图标 */}
          {!isSuccess && !isError && (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">创建中...</p>
            </div>
          )}
          {isSuccess && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl">✅</div>
              <p className="text-green-600 dark:text-green-400 font-medium text-sm">创建成功</p>
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl">❌</div>
              <p className="text-red-600 dark:text-red-400 font-medium text-sm">创建失败</p>
            </div>
          )}

          {/* 类型标签 - 左上角 */}
          <div className="absolute top-3 left-3 z-10">
            <Chip
              size="sm"
              color={getTypeColor(type)}
              variant="solid"
              className="text-white font-semibold"
            >
              {type}
            </Chip>
          </div>

          {/* 源标签 - 右上角 */}
          <div className="absolute top-3 right-3 z-10">
            <Chip
              size="sm"
              variant="flat"
              className={clsx(
                "font-medium",
                source === "local"
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
              )}
              startContent={getSourceIcon()}
            >
              {getSourceLabel()}
            </Chip>
          </div>

          {/* 状态标签 - 右下角 */}
          <div className="absolute bottom-3 right-3 z-10">
            <Chip
              size="sm"
              variant="flat"
              className={clsx(
                "font-medium",
                isSuccess ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                isError ? "bg-red-500/20 text-red-600 dark:text-red-400" :
                "bg-blue-500/20 text-blue-600 dark:text-blue-400"
              )}
            >
              {isSuccess ? "已完成" : isError ? "失败" : "创建中"}
            </Chip>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-4 flex flex-col gap-3">
          {/* 标题 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={clsx(
              "text-lg font-semibold line-clamp-2",
              themeStyles.text
            )}>
              {title}
            </h3>
          </div>

          {/* 进度消息 */}
          <div className={clsx(
            "text-sm p-2 rounded-lg",
            isSuccess ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" :
            isError ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" :
            "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          )}>
            <p className="text-xs line-clamp-2">{message}</p>
          </div>

          {/* 提示信息 */}
          {!isSuccess && !isError && (
            <div className={clsx(
              "text-xs",
              themeStyles.textSecondary
            )}>
              请耐心等待，扫描大型文件夹可能需要较长时间...
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

