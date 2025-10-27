"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import AnimeCard from "@/components/cards/anime-card";
import { SearchIcon } from "@/components/icons";
import { getPlaceholderImage } from "@/lib/placeholder-images";

// 模拟番剧数据
const animeData = [
    {
        id: "1",
        title: "进击的巨人 最终季",
        subtitle: "Shingeki no Kyojin: The Final Season",
        studio: "WIT Studio / MAPPA",
        rating: 9.8,
        year: "2023",
        season: "冬",
        status: "已完结" as const,
        episodes: 87,
        currentEpisode: 87,
        tags: ["动作", "剧情", "悬疑", "战争"],
        cover: getPlaceholderImage('animes', 0),
        views: "2.1亿",
        followers: "1205万",
        updateDay: "周日",
        isFollowing: true,
        hasNewEpisode: false
    },
    {
        id: "2",
        title: "鬼灭之刃 锻刀村篇",
        subtitle: "Kimetsu no Yaiba: Katanakaji no Sato-hen",
        studio: "Ufotable",
        rating: 9.5,
        year: "2023",
        season: "春",
        status: "已完结" as const,
        episodes: 11,
        currentEpisode: 11,
        tags: ["动作", "超自然", "历史"],
        cover: "https://heroui.com/images/card-example-5.jpeg",
        views: "1.8亿",
        followers: "980万",
        updateDay: "周日",
        isFollowing: false,
        hasNewEpisode: false
    },
    {
        id: "3",
        title: "咒术回战 第二季",
        subtitle: "Jujutsu Kaisen Season 2",
        studio: "MAPPA",
        rating: 9.3,
        year: "2023",
        season: "夏",
        status: "连载中" as const,
        episodes: 23,
        currentEpisode: 15,
        tags: ["动作", "超自然", "学校"],
        cover: "https://heroui.com/images/card-example-6.jpeg",
        views: "1.5亿",
        followers: "856万",
        updateDay: "周四",
        isFollowing: true,
        hasNewEpisode: true
    },
    {
        id: "4",
        title: "间谍过家家 第二季",
        subtitle: "SPY×FAMILY Season 2",
        studio: "WIT Studio & CloverWorks",
        rating: 9.1,
        year: "2023",
        season: "秋",
        status: "连载中" as const,
        episodes: 12,
        currentEpisode: 8,
        tags: ["喜剧", "动作", "家庭"],
        cover: "https://heroui.com/images/card-example-1.jpeg",
        views: "1.2亿",
        followers: "745万",
        updateDay: "周六",
        isFollowing: false,
        hasNewEpisode: true
    },
    {
        id: "5",
        title: "葬送的芙莉莲",
        subtitle: "Sousou no Frieren",
        studio: "Madhouse",
        rating: 9.7,
        year: "2023",
        season: "秋",
        status: "连载中" as const,
        episodes: 28,
        currentEpisode: 12,
        tags: ["奇幻", "剧情", "冒险"],
        cover: "https://heroui.com/images/card-example-2.jpeg",
        views: "8500万",
        followers: "623万",
        updateDay: "周五",
        isFollowing: true,
        hasNewEpisode: false
    },
    {
        id: "6",
        title: "药屋少女的呢喃",
        subtitle: "Kusuriya no Hitorigoto",
        studio: "OLM & TOHO animation STUDIO",
        rating: 8.9,
        year: "2023",
        season: "秋",
        status: "连载中" as const,
        episodes: 24,
        currentEpisode: 10,
        tags: ["历史", "悬疑", "医学"],
        cover: "https://heroui.com/images/card-example-3.jpeg",
        views: "6800万",
        followers: "445万",
        updateDay: "周六",
        isFollowing: false,
        hasNewEpisode: true
    }
];

// 番剧分类
const categories = [
    { id: "all", name: "全部", count: animeData.length },
    { id: "following", name: "我的追番", count: animeData.filter(a => a.isFollowing).length },
    { id: "airing", name: "连载中", count: animeData.filter(a => a.status === "连载中").length },
    { id: "completed", name: "已完结", count: animeData.filter(a => a.status === "已完结").length },
    { id: "upcoming", name: "即将开播", count: 0 },
    { id: "new", name: "有更新", count: animeData.filter(a => a.hasNewEpisode).length }
];

// 排序选项
const sortOptions = [
    { id: "hot", name: "热门" },
    { id: "rating", name: "评分" },
    { id: "update", name: "更新时间" },
    { id: "follow", name: "追番人数" },
    { id: "name", name: "名称" }
];

// 时间分类
const timeCategories = [
    { id: "2024", name: "2024年" },
    { id: "2023", name: "2023年" },
    { id: "2022", name: "2022年" },
    { id: "older", name: "更早" }
];

export default function Animes() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSort, setSelectedSort] = useState("hot");
    const [selectedYear, setSelectedYear] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // 筛选数据
    const filteredAnimes = animeData.filter(anime => {
        if (selectedCategory === "following") return anime.isFollowing;
        if (selectedCategory === "airing") return anime.status === "连载中";
        if (selectedCategory === "completed") return anime.status === "已完结";
        if (selectedCategory === "new") return anime.hasNewEpisode;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">追番</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">发现精彩番剧，追寻动漫世界</p>
                </div>

                {/* 搜索框 */}
                <div className="w-80">
                    <Input
                        placeholder="搜索番剧..."
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
                <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{animeData.filter(a => a.isFollowing).length}</div>
                        <div className="text-sm opacity-90">我的追番</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{animeData.filter(a => a.status === "连载中").length}</div>
                        <div className="text-sm opacity-90">连载中</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{animeData.filter(a => a.hasNewEpisode).length}</div>
                        <div className="text-sm opacity-90">有更新</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{animeData.filter(a => a.status === "已完结").length}</div>
                        <div className="text-sm opacity-90">已完结</div>
                    </CardBody>
                </Card>
            </div>

            {/* 筛选和排序 */}
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

                {/* 排序和年份筛选 */}
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
                            {timeCategories.map((year) => (
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
                </div>
            </div>

            {/* 番剧网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {Array.from({ length: 21 }, (_, index) => {
                    const data = filteredAnimes[index % filteredAnimes.length];
                    return (
                        <AnimeCard
                            key={index}
                            id={`${data.id}-${index}`}
                            title={`${data.title}${index > 5 ? ` Part ${Math.floor(index / 6)}` : ''}`}
                            subtitle={data.subtitle}
                            studio={data.studio}
                            rating={data.rating}
                            year={data.year}
                            season={data.season}
                            status={data.status}
                            episodes={data.episodes}
                            currentEpisode={data.currentEpisode}
                            tags={data.tags}
                            cover={data.cover}
                            views={data.views}
                            followers={data.followers}
                            updateDay={data.updateDay}
                            isFollowing={data.isFollowing}
                            hasNewEpisode={data.hasNewEpisode}
                        />
                    );
                })}
            </div>
        </div>
    );
}