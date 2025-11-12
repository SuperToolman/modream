"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { moviesApi } from "@/lib/api";
import type { Movie } from "@/types/movie";
import { getPlaceholderImage } from "@/lib/placeholder-images";

interface MovieDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function MovieDetail({ params }: MovieDetailProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const isSSR = useIsSSR();
    const isDark = theme === 'dark' && !isSSR;

    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    // 主题样式
    const themeStyles = {
        background: isDark
            ? 'bg-gradient-to-b from-gray-900 to-black'
            : 'bg-gradient-to-b from-gray-100 to-white',
        textPrimary: isDark ? 'text-white' : 'text-gray-900',
        textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
        textTertiary: isDark ? 'text-gray-400' : 'text-gray-500',
        cardBg: isDark ? 'bg-gray-800/50' : 'bg-white/80',
        border: isDark ? 'border-gray-700' : 'border-gray-300',
    };

    // 解析 params Promise
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    // 加载电影详情
    useEffect(() => {
        if (!resolvedParams) return;

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
    }, [resolvedParams]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="加载中..." />
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-lg text-gray-600 dark:text-gray-400">{error || "电影不存在"}</p>
                <Button color="primary" onPress={() => router.push("/content/movies")}>
                    返回电影列表
                </Button>
            </div>
        );
    }

    // 提取数据
    const year = movie.release_date?.substring(0, 4);
    const director = movie.directors?.[0];
    const poster = movie.cover || movie.poster_urls?.[0] || getPlaceholderImage('movies', movie.id);
    const banner = movie.poster_urls?.[1] || poster; // 使用第二张海报作为横幅，或使用第一张

    // 判断画质
    let quality: "4K" | "1080P" | "HDR" | "IMAX" | undefined;
    if (movie.resolution) {
        if (movie.resolution.includes("3840") || movie.resolution.includes("4096")) {
            quality = "4K";
        } else if (movie.resolution.includes("1920")) {
            quality = "1080P";
        }
    }

    return (
        <div className={clsx("min-h-screen -mt-16 rounded-2xl overflow-hidden pt-12", themeStyles.background)}>
            {/* 全屏横幅背景 */}
            <div className="relative w-full h-[75vh] min-h-[800px] rounded-t-2xl">
                {/* 背景图片 */}
                <div className="absolute inset-0 z-0">
                    <Image
                        alt={movie.title}
                        src={banner}
                        className="object-cover w-full h-full"
                        removeWrapper
                    />
                </div>

                {/* 渐变遮罩层 - 只保留底部渐变 */}
                {/* 底部渐变：从底部向上渐变到透明 */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                        background: isDark
                            ? 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.3) 40%, transparent 60%)'
                            : 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 20%, rgba(255,255,255,0.4) 40%, transparent 60%)'
                    }}
                />

                {/* 电影信息内容 */}
                <div className="relative h-full w-full px-8 md:px-12 lg:px-16 flex items-end pb-20 z-20">
                    <div className="flex flex-col md:flex-row gap-8 w-full max-w-[1600px] mx-auto">
                        {/* 海报 */}
                        <div className="flex-shrink-0">
                            <div className="relative group">
                                <Image
                                    alt={movie.title}
                                    src={poster}
                                    className="w-48 md:w-64 h-72 md:h-96 object-cover rounded-xl shadow-2xl ring-4 ring-white/10"
                                    removeWrapper
                                />
                                {/* 悬停效果 */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl" />
                            </div>
                        </div>

                        {/* 电影信息 */}
                        <div className={clsx("flex-1 space-y-6", themeStyles.textPrimary)}>
                            {/* 标题 */}
                            <div>
                                <h1 className="text-4xl md:text-6xl font-bold mb-3">
                                    {movie.title}
                                </h1>
                                {movie.original_title && (
                                    <p className={clsx("text-xl md:text-2xl font-light", themeStyles.textSecondary)}>
                                        {movie.original_title}
                                    </p>
                                )}
                            </div>

                            {/* 评分和标签 */}
                            <div className="flex flex-wrap items-center gap-4">
                                {movie.rating > 0 && (
                                    <div className={clsx(
                                        "flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full border",
                                        isDark
                                            ? "bg-yellow-500/20 border-yellow-500/30"
                                            : "bg-yellow-100 border-yellow-400"
                                    )}>
                                        <span className="text-yellow-500 text-2xl">★</span>
                                        <span className={clsx("text-2xl font-bold", themeStyles.textPrimary)}>{movie.rating.toFixed(1)}</span>
                                        <span className={clsx("text-sm", themeStyles.textSecondary)}>/ 10</span>
                                    </div>
                                )}
                                {movie.votes > 0 && (
                                    <div className={clsx("text-sm", themeStyles.textTertiary)}>
                                        {movie.votes.toLocaleString()} 人评价
                                    </div>
                                )}
                                {quality && (
                                    <Chip
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-4 py-1"
                                    >
                                        {quality}
                                    </Chip>
                                )}
                            </div>

                            {/* 基本信息 */}
                            <div className={clsx("flex flex-wrap items-center gap-3", themeStyles.textSecondary)}>
                                {year && (
                                    <span className={clsx(
                                        "px-3 py-1 backdrop-blur-sm rounded-full text-sm",
                                        isDark ? "bg-white/10" : "bg-gray-200"
                                    )}>
                                        {year}
                                    </span>
                                )}
                                {movie.formatted_duration && (
                                    <span className={clsx(
                                        "px-3 py-1 backdrop-blur-sm rounded-full text-sm",
                                        isDark ? "bg-white/10" : "bg-gray-200"
                                    )}>
                                        {movie.formatted_duration}
                                    </span>
                                )}
                                {movie.resolution && (
                                    <span className={clsx(
                                        "px-3 py-1 backdrop-blur-sm rounded-full text-sm",
                                        isDark ? "bg-white/10" : "bg-gray-200"
                                    )}>
                                        {movie.resolution}
                                    </span>
                                )}
                            </div>

                            {/* 类型标签 */}
                            {movie.genres && movie.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {movie.genres.map((g) => (
                                        <Chip
                                            key={g}
                                            variant="bordered"
                                            className={clsx(
                                                "backdrop-blur-sm",
                                                isDark
                                                    ? "border-white/30 text-white"
                                                    : "border-gray-400 text-gray-900"
                                            )}
                                        >
                                            {g}
                                        </Chip>
                                    ))}
                                </div>
                            )}

                            {/* 导演信息 */}
                            {director && (
                                <div className={themeStyles.textSecondary}>
                                    <span className={themeStyles.textTertiary}>导演：</span>
                                    <span className="font-medium">{director}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 操作按钮区域 */}
            <div className="w-full px-8 md:px-12 lg:px-16 -mt-8 relative z-30">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-wrap gap-4">
                        {/* 立即播放按钮 - 主要操作，保持红色渐变 */}
                        <Button
                            size="lg"
                            onPress={() => router.push(`/content/movies/${movie.id}/play`)}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-8 py-6 text-lg shadow-xl transition-all data-[hover=true]:shadow-2xl data-[hover=true]:scale-105"
                            startContent={
                                <svg className="w-6 h-6 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            }
                        >
                            <span className="pointer-events-none">立即播放</span>
                        </Button>

                        {/* 收藏按钮 */}
                        <Button
                            size="lg"
                            variant="bordered"
                            className={clsx(
                                "border-2 backdrop-blur-sm px-6 py-6",
                                isDark
                                    ? "border-white/30 text-white hover:bg-white/10"
                                    : "border-gray-400 text-gray-900 hover:bg-gray-100"
                            )}
                            startContent={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            }
                        >
                            收藏
                        </Button>

                        {/* 分享按钮 */}
                        <Button
                            size="lg"
                            variant="bordered"
                            className={clsx(
                                "border-2 backdrop-blur-sm px-6 py-6",
                                isDark
                                    ? "border-white/30 text-white hover:bg-white/10"
                                    : "border-gray-400 text-gray-900 hover:bg-gray-100"
                            )}
                            startContent={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            }
                        >
                            分享
                        </Button>

                        {/* 打开文件按钮 */}
                        <Button
                            size="lg"
                            variant="bordered"
                            className={clsx(
                                "border-2 backdrop-blur-sm px-6 py-6",
                                isDark
                                    ? "border-white/30 text-white hover:bg-white/10"
                                    : "border-gray-400 text-gray-900 hover:bg-gray-100"
                            )}
                            onPress={() => {
                                if (movie.path) {
                                    window.open(`file:///${movie.path}`, '_blank');
                                }
                            }}
                            startContent={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            }
                        >
                            打开文件
                        </Button>
                    </div>
                </div>
            </div>

            {/* 详细信息标签页 */}
            <div className="w-full px-8 md:px-12 lg:px-16 py-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* 标签导航 */}
                    <div className={clsx("flex gap-2 mb-8 border-b", isDark ? "border-white/10" : "border-gray-300")}>
                        {[
                            { id: "overview", name: "剧情简介", icon: "📖" },
                            { id: "cast", name: "演职员", icon: "🎭" },
                            { id: "media", name: "海报剧照", icon: "🎬" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "px-6 py-3 text-lg font-medium transition-all relative",
                                    activeTab === tab.id
                                        ? isDark ? "text-white" : "text-gray-900"
                                        : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-700 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>

                {/* 标签内容 */}
                <div className="mt-8">
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            {/* 剧情简介 */}
                            {movie.description && (
                                <div className={clsx(
                                    "backdrop-blur-sm rounded-2xl p-8 border",
                                    isDark
                                        ? "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-white/10"
                                        : "bg-white/80 border-gray-200"
                                )}>
                                    <h3 className={clsx("text-2xl font-bold mb-4 flex items-center gap-2", themeStyles.textPrimary)}>
                                        <span className="text-3xl">📖</span>
                                        剧情简介
                                    </h3>
                                    <p className={clsx("leading-relaxed text-lg", themeStyles.textSecondary)}>
                                        {movie.description}
                                    </p>
                                </div>
                            )}

                            {/* 信息卡片 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 基本信息 */}
                                <div className={clsx(
                                    "backdrop-blur-sm rounded-2xl p-6 border",
                                    isDark
                                        ? "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-white/10"
                                        : "bg-white/80 border-gray-200"
                                )}>
                                    <h3 className={clsx("text-xl font-bold mb-4 flex items-center gap-2", themeStyles.textPrimary)}>
                                        <span className="text-2xl">🎬</span>
                                        基本信息
                                    </h3>
                                    <div className="space-y-3">
                                        {director && (
                                            <div className={clsx("flex justify-between items-center py-2 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                                <span className={themeStyles.textTertiary}>导演</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{director}</span>
                                            </div>
                                        )}
                                        {movie.release_date && (
                                            <div className={clsx("flex justify-between items-center py-2 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                                <span className={themeStyles.textTertiary}>上映日期</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.release_date}</span>
                                            </div>
                                        )}
                                        {movie.formatted_duration && (
                                            <div className={clsx("flex justify-between items-center py-2 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                                <span className={themeStyles.textTertiary}>片长</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.formatted_duration}</span>
                                            </div>
                                        )}
                                        {movie.resolution && (
                                            <div className={clsx("flex justify-between items-center py-2 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                                <span className={themeStyles.textTertiary}>分辨率</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.resolution}</span>
                                            </div>
                                        )}
                                        {movie.formatted_size && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className={themeStyles.textTertiary}>文件大小</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.formatted_size}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 文件信息 */}
                                <div className={clsx(
                                    "backdrop-blur-sm rounded-2xl p-6 border",
                                    isDark
                                        ? "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-white/10"
                                        : "bg-white/80 border-gray-200"
                                )}>
                                    <h3 className={clsx("text-xl font-bold mb-4 flex items-center gap-2", themeStyles.textPrimary)}>
                                        <span className="text-2xl">💾</span>
                                        文件信息
                                    </h3>
                                    <div className="space-y-3">
                                        {movie.extension && (
                                            <div className={clsx("flex justify-between items-center py-2 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                                <span className={themeStyles.textTertiary}>文件格式</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.extension.toUpperCase()}</span>
                                            </div>
                                        )}
                                        {movie.width && movie.height && (
                                            <div className={clsx("flex justify-between items-center py-2 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                                <span className={themeStyles.textTertiary}>视频尺寸</span>
                                                <span className={clsx(themeStyles.textPrimary, "font-medium")}>{movie.width} × {movie.height}</span>
                                            </div>
                                        )}
                                        {movie.path && (
                                            <div className={clsx("py-2 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                                <span className={clsx(themeStyles.textTertiary, "block mb-1")}>文件路径</span>
                                                <span className={clsx(themeStyles.textPrimary, "text-sm break-all")}>{movie.path}</span>
                                            </div>
                                        )}
                                        <div className={clsx("flex justify-between items-center py-2 border-b", isDark ? "border-white/5" : "border-gray-200")}>
                                            <span className={themeStyles.textTertiary}>创建时间</span>
                                            <span className={clsx(themeStyles.textPrimary, "text-sm")}>
                                                {new Date(movie.create_time).toLocaleString('zh-CN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className={themeStyles.textTertiary}>更新时间</span>
                                            <span className={clsx(themeStyles.textPrimary, "text-sm")}>
                                                {new Date(movie.update_time).toLocaleString('zh-CN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "cast" && (
                        <div className="space-y-8">
                            {/* 导演 */}
                            {movie.directors && movie.directors.length > 0 && (
                                <div className={clsx(
                                    "backdrop-blur-sm rounded-2xl p-8 border",
                                    isDark
                                        ? "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-white/10"
                                        : "bg-white/80 border-gray-200"
                                )}>
                                    <h3 className={clsx("text-2xl font-bold mb-6 flex items-center gap-2", themeStyles.textPrimary)}>
                                        <span className="text-3xl">🎬</span>
                                        导演
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {movie.directors.map((dir, index) => (
                                            <div
                                                key={index}
                                                className={clsx(
                                                    "backdrop-blur-sm rounded-xl p-4 border transition-all hover:scale-105",
                                                    isDark
                                                        ? "bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/20 hover:border-red-500/40"
                                                        : "bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:border-red-400"
                                                )}
                                            >
                                                <div className="text-center">
                                                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-2xl">
                                                        🎭
                                                    </div>
                                                    <p className={clsx("font-medium", themeStyles.textPrimary)}>{dir}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 演员 */}
                            {movie.actors && movie.actors.length > 0 && (
                                <div className={clsx(
                                    "backdrop-blur-sm rounded-2xl p-8 border",
                                    isDark
                                        ? "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-white/10"
                                        : "bg-white/80 border-gray-200"
                                )}>
                                    <h3 className={clsx("text-2xl font-bold mb-6 flex items-center gap-2", themeStyles.textPrimary)}>
                                        <span className="text-3xl">⭐</span>
                                        主要演员
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {movie.actors.map((actor, index) => (
                                            <div
                                                key={index}
                                                className={clsx(
                                                    "backdrop-blur-sm rounded-xl p-4 border transition-all hover:scale-105",
                                                    isDark
                                                        ? "bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20 hover:border-blue-500/40"
                                                        : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 hover:border-blue-400"
                                                )}
                                            >
                                                <div className="text-center">
                                                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-2xl">
                                                        👤
                                                    </div>
                                                    <p className={clsx("font-medium text-sm", themeStyles.textPrimary)}>{actor}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 空状态 */}
                            {(!movie.actors || movie.actors.length === 0) && (!movie.directors || movie.directors.length === 0) && (
                                <div className={clsx(
                                    "backdrop-blur-sm rounded-2xl p-16 border text-center",
                                    isDark
                                        ? "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-white/10"
                                        : "bg-white/80 border-gray-200"
                                )}>
                                    <div className="text-6xl mb-4">🎭</div>
                                    <p className={clsx("text-lg", themeStyles.textTertiary)}>暂无演职员信息</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "media" && (
                        <div>
                            {movie.poster_urls && movie.poster_urls.length > 0 ? (
                                <div className={clsx(
                                    "backdrop-blur-sm rounded-2xl p-8 border",
                                    isDark
                                        ? "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-white/10"
                                        : "bg-white/80 border-gray-200"
                                )}>
                                    <h3 className={clsx("text-2xl font-bold mb-6 flex items-center gap-2", themeStyles.textPrimary)}>
                                        <span className="text-3xl">🎬</span>
                                        海报剧照
                                        <span className={clsx("text-sm font-normal ml-2", themeStyles.textTertiary)}>({movie.poster_urls.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {movie.poster_urls.map((posterUrl, index) => (
                                            <div
                                                key={index}
                                                className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
                                            >
                                                <Image
                                                    alt={`海报 ${index + 1}`}
                                                    src={posterUrl}
                                                    className="object-cover w-full h-full"
                                                    removeWrapper
                                                />
                                                {/* 悬停遮罩 */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                                        <p className="text-white text-sm font-medium">海报 {index + 1}</p>
                                                    </div>
                                                </div>
                                                {/* 边框光效 */}
                                                <div className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/20 rounded-xl transition-all duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={clsx(
                                    "backdrop-blur-sm rounded-2xl p-16 border text-center",
                                    isDark
                                        ? "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-white/10"
                                        : "bg-white/80 border-gray-200"
                                )}>
                                    <div className="text-6xl mb-4">🎬</div>
                                    <p className={clsx("text-lg", themeStyles.textTertiary)}>暂无海报图片</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
}
