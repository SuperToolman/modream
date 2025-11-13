'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { CloseIcon } from "@/components/icons/photo-icons";
import { TransformWrapper, TransformComponent, MiniMap } from "react-zoom-pan-pinch";
import { photosApi } from "@/lib/api/photos";
import type { PhotoDetail } from "@/types/photo";
import { toast } from "sonner";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import PhotoToolbar from "./photo-toolbar";
import PhotoExifPanel from "./photo-exif-panel";

interface PhotoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoId: number;
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void;
}

export default function PhotoDetailModal({
  isOpen,
  onClose,
  photoId,
  onFavoriteToggle
}: PhotoDetailModalProps) {
  const { theme } = useTheme();
  const isSSR = useIsSSR();
  const isDark = theme === 'dark' && !isSSR;

  const [photo, setPhoto] = useState<PhotoDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  // 主题样式（使用 useMemo 缓存）
  const themeStyles = useMemo(() => ({
    background: isDark
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    cardBg: isDark ? 'bg-gray-800/80' : 'bg-white/90',
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-300',
    chipBg: isDark ? 'bg-white/10' : 'bg-gray-200',
  }), [isDark]);

  // 加载照片详情
  useEffect(() => {
    if (isOpen && photoId) {
      loadPhotoDetail();
    }
  }, [isOpen, photoId]);

  const loadPhotoDetail = async () => {
    setLoading(true);
    try {
      const data = await photosApi.getById(photoId);
      setPhoto(data);
      setFavorite(data.is_favorite);
    } catch (error) {
      console.error("Failed to load photo detail:", error);
      toast.error("加载照片详情失败");
    } finally {
      setLoading(false);
    }
  };

  // 事件处理函数（使用 useCallback 缓存）
  const handleFavoriteClick = useCallback(async () => {
    try {
      await photosApi.toggleFavorite(photoId);
      const newFavorite = !favorite;
      setFavorite(newFavorite);
      onFavoriteToggle?.(photoId, newFavorite);
      toast.success(newFavorite ? "已添加到收藏" : "已取消收藏");
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("操作失败");
    }
  }, [photoId, favorite, onFavoriteToggle]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleFullscreen = useCallback(() => {
    setShowInfoPanel((prev) => !prev);
  }, []);

  const handleDelete = useCallback(async () => {
    // TODO: 实现删除功能
    toast.info("删除功能待实现");
  }, []);

  const handleAddToAlbum = useCallback(() => {
    // TODO: 实现添加到相册功能
    toast.info("添加到相册功能待实现");
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      hideCloseButton
      classNames={{
        backdrop: "bg-black/95 backdrop-blur-sm",
        base: "bg-transparent shadow-none max-w-[90vw]",
        wrapper: "items-center justify-center p-8",
        body: "p-0",
      }}
    >
      <ModalContent className="bg-transparent shadow-none">
        <ModalBody className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-96 rounded-2xl backdrop-blur-xl bg-black/50">
              <Spinner size="lg" color="white" />
            </div>
          ) : photo ? (
            <div className={clsx(
              "grid gap-4 rounded-2xl overflow-hidden shadow-2xl",
              showInfoPanel ? 'grid-cols-1 lg:grid-cols-[1fr_420px]' : 'grid-cols-1'
            )}>
              {/* 左侧：可缩放的原图 */}
              <div className={clsx(
                "relative overflow-hidden group",
                "h-[80vh]",
                showInfoPanel ? "rounded-l-2xl" : "rounded-2xl",
                isDark
                  ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
                  : "bg-gradient-to-br from-gray-100 via-white to-gray-50"
              )}>
                {/* 装饰性网格背景 */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: isDark
                    ? 'radial-gradient(circle, white 1px, transparent 1px)'
                    : 'radial-gradient(circle, black 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />

                {/* 关闭按钮（当信息面板隐藏时显示） */}
                {!showInfoPanel && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onClose}
                    className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 backdrop-blur-md"
                    title="关闭 (ESC)"
                  >
                    <CloseIcon />
                  </Button>
                )}

                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={10}
                    wheel={{ step: 0.1 }}
                    doubleClick={{ mode: "reset" }}
                    centerOnInit={true}
                    centerZoomedOut={true}
                    alignmentAnimation={{ disabled: false }}
                    limitToBounds={false}
                  >
                  {({ zoomIn, zoomOut }) => (
                    <>
                      {/* 顶部操作栏 */}
                      <PhotoToolbar
                        zoomIn={zoomIn}
                        zoomOut={zoomOut}
                        onRotate={handleRotate}
                        onTogglePanel={handleFullscreen}
                        onFavorite={handleFavoriteClick}
                        onDelete={handleDelete}
                        onAddToAlbum={handleAddToAlbum}
                        showInfoPanel={showInfoPanel}
                        isFavorite={favorite}
                      />

                      <TransformComponent
                        wrapperStyle={{
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        <img
                          src={photosApi.getImageUrl(photo.id)}
                          alt={`Photo ${photo.id}`}
                          style={{
                            userSelect: 'none',
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </TransformComponent>

                      {/* 官方 MiniMap 组件 */}
                      <MiniMap
                        width={192}
                        height={192}
                        borderColor="rgba(255, 255, 255, 0.3)"
                        className="!absolute !top-20 !right-4 !bg-black/60 !backdrop-blur-sm !rounded-lg !p-2"
                      >
                        <img
                          src={photosApi.getImageUrl(photo.id)}
                          alt="Minimap"
                          className="w-full h-full object-contain opacity-50"
                          style={{
                            transform: `rotate(${rotation}deg)`,
                          }}
                        />
                      </MiniMap>
                    </>
                  )}
                </TransformWrapper>
                </div>
              </div>

              {/* 右侧：详细信息 */}
              {showInfoPanel && (
              <div className={clsx(
                "relative p-6 overflow-y-auto space-y-4 rounded-r-2xl h-[80vh]",
                "backdrop-blur-xl border-l",
                themeStyles.border,
                isDark ? "bg-gray-900/95" : "bg-white/95"
              )}>
                {/* 关闭按钮 */}
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={onClose}
                  className={clsx(
                    "absolute top-4 right-4 z-50",
                    isDark ? "text-white hover:bg-white/10" : "text-gray-900 hover:bg-gray-900/10"
                  )}
                  title="关闭 (ESC)"
                >
                  <CloseIcon />
                </Button>

                {/* 基本信息卡片 */}
                <Card className={clsx("backdrop-blur-md border", themeStyles.cardBg, themeStyles.border)}>
                  <CardHeader className="pb-3">
                    <h3 className={clsx("text-lg font-bold", themeStyles.textPrimary)}>📋 基本信息</h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-3 text-sm">
                      <InfoRow label="文件路径" value={photo.path} />
                      <InfoRow label="文件大小" value={formatFileSize(photo.byte_size)} />
                      <InfoRow label="分辨率" value={photo.resolution || '未知'} />
                      <InfoRow label="尺寸" value={photo.width && photo.height ? `${photo.width} × ${photo.height}` : '未知'} />
                      <InfoRow label="格式" value={photo.extension?.toUpperCase() || '未知'} />
                      <InfoRow label="创建时间" value={formatDate(photo.create_time)} />
                      <InfoRow label="修改时间" value={formatDate(photo.update_time)} />
                      {photo.hash && <InfoRow label="文件哈希" value={photo.hash.substring(0, 16) + '...'} />}
                    </div>
                  </CardBody>
                </Card>

                {/* 标签卡片 */}
                {photo.tags && photo.tags.length > 0 && (
                  <Card className={clsx("backdrop-blur-md border", themeStyles.cardBg, themeStyles.border)}>
                    <CardHeader className="pb-3">
                      <h3 className={clsx("text-lg font-bold", themeStyles.textPrimary)}>🏷️ 标签</h3>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {photo.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            size="sm"
                            variant="bordered"
                            className={clsx(
                              "backdrop-blur-sm",
                              isDark ? "border-blue-400/50 text-blue-300" : "border-blue-500 text-blue-700"
                            )}
                          >
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* EXIF 信息面板 */}
                <PhotoExifPanel
                  exif={photo.exif}
                  isDark={isDark}
                  themeStyles={themeStyles}
                />
              </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-500 dark:text-gray-400">加载失败</p>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// 信息行组件（用于基本信息卡片）
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 group">
      <span className="text-gray-500 dark:text-gray-400 min-w-[100px] font-medium text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="text-gray-900 dark:text-white text-right flex-1 break-all font-mono text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {value}
      </span>
    </div>
  );
}

