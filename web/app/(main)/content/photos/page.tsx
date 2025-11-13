"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import PhotoCard from "@/components/cards/photo-card";
import PhotoDetailModal from "./components/photo-detail-modal";
import { SearchIcon } from "@/components/icons";
import { photosApi } from "@/lib/api/photos";
import type { Photo, PhotoViewMode, PhotoSortBy } from "@/types/photo";
import { toast } from "sonner";

// 视图模式选项
const viewModes: { id: PhotoViewMode; name: string; icon: string }[] = [
    { id: "grid", name: "网格", icon: "⊞" },
    { id: "masonry", name: "瀑布流", icon: "⊟" },
    { id: "list", name: "列表", icon: "☰" },
];

// 排序选项
const sortOptions: { id: PhotoSortBy; name: string }[] = [
    { id: "date", name: "拍摄日期" },
    { id: "name", name: "文件名" },
    { id: "size", name: "文件大小" },
    { id: "favorite", name: "收藏优先" },
];

export default function Photos() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<PhotoViewMode>("grid");
    const [sortBy, setSortBy] = useState<PhotoSortBy>("date");
    const [selectedFilter, setSelectedFilter] = useState<"all" | "favorites" | string>("all");

    // 模态框状态
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);

    // 使用 ref 来存储最新的状态值，避免闭包问题
    const loadingMoreRef = useRef(false);
    const currentPageRef = useRef(1);
    const totalPagesRef = useRef(1);

    // 同步 ref 和 state
    useEffect(() => {
        loadingMoreRef.current = loadingMore;
        currentPageRef.current = currentPage;
        totalPagesRef.current = totalPages;
    }, [loadingMore, currentPage, totalPages]);

    // 加载照片数据
    useEffect(() => {
        loadPhotos(true);
    }, [selectedFilter]);

    // 滚动到底部时加载更多
    useEffect(() => {
        if (typeof window === 'undefined' || loading) return;

        // 找到滚动容器（layout.tsx 中的 overflow-y-auto 容器）
        const scrollContainer = document.querySelector('main .overflow-y-auto');
        if (!scrollContainer) {
            console.warn('未找到滚动容器');
            return;
        }

        const handleScroll = () => {
            // 使用 ref 获取最新的状态值
            if (loadingMoreRef.current || currentPageRef.current >= totalPagesRef.current) {
                return;
            }

            const scrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const clientHeight = scrollContainer.clientHeight;

            // 距离底部 500px 时触发加载
            if (scrollTop + clientHeight >= scrollHeight - 500) {
                console.log('📜 滚动到底部，加载下一页', {
                    scrollTop,
                    scrollHeight,
                    clientHeight,
                    currentPage: currentPageRef.current,
                    totalPages: totalPagesRef.current
                });

                setLoadingMore(true);
                const nextPage = currentPageRef.current + 1;

                (async () => {
                    try {
                        let response;
                        if (selectedFilter === "favorites") {
                            response = await photosApi.getFavorites({
                                page_index: nextPage,
                                page_size: 24,
                            });
                        } else {
                            response = await photosApi.getPaginated({
                                page_index: nextPage,
                                page_size: 24,
                            });
                        }

                        setPhotos(prev => [...prev, ...response.items]);
                        setTotalPages(response.total_pages);
                        setTotal(response.total);
                        setCurrentPage(nextPage);
                    } catch (error) {
                        console.error("Failed to load more photos:", error);
                        toast.error("加载更多照片失败");
                    } finally {
                        setLoadingMore(false);
                    }
                })();
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [selectedFilter, loading]); // 只依赖 selectedFilter 和 loading

    const loadPhotos = async (reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
                setCurrentPage(1);
            } else {
                setLoadingMore(true);
            }

            const page = reset ? 1 : currentPage;
            let response;

            if (selectedFilter === "favorites") {
                response = await photosApi.getFavorites({
                    page_index: page,
                    page_size: 24,
                });
            } else {
                response = await photosApi.getPaginated({
                    page_index: page,
                    page_size: 24,
                });
            }

            if (reset) {
                setPhotos(response.items);
            } else {
                setPhotos(prev => [...prev, ...response.items]);
            }
            setTotalPages(response.total_pages);
            setTotal(response.total);
        } catch (error) {
            console.error("Failed to load photos:", error);
            toast.error("加载照片失败");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 监听滚动事件，实现无限滚动
    useEffect(() => {
        // 只在客户端执行
        if (typeof window === 'undefined') return;

        const handleScroll = async () => {
            // 检查是否滚动到底部（距离底部 500px 时触发）
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const distanceToBottom = scrollHeight - scrollTop - clientHeight;

            // 检查是否需要加载更多
            if (distanceToBottom < 500 && currentPage < totalPages && !loadingMore) {
                try {
                    setLoadingMore(true);
                    const nextPage = currentPage + 1;

                    let response;
                    if (selectedFilter === "favorites") {
                        response = await photosApi.getFavorites({
                            page_index: nextPage,
                            page_size: 24,
                        });
                    } else {
                        response = await photosApi.getPaginated({
                            page_index: nextPage,
                            page_size: 24,
                        });
                    }

                    setPhotos(prev => [...prev, ...response.items]);
                    setTotalPages(response.total_pages);
                    setTotal(response.total);
                    setCurrentPage(nextPage);
                } catch (error) {
                    console.error("Failed to load more photos:", error);
                    toast.error("加载更多照片失败");
                } finally {
                    setLoadingMore(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentPage, totalPages, loadingMore, selectedFilter]);

    // 打开照片详情模态框
    const handlePhotoClick = (id: number) => {
        setSelectedPhotoId(id);
        setIsDetailModalOpen(true);
    };

    // 关闭照片详情模态框
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedPhotoId(null);
    };

    // 切换收藏状态
    const handleFavoriteToggle = async (id: number) => {
        try {
            await photosApi.toggleFavorite(id);
            // 更新本地状态
            setPhotos(photos.map(photo =>
                photo.id === id
                    ? { ...photo, is_favorite: !photo.is_favorite }
                    : photo
            ));
            toast.success("收藏状态已更新");
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
            toast.error("操作失败");
        }
    };

    // 从模态框切换收藏状态
    const handleFavoriteToggleFromModal = (id: number, isFavorite: boolean) => {
        // 更新本地状态
        setPhotos(photos.map(photo =>
            photo.id === id
                ? { ...photo, is_favorite: isFavorite }
                : photo
        ));
    };

    // 提取所有标签
    const allTags = new Set<string>();
    photos.forEach(photo => {
        photo.tags?.forEach(tag => allTags.add(tag));
    });

    // 筛选数据
    const filteredPhotos = photos.filter(photo => {
        // 搜索过滤
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const pathMatch = photo.path.toLowerCase().includes(query);
            const tagsMatch = photo.tags?.some(tag => tag.toLowerCase().includes(query));
            if (!pathMatch && !tagsMatch) return false;
        }

        return true;
    });

    // 排序数据
    const sortedPhotos = [...filteredPhotos].sort((a, b) => {
        switch (sortBy) {
            case "date":
                return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
            case "name":
                return a.path.localeCompare(b.path);
            case "size":
                return b.byte_size - a.byte_size;
            case "favorite":
                if (a.is_favorite === b.is_favorite) {
                    return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
                }
                return a.is_favorite ? -1 : 1;
            default:
                return 0;
        }
    });

    // 分组数据
    const groupedPhotos = (() => {
        const groups: { [key: string]: Photo[] } = {};

        sortedPhotos.forEach(photo => {
            let groupKey = "";

            switch (sortBy) {
                case "date": {
                    // 按日期分组：2025/11/13
                    const date = new Date(photo.create_time);
                    groupKey = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
                    break;
                }
                case "name": {
                    // 按文件名首字母分组
                    const fileName = photo.path.split(/[/\\]/).pop() || "";
                    const firstChar = fileName.charAt(0).toUpperCase();
                    groupKey = /[A-Z]/.test(firstChar) ? firstChar : "#";
                    break;
                }
                case "size": {
                    // 按文件大小区间分组
                    const mb = photo.byte_size / (1024 * 1024);
                    if (mb < 1) {
                        groupKey = "< 1 MB";
                    } else if (mb < 5) {
                        groupKey = "1 - 5 MB";
                    } else if (mb < 10) {
                        groupKey = "5 - 10 MB";
                    } else if (mb < 50) {
                        groupKey = "10 - 50 MB";
                    } else if (mb < 100) {
                        groupKey = "50 - 100 MB";
                    } else {
                        groupKey = "> 100 MB";
                    }
                    break;
                }
                case "favorite": {
                    // 按收藏状态分组
                    groupKey = photo.is_favorite ? "❤️ 收藏的照片" : "📷 其他照片";
                    break;
                }
                default:
                    groupKey = "未分组";
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(photo);
        });

        return groups;
    })();

    // 统计数据
    const favoriteCount = photos.filter(p => p.is_favorite).length;

    // 网格列数配置
    const getGridCols = () => {
        switch (viewMode) {
            case "grid":
                return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8";
            case "masonry":
                return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 2xl:columns-8";
            case "list":
                return "grid-cols-1";
            default:
                return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8";
        }
    };

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">照片</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">珍藏美好瞬间</p>
                </div>

                {/* 搜索框 */}
                <div className="w-80">
                    <Input
                        placeholder="搜索照片..."
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
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{total}</div>
                        <div className="text-sm opacity-90">照片总数</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{favoriteCount}</div>
                        <div className="text-sm opacity-90">收藏照片</div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                    <CardBody className="p-4 text-center">
                        <div className="text-2xl font-bold">{allTags.size}</div>
                        <div className="text-sm opacity-90">标签数量</div>
                    </CardBody>
                </Card>
            </div>

            {/* 筛选和视图控制 */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* 筛选按钮 */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedFilter === "all" ? "solid" : "bordered"}
                        color={selectedFilter === "all" ? "primary" : "default"}
                        size="sm"
                        onPress={() => setSelectedFilter("all")}
                    >
                        全部照片 ({total})
                    </Button>
                    <Button
                        variant={selectedFilter === "favorites" ? "solid" : "bordered"}
                        color={selectedFilter === "favorites" ? "danger" : "default"}
                        size="sm"
                        onPress={() => setSelectedFilter("favorites")}
                    >
                        ❤️ 我的收藏 ({favoriteCount})
                    </Button>
                </div>

                {/* 排序和视图模式 */}
                <div className="flex items-center gap-4">
                    {/* 排序选择 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">排序:</span>
                        <div className="flex gap-1">
                            {sortOptions.map((option) => (
                                <Button
                                    key={option.id}
                                    variant={sortBy === option.id ? "solid" : "ghost"}
                                    color={sortBy === option.id ? "primary" : "default"}
                                    size="sm"
                                    onPress={() => setSortBy(option.id)}
                                >
                                    {option.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* 视图模式 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">视图:</span>
                        <div className="flex gap-1">
                            {viewModes.map((mode) => (
                                <Button
                                    key={mode.id}
                                    variant={viewMode === mode.id ? "solid" : "ghost"}
                                    color={viewMode === mode.id ? "primary" : "default"}
                                    size="sm"
                                    onPress={() => setViewMode(mode.id)}
                                >
                                    {mode.icon} {mode.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 照片网格 - 分组显示 */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" label="加载中..." />
                </div>
            ) : sortedPhotos.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    暂无照片数据
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedPhotos).map(([groupKey, groupPhotos], groupIndex) => (
                        <div key={groupKey} className="space-y-4">
                            {/* 分组标题 */}
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {groupKey}
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {groupPhotos.length} 张照片
                                </span>
                            </div>

                            {/* 分组照片网格 */}
                            <div className={viewMode === "masonry" ? getGridCols() : `grid ${getGridCols()} gap-4`}>
                                {groupPhotos.map((photo, photoIndex) => {
                                    // 只对第一组的前 12 张照片使用 eager 加载
                                    const shouldPrioritize = groupIndex === 0 && photoIndex < 12;

                                    return (
                                        <div key={photo.id} className={viewMode === "masonry" ? "mb-4 break-inside-avoid" : ""}>
                                            <PhotoCard
                                                id={photo.id}
                                                thumbnailUrl={photosApi.getThumbnailUrl(photo.id)}
                                                resolution={photo.resolution}
                                                extension={photo.extension}
                                                formattedSize={photo.formatted_size}
                                                isFavorite={photo.is_favorite}
                                                tags={photo.tags}
                                                createTime={photo.create_time}
                                                width={photo.width}
                                                height={photo.height}
                                                onFavoriteToggle={handleFavoriteToggle}
                                                onCardClick={handlePhotoClick}
                                                priority={shouldPrioritize}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 加载更多指示器 */}
            {loadingMore && (
                <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" label="加载更多照片..." />
                </div>
            )}

            {/* 已加载全部提示 */}
            {!loading && !loadingMore && sortedPhotos.length > 0 && currentPage >= totalPages && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    已加载全部 {total} 张照片
                </div>
            )}

            {/* 照片详情模态框 */}
            {selectedPhotoId && (
                <PhotoDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    photoId={selectedPhotoId}
                    onFavoriteToggle={handleFavoriteToggleFromModal}
                />
            )}
        </div>
    );
}
