import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import Link from "next/link";
import { getPlaceholderImage } from "@/lib/placeholder-images";

interface GameCardProps {
    id?: string;
    title?: string;
    developer?: string;
    publisher?: string;
    price?: string;
    originalPrice?: string;
    discount?: number;
    rating?: number;
    tags?: string[];
    releaseDate?: string;
    thumbnail?: string;
    screenshots?: string[];
    isWishlisted?: boolean;
    isOwned?: boolean;
    platforms?: string[];
}

export default function GameCard({
    id = "1",
    title = "Cyberpunk 2077",
    developer = "CD PROJEKT RED",
    publisher = "CD PROJEKT RED",
    price = "¥298",
    originalPrice = "¥398",
    discount = 25,
    rating = 4.2,
    tags = ["开放世界", "RPG", "科幻", "动作"],
    releaseDate = "2020-12-10",
    thumbnail = getPlaceholderImage('games', 0),
    screenshots = [
        getPlaceholderImage('games', 1),
        getPlaceholderImage('games', 2),
        getPlaceholderImage('games', 3)
    ],
    isWishlisted = false,
    isOwned = false,
    platforms = ["Windows", "Mac", "Linux"]
}: GameCardProps) {
    return (
        <Link href={`/content/games/${id}`}>
            <Card className="w-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400" radius="lg" shadow="sm">
                <CardBody className="p-0">
                    {/* 游戏封面图片容器 */}
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg group">
                        <Image
                            alt={title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            src={thumbnail}
                            removeWrapper
                        />
                        
                        {/* 折扣标签 */}
                        {discount && discount > 0 && (
                            <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                -{discount}%
                            </div>
                        )}
                        
                        {/* 平台图标 */}
                        <div className="absolute top-3 right-3 flex gap-1 z-10">
                            {platforms.map((platform) => (
                                <div key={platform} className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                    {platform === "Windows" ? "Win" : platform === "Mac" ? "Mac" : "Linux"}
                                </div>
                            ))}
                        </div>

                        {/* 悬停时显示的截图预览 */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex gap-2 overflow-hidden">
                                {screenshots.slice(0, 3).map((screenshot, index) => (
                                    <div key={index} className="w-20 h-12 rounded overflow-hidden">
                                        <Image
                                            alt={`Screenshot ${index + 1}`}
                                            className="object-cover w-full h-full"
                                            src={screenshot}
                                            removeWrapper
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 底部渐变遮罩 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent h-16 flex items-end z-10">
                            <div className="flex items-center justify-between w-full p-3">
                                <div className="flex items-center gap-2">
                                    {/* 评分 */}
                                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                        <span>★</span>
                                        <span className="text-white">{rating}</span>
                                    </div>
                                </div>
                                
                                {/* 状态标签 */}
                                {isOwned && (
                                    <Chip size="sm" color="success" variant="flat">
                                        已拥有
                                    </Chip>
                                )}
                                {isWishlisted && !isOwned && (
                                    <Chip size="sm" color="primary" variant="flat">
                                        已收藏
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 游戏信息 */}
                    <div className="p-4">
                        {/* 游戏标题 */}
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100 leading-tight overflow-hidden"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical'
                            }}>
                            {title}
                        </h3>

                        {/* 开发商信息 */}
                        <div className="mb-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                开发商: <span className="text-blue-600 dark:text-blue-400 hover:underline">{developer}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                发行商: {publisher}
                            </p>
                        </div>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-1 mb-3">
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

                        {/* 价格和发布日期 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {discount && discount > 0 ? (
                                    <>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                            {originalPrice}
                                        </span>
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {price}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {price}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {releaseDate}
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </Link>
    )
}
