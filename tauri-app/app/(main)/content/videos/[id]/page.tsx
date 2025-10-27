"use client";

import Link from 'next/link';
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import VideoPlayer from "@/components/video/video-player";
import VideoComments from "@/components/video/video-comments";
import VideoRecommendations from "@/components/video/video-recommendations";
import { useState, useEffect } from "react";

// 模拟视频详情数据
const getVideoDetail = (id: string) => {
    const videoDetails = {
        "1": {
            id: "1",
            title: "【技术分享】Next.js 15 + Tauri 2 桌面应用开发完整教程",
            description: "本视频详细介绍了如何使用 Next.js 15 和 Tauri 2 构建现代化的桌面应用程序。包含项目搭建、UI设计、窗口控制、打包发布等完整流程。适合有一定前端基础的开发者学习。",
            videoUrl: "/assets/video/test-video.mp4",
            thumbnail: "https://heroui.com/images/hero-card-complete.jpeg",
            duration: "15:32",
            views: 125000,
            likes: 8900,
            coins: 1200,
            favorites: 3400,
            shares: 560,
            publishTime: "2024-01-15 14:30:00",
            uploader: {
                name: "前端技术分享",
                avatar: "https://heroui.com/images/hero-card-2.jpeg",
                followers: 89000,
                isFollowed: false,
                level: 6,
                description: "专注前端技术分享，每周更新最新技术教程"
            },
            tags: ["前端开发", "Next.js", "Tauri", "桌面应用", "教程"],
            category: "科技",
            quality: ["1080P", "720P", "480P"],
            currentQuality: "1080P",
            danmakuCount: 2340,
            isLiked: false,
            isFavorited: false,
            isCoined: false
        }
    };
    return videoDetails[id as keyof typeof videoDetails] || videoDetails["1"];
};

// 为静态导出生成参数 - 移除以支持客户端组件
// export async function generateStaticParams() {
//     return Array.from({length: 20}, (_, i) => ({
//         id: (i + 1).toString()
//     }));
// }

interface VideoDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function VideoDetail({ params }: VideoDetailProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

    // 解析 params Promise
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return <div>Loading...</div>;
    }

    const video = getVideoDetail(resolvedParams.id);

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

    return (
        <div className="max-w-full mx-auto">
            {/* 返回按钮 */}
            <div className="p-4">
                <Link href="/content">
                    <Button
                        variant="light"
                        startContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        }
                    >
                        返回
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 px-4 pb-6">
                {/* 左侧主要内容区域 */}
                <div className="xl:col-span-3 space-y-4">
                    {/* 视频播放器 */}
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <VideoPlayer 
                            src={video.videoUrl}
                            poster={video.thumbnail}
                            title={video.title}
                        />
                    </div>

                    {/* 视频信息 */}
                    <Card>
                        <CardBody className="p-6">
                            {/* 标题和标签 */}
                            <div className="mb-4">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {video.title}
                                </h1>
                                <div className="flex flex-wrap gap-2">
                                    {video.tags.map((tag) => (
                                        <Chip key={tag} variant="flat" size="sm" color="primary">
                                            {tag}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            {/* 视频统计信息 */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <span>{formatNumber(video.views)} 播放</span>
                                <span>•</span>
                                <span>{video.danmakuCount} 弹幕</span>
                                <span>•</span>
                                <span>{formatTime(video.publishTime)}</span>
                                <span>•</span>
                                <span>{video.category}</span>
                            </div>

                            {/* 互动按钮 */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <Button
                                    variant={video.isLiked ? "solid" : "bordered"}
                                    color={video.isLiked ? "danger" : "default"}
                                    startContent={
                                        <svg className="w-4 h-4" fill={video.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    }
                                    size="sm"
                                >
                                    {formatNumber(video.likes)}
                                </Button>

                                <Button
                                    variant={video.isCoined ? "solid" : "bordered"}
                                    color={video.isCoined ? "warning" : "default"}
                                    startContent={
                                        <svg className="w-4 h-4" fill={video.isCoined ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    }
                                    size="sm"
                                >
                                    {formatNumber(video.coins)}
                                </Button>

                                <Button
                                    variant={video.isFavorited ? "solid" : "bordered"}
                                    color={video.isFavorited ? "secondary" : "default"}
                                    startContent={
                                        <svg className="w-4 h-4" fill={video.isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    }
                                    size="sm"
                                >
                                    {formatNumber(video.favorites)}
                                </Button>

                                <Button
                                    variant="bordered"
                                    startContent={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                        </svg>
                                    }
                                    size="sm"
                                >
                                    {formatNumber(video.shares)}
                                </Button>
                            </div>

                            <Divider className="mb-6" />

                            {/* UP主信息 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        src={video.uploader.avatar}
                                        size="lg"
                                        className="ring-2 ring-primary-200"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {video.uploader.name}
                                            </h3>
                                            <Chip size="sm" color="primary" variant="flat">
                                                Lv.{video.uploader.level}
                                            </Chip>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatNumber(video.uploader.followers)} 粉丝
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {video.uploader.description}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    color={video.uploader.isFollowed ? "default" : "primary"}
                                    variant={video.uploader.isFollowed ? "bordered" : "solid"}
                                    size="sm"
                                >
                                    {video.uploader.isFollowed ? "已关注" : "+ 关注"}
                                </Button>
                            </div>

                            <Divider className="my-6" />

                            {/* 视频简介 */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">视频简介</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {video.description}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 评论区 */}
                    <VideoComments videoId={video.id} />
                </div>

                {/* 右侧推荐视频 */}
                <div className="xl:col-span-1">
                    <VideoRecommendations currentVideoId={video.id} />
                </div>
            </div>
        </div>
    );
}
