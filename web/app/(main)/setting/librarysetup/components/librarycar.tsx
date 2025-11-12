'use client';

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { FolderIcon, CloudIcon, MoreVertIcon, TrashIcon, EditIcon, RenameIcon, ImageEditIcon, ScanIcon } from "@/components/icons";

// 媒体库类型定义
type LibraryType =
  | "电影"        // 原来是 "影片"
  | "视频"
  | "音乐"
  | "电视节目"
  | "有声读物"
  | "书籍"
  | "游戏"
  | "漫画"
  | "音乐视频"
  | "照片"        // 原来是 "家庭视频和照片"
  | "混合内容";

export type LibrarySource = "local" | "webdav";

interface LibraryCarProps {
  id?: string;
  title?: string;
  cover?: string;
  type?: LibraryType;
  path?: string;
  source?: LibrarySource;
  itemCount?: number;
  lastScanned?: string;
  onRemove?: () => void;
  onRename?: () => void;
  onScan?: () => void;
  onEditImage?: () => void;
  onEdit?: () => void;
  onChangeType?: () => void;
}

// 根据媒体库类型获取默认封面
const getDefaultCover = (type: LibraryType): string => {
  const coverMap: Record<LibraryType, string> = {
    "电影": "/assets/image/default_cover_电影.png",
    "视频": "/assets/image/default_cover_视频.png",
    "音乐": "/assets/image/default_cover_音乐.png",
    "电视节目": "/assets/image/default_cover_电视节目.png",
    "有声读物": "/assets/image/default_cover_有声读物.png",
    "书籍": "/assets/image/default_cover_书籍.png",
    "游戏": "/assets/image/game_cover_defualt.png",
    "漫画": "/assets/image/default_cover_漫画.png",
    "音乐视频": "/assets/image/default_cover_音乐视频.png",
    "照片": "/assets/image/default_cover_照片.png",
    "混合内容": "/assets/image/default_cover_漫画内容.png",
  };

  return coverMap[type] || "/assets/image/default_cover_电影.png";
};

/**
 * 媒体库卡片组件
 * 展示媒体库的基本信息，包括封面、标题、类型、路径、源等
 */
export const LibraryCar = ({
  title = "我的电影库",
  cover,
  type = "电影",
  path = "/media/movies",
  source = "local",
  itemCount = 128,
  lastScanned = "2024-01-15 14:30",
  onRemove,
  onRename,
  onScan,
  onEditImage,
  onEdit,
  onChangeType,
}: LibraryCarProps) => {
  const { theme } = useTheme();
  const isSSR = useIsSSR();
  const isDark = theme === 'dark' && !isSSR;

  // 使用自定义封面或默认封面
  const displayCover = cover || getDefaultCover(type);

  // 获取类型对应的颜色
  const getTypeColor = (type: LibraryType) => {
    const colorMap: Record<LibraryType, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
      "电影": "primary",
      "视频": "primary",
      "音乐": "secondary",
      "电视节目": "warning",
      "有声读物": "success",
      "书籍": "success",     // 给书籍一个颜色
      "游戏": "danger",
      "漫画": "primary",     // 给漫画一个颜色
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

  return (
    <Card
      className={clsx(
        "w-full max-w-sm hover:shadow-xl transition-all duration-300 cursor-pointer group",
        themeStyles.background,
        themeStyles.border,
        themeStyles.shadow,
        "border"
      )}
      radius="lg"
    >
      <CardBody className="p-0 relative">
        {/* 封面图片容器 */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <Image
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            src={displayCover}
            removeWrapper
          />

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

          {/* 项目数量 + 菜单 - 右下角 */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <Chip
              size="sm"
              variant="flat"
              className="bg-black/40 text-white font-medium"
            >
              {itemCount} 项
            </Chip>

            {/* 悬停菜单 */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <MoreVertIcon size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="媒体库操作"
                className={clsx(
                  isDark ? "bg-gray-800" : "bg-white"
                )}
              >
                <DropdownItem
                  key="remove"
                  color="danger"
                  startContent={<TrashIcon size={16} />}
                  onPress={onRemove}
                >
                  移除
                </DropdownItem>
                <DropdownItem
                  key="rename"
                  startContent={<RenameIcon size={16} />}
                  onPress={onRename}
                >
                  重命名
                </DropdownItem>
                <DropdownItem
                  key="scan"
                  startContent={<ScanIcon size={16} />}
                  onPress={onScan}
                >
                  扫描媒体库文件
                </DropdownItem>
                <DropdownItem
                  key="editImage"
                  startContent={<ImageEditIcon size={16} />}
                  onPress={onEditImage}
                >
                  编辑图像
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<EditIcon size={16} />}
                  onPress={onEdit}
                >
                  编辑
                </DropdownItem>
                <DropdownItem
                  key="changeType"
                  startContent={<MoreVertIcon size={16} />}
                  onPress={onChangeType}
                >
                  更改内容类型
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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

          {/* 路径信息 */}
          <div className="flex items-center gap-2">
            <div className={themeStyles.textSecondary}>
              <FolderIcon size={16} />
            </div>
            <Tooltip
              content={path}
              color={isDark ? "default" : "foreground"}
              className="max-w-xs"
            >
              <p className={clsx(
                "text-sm line-clamp-1 cursor-help",
                themeStyles.textSecondary
              )}>
                {path}
              </p>
            </Tooltip>
          </div>

          {/* 最后扫描时间 */}
          <div className={clsx(
            "text-xs",
            themeStyles.textSecondary
          )}>
            最后扫描: {lastScanned}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};