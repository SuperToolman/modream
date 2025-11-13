'use client';

import { useState } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { HeartIcon } from "@/components/icons";

interface PhotoCardProps {
  id: number;
  thumbnailUrl: string;
  resolution?: string | null;
  extension?: string | null;
  formattedSize?: string;
  isFavorite?: boolean;
  tags?: string[] | null;
  createTime?: string;
  width?: number | null;
  height?: number | null;
  onFavoriteToggle?: (id: number) => void;
  onCardClick?: (id: number) => void;
  priority?: boolean;
}

export default function PhotoCard({
  id,
  thumbnailUrl,
  resolution,
  extension,
  formattedSize,
  isFavorite = false,
  tags = [],
  createTime,
  width,
  height,
  onFavoriteToggle,
  onCardClick,
  priority = false
}: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);

  const handleCardClick = () => {
    onCardClick?.(id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    onFavoriteToggle?.(id);
  };

  // 计算宽高比
  const aspectRatio = width && height ? width / height : 1;
  const isPortrait = aspectRatio < 1;
  const isLandscape = aspectRatio > 1.5;

  // 格式化日期 - 使用简单的字符串格式化避免 hydration 问题
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  return (
    <Card
      className="w-full bg-white dark:bg-gray-900 shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden group border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图片容器 */}
      <CardBody
        className="p-0 relative overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        <div
          className={`relative w-full overflow-hidden ${
            isPortrait ? 'aspect-[3/4]' : isLandscape ? 'aspect-[16/9]' : 'aspect-square'
          }`}
        >
          <Image
            alt={`Photo ${id}`}
            className="w-full h-full object-cover will-change-transform group-hover:scale-105 transition-transform duration-300"
            src={thumbnailUrl}
            removeWrapper
            loading={priority ? "eager" : "lazy"}
            disableSkeleton={false}
          />

          {/* 悬停时显示的信息层 */}
          <div
            className={`absolute inset-0 will-change-opacity transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* 收藏按钮 - 右上角 */}
            <div
              className="absolute top-2 right-2 z-20"
              onClick={handleFavoriteClick}
            >
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className={`${
                  favorite
                    ? 'bg-red-500/90 text-white'
                    : 'bg-black/40 text-white hover:bg-black/60'
                } backdrop-blur-sm transition-all duration-200`}
              >
                <HeartIcon
                  className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`}
                />
              </Button>
            </div>

            {/* 分辨率标签 - 左上角 */}
            {resolution && (
              <div className="absolute top-2 left-2 z-10">
                <Chip
                  size="sm"
                  variant="solid"
                  className="bg-black/60 backdrop-blur-sm text-white font-semibold"
                >
                  {resolution}
                </Chip>
              </div>
            )}

            {/* 文件格式 - 左下角 */}
            {extension && (
              <div className="absolute bottom-2 left-2 z-10">
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-black/60 backdrop-blur-sm text-white text-xs uppercase"
                >
                  {extension}
                </Chip>
              </div>
            )}

            {/* 文件大小 - 右下角 */}
            {formattedSize && (
              <div className="absolute bottom-2 right-2 z-10">
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-black/60 backdrop-blur-sm text-white text-xs"
                >
                  {formattedSize}
                </Chip>
              </div>
            )}
          </div>

          {/* 底部信息遮罩 - 悬停时显示 */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent will-change-opacity transition-opacity duration-200 pointer-events-none ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              {/* 拍摄日期 */}
              {createTime && (
                <p className="text-xs opacity-90 mb-1">
                  📅 {formatDate(createTime)}
                </p>
              )}

              {/* 标签 */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant="flat"
                      className="bg-white/20 backdrop-blur-sm text-white text-xs"
                    >
                      {tag}
                    </Chip>
                  ))}
                  {tags.length > 3 && (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="bg-white/20 backdrop-blur-sm text-white text-xs"
                    >
                      +{tags.length - 3}
                    </Chip>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

