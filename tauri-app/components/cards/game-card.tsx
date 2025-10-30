"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import Link from "next/link";

interface GameCardProps {
    id: string;
    title: string;
    developer?: string;
    publisher?: string;
    tags?: string[];
    releaseDate?: string;
    thumbnail?: string;
    screenshots?: string[];
    platforms?: string[];
}

export default function GameCard({
    id,
    title,
    developer,
    publisher,
    tags = [],
    releaseDate,
    thumbnail,
    screenshots = [],
    platforms = []
}: GameCardProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
    const carouselTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 获取所有可用的封面图片（包括 thumbnail 和 screenshots）
    const allImages = [thumbnail, ...screenshots].filter(Boolean) as string[];
    const hasMultipleImages = allImages.length > 1;

    // 处理鼠标悬停
    useEffect(() => {
        if (isHovering && hasMultipleImages) {
            // 悬停2秒后开始轮播
            hoverTimerRef.current = setTimeout(() => {
                // 开始轮播，每2秒切换一张图片
                carouselTimerRef.current = setInterval(() => {
                    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
                }, 2000);
            }, 2000);
        } else {
            // 清除定时器并重置索引
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = null;
            }
            if (carouselTimerRef.current) {
                clearInterval(carouselTimerRef.current);
                carouselTimerRef.current = null;
            }
            setCurrentImageIndex(0);
        }

        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
        };
    }, [isHovering, hasMultipleImages, allImages.length]);

    // 默认封面图片路径
    const defaultCover = "/assets/image/game_cover_defualt.png";
    const displayImage = allImages.length > 0 ? allImages[currentImageIndex] : defaultCover;

    return (
        <Link href={`/content/games/${id}`}>
            <Card className="w-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400" radius="lg" shadow="sm">
                <CardBody className="p-0">
                    {/* 游戏封面图片容器 */}
                    <div
                        className="relative aspect-[16/9] overflow-hidden rounded-t-lg group"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <Image
                            alt={title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            src={displayImage}
                            removeWrapper
                        />

                        {/* 平台图标 */}
                        {platforms.length > 0 && (
                            <div className="absolute top-3 right-3 flex gap-1 z-10">
                                {platforms.map((platform) => (
                                    <div key={platform} className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                        {platform}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 悬停时底部显示开发商和发行商信息 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-12 pb-3 px-4 z-10">
                            <div className="text-white space-y-1">
                                {developer && (
                                    <p className="text-sm font-medium truncate">
                                        开发商: {developer}
                                    </p>
                                )}
                                {publisher && (
                                    <p className="text-xs text-gray-200 truncate">
                                        发行商: {publisher}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 轮播指示器 */}
                        {hasMultipleImages && (
                            <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                                {currentImageIndex + 1} / {allImages.length}
                            </div>
                        )}
                    </div>

                    {/* 游戏信息 */}
                    <div className="p-4">
                        {/* 游戏标题 - 固定2行高度 */}
                        <h3
                            className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100 overflow-hidden"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                minHeight: '3.5rem', // 约2行的高度
                                lineHeight: '1.75rem'
                            }}
                        >
                            {title}
                        </h3>

                        {/* 标签 - 固定高度区域 */}
                        <div className="flex flex-wrap gap-1 mb-3" style={{ minHeight: '1.75rem' }}>
                            {tags.slice(0, 3).map((tag) => (
                                <Chip key={tag} size="sm" variant="flat" color="default" className="text-xs">
                                    {tag}
                                </Chip>
                            ))}
                            {tags.length > 3 && (
                                <Chip size="sm" variant="flat" color="default" className="text-xs">
                                    +{tags.length - 3}
                                </Chip>
                            )}
                        </div>

                        {/* 发布日期 */}
                        {releaseDate && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    发布日期: {releaseDate}
                                </span>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </Link>
    )
}
