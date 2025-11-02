"use client";

import Link from 'next/link';
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { useState, useEffect } from "react";
import { mangasApi, mangaChaptersApi } from '@/lib/api';
import type { Manga, MangaChapter } from '@/types/manga';

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
    const [manga, setManga] = useState<Manga | null>(null);
    const [chapters, setChapters] = useState<MangaChapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const chaptersPerPage = 20; // 4 行 × 5 列 = 20 章/页
    const [error, setError] = useState<string | null>(null);

    // 解析 params Promise 并获取漫画详情
    useEffect(() => {
        params.then(async (resolvedParams) => {
            try {
                const mangaId = parseInt(resolvedParams.id, 10);
                const data = await mangasApi.getById(mangaId);
                setManga(data);

                // 如果是章节漫画，获取章节列表
                if (data.has_chapters) {
                    const chaptersData = await mangaChaptersApi.getByMangaId(mangaId);
                    setChapters(chaptersData);
                }
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
    // 直接使用 manga.cover 字段，它已经包含了正确的路径
    // - 非章节漫画: /manga/{id}/cover
    // - 章节漫画: /manga_chapter/{id}/cover
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    const coverUrl = manga.cover
        ? `${baseURL}${manga.cover}?width=300&height=400&quality=85`
        : undefined;



    // 判断是否有作者
    const hasAuthor = manga.author_id !== null && manga.author_id !== undefined;
    const authorAvatarUrl = hasAuthor
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${manga.author_id}`
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

    return (
        <div className="w-full h-full flex flex-col px-[10%]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 flex-1 min-h-0 w-full">
                {/* 左侧 - 封面和基本信息 */}
                <div className="lg:col-span-1 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                        <CardBody className="p-0">
                            {/* 封面图片 */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 line-clamp-3">
                                    {manga.title}
                                </h1>

                                {/* 作者信息 */}
                                {hasAuthor && (
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                        <Avatar
                                            size="md"
                                            src={authorAvatarUrl}
                                            name={`作者 ${manga.author_id}`}
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">作者</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                作者 {manga.author_id}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* 基本信息 */}
                                <div className="space-y-3 text-sm mb-6">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">页数</span>
                                        <span className="text-gray-900 dark:text-white font-semibold">{manga.page_count} 页</span>
                                    </div>
                                    {manga.has_chapters && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                            <span className="text-gray-600 dark:text-gray-400">章节数</span>
                                            <span className="text-gray-900 dark:text-white font-semibold">{chapters.length} 章</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">类型</span>
                                        <span className="text-gray-900 dark:text-white font-semibold">
                                            {manga.manga_type_string || '未分类'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">文件大小</span>
                                        <span className="text-gray-900 dark:text-white font-semibold">
                                            {formatFileSize(manga.byte_size)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600 dark:text-gray-400">更新时间</span>
                                        <span className="text-gray-900 dark:text-white font-semibold text-xs">
                                            {new Date(manga.update_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex gap-3">
                                    <Link
                                        href={
                                            manga.has_chapters && chapters.length > 0
                                                ? `/content/mangas/${manga.id}/read?chapter=${chapters[0].id}&page=1`
                                                : `/content/mangas/${manga.id}/read?page=1`
                                        }
                                        className="flex-1"
                                    >
                                        <Button
                                            color="primary"
                                            size="lg"
                                            className="w-full font-semibold"
                                        >
                                            开始阅读
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="bordered"
                                        size="lg"
                                        isIconOnly
                                        className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* 右侧 - 详情内容 */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
                    {/* 面包屑导航 */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                        <Link href="/content/mangas" className="hover:text-primary transition-colors flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            返回列表
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate">
                            {manga.title}
                        </span>
                    </div>

                    {/* 1. 漫画元数据 Card */}
                    <div className="space-y-4">
                        {/* 标签 */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">标签</h3>
                            </CardHeader>
                            <CardBody>

                                <div className="flex flex-wrap gap-2">
                                    <Chip color="primary" variant="flat" size="sm">恋爱</Chip>
                                    <Chip color="secondary" variant="flat" size="sm">冒险</Chip>
                                    <Chip color="success" variant="flat" size="sm">热血</Chip>
                                    <Chip color="warning" variant="flat" size="sm">搞笑</Chip>
                                    <Chip color="danger" variant="flat" size="sm">悬疑</Chip>
                                </div>
                            </CardBody>
                        </Card>


                        {/* 作品/角色/作者 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* 作品 */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">作品</h3>
                                </CardHeader>
                                <CardBody>

                                    <div className="flex flex-wrap gap-2">
                                        <Chip color="primary" variant="bordered" size="sm">Fate/Grand Order</Chip>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* 角色 */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">角色</h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="flex flex-wrap gap-2">
                                        <Chip color="secondary" variant="bordered" size="sm">阿尔托莉雅</Chip>
                                        <Chip color="secondary" variant="bordered" size="sm">玛修</Chip>
                                    </div>
                                </CardBody>
                            </Card>
                            {/* 作者 */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">作者</h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="flex flex-wrap gap-2">
                                        <Chip color="success" variant="bordered" size="sm">STANKY</Chip>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/* 2. 章节列表 Card - 填满剩余高度 */}
                    {manga.has_chapters && chapters.length > 0 && (() => {
                        // 计算分页
                        const totalPages = Math.ceil(chapters.length / chaptersPerPage);
                        const startIndex = (currentPage - 1) * chaptersPerPage;
                        const endIndex = startIndex + chaptersPerPage;
                        const currentChapters = chapters.slice(startIndex, endIndex);

                        return (
                            <Card className="flex-1 min-h-0">
                                <CardBody className="p-6 flex flex-col min-h-0">
                                    {/* 标题栏 */}
                                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            章节列表
                                        </h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            共 {chapters.length} 章 · 第 {currentPage}/{totalPages} 页
                                        </span>
                                    </div>

                                    {/* 章节网格 - 4 行 × 5 列 */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                        {currentChapters.map((chapter, index) => {
                                            const globalIndex = startIndex + index;
                                            return (
                                                <Link
                                                    key={chapter.id}
                                                    href={`/content/mangas/${manga.id}/read?chapter=${chapter.id}&page=1`}
                                                    className="group block h-24"
                                                >
                                                    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden">
                                                        <div className="p-4 h-full flex flex-col">
                                                            {/* 章节编号 + 标题 */}
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                                                                    {globalIndex + 1}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                                                        {chapter.title}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* 章节信息 */}
                                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                                                                <div className="flex items-center gap-1">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span>{chapter.page_count} 页</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                                    </svg>
                                                                    <span>{formatFileSize(chapter.byte_size)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {/* 分页器 */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center mt-4 flex-shrink-0">
                                            <Pagination
                                                total={totalPages}
                                                page={currentPage}
                                                onChange={setCurrentPage}
                                                showControls
                                                color="primary"
                                                size="sm"
                                            />
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        );
                    })()}

                    {/* 3. 底部信息区 - 左右布局 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
                        {/* 3.1 文件信息 Card */}
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    文件信息
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">文件路径</p>
                                        <p className="text-xs text-gray-700 dark:text-gray-300 break-all font-mono bg-gray-50 dark:bg-gray-800/50 p-3 rounded border border-gray-200 dark:border-gray-700">
                                            {manga.path}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* 3.2 开发者信息 Card（仅开发环境） */}
                        {process.env.NODE_ENV === 'development' && (
                            <Card>
                                <CardBody className="p-6">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        开发者信息
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded p-3 overflow-x-auto border border-gray-200 dark:border-gray-700 max-h-32 custom-scrollbar">
                                        <pre className="text-[10px] text-gray-700 dark:text-gray-300 font-mono">
                                            {JSON.stringify({ manga, chapters }, null, 2)}
                                        </pre>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}