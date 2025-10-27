"use client";

import Link from 'next/link';
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { useState, useEffect } from "react";
import { mangasApi } from '@/lib/api/mangas';
import type { Manga } from '@/types/manga';

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

interface MangaDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function MangaDetail({ params }: MangaDetailProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [manga, setManga] = useState<Manga | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 解析 params Promise 并获取漫画详情
    useEffect(() => {
        params.then(async (resolvedParams) => {
            setResolvedParams(resolvedParams);
            try {
                const mangaId = parseInt(resolvedParams.id, 10);
                const data = await mangasApi.getById(mangaId);
                setManga(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取漫画详情失败');
            } finally {
                setLoading(false);
            }
        });
    }, [params]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
    }

    if (error || !manga) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <Link href="/content/mangas">
                    <Button
                        variant="light"
                        className="mb-4"
                        startContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        }
                    >
                        返回
                    </Button>
                </Link>
                <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <CardBody className="p-6">
                        <p className="text-red-600 dark:text-red-400">
                            {error || '漫画不存在'}
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // 构建完整的 cover URL
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    const coverUrl = manga.cover ? `${baseURL}${manga.cover}` : undefined;

    // 判断是否有作者
    const hasAuthor = manga.author_id !== null && manga.author_id !== undefined;
    const authorAvatarUrl = hasAuthor
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${manga.author_id}`
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* 返回按钮 */}
            <Link href="/content/mangas">
                <Button
                    variant="light"
                    className="mb-4"
                    startContent={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    }
                >
                    返回
                </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 左侧 - 封面和基本信息 */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardBody className="p-0">
                            {/* 封面图片 */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-lg">
                                <Image
                                    alt={manga.title}
                                    className="w-full h-full object-cover"
                                    src={coverUrl}
                                    removeWrapper
                                    isBlurred
                                />
                            </div>

                            <div className="p-6">
                                {/* 标题 */}
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {manga.title}
                                </h1>

                                {/* 作者信息 */}
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <Avatar
                                        size="md"
                                        src={authorAvatarUrl}
                                        name={hasAuthor ? `作者 ${manga.author_id}` : '未知作者'}
                                    />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">作者</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {hasAuthor ? `作者 ${manga.author_id}` : '未知作者'}
                                        </p>
                                    </div>
                                </div>

                                {/* 基本信息 */}
                                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <div className="flex justify-between">
                                        <span>页数:</span>
                                        <span className="text-gray-900 dark:text-white font-medium">{manga.page_count} 页</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>类型:</span>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {manga.manga_type_string || '未分类'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>媒体库:</span>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {manga.media_library_id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>创建时间:</span>
                                        <span className="text-gray-900 dark:text-white font-medium text-xs">
                                            {new Date(manga.create_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>更新时间:</span>
                                        <span className="text-gray-900 dark:text-white font-medium text-xs">
                                            {new Date(manga.update_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <Divider className="my-4" />

                                {/* 操作按钮 */}
                                <div className="flex gap-2">
                                    <Link href={`/content/mangas/${manga.id}/read?page=1`} className="flex-1">
                                        <Button
                                            color="primary"
                                            className="w-full"
                                        >
                                            开始阅读
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="bordered"
                                        isIconOnly
                                        className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* 右侧 - 详情内容 */}
                <div className="lg:col-span-2 space-y-5">
                    {/* 作品简介 Card */}
                    <Card>
                        <CardBody className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                作品简介
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {manga.description || '暂无简介'}
                            </p>
                        </CardBody>
                    </Card>

                    {/* 文件信息和详细信息 Card */}
                    <Card>
                        <CardBody className="p-6">

                            {/* 文件路径信息 */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    文件信息
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">文件路径</p>
                                    <p className="text-sm text-gray-900 dark:text-white break-all font-mono">
                                        {manga.path}
                                    </p>
                                </div>
                            </div>

                            <Divider className="mb-6" />

                            {/* 详细信息 */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    详细信息
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">总页数</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {manga.page_count}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">漫画类型</p>
                                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                            {manga.manga_type_string || '未分类'}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">文件大小</p>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {formatFileSize(manga.byte_size)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 数据结构 Card */}
                    <Card>
                        <CardBody className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                数据结构
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono">
                                    {JSON.stringify(manga, null, 2)}
                                </pre>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}