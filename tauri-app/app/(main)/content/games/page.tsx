"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import GameCard from "@/components/cards/game-card";
import { SearchIcon } from "@/components/icons";
import { api } from "@/lib/api";
import type { GameInfo } from "@/types/dto";

export default function Games() {
    const [games, setGames] = useState<GameInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSort, setSelectedSort] = useState("release");
    const [searchQuery, setSearchQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    // 加载游戏列表
    useEffect(() => {
        loadGames();
    }, [pageIndex, pageSize]);

    const loadGames = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.games.getPaginated({
                page_index: pageIndex,
                page_size: pageSize,
            });
            setGames(response.items);
            setTotalCount(response.total);
        } catch (err) {
            console.error('Failed to load games:', err);
            setError(err instanceof Error ? err.message : '加载游戏列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 筛选和排序游戏
    const filteredGames = games.filter(game => {
        // 搜索过滤
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                game.title.toLowerCase().includes(query) ||
                game.developer?.toLowerCase().includes(query) ||
                game.publisher?.toLowerCase().includes(query) ||
                game.description.toLowerCase().includes(query)
            );
        }

        // 分类过滤
        if (selectedCategory !== "all") {
            return game.tabs?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
        }

        return true;
    }).sort((a, b) => {
        // 排序
        switch (selectedSort) {
            case "name":
                return a.title.localeCompare(b.title);
            case "release":
                return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
            default:
                return 0;
        }
    });

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">游戏库</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        共 {totalCount} 款游戏
                    </p>
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
                    <Button
                        variant={selectedCategory === "all" ? "solid" : "bordered"}
                        color={selectedCategory === "all" ? "primary" : "default"}
                        size="sm"
                        onPress={() => setSelectedCategory("all")}
                    >
                        全部
                    </Button>
                    {/* 可以根据实际标签动态生成分类 */}
                </div>

                {/* 排序选项 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">排序:</span>
                    <div className="flex gap-1">
                        <Button
                            variant={selectedSort === "release" ? "solid" : "ghost"}
                            color={selectedSort === "release" ? "primary" : "default"}
                            size="sm"
                            onPress={() => setSelectedSort("release")}
                        >
                            发布日期
                        </Button>
                        <Button
                            variant={selectedSort === "name" ? "solid" : "ghost"}
                            color={selectedSort === "name" ? "primary" : "default"}
                            size="sm"
                            onPress={() => setSelectedSort("name")}
                        >
                            名称
                        </Button>
                    </div>
                </div>
            </div>

            {/* 加载状态 */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" label="加载中..." />
                </div>
            )}

            {/* 错误状态 */}
            {error && (
                <div className="text-center py-20">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button color="primary" onPress={loadGames}>
                        重试
                    </Button>
                </div>
            )}

            {/* 游戏网格 */}
            {!loading && !error && (
                <>
                    {filteredGames.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 dark:text-gray-400">暂无游戏</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {filteredGames.map((game) => (
                                <GameCard
                                    key={game.id}
                                    id={game.id.toString()}
                                    title={game.title}
                                    developer={game.developer || '未知开发商'}
                                    publisher={game.publisher || '未知发行商'}
                                    tags={game.tabs || []}
                                    releaseDate={game.release_date}
                                    thumbnail={game.covers?.[0] || ''}
                                    screenshots={game.covers || []}
                                    platforms={game.platform ? [game.platform] : []}
                                />
                            ))}
                        </div>
                    )}

                    {/* 分页 */}
                    {totalCount > pageSize && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                size="sm"
                                isDisabled={pageIndex === 1}
                                onPress={() => setPageIndex(p => p - 1)}
                            >
                                上一页
                            </Button>
                            <span className="flex items-center px-4 text-sm">
                                第 {pageIndex} 页 / 共 {Math.ceil(totalCount / pageSize)} 页
                            </span>
                            <Button
                                size="sm"
                                isDisabled={pageIndex >= Math.ceil(totalCount / pageSize)}
                                onPress={() => setPageIndex(p => p + 1)}
                            >
                                下一页
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}