'use client';

import Link from 'next/link';
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";

interface RecommendedVideo {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    views: number;
    publishTime: string;
    uploader: {
        name: string;
        avatar: string;
    };
    category: string;
}

interface VideoRecommendationsProps {
    currentVideoId: string;
}

export default function VideoRecommendations({ currentVideoId }: VideoRecommendationsProps) {
    // 模拟推荐视频数据
    const recommendedVideos: RecommendedVideo[] = [
        {
            id: "2",
            title: "React 18 新特性详解：Concurrent Features 实战应用",
            thumbnail: "https://heroui.com/images/hero-card-4.jpeg",
            duration: "12:45",
            views: 89000,
            publishTime: "2024-01-10 10:30:00",
            uploader: {
                name: "React技术分享",
                avatar: "https://heroui.com/images/hero-card-3.jpeg"
            },
            category: "前端开发"
        },
        {
            id: "3",
            title: "TypeScript 5.0 重大更新：装饰器和新语法特性",
            thumbnail: "https://heroui.com/images/hero-card-5.jpeg",
            duration: "18:20",
            views: 156000,
            publishTime: "2024-01-08 14:15:00",
            uploader: {
                name: "TS开发指南",
                avatar: "https://heroui.com/images/hero-card-4.jpeg"
            },
            category: "编程语言"
        },
        {
            id: "4",
            title: "Rust 入门教程：从零开始学习系统编程语言",
            thumbnail: "https://heroui.com/images/hero-card-6.jpeg",
            duration: "25:30",
            views: 234000,
            publishTime: "2024-01-05 16:45:00",
            uploader: {
                name: "Rust学习社区",
                avatar: "https://heroui.com/images/hero-card-5.jpeg"
            },
            category: "系统编程"
        },
        {
            id: "5",
            title: "Vue 3 Composition API 最佳实践与性能优化",
            thumbnail: "https://heroui.com/images/hero-card-2.jpeg",
            duration: "16:12",
            views: 178000,
            publishTime: "2024-01-03 11:20:00",
            uploader: {
                name: "Vue技术栈",
                avatar: "https://heroui.com/images/hero-card-6.jpeg"
            },
            category: "前端框架"
        },
        {
            id: "6",
            title: "Docker 容器化部署实战：从开发到生产环境",
            thumbnail: "https://heroui.com/images/hero-card-3.jpeg",
            duration: "22:08",
            views: 145000,
            publishTime: "2024-01-01 09:30:00",
            uploader: {
                name: "DevOps实践",
                avatar: "https://heroui.com/images/hero-card-2.jpeg"
            },
            category: "运维部署"
        },
        {
            id: "7",
            title: "Node.js 性能优化：内存管理与异步编程最佳实践",
            thumbnail: "https://heroui.com/images/hero-card-complete.jpeg",
            duration: "19:45",
            views: 198000,
            publishTime: "2023-12-28 15:10:00",
            uploader: {
                name: "Node.js深度解析",
                avatar: "https://heroui.com/images/hero-card-3.jpeg"
            },
            category: "后端开发"
        },
        {
            id: "8",
            title: "微前端架构设计：qiankun 框架实战应用",
            thumbnail: "https://heroui.com/images/hero-card-4.jpeg",
            duration: "28:15",
            views: 267000,
            publishTime: "2023-12-25 13:45:00",
            uploader: {
                name: "前端架构师",
                avatar: "https://heroui.com/images/hero-card-4.jpeg"
            },
            category: "架构设计"
        }
    ];

    const formatNumber = (num: number) => {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toString();
    };

    const formatTime = (timeStr: string) => {
        const date = new Date(timeStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return `${minutes}分钟前`;
            }
            return `${hours}小时前`;
        } else if (days < 30) {
            return `${days}天前`;
        } else {
            return date.toLocaleDateString();
        }
    };

    // 过滤掉当前视频
    const filteredVideos = recommendedVideos.filter(video => video.id !== currentVideoId);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
                相关推荐
            </h3>
            
            <div className="space-y-3">
                {filteredVideos.map((video) => (
                    <Link key={video.id} href={`/content/videos/${video.id}`}>
                        <Card 
                            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                            isPressable
                        >
                            <CardBody className="p-3">
                                <div className="flex gap-3">
                                    {/* 视频缩略图 */}
                                    <div className="relative flex-shrink-0 w-40 aspect-video overflow-hidden rounded-lg">
                                        <Image
                                            alt={video.title}
                                            className="object-cover w-full h-full"
                                            src={video.thumbnail}
                                            removeWrapper
                                        />
                                        {/* 时长标签 */}
                                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                            {video.duration}
                                        </div>
                                    </div>

                                    {/* 视频信息 */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">
                                            {video.title}
                                        </h4>
                                        
                                        {/* UP主信息 */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <Avatar
                                                src={video.uploader.avatar}
                                                size="sm"
                                                className="w-5 h-5"
                                            />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                {video.uploader.name}
                                            </span>
                                        </div>
                                        
                                        {/* 统计信息 */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{formatNumber(video.views)} 播放</span>
                                                <span>•</span>
                                                <span>{formatTime(video.publishTime)}</span>
                                            </div>
                                            
                                            <Chip size="sm" variant="flat" color="primary" className="text-xs">
                                                {video.category}
                                            </Chip>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* 刷新推荐 */}
            <div className="text-center pt-4">
                <button className="text-sm text-primary hover:text-primary-600 transition-colors">
                    换一批推荐
                </button>
            </div>
        </div>
    );
}
