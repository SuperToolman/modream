import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import Link from "next/link";
import { getPlaceholderImage } from "@/lib/placeholder-images";

interface MovieCardProps {
    id?: string;
    title?: string;
    originalTitle?: string;
    director?: string;
    year?: string;
    duration?: string;
    rating?: number;
    imdbRating?: number;
    genre?: string[];
    country?: string;
    language?: string;
    poster?: string;
    views?: string;
    likes?: string;
    quality?: "1080P" | "4K" | "HDR" | "IMAX";
    type?: "电影" | "纪录片" | "短片";
    isCollected?: boolean;
    hasSubtitle?: boolean;
    releaseDate?: string;
}

export default function MovieCard({
    id,
    title,
    originalTitle,
    director,
    year,
    duration,
    rating,
    imdbRating,
    genre = [],
    country,
    language,
    poster,
    views,
    likes,
    quality,
    type,
    isCollected = false,
    hasSubtitle = false,
    releaseDate
}: MovieCardProps) {
    const getQualityColor = (quality: string) => {
        switch (quality) {
            case "4K": return "warning";
            case "HDR": return "secondary";
            case "IMAX": return "success";
            default: return "primary";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "电影": return "primary";
            case "纪录片": return "success";
            case "短片": return "warning";
            default: return "default";
        }
    };

    return (
        <Link href={`/content/movies/${id}`}>
            <Card className="w-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 group" radius="lg" shadow="sm">
                <CardBody className="p-0">
                    {/* 电影海报容器 */}
                    <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
                        <Image
                            alt={title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            src={poster}
                            removeWrapper
                        />
                        
                        {/* 画质标签 */}
                        {quality && (
                            <div className="absolute top-3 left-3 z-10">
                                <Chip
                                    size="sm"
                                    color={getQualityColor(quality) as any}
                                    variant="solid"
                                    className="text-white font-bold"
                                >
                                    {quality}
                                </Chip>
                            </div>
                        )}

                        {/* 类型标签 */}
                        {type && (
                            <div className="absolute top-3 right-3 z-10">
                                <Chip
                                    size="sm"
                                    color={getTypeColor(type) as any}
                                    variant="flat"
                                    className="bg-black/70 text-white"
                                >
                                    {type}
                                </Chip>
                            </div>
                        )}

                        {/* 字幕标识 */}
                        {hasSubtitle && (
                            <div className="absolute top-12 right-3 z-10">
                                <Chip size="sm" color="default" variant="flat" className="bg-black/70 text-white text-xs">
                                    字幕
                                </Chip>
                            </div>
                        )}

                        {/* 评分显示 */}
                        {(rating !== undefined || duration) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent h-20 flex items-end z-10">
                                <div className="w-full p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {rating !== undefined && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-yellow-400 text-sm">★</span>
                                                    <span className="text-white font-medium">{rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                            {imdbRating !== undefined && imdbRating !== rating && (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="text-gray-300">IMDb</span>
                                                    <span className="text-white">{imdbRating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {duration && (
                                            <div className="text-white text-xs">
                                                {duration}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 悬停时显示的操作按钮 */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    color="primary" 
                                    variant="solid"
                                    className="text-white"
                                >
                                    立即观看
                                </Button>
                                <Button 
                                    size="sm" 
                                    color={isCollected ? "success" : "default"} 
                                    variant={isCollected ? "solid" : "bordered"}
                                    className={isCollected ? "text-white" : "text-white border-white"}
                                >
                                    {isCollected ? "已收藏" : "收藏"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 电影信息 */}
                    <div className="p-4">
                        {/* 中文标题 */}
                        {title && (
                            <h3 className="text-base font-bold mb-1 text-gray-900 dark:text-gray-100 leading-tight overflow-hidden"
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                {title}
                            </h3>
                        )}

                        {/* 原标题 */}
                        {originalTitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 overflow-hidden"
                               style={{
                                   display: '-webkit-box',
                                   WebkitLineClamp: 1,
                                   WebkitBoxOrient: 'vertical'
                               }}>
                                {originalTitle}
                            </p>
                        )}

                        {/* 导演和年份 */}
                        {(director || year || country || language) && (
                            <div className="mb-3">
                                {director && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        导演: <span className="text-blue-600 dark:text-blue-400">{director}</span>
                                    </p>
                                )}
                                {(year || country || language) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {[year, country, language].filter(Boolean).join(' · ')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* 类型标签 */}
                        {genre.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {genre.slice(0, 3).map((g) => (
                                    <Chip key={g} size="sm" variant="flat" color="primary" className="text-xs">
                                        {g}
                                    </Chip>
                                ))}
                                {genre.length > 3 && (
                                    <Chip size="sm" variant="flat" color="default" className="text-xs">
                                        +{genre.length - 3}
                                    </Chip>
                                )}
                            </div>
                        )}

                        {/* 统计信息 - 只在有数据时显示 */}
                        {(views || likes || isCollected) && (
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                {(views || likes) && (
                                    <div className="flex items-center gap-3">
                                        {views && <span>{views} 播放</span>}
                                        {likes && <span>{likes} 点赞</span>}
                                    </div>
                                )}
                                {isCollected && (
                                    <Chip size="sm" color="success" variant="flat" className="text-xs">
                                        已收藏
                                    </Chip>
                                )}
                            </div>
                        )}

                        {/* 上映日期 */}
                        {releaseDate && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    上映: {releaseDate}
                                </p>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </Link>
    )
}
