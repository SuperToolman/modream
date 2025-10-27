"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import MovieCard from "@/components/cards/movie-card";
import { SearchIcon } from "@/components/icons";
import { getPlaceholderImage } from "@/lib/placeholder-images";

// 模拟电影数据
const movieData = [
    {
        id: "1",
        title: "奥本海默",
        originalTitle: "Oppenheimer",
        director: "克里斯托弗·诺兰",
        year: "2023",
        duration: "180分钟",
        rating: 8.8,
        imdbRating: 8.3,
        genre: ["剧情", "传记", "历史"],
        country: "美国",
        language: "英语",
        poster: getPlaceholderImage('movies', 0),
        views: "1250万",
        likes: "89万",
        quality: "4K" as const,
        type: "电影" as const,
        isCollected: true,
        hasSubtitle: true,
        releaseDate: "2023-08-30"
    },
    {
        id: "2",
        title: "芭比",
        originalTitle: "Barbie",
        director: "格蕾塔·葛韦格",
        year: "2023",
        duration: "114分钟",
        rating: 8.2,
        imdbRating: 6.9,
        genre: ["喜剧", "奇幻", "冒险"],
        country: "美国",
        language: "英语",
        poster: "https://heroui.com/images/card-example-5.jpeg",
        views: "2100万",
        likes: "156万",
        quality: "1080P" as const,
        type: "电影" as const,
        isCollected: false,
        hasSubtitle: true,
        releaseDate: "2023-07-21"
    },
    {
        id: "3",
        title: "蜘蛛侠：纵横宇宙",
        originalTitle: "Spider-Man: Across the Spider-Verse",
        director: "华金·多斯·桑托斯",
        year: "2023",
        duration: "140分钟",
        rating: 9.1,
        imdbRating: 8.7,
        genre: ["动画", "动作", "冒险"],
        country: "美国",
        language: "英语",
        poster: "https://heroui.com/images/card-example-6.jpeg",
        views: "1800万",
        likes: "234万",
        quality: "IMAX" as const,
        type: "电影" as const,
        isCollected: true,
        hasSubtitle: true,
        releaseDate: "2023-06-02"
    },
    {
        id: "4",
        title: "速度与激情10",
        originalTitle: "Fast X",
        director: "路易斯·莱特里尔",
        year: "2023",
        duration: "141分钟",
        rating: 7.8,
        imdbRating: 5.8,
        genre: ["动作", "犯罪", "惊悚"],
        country: "美国",
        language: "英语",
        poster: "https://heroui.com/images/card-example-1.jpeg",
        views: "3200万",
        likes: "198万",
        quality: "HDR" as const,
        type: "电影" as const,
        isCollected: false,
        hasSubtitle: true,
        releaseDate: "2023-05-19"
    },
    {
        id: "5",
        title: "银河护卫队3",
        originalTitle: "Guardians of the Galaxy Vol. 3",
        director: "詹姆斯·古恩",
        year: "2023",
        duration: "150分钟",
        rating: 8.5,
        imdbRating: 7.9,
        genre: ["动作", "冒险", "喜剧"],
        country: "美国",
        language: "英语",
        poster: "https://heroui.com/images/card-example-2.jpeg",
        views: "2800万",
        likes: "267万",
        quality: "4K" as const,
        type: "电影" as const,
        isCollected: true,
        hasSubtitle: true,
        releaseDate: "2023-05-05"
    },
    {
        id: "6",
        title: "我本是高山",
        originalTitle: "I Am What I Am",
        director: "郑大圣",
        year: "2023",
        duration: "112分钟",
        rating: 7.2,
        imdbRating: 6.8,
        genre: ["剧情", "传记"],
        country: "中国",
        language: "中文",
        poster: "https://heroui.com/images/card-example-3.jpeg",
        views: "890万",
        likes: "67万",
        quality: "1080P" as const,
        type: "电影" as const,
        isCollected: false,
        hasSubtitle: false,
        releaseDate: "2023-11-24"
    }
];

// 电影分类
const categories = [
    { id: "all", name: "全部", count: movieData.length },
    { id: "collected", name: "我的收藏", count: movieData.filter(m => m.isCollected).length },
    { id: "action", name: "动作", count: 3 },
    { id: "drama", name: "剧情", count: 3 },
    { id: "comedy", name: "喜剧", count: 2 },
    { id: "animation", name: "动画", count: 1 },
    { id: "documentary", name: "纪录片", count: 0 }
];

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

    // 筛选数据
    const filteredMovies = movieData.filter(movie => {
        if (selectedCategory === "collected") return movie.isCollected;
        if (selectedCategory === "action") return movie.genre.includes("动作");
        if (selectedCategory === "drama") return movie.genre.includes("剧情");
        if (selectedCategory === "comedy") return movie.genre.includes("喜剧");
        if (selectedCategory === "animation") return movie.genre.includes("动画");
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
                        <div className="text-2xl font-bold">{movieData.filter(m => m.isCollected).length}</div>
                        <div className="text-sm opacity-90">我的收藏</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{movieData.filter(m => m.quality === "4K").length}</div>
                        <div className="text-sm opacity-90">4K电影</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{movieData.filter(m => m.year === "2023").length}</div>
                        <div className="text-sm opacity-90">2023新片</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{movieData.filter(m => m.rating >= 8.5).length}</div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {Array.from({ length: 21 }, (_, index) => {
                    const data = filteredMovies[index % filteredMovies.length];
                    return (
                        <MovieCard
                            key={index}
                            id={`${data.id}-${index}`}
                            title={`${data.title}${index > 5 ? ` ${Math.floor(index / 6) + 1}` : ''}`}
                            originalTitle={data.originalTitle}
                            director={data.director}
                            year={data.year}
                            duration={data.duration}
                            rating={data.rating}
                            imdbRating={data.imdbRating}
                            genre={data.genre}
                            country={data.country}
                            language={data.language}
                            poster={data.poster}
                            views={data.views}
                            likes={data.likes}
                            quality={data.quality}
                            type={data.type}
                            isCollected={data.isCollected}
                            hasSubtitle={data.hasSubtitle}
                            releaseDate={data.releaseDate}
                        />
                    );
                })}
            </div>
        </div>
    );
}