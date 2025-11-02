import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import Link from "next/link";
import { getPlaceholderImage } from "@/lib/placeholder-images";

interface AnimeCardProps {
    id?: string;
    title?: string;
    subtitle?: string;
    studio?: string;
    rating?: number;
    year?: string;
    season?: string;
    status?: "连载中" | "已完结" | "未开播";
    episodes?: number;
    currentEpisode?: number;
    tags?: string[];
    cover?: string;
    views?: string;
    followers?: string;
    updateDay?: string;
    isFollowing?: boolean;
    hasNewEpisode?: boolean;
}

export default function AnimeCard({
    id = "1",
    title = "进击的巨人 最终季",
    subtitle = "Shingeki no Kyojin: The Final Season",
    studio = "WIT Studio / MAPPA",
    rating = 9.8,
    year = "2023",
    season = "冬",
    status = "已完结",
    episodes = 87,
    currentEpisode = 87,
    tags = ["动作", "剧情", "悬疑"],
    cover = getPlaceholderImage('animes', 0),
    views = "2.1亿",
    followers = "1205万",
    updateDay = "周日",
    isFollowing = false,
    hasNewEpisode = false
}: AnimeCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "连载中": return "success";
            case "已完结": return "default";
            case "未开播": return "warning";
            default: return "default";
        }
    };

    return (
        <Link href={`/content/animes/${id}`}>
            <Card className="w-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-400 group" radius="lg" shadow="sm">
                <CardBody className="p-0">
                    {/* 封面图片容器 */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                        <Image
                            alt={title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            src={cover}
                            removeWrapper
                        />
                        
                        {/* 状态标签 */}
                        <div className="absolute top-3 left-3 z-10">
                            <Chip 
                                size="sm" 
                                color={getStatusColor(status) as any}
                                variant="solid"
                                className="text-white font-medium"
                            >
                                {status}
                            </Chip>
                        </div>

                        {/* 新剧集提示 */}
                        {hasNewEpisode && status === "连载中" && (
                            <div className="absolute top-3 right-3 z-10">
                                <Chip size="sm" color="danger" variant="solid" className="animate-pulse">
                                    NEW
                                </Chip>
                            </div>
                        )}

                        {/* 评分 */}
                        <div className="absolute top-3 right-3 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span>{rating}</span>
                        </div>

                        {/* 进度条（连载中显示） */}
                        {status === "连载中" && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent h-16 flex items-end z-10">
                                <div className="w-full p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-white text-xs">
                                            {currentEpisode}/{episodes === 0 ? "?" : episodes}
                                        </span>
                                        <span className="text-white text-xs">{updateDay}更新</span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-1">
                                        <div 
                                            className="bg-pink-500 h-1 rounded-full transition-all duration-300"
                                            style={{ 
                                                width: episodes > 0 ? `${(currentEpisode / episodes) * 100}%` : '0%' 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 已完结显示总集数 */}
                        {status === "已完结" && (
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                                全{episodes}话
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
                                    color={isFollowing ? "success" : "default"} 
                                    variant={isFollowing ? "solid" : "bordered"}
                                    className={isFollowing ? "text-white" : "text-white border-white"}
                                >
                                    {isFollowing ? "已追番" : "追番"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 番剧信息 */}
                    <div className="p-4">
                        {/* 标题 */}
                        <h3 className="text-base font-bold mb-1 text-gray-900 dark:text-gray-100 leading-tight overflow-hidden"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical'
                            }}>
                            {title}
                        </h3>

                        {/* 副标题 */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 overflow-hidden"
                           style={{
                               display: '-webkit-box',
                               WebkitLineClamp: 1,
                               WebkitBoxOrient: 'vertical'
                           }}>
                            {subtitle}
                        </p>

                        {/* 制作信息 */}
                        <div className="mb-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {studio} · {year}年{season}
                            </p>
                        </div>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-1 mb-3">
                            {tags.slice(0, 3).map((tag) => (
                                <Chip key={tag} size="sm" variant="flat" color="primary" className="text-xs">
                                    {tag}
                                </Chip>
                            ))}
                            {tags.length > 3 && (
                                <Chip size="sm" variant="flat" color="default" className="text-xs">
                                    +{tags.length - 3}
                                </Chip>
                            )}
                        </div>

                        {/* 统计信息 */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-3">
                                <span>{views} 播放</span>
                                <span>{followers} 追番</span>
                            </div>
                            {isFollowing && (
                                <Chip size="sm" color="success" variant="flat" className="text-xs">
                                    已追番
                                </Chip>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Link>
    )
}
