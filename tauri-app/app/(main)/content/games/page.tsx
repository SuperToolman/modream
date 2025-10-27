"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import GameCard from "@/components/cards/game-card";
import { SearchIcon } from "@/components/icons";
import { getPlaceholderImage } from "@/lib/placeholder-images";

// 模拟游戏数据
const gameData = [
    {
        id: "1",
        title: "Cyberpunk 2077",
        developer: "CD PROJEKT RED",
        publisher: "CD PROJEKT RED",
        price: "¥298",
        originalPrice: "¥398",
        discount: 25,
        rating: 4.2,
        tags: ["开放世界", "RPG", "科幻", "动作"],
        releaseDate: "2020-12-10",
        thumbnail: getPlaceholderImage('games', 0),
        screenshots: [
            getPlaceholderImage('games', 1),
            getPlaceholderImage('games', 2),
            getPlaceholderImage('games', 3)
        ],
        isWishlisted: false,
        isOwned: false,
        platforms: ["Windows", "Mac", "Linux"]
    },
    {
        id: "2",
        title: "The Witcher 3: Wild Hunt",
        developer: "CD PROJEKT RED",
        publisher: "CD PROJEKT RED",
        price: "¥199",
        originalPrice: "¥299",
        discount: 33,
        rating: 4.8,
        tags: ["RPG", "开放世界", "奇幻", "冒险"],
        releaseDate: "2015-05-19",
        thumbnail: getPlaceholderImage('games', 1),
        screenshots: [
            getPlaceholderImage('games', 4),
            getPlaceholderImage('games', 5),
            getPlaceholderImage('games', 6)
        ],
        isWishlisted: true,
        isOwned: false,
        platforms: ["Windows", "Mac", "Linux"]
    },
    {
        id: "3",
        title: "Red Dead Redemption 2",
        developer: "Rockstar Games",
        publisher: "Rockstar Games",
        price: "¥399",
        originalPrice: "",
        discount: 0,
        rating: 4.6,
        tags: ["动作", "冒险", "开放世界", "西部"],
        releaseDate: "2019-11-05",
        thumbnail: "https://heroui.com/images/card-example-6.jpeg",
        screenshots: [
            "https://heroui.com/images/card-example-3.jpeg",
            "https://heroui.com/images/card-example-4.jpeg",
            "https://heroui.com/images/card-example-5.jpeg"
        ],
        isWishlisted: false,
        isOwned: true,
        platforms: ["Windows"]
    },
    {
        id: "4",
        title: "Elden Ring",
        developer: "FromSoftware",
        publisher: "Bandai Namco Entertainment",
        price: "¥298",
        originalPrice: "",
        discount: 0,
        rating: 4.7,
        tags: ["动作", "RPG", "魂系", "奇幻"],
        releaseDate: "2022-02-25",
        thumbnail: "https://heroui.com/images/card-example-1.jpeg",
        screenshots: [
            "https://heroui.com/images/card-example-4.jpeg",
            "https://heroui.com/images/card-example-5.jpeg",
            "https://heroui.com/images/card-example-6.jpeg"
        ],
        isWishlisted: true,
        isOwned: false,
        platforms: ["Windows", "Mac"]
    },
    {
        id: "5",
        title: "Grand Theft Auto V",
        developer: "Rockstar North",
        publisher: "Rockstar Games",
        price: "¥149",
        originalPrice: "¥199",
        discount: 25,
        rating: 4.4,
        tags: ["动作", "冒险", "开放世界", "犯罪"],
        releaseDate: "2015-04-14",
        thumbnail: "https://heroui.com/images/card-example-2.jpeg",
        screenshots: [
            "https://heroui.com/images/card-example-5.jpeg",
            "https://heroui.com/images/card-example-6.jpeg",
            "https://heroui.com/images/card-example-1.jpeg"
        ],
        isWishlisted: false,
        isOwned: true,
        platforms: ["Windows"]
    },
    {
        id: "6",
        title: "Hades",
        developer: "Supergiant Games",
        publisher: "Supergiant Games",
        price: "¥98",
        originalPrice: "¥128",
        discount: 23,
        rating: 4.9,
        tags: ["独立", "动作", "Roguelike", "神话"],
        releaseDate: "2020-09-17",
        thumbnail: "https://heroui.com/images/card-example-3.jpeg",
        screenshots: [
            "https://heroui.com/images/card-example-6.jpeg",
            "https://heroui.com/images/card-example-1.jpeg",
            "https://heroui.com/images/card-example-2.jpeg"
        ],
        isWishlisted: false,
        isOwned: false,
        platforms: ["Windows", "Mac"]
    }
];

// 游戏分类
const categories = [
    { id: "all", name: "全部", count: gameData.length },
    { id: "action", name: "动作", count: 4 },
    { id: "rpg", name: "RPG", count: 4 },
    { id: "adventure", name: "冒险", count: 3 },
    { id: "indie", name: "独立游戏", count: 1 },
    { id: "openworld", name: "开放世界", count: 4 }
];

// 排序选项
const sortOptions = [
    { id: "featured", name: "推荐" },
    { id: "price-low", name: "价格从低到高" },
    { id: "price-high", name: "价格从高到低" },
    { id: "rating", name: "评分最高" },
    { id: "release", name: "发布日期" },
    { id: "name", name: "名称" }
];

export default function Games() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSort, setSelectedSort] = useState("featured");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">游戏商店</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">发现精彩游戏，开启冒险之旅</p>
                </div>

                {/* 搜索框 */}
                <div className="w-80">
                    <Input
                        placeholder="搜索游戏..."
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

            {/* 筛选和排序 */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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

                {/* 排序选项 */}
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
            </div>

            {/* 游戏网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {Array.from({ length: 20 }, (_, index) => {
                    const data = gameData[index % gameData.length];
                    return (
                        <GameCard
                            key={index}
                            id={`${data.id}-${index}`}
                            title={`${data.title}${index > 5 ? ` - Edition ${index - 5}` : ''}`}
                            developer={data.developer}
                            publisher={data.publisher}
                            price={data.price}
                            originalPrice={data.originalPrice}
                            discount={data.discount}
                            rating={data.rating}
                            tags={data.tags}
                            releaseDate={data.releaseDate}
                            thumbnail={data.thumbnail}
                            screenshots={data.screenshots}
                            isWishlisted={data.isWishlisted}
                            isOwned={data.isOwned}
                            platforms={data.platforms}
                        />
                    );
                })}
            </div>
        </div>
    );
}