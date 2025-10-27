"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
// import { Progress } from "@heroui/progress"; // 如果需要进度条组件

// 模拟游戏详情数据
const getGameDetail = (id: string) => {
    const gameDetails = {
        "1": {
            id: "1",
            title: "Cyberpunk 2077",
            developer: "CD PROJEKT RED",
            publisher: "CD PROJEKT RED",
            price: "¥298",
            originalPrice: "¥398",
            discount: 25,
            rating: 4.2,
            reviewCount: 125000,
            tags: ["开放世界", "RPG", "科幻", "动作", "第一人称", "未来主义"],
            releaseDate: "2020-12-10",
            lastUpdate: "2024-01-15",
            description: "《赛博朋克2077》是一款开放世界动作冒险RPG，故事发生在赛博朋克世界的大都会夜之城。玩家将扮演一名雇佣兵V，追寻一个独一无二的植入物——获得永生的关键。你可以自定义角色的义体、技能和玩法，探索包罗万象的城市。你做出的选择将会影响剧情走向和你周围的世界。",
            features: [
                "成为赛博朋克",
                "生活在未来",
                "建立你的传奇"
            ],
            systemRequirements: {
                minimum: {
                    os: "Windows 10 64-bit",
                    processor: "Intel Core i5-3570K / AMD FX-8310",
                    memory: "8 GB RAM",
                    graphics: "NVIDIA GeForce GTX 780 / AMD Radeon RX 470",
                    storage: "70 GB 可用空间"
                },
                recommended: {
                    os: "Windows 10 64-bit",
                    processor: "Intel Core i7-4790 / AMD Ryzen 3 3200G",
                    memory: "12 GB RAM",
                    graphics: "NVIDIA GeForce GTX 1060 / AMD Radeon R9 Fury",
                    storage: "70 GB 可用空间"
                }
            },
            screenshots: [
                "https://heroui.com/images/card-example-1.jpeg",
                "https://heroui.com/images/card-example-2.jpeg",
                "https://heroui.com/images/card-example-3.jpeg",
                "https://heroui.com/images/card-example-4.jpeg",
                "https://heroui.com/images/card-example-5.jpeg",
                "https://heroui.com/images/card-example-6.jpeg"
            ],
            videos: [
                {
                    title: "官方预告片",
                    thumbnail: "https://heroui.com/images/card-example-1.jpeg",
                    duration: "2:34"
                },
                {
                    title: "游戏玩法演示",
                    thumbnail: "https://heroui.com/images/card-example-2.jpeg",
                    duration: "15:42"
                }
            ],
            reviews: [
                {
                    id: 1,
                    username: "玩家123",
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp",
                    rating: 5,
                    date: "2024-01-10",
                    content: "画面震撼，剧情引人入胜，虽然有些bug但整体体验很棒！",
                    helpful: 234,
                    playtime: "120小时"
                },
                {
                    id: 2,
                    username: "游戏达人",
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp",
                    rating: 4,
                    date: "2024-01-08",
                    content: "开放世界做得很好，但优化还有待提升。期待后续更新。",
                    helpful: 156,
                    playtime: "85小时"
                }
            ],
            dlc: [
                {
                    name: "Phantom Liberty",
                    price: "¥268",
                    description: "全新间谍惊悚扩展包",
                    releaseDate: "2023-09-26"
                }
            ],
            achievements: {
                total: 44,
                unlocked: 12,
                percentage: 27
            },
            platforms: ["Windows", "Mac", "Linux"],
            languages: ["简体中文", "英语", "日语", "韩语"],
            isWishlisted: false,
            isOwned: false,
            inCart: false
        }
    };

    return gameDetails[id as keyof typeof gameDetails] || gameDetails["1"];
};

// 为静态导出生成参数 - 移除以支持客户端组件
// export async function generateStaticParams() {
//     return Array.from({length: 20}, (_, i) => ({
//         id: (i + 1).toString()
//     }));
// }

interface GameDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function GameDetail({ params }: GameDetailProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [selectedScreenshot, setSelectedScreenshot] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const [showSystemReq, setShowSystemReq] = useState("minimum");

    // 解析 params Promise
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return <div>Loading...</div>;
    }

    const game = getGameDetail(resolvedParams.id);

    return (
        <div className="space-y-6">
            {/* 游戏头部信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧：截图和视频 */}
                <div className="lg:col-span-2 space-y-4">
                    {/* 主要截图 */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <Image
                            alt={game.title}
                            src={game.screenshots[selectedScreenshot]}
                            className="object-cover w-full h-full"
                            removeWrapper
                        />
                    </div>

                    {/* 截图缩略图 */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {game.screenshots.map((screenshot, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedScreenshot(index)}
                                className={`flex-shrink-0 w-20 h-12 rounded overflow-hidden border-2 transition-colors ${
                                    selectedScreenshot === index 
                                        ? 'border-blue-500' 
                                        : 'border-transparent hover:border-gray-300'
                                }`}
                            >
                                <Image
                                    alt={`Screenshot ${index + 1}`}
                                    src={screenshot}
                                    className="object-cover w-full h-full"
                                    removeWrapper
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 右侧：游戏信息和购买 */}
                <div className="space-y-4">
                    <Card className="bg-white dark:bg-gray-900">
                        <CardBody className="p-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {game.title}
                            </h1>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400">★</span>
                                    <span className="font-medium">{game.rating}</span>
                                    <span className="text-gray-500">({game.reviewCount.toLocaleString()} 评价)</span>
                                </div>
                                
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p>开发商: <span className="text-blue-600 dark:text-blue-400">{game.developer}</span></p>
                                    <p>发行商: {game.publisher}</p>
                                    <p>发布日期: {game.releaseDate}</p>
                                </div>
                            </div>

                            {/* 标签 */}
                            <div className="flex flex-wrap gap-1 mb-6">
                                {game.tags.map((tag) => (
                                    <Chip key={tag} size="sm" variant="flat" color="primary">
                                        {tag}
                                    </Chip>
                                ))}
                            </div>

                            {/* 价格和购买 */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    {game.discount > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Chip color="success" size="sm">-{game.discount}%</Chip>
                                                <span className="text-sm text-gray-500 line-through">{game.originalPrice}</span>
                                            </div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {game.price}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {game.price}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Button 
                                        color="primary" 
                                        size="lg" 
                                        className="w-full"
                                        disabled={game.isOwned}
                                    >
                                        {game.isOwned ? "已拥有" : game.inCart ? "已在购物车" : "添加到购物车"}
                                    </Button>
                                    
                                    <Button 
                                        variant="bordered" 
                                        size="lg" 
                                        className="w-full"
                                    >
                                        {game.isWishlisted ? "已收藏" : "添加到愿望单"}
                                    </Button>
                                </div>
                            </div>

                            {/* 平台支持 */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">支持平台:</p>
                                <div className="flex gap-2">
                                    {game.platforms.map((platform) => (
                                        <Chip key={platform} size="sm" variant="flat">
                                            {platform}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* 详细信息标签页 */}
            <Card className="bg-white dark:bg-gray-900">
                <CardHeader>
                    <div className="flex gap-4">
                        {[
                            { id: "overview", name: "概述" },
                            { id: "reviews", name: "评价" },
                            { id: "system", name: "系统要求" },
                            { id: "dlc", name: "DLC" }
                        ].map((tab) => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "solid" : "light"}
                                color={activeTab === tab.id ? "primary" : "default"}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                {tab.name}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">关于这款游戏</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {game.description}
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-3">主要特色</h3>
                                <ul className="space-y-2">
                                    {game.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">用户评价</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400 text-xl">★</span>
                                    <span className="text-xl font-bold">{game.rating}</span>
                                    <span className="text-gray-500">/ 5.0</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {game.reviews.map((review) => (
                                    <Card key={review.id} className="bg-gray-50 dark:bg-gray-800">
                                        <CardBody className="p-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar src={review.avatar} size="sm" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium">{review.username}</span>
                                                        <div className="flex text-yellow-400">
                                                            {Array.from({ length: 5 }, (_, i) => (
                                                                <span key={i}>
                                                                    {i < review.rating ? "★" : "☆"}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">{review.date}</span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                                                        {review.content}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span>游戏时长: {review.playtime}</span>
                                                        <span>👍 {review.helpful} 人觉得有用</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "system" && (
                        <div className="space-y-6">
                            <div className="flex gap-4 mb-4">
                                <Button
                                    variant={showSystemReq === "minimum" ? "solid" : "bordered"}
                                    color={showSystemReq === "minimum" ? "primary" : "default"}
                                    onPress={() => setShowSystemReq("minimum")}
                                >
                                    最低配置
                                </Button>
                                <Button
                                    variant={showSystemReq === "recommended" ? "solid" : "bordered"}
                                    color={showSystemReq === "recommended" ? "primary" : "default"}
                                    onPress={() => setShowSystemReq("recommended")}
                                >
                                    推荐配置
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    {Object.entries(game.systemRequirements[showSystemReq as keyof typeof game.systemRequirements]).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                                {key === 'os' ? '操作系统' : 
                                                 key === 'processor' ? '处理器' :
                                                 key === 'memory' ? '内存' :
                                                 key === 'graphics' ? '显卡' :
                                                 key === 'storage' ? '存储空间' : key}:
                                            </span>
                                            <span className="text-gray-900 dark:text-white">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "dlc" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">可下载内容</h3>
                            {game.dlc.map((dlc, index) => (
                                <Card key={index} className="bg-gray-50 dark:bg-gray-800">
                                    <CardBody className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-lg">{dlc.name}</h4>
                                                <p className="text-gray-600 dark:text-gray-400 mb-2">{dlc.description}</p>
                                                <p className="text-sm text-gray-500">发布日期: {dlc.releaseDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                    {dlc.price}
                                                </div>
                                                <Button color="primary" size="sm">
                                                    购买
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
