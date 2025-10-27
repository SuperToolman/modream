"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";

// 模拟番剧详情数据
const getAnimeDetail = (id: string) => {
    const animeDetails = {
        "1": {
            id: "1",
            title: "进击的巨人 最终季",
            subtitle: "Shingeki no Kyojin: The Final Season",
            originalTitle: "進撃の巨人 The Final Season",
            studio: "WIT Studio / MAPPA",
            director: "荒木哲郎 / 林祐一郎",
            rating: 9.8,
            reviewCount: 2150000,
            year: "2023",
            season: "冬",
            status: "已完结" as "连载中" | "已完结" | "未开播",
            episodes: 87,
            currentEpisode: 87,
            duration: "24分钟",
            tags: ["动作", "剧情", "悬疑", "战争", "黑暗", "成人"],
            cover: "https://heroui.com/images/card-example-4.jpeg",
            banner: "https://heroui.com/images/hero-card-complete.jpeg",
            views: "2.1亿",
            followers: "1205万",
            updateDay: "周日",
            updateTime: "每周日 00:00",
            description: "在这个世界上，人类居住在由三重巨大的城墙所围成的都市里。在城墙外面，有着会吃人的巨人徘徊着，而城墙内的人们就如同圈养的家畜般生活着。主人公艾伦·耶格尔对于只能在城墙内侧生活的现状抱有疑问，向往着城墙外面的世界。在艾伦10岁那年，前所未见的「超大型巨人」出现，破坏了城墙，随后消失了。巨人们成群的冲进墙内，人们被迫放弃墙外的土地，退居到更内侧的地区。",
            staff: [
                { role: "原作", name: "谏山创" },
                { role: "监督", name: "荒木哲郎 / 林祐一郎" },
                { role: "系列构成", name: "小林靖子" },
                { role: "角色设计", name: "浅野恭司 / 岸友洋" },
                { role: "音乐", name: "澤野弘之 / KOHTA YAMAMOTO" }
            ],
            cast: [
                { character: "艾伦·耶格尔", voice: "梶裕贵", avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp" },
                { character: "三笠·阿克曼", voice: "石川由依", avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp" },
                { character: "阿明·阿诺德", voice: "井上麻里奈", avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp" },
                { character: "利威尔·阿克曼", voice: "神谷浩史", avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp" }
            ],
            episodes_list: Array.from({length: 87}, (_, i) => ({
                id: i + 1,
                title: `第${i + 1}话`,
                subtitle: i < 10 ? `Season 1 Episode ${i + 1}` : 
                         i < 25 ? `Season 2 Episode ${i - 9}` : 
                         i < 47 ? `Season 3 Episode ${i - 24}` : 
                         `Final Season Episode ${i - 46}`,
                duration: "24:00",
                views: `${Math.floor(Math.random() * 5000 + 1000)}万`,
                uploadDate: "2023-03-04",
                thumbnail: "https://heroui.com/images/card-example-1.jpeg",
                isWatched: i < 85
            })),
            related: [
                {
                    id: "2",
                    title: "进击的巨人 第一季",
                    cover: "https://heroui.com/images/card-example-1.jpeg",
                    relation: "前作"
                },
                {
                    id: "3", 
                    title: "进击的巨人 第二季",
                    cover: "https://heroui.com/images/card-example-2.jpeg",
                    relation: "前作"
                }
            ],
            comments: [
                {
                    id: 1,
                    username: "动漫爱好者",
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp",
                    content: "神作！最终季的制作质量真的太棒了，每一帧都是电影级别的画面！",
                    likes: 2341,
                    replies: 156,
                    time: "3天前",
                    level: 6
                },
                {
                    id: 2,
                    username: "巨人粉丝",
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp",
                    content: "谏山创老师的剧情真的太精彩了，每个角色都有自己的故事和成长轨迹。",
                    likes: 1876,
                    replies: 89,
                    time: "5天前",
                    level: 5
                }
            ],
            isFollowing: true,
            hasNewEpisode: false,
            nextEpisodeTime: null
        }
    };

    return animeDetails[id as keyof typeof animeDetails] || animeDetails["1"];
};

// 为静态导出生成参数 - 移除以支持客户端组件
// export async function generateStaticParams() {
//     return Array.from({length: 20}, (_, i) => ({
//         id: (i + 1).toString()
//     }));
// }

interface AnimeDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function AnimeDetail({ params }: AnimeDetailProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [activeTab, setActiveTab] = useState("episodes");
    const [selectedSeason, setSelectedSeason] = useState("all");

    // 解析 params Promise
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return <div>Loading...</div>;
    }

    const anime = getAnimeDetail(resolvedParams.id);

    // 按季度分组剧集
    const groupedEpisodes = {
        "season1": anime.episodes_list.slice(0, 25),
        "season2": anime.episodes_list.slice(25, 37),
        "season3": anime.episodes_list.slice(37, 59),
        "final": anime.episodes_list.slice(59)
    };

    const seasonOptions = [
        { id: "all", name: "全部", count: anime.episodes_list.length },
        { id: "season1", name: "第一季", count: 25 },
        { id: "season2", name: "第二季", count: 12 },
        { id: "season3", name: "第三季", count: 22 },
        { id: "final", name: "最终季", count: anime.episodes_list.length - 59 }
    ];

    const getDisplayEpisodes = () => {
        if (selectedSeason === "all") return anime.episodes_list;
        return groupedEpisodes[selectedSeason as keyof typeof groupedEpisodes] || [];
    };

    return (
        <div className="space-y-6">
            {/* 番剧横幅 */}
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                    alt={anime.title}
                    src={anime.banner}
                    className="object-cover w-full h-full"
                    removeWrapper
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* 番剧基本信息 */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* 封面 */}
                        <div className="flex-shrink-0">
                            <Image
                                alt={anime.title}
                                src={anime.cover}
                                className="w-32 h-44 object-cover rounded-lg shadow-lg"
                                removeWrapper
                            />
                        </div>
                        
                        {/* 信息 */}
                        <div className="flex-1 text-white">
                            <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
                            <p className="text-lg text-gray-200 mb-2">{anime.subtitle}</p>
                            <p className="text-sm text-gray-300 mb-4">{anime.originalTitle}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400">★</span>
                                    <span className="font-medium">{anime.rating}</span>
                                    <span className="text-gray-300">({anime.reviewCount.toLocaleString()})</span>
                                </div>
                                <Chip color={anime.status === "连载中" ? "success" : anime.status === "已完结" ? "default" : "warning"} size="sm">
                                    {anime.status}
                                </Chip>
                                <span className="text-sm">{anime.year}年{anime.season} · {anime.episodes}话 · {anime.duration}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {anime.tags.map((tag) => (
                                    <Chip key={tag} size="sm" variant="flat" className="bg-white/20 text-white">
                                        {tag}
                                    </Chip>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                <span>{anime.views} 播放</span>
                                <span>{anime.followers} 追番</span>
                                {anime.status === "连载中" && (
                                    <span>{anime.updateTime} 更新</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
                <Button color="primary" size="lg" className="flex-1 md:flex-none">
                    立即观看
                </Button>
                <Button 
                    color={anime.isFollowing ? "success" : "default"} 
                    variant={anime.isFollowing ? "solid" : "bordered"}
                    size="lg"
                >
                    {anime.isFollowing ? "已追番" : "追番"} {anime.followers}
                </Button>
                <Button variant="bordered" size="lg">
                    分享
                </Button>
                <Button variant="bordered" size="lg">
                    收藏
                </Button>
            </div>

            {/* 详细信息标签页 */}
            <Card className="bg-white dark:bg-gray-900">
                <CardHeader>
                    <div className="flex gap-4">
                        {[
                            { id: "episodes", name: "选集" },
                            { id: "info", name: "简介" },
                            { id: "comments", name: "评论" },
                            { id: "related", name: "相关推荐" }
                        ].map((tab) => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "solid" : "light"}
                                color={activeTab === tab.id ? "primary" : "default"}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                {tab.name}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    {activeTab === "episodes" && (
                        <div className="space-y-4">
                            {/* 季度选择 */}
                            <div className="flex flex-wrap gap-2">
                                {seasonOptions.map((season) => (
                                    <Button
                                        key={season.id}
                                        variant={selectedSeason === season.id ? "solid" : "bordered"}
                                        color={selectedSeason === season.id ? "primary" : "default"}
                                        size="sm"
                                        onPress={() => setSelectedSeason(season.id)}
                                    >
                                        {season.name} ({season.count})
                                    </Button>
                                ))}
                            </div>

                            {/* 剧集列表 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {getDisplayEpisodes().slice(0, 20).map((episode) => (
                                    <Link key={episode.id} href={`/content/animes/${anime.id}/watch?episode=${episode.id}`}>
                                        <Card className={`cursor-pointer transition-all hover:scale-105 ${
                                            episode.isWatched 
                                                ? 'bg-gray-100 dark:bg-gray-800 border-2 border-green-500' 
                                                : 'hover:shadow-md'
                                        }`} isPressable>
                                            <CardBody className="p-0">
                                                <div className="relative aspect-video">
                                                    <Image
                                                        alt={episode.title}
                                                        src={episode.thumbnail}
                                                        className="object-cover w-full h-full"
                                                        removeWrapper
                                                    />
                                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                                        {episode.duration}
                                                    </div>
                                                    {episode.isWatched && (
                                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                                                            已看
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-medium text-sm mb-1">{episode.title}</h4>
                                                    <p className="text-xs text-gray-500 mb-1">{episode.subtitle}</p>
                                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                                        <span>{episode.views} 播放</span>
                                                        <span>{episode.uploadDate}</span>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "info" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">剧情简介</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {anime.description}
                                </p>
                            </div>
                            
                            <Divider />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">制作信息</h3>
                                    <div className="space-y-2">
                                        {anime.staff.map((staff, index) => (
                                            <div key={index} className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{staff.role}:</span>
                                                <span className="font-medium">{staff.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">声优阵容</h3>
                                    <div className="space-y-3">
                                        {anime.cast.map((cast, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <Avatar src={cast.avatar} size="sm" />
                                                <div>
                                                    <div className="font-medium text-sm">{cast.character}</div>
                                                    <div className="text-xs text-gray-500">CV: {cast.voice}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "comments" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">评论 ({anime.comments.length})</h3>
                                <Button size="sm" color="primary">
                                    发表评论
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                {anime.comments.map((comment) => (
                                    <Card key={comment.id} className="bg-gray-50 dark:bg-gray-800">
                                        <CardBody className="p-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar src={comment.avatar} size="sm" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium">{comment.username}</span>
                                                        <Chip size="sm" color="primary" variant="flat">
                                                            LV{comment.level}
                                                        </Chip>
                                                        <span className="text-sm text-gray-500">{comment.time}</span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                                        {comment.content}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <button className="flex items-center gap-1 hover:text-blue-500">
                                                            <span>👍</span>
                                                            <span>{comment.likes}</span>
                                                        </button>
                                                        <button className="hover:text-blue-500">
                                                            回复 ({comment.replies})
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "related" && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">相关推荐</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {anime.related.map((related) => (
                                    <Link key={related.id} href={`/content/animes/${related.id}`}>
                                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                            <CardBody className="p-0">
                                                <div className="relative aspect-[3/4]">
                                                    <Image
                                                        alt={related.title}
                                                        src={related.cover}
                                                        className="object-cover w-full h-full"
                                                        removeWrapper
                                                    />
                                                    <div className="absolute top-2 left-2">
                                                        <Chip size="sm" color="primary" variant="solid">
                                                            {related.relation}
                                                        </Chip>
                                                    </div>
                                                </div>
                                                <div className="p-2">
                                                    <h4 className="text-sm font-medium overflow-hidden"
                                                        style={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical'
                                                        }}>
                                                        {related.title}
                                                    </h4>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
