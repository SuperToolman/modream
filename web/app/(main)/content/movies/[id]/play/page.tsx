"use client";

import { useState, useEffect, use } from "react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Tabs, Tab } from "@heroui/tabs";
import Link from "next/link";
import VideoPlayer from "@/components/video/video-player";
import { moviesApi } from "@/lib/api";
import type { Movie } from "@/types/movie";
import { getPlaceholderImage } from "@/lib/placeholder-images";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function MoviePlayPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const { theme } = useTheme();
    const isSSR = useIsSSR();
    const isDark = theme === 'dark' && !isSSR;

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 主题样式
    const themeStyles = {
        background: isDark ? 'bg-black' : 'bg-gray-100',
        textPrimary: isDark ? 'text-white' : 'text-gray-900',
        textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
        textTertiary: isDark ? 'text-gray-400' : 'text-gray-500',
        cardBg: isDark ? 'bg-gray-900/50' : 'bg-white',
        border: isDark ? 'border-gray-800' : 'border-gray-200',
        buttonBg: isDark ? 'bg-white/10' : 'bg-gray-200',
        buttonBorder: isDark ? 'border-gray-700' : 'border-gray-300',
    };

    // 加载电影详情
    useEffect(() => {
        const loadMovie = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await moviesApi.getById(parseInt(resolvedParams.id));
                setMovie(data);
            } catch (err) {
                console.error("Failed to load movie:", err);
                setError("加载电影详情失败");
            } finally {
                setLoading(false);
            }
        };

        loadMovie();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className={clsx("flex justify-center items-center min-h-screen", themeStyles.background)}>
                <Spinner size="lg" label="加载中..." color="primary" />
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className={clsx("flex flex-col justify-center items-center min-h-screen gap-4", themeStyles.background)}>
                <p className="text-red-500">{error || "电影不存在"}</p>
                <Link href="/content/movies">
                    <Button color="primary">返回电影列表</Button>
                </Link>
            </div>
        );
    }

    // 获取视频 URL
    const videoUrl = moviesApi.getVideoUrl(movie.id);
    const poster = movie.cover || movie.poster_urls?.[0] || getPlaceholderImage('movies', movie.id);

    // 判断画质
    let quality: "4K" | "1080P" | "HDR" | "IMAX" | undefined;
    if (movie.resolution) {
        if (movie.resolution.includes("3840") || movie.resolution.includes("4096")) {
            quality = "4K";
        } else if (movie.resolution.includes("1920")) {
            quality = "1080P";
        }
    }

    // 格式化年份
    const year = movie.release_date ? movie.release_date.substring(0, 4) : null;

    return (
        <div className={clsx("min-h-screen", themeStyles.background)}>
            {/* 主内容区域 */}
            <div className="max-w-[1920px] mx-auto">
                {/* 返回按钮 */}
                <div className="px-4 md:px-8 lg:px-16 py-4">
                    <Link href={`/content/movies/${movie.id}`}>
                        <Button
                            variant="light"
                            className={clsx(isDark ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-gray-900")}
                            startContent={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            }
                        >
                            返回
                        </Button>
                    </Link>
                </div>

                {/* 视频播放器区域 - 电影院式布局 */}
                <div className="px-4 md:px-8 lg:px-16 pb-8">
                    <div className="relative aspect-video bg-black overflow-hidden">
                        <VideoPlayer
                            src={videoUrl}
                            poster={poster}
                            title={movie.title}
                        />
                    </div>
                </div>

                {/* 电影信息和详情区域 */}
                <div className="px-4 md:px-8 lg:px-16 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 左侧主要内容 */}
                        <div className="lg:col-span-2 space-y-6">
                                {/* 电影标题和基本信息 */}
                                <div className="space-y-4">
                                    <h1 className={clsx("text-3xl md:text-4xl font-bold", themeStyles.textPrimary)}>
                                        {movie.title}
                                    </h1>
                                    {movie.original_title && movie.original_title !== movie.title && (
                                        <p className={clsx("text-xl", themeStyles.textTertiary)}>
                                            {movie.original_title}
                                        </p>
                                    )}

                                    {/* 标签栏 */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        {movie.rating > 0 && (
                                            <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-md">
                                                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="text-yellow-500 font-bold text-lg">{movie.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                        {quality && (
                                            <Chip size="md" color="primary" variant="flat" className="font-semibold">
                                                {quality}
                                            </Chip>
                                        )}
                                        {year && (
                                            <Chip
                                                size="md"
                                                variant="flat"
                                                className={clsx(
                                                    isDark
                                                        ? "bg-white/10 text-white"
                                                        : "bg-gray-200 text-gray-900"
                                                )}
                                            >
                                                {year}
                                            </Chip>
                                        )}
                                        {movie.formatted_duration && (
                                            <Chip
                                                size="md"
                                                variant="flat"
                                                className={clsx(
                                                    isDark
                                                        ? "bg-white/10 text-white"
                                                        : "bg-gray-200 text-gray-900"
                                                )}
                                            >
                                                {movie.formatted_duration}
                                            </Chip>
                                        )}
                                    </div>

                                    {/* 类型标签 */}
                                    {movie.genres && movie.genres.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {movie.genres.map((genre, index) => (
                                                <Chip
                                                    key={index}
                                                    size="sm"
                                                    variant="bordered"
                                                    className={clsx(
                                                        isDark
                                                            ? "border-gray-600 text-gray-300"
                                                            : "border-gray-400 text-gray-700"
                                                    )}
                                                >
                                                    {genre}
                                                </Chip>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Divider className={clsx(isDark ? "bg-gray-800" : "bg-gray-300")} />

                                {/* 选项卡 */}
                                <Tabs
                                    aria-label="电影信息"
                                    color="primary"
                                    variant="underlined"
                                    classNames={{
                                        tabList: clsx(
                                            "gap-6 w-full relative rounded-none p-0 border-b",
                                            isDark ? "border-gray-800" : "border-gray-300"
                                        ),
                                        cursor: "w-full bg-primary",
                                        tab: "max-w-fit px-0 h-12",
                                        tabContent: clsx(
                                            "group-data-[selected=true]:text-primary",
                                            isDark ? "text-gray-400" : "text-gray-600"
                                        )
                                    }}
                                >
                                    <Tab key="intro" title="简介">
                                        <div className="py-6 space-y-6">
                                            {/* 简介 */}
                                            {movie.description && (
                                                <div>
                                                    <h3 className={clsx("text-lg font-semibold mb-3", themeStyles.textPrimary)}>剧情简介</h3>
                                                    <p className={clsx("leading-relaxed text-base", themeStyles.textSecondary)}>
                                                        {movie.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 演职人员 */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {movie.directors && movie.directors.length > 0 && (
                                                    <div>
                                                        <h4 className={clsx("text-sm mb-2", themeStyles.textTertiary)}>导演</h4>
                                                        <p className={themeStyles.textPrimary}>{movie.directors.join("、")}</p>
                                                    </div>
                                                )}
                                                {movie.actors && movie.actors.length > 0 && (
                                                    <div>
                                                        <h4 className={clsx("text-sm mb-2", themeStyles.textTertiary)}>主演</h4>
                                                        <p className={themeStyles.textPrimary}>{movie.actors.slice(0, 5).join("、")}</p>
                                                    </div>
                                                )}
                                                {movie.writers && movie.writers.length > 0 && (
                                                    <div>
                                                        <h4 className={clsx("text-sm mb-2", themeStyles.textTertiary)}>编剧</h4>
                                                        <p className={themeStyles.textPrimary}>{movie.writers.join("、")}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Tab>

                                    <Tab key="cast" title="演职人员">
                                        <div className="py-6 space-y-6">
                                            {movie.actors && movie.actors.length > 0 && (
                                                <div>
                                                    <h3 className={clsx("text-lg font-semibold mb-4", themeStyles.textPrimary)}>演员</h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {movie.actors.map((actor, index) => (
                                                            <div
                                                                key={index}
                                                                className={clsx(
                                                                    "transition-colors cursor-pointer",
                                                                    isDark
                                                                        ? "text-gray-300 hover:text-white"
                                                                        : "text-gray-600 hover:text-gray-900"
                                                                )}
                                                            >
                                                                {actor}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {movie.directors && movie.directors.length > 0 && (
                                                <div>
                                                    <h3 className={clsx("text-lg font-semibold mb-4", themeStyles.textPrimary)}>导演</h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {movie.directors.map((director, index) => (
                                                            <div
                                                                key={index}
                                                                className={clsx(
                                                                    "transition-colors cursor-pointer",
                                                                    isDark
                                                                        ? "text-gray-300 hover:text-white"
                                                                        : "text-gray-600 hover:text-gray-900"
                                                                )}
                                                            >
                                                                {director}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Tab>
                                </Tabs>
                            </div>

                            {/* 右侧信息栏 */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* 技术信息 */}
                                <Card className={clsx(themeStyles.cardBg, "border", themeStyles.border)}>
                                    <CardBody className="p-6">
                                        <h3 className={clsx("text-lg font-semibold mb-4", themeStyles.textPrimary)}>技术信息</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className={themeStyles.textTertiary}>分辨率</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.resolution || "未知"}</span>
                                            </div>
                                            <Divider className={clsx(isDark ? "bg-gray-800" : "bg-gray-300")} />
                                            <div className="flex justify-between items-center">
                                                <span className={themeStyles.textTertiary}>文件大小</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.formatted_size}</span>
                                            </div>
                                            <Divider className={clsx(isDark ? "bg-gray-800" : "bg-gray-300")} />
                                            <div className="flex justify-between items-center">
                                                <span className={themeStyles.textTertiary}>格式</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.extension?.toUpperCase() || "未知"}</span>
                                            </div>
                                            {movie.duration && (
                                                <>
                                                    <Divider className={clsx(isDark ? "bg-gray-800" : "bg-gray-300")} />
                                                    <div className="flex justify-between items-center">
                                                        <span className={themeStyles.textTertiary}>时长</span>
                                                        <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.formatted_duration}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* 标签 */}
                                {movie.tags && movie.tags.length > 0 && (
                                    <Card className={clsx(themeStyles.cardBg, "border", themeStyles.border)}>
                                        <CardBody className="p-6">
                                            <h3 className={clsx("text-lg font-semibold mb-4", themeStyles.textPrimary)}>标签</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {movie.tags.map((tag, index) => (
                                                    <Chip
                                                        key={index}
                                                        size="sm"
                                                        variant="flat"
                                                        className={clsx(
                                                            "transition-colors cursor-pointer",
                                                            isDark
                                                                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                        )}
                                                    >
                                                        {tag}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </CardBody>
                                    </Card>
                                )}

                                {/* 操作按钮 */}
                                <div className="space-y-3">
                                    <Button
                                        className={clsx(
                                            "w-full border",
                                            isDark
                                                ? "bg-white/10 hover:bg-white/20 text-white border-gray-700"
                                                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300"
                                        )}
                                        variant="bordered"
                                        startContent={
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        }
                                    >
                                        收藏
                                    </Button>
                                    <Button
                                        className={clsx(
                                            "w-full border",
                                            isDark
                                                ? "bg-white/10 hover:bg-white/20 text-white border-gray-700"
                                                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300"
                                        )}
                                        variant="bordered"
                                        startContent={
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        }
                                    >
                                        分享
                                    </Button>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

