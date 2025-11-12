"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import MovieCard from "@/components/cards/movie-card";
import { SearchIcon } from "@/components/icons";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { moviesApi } from "@/lib/api";
import type { Movie } from "@/types/movie";

// 排序选项
const sortOptions = [
    { id: "hot", name: "热门" },
    { id: "rating", name: "评分" },
    { id: "latest", name: "最新" },
    { id: "views", name: "播放量" },
    { id: "name", name: "名称" }
];

// 年份分类
const yearCategories = [
    { id: "2024", name: "2024" },
    { id: "2023", name: "2023" },
    { id: "2022", name: "2022" },
    { id: "2021", name: "2021" },
    { id: "older", name: "更早" }
];

// 地区分类
const regionCategories = [
    { id: "all", name: "全部地区" },
    { id: "china", name: "中国大陆" },
    { id: "usa", name: "美国" },
    { id: "japan", name: "日本" },
    { id: "korea", name: "韩国" },
    { id: "europe", name: "欧洲" }
];

export default function Movies() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSort, setSelectedSort] = useState("hot");
    const [selectedYear, setSelectedYear] = useState("all");
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // 加载电影数据
    useEffect(() => {
        loadMovies();
    }, [currentPage]);

    const loadMovies = async () => {
        try {
            setLoading(true);
            const response = await moviesApi.getPaginated({
                page_index: currentPage,
                page_size: 50,
            });
            setMovies(response.items);
            setTotalPages(response.total_pages);
            setTotal(response.total);
        } catch (error) {
            console.error("Failed to load movies:", error);
        } finally {
            setLoading(false);
        }
    };

    // 动态计算分类
    const allGenres = new Set<string>();
    movies.forEach(movie => {
        movie.genres?.forEach(genre => allGenres.add(genre));
    });

    const categories = [
        { id: "all", name: "全部", count: movies.length },
        { id: "collected", name: "我的收藏", count: 0 }, // TODO: 实现收藏功能
        ...Array.from(allGenres).map(genre => ({
            id: genre,
            name: genre,
            count: movies.filter(m => m.genres?.includes(genre)).length
        }))
    ];

    // 筛选数据
    const filteredMovies = movies.filter(movie => {
        // 搜索过滤
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const titleMatch = movie.title.toLowerCase().includes(query);
            const originalTitleMatch = movie.original_title?.toLowerCase().includes(query);
            if (!titleMatch && !originalTitleMatch) return false;
        }

        // 分类过滤
        if (selectedCategory !== "all") {
            if (selectedCategory === "collected") {
                // TODO: 实现收藏功能
                return false;
            }
            if (!movie.genres?.some(g => g.includes(selectedCategory))) {
                return false;
            }
        }

        // 年份过滤
        if (selectedYear !== "all") {
            const releaseYear = movie.release_date?.substring(0, 4);
            if (selectedYear === "older") {
                if (!releaseYear || parseInt(releaseYear) >= 2021) return false;
            } else {
                if (releaseYear !== selectedYear) return false;
            }
        }

        return true;
    });

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">电影</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">精彩电影，尽在眼前</p>
                </div>

                {/* 搜索框 */}
                <div className="w-80">
                    <Input
                        placeholder="搜索电影..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        startContent={<SearchIcon className="text-gray-400" />}
                        classNames={{
                            input: "bg-transparent",
                            inputWrapper: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        }}
                    />
                </div>
            </div>

            <Divider />

            {/* 快速统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{total}</div>
                        <div className="text-sm opacity-90">电影总数</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{movies.filter(m => m.resolution && (m.resolution.includes("3840") || m.resolution.includes("4096"))).length}</div>
                        <div className="text-sm opacity-90">4K电影</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{movies.filter(m => m.release_date?.startsWith("2023")).length}</div>
                        <div className="text-sm opacity-90">2023新片</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{movies.filter(m => m.rating >= 8.5).length}</div>
                        <div className="text-sm opacity-90">高分电影</div>
                    </CardBody>
                </Card>
            </div>

            {/* 筛选选项 */}
            <div className="space-y-4">
                {/* 分类筛选 */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "solid" : "bordered"}
                            color={selectedCategory === category.id ? "primary" : "default"}
                            size="sm"
                            onPress={() => setSelectedCategory(category.id)}
                            className="min-w-fit"
                        >
                            {category.name} ({category.count})
                        </Button>
                    ))}
                </div>

                {/* 排序、年份、地区筛选 */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">排序:</span>
                        <div className="flex gap-1">
                            {sortOptions.map((option) => (
                                <Button
                                    key={option.id}
                                    variant={selectedSort === option.id ? "solid" : "ghost"}
                                    color={selectedSort === option.id ? "primary" : "default"}
                                    size="sm"
                                    onPress={() => setSelectedSort(option.id)}
                                >
                                    {option.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">年份:</span>
                            <div className="flex gap-1">
                                <Button
                                    variant={selectedYear === "all" ? "solid" : "ghost"}
                                    color={selectedYear === "all" ? "primary" : "default"}
                                    size="sm"
                                    onPress={() => setSelectedYear("all")}
                                >
                                    全部
                                </Button>
                                {yearCategories.map((year) => (
                                    <Button
                                        key={year.id}
                                        variant={selectedYear === year.id ? "solid" : "ghost"}
                                        color={selectedYear === year.id ? "primary" : "default"}
                                        size="sm"
                                        onPress={() => setSelectedYear(year.id)}
                                    >
                                        {year.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">地区:</span>
                            <div className="flex gap-1">
                                {regionCategories.map((region) => (
                                    <Button
                                        key={region.id}
                                        variant={selectedRegion === region.id ? "solid" : "ghost"}
                                        color={selectedRegion === region.id ? "primary" : "default"}
                                        size="sm"
                                        onPress={() => setSelectedRegion(region.id)}
                                    >
                                        {region.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 电影网格 */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" label="加载中..." />
                </div>
            ) : filteredMovies.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    暂无电影数据
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                    {filteredMovies.map((movie) => {
                        // 提取年份
                        const year = movie.release_date?.substring(0, 4);

                        // 获取导演（取第一个）
                        const director = movie.directors?.[0];

                        // 判断画质
                        let quality: "4K" | "1080P" | "HDR" | "IMAX" | undefined;
                        if (movie.resolution) {
                            if (movie.resolution.includes("3840") || movie.resolution.includes("4096")) {
                                quality = "4K";
                            } else if (movie.resolution.includes("1920")) {
                                quality = "1080P";
                            }
                        }

                        // 获取海报（优先使用 cover，否则使用第一个 poster_url）
                        const poster = movie.cover || movie.poster_urls?.[0] || getPlaceholderImage('movies', movie.id);

                        return (
                            <MovieCard
                                key={movie.id}
                                id={movie.id.toString()}
                                title={movie.title}
                                originalTitle={movie.original_title || undefined}
                                director={director}
                                year={year}
                                duration={movie.formatted_duration}
                                rating={movie.rating > 0 ? movie.rating : undefined}
                                genre={movie.genres || []}
                                poster={poster}
                                quality={quality}
                                type="电影"
                                releaseDate={movie.release_date || undefined}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}