'use client';

import { memo } from 'react';
import clsx from "clsx";
import { Button } from "@heroui/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { HeartIcon } from "@/components/icons";
import {
  ZoomInIcon,
  ZoomOutIcon,
  RotateIcon,
  PanelCollapseIcon,
  PanelExpandIcon,
  DeleteIcon,
  MoreIcon,
} from "@/components/icons/photo-icons";

interface PhotoToolbarProps {
  zoomIn: (step: number) => void;
  zoomOut: (step: number) => void;
  onRotate: () => void;
  onTogglePanel: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  onAddToAlbum: () => void;
  showInfoPanel: boolean;
  isFavorite: boolean;
}

/**
 * 照片查看器操作栏组件
 * 提供缩放、旋转、收藏、删除等操作
 */
function PhotoToolbar({
  zoomIn,
  zoomOut,
  onRotate,
  onTogglePanel,
  onFavorite,
  onDelete,
  onAddToAlbum,
  showInfoPanel,
  isFavorite,
}: PhotoToolbarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-3 p-6 bg-gradient-to-b from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
      <div className="flex items-center gap-2 backdrop-blur-xl bg-white/10 rounded-full px-4 py-2 border border-white/20 shadow-2xl">
        {/* 放大按钮 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => zoomIn(0.2)}
          className="text-white hover:bg-white/20 transition-all hover:scale-110"
          title="放大 (Zoom In)"
        >
          <ZoomInIcon />
        </Button>

        <div className="w-px h-6 bg-white/30" />

        {/* 缩小按钮 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => zoomOut(0.2)}
          className="text-white hover:bg-white/20 transition-all hover:scale-110"
          title="缩小 (Zoom Out)"
        >
          <ZoomOutIcon />
        </Button>

        <div className="w-px h-6 bg-white/30" />

        {/* 旋转按钮 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onRotate}
          className="text-white hover:bg-white/20 transition-all hover:scale-110"
          title="旋转 90° (Rotate)"
        >
          <RotateIcon />
        </Button>

        <div className="w-px h-6 bg-white/30" />

        {/* 切换信息面板按钮 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onTogglePanel}
          className="text-white hover:bg-white/20 transition-all hover:scale-110"
          title={showInfoPanel ? "隐藏详情面板" : "显示详情面板"}
        >
          {showInfoPanel ? <PanelCollapseIcon /> : <PanelExpandIcon />}
        </Button>

        <div className="w-px h-6 bg-white/30" />

        {/* 收藏按钮 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onFavorite}
          className={clsx(
            "transition-all hover:scale-110",
            isFavorite
              ? 'text-red-400 hover:bg-red-500/20'
              : 'text-white hover:bg-white/20'
          )}
          title={isFavorite ? "取消收藏" : "添加收藏"}
        >
          <HeartIcon className={clsx("w-5 h-5", isFavorite && 'fill-current')} />
        </Button>

        <div className="w-px h-6 bg-white/30" />

        {/* 删除按钮 */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onDelete}
          className="text-white hover:bg-red-500/30 transition-all hover:scale-110"
          title="删除照片"
        >
          <DeleteIcon />
        </Button>

        <div className="w-px h-6 bg-white/30" />

        {/* 更多操作下拉菜单 */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-white hover:bg-white/20 transition-all hover:scale-110"
              title="更多操作"
            >
              <MoreIcon />
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="照片操作" 
            className="bg-gray-900/95 backdrop-blur-xl border border-white/20"
          >
            <DropdownItem
              key="add-to-album"
              onClick={onAddToAlbum}
              className="text-white hover:bg-white/10"
            >
              📁 添加到相册
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}

// 使用 memo 优化性能，避免不必要的重渲染
export default memo(PhotoToolbar);

