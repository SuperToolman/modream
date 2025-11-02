"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
// import { Progress } from "@heroui/progress"; // 如果需要进度条组件
import Link from "next/link";

// 模拟电影详情数据
const getMovieDetail = (id: string) => {
    const movieDetails = {
        "1": {
            id: "1",
            title: "奥本海默",
            originalTitle: "Oppenheimer",
            director: "克里斯托弗·诺兰",
            year: "2023",
            duration: "180分钟",
            rating: 8.8,
            imdbRating: 8.3,
            reviewCount: 850000,
            genre: ["剧情", "传记", "历史", "战争"],
            country: "美国",
            language: "英语",
            poster: "https://heroui.com/images/card-example-4.jpeg",
            banner: "https://heroui.com/images/hero-card-complete.jpeg",
            views: "1250万",
            likes: "89万",
            quality: "4K" as const,
            type: "电影" as const,
            releaseDate: "2023-08-30",
            boxOffice: "$952.7M",
            description: "《奥本海默》是一部2023年美国传记惊悚片，由克里斯托弗·诺兰编剧和执导。影片改编自凯·伯德和马丁·J·舍温的传记《美国普罗米修斯：J·罗伯特·奥本海默的胜利与悲剧》，讲述了理论物理学家J·罗伯特·奥本海默在第二次世界大战期间参与曼哈顿计划研制原子弹的故事。",
            cast: [
                { 
                    name: "基里安·墨菲", 
                    character: "J·罗伯特·奥本海默", 
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp" 
                },
                { 
                    name: "艾米莉·布朗特", 
                    character: "凯瑟琳·奥本海默", 
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp" 
                },
                { 
                    name: "马特·达蒙", 
                    character: "莱斯利·格罗夫斯", 
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp" 
                },
                { 
                    name: "小罗伯特·唐尼", 
                    character: "刘易斯·施特劳斯", 
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp" 
                }
            ],
            crew: [
                { role: "导演", name: "克里斯托弗·诺兰" },
                { role: "编剧", name: "克里斯托弗·诺兰" },
                { role: "制片人", name: "艾玛·托马斯, 查尔斯·罗文" },
                { role: "摄影", name: "霍伊特·范·霍伊特玛" },
                { role: "剪辑", name: "李·史密斯" },
                { role: "音乐", name: "路德维希·戈兰松" }
            ],
            awards: [
                "第96届奥斯卡金像奖 最佳影片",
                "第96届奥斯卡金像奖 最佳导演",
                "第96届奥斯卡金像奖 最佳男主角",
                "第81届金球奖 最佳剧情片",
                "第77届英国电影学院奖 最佳影片"
            ],
            screenshots: [
                "https://heroui.com/images/card-example-1.jpeg",
                "https://heroui.com/images/card-example-2.jpeg",
                "https://heroui.com/images/card-example-3.jpeg",
                "https://heroui.com/images/card-example-5.jpeg",
                "https://heroui.com/images/card-example-6.jpeg"
            ],
            trailers: [
                {
                    title: "官方预告片",
                    thumbnail: "https://heroui.com/images/card-example-1.jpeg",
                    duration: "2:34"
                },
                {
                    title: "幕后花絮",
                    thumbnail: "https://heroui.com/images/card-example-2.jpeg",
                    duration: "5:42"
                }
            ],
            related: [
                {
                    id: "2",
                    title: "敦刻尔克",
                    poster: "https://heroui.com/images/card-example-1.jpeg",
                    relation: "同导演作品"
                },
                {
                    id: "3", 
                    title: "星际穿越",
                    poster: "https://heroui.com/images/card-example-2.jpeg",
                    relation: "同导演作品"
                },
                {
                    id: "4", 
                    title: "盗梦空间",
                    poster: "https://heroui.com/images/card-example-3.jpeg",
                    relation: "同导演作品"
                }
            ],
            comments: [
                {
                    id: 1,
                    username: "电影爱好者",
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp",
                    rating: 5,
                    content: "诺兰又一次证明了自己是当代最伟大的导演之一。基里安·墨菲的表演令人印象深刻！",
                    likes: 3421,
                    replies: 234,
                    time: "2天前",
                    level: 6
                },
                {
                    id: 2,
                    username: "影评人",
                    avatar: "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp",
                    rating: 4,
                    content: "电影在历史准确性和戏剧张力之间找到了完美的平衡点。摄影和音效都是顶级水准。",
                    likes: 2156,
                    replies: 167,
                    time: "4天前",
                    level: 7
                }
            ],
            isCollected: true,
            hasSubtitle: true,
            subtitleLanguages: ["中文", "英文", "日文"]
        }
    };

    return movieDetails[id as keyof typeof movieDetails] || movieDetails["1"];
};

// 为静态导出生成参数 - 移除以支持客户端组件
// export async function generateStaticParams() {
//     return Array.from({length: 20}, (_, i) => ({
//         id: (i + 1).toString()
//     }));
// }

interface MovieDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function MovieDetail({ params }: MovieDetailProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [selectedScreenshot, setSelectedScreenshot] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");

    // 解析 params Promise
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return <div>Loading...</div>;
    }

    const movie = getMovieDetail(resolvedParams.id);

    return (
        <div className="space-y-6">
            {/* 电影横幅 */}
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                    alt={movie.title}
                    src={movie.banner}
                    className="object-cover w-full h-full"
                    removeWrapper
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* 电影基本信息 */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* 海报 */}
                        <div className="flex-shrink-0">
                            <Image
                                alt={movie.title}
                                src={movie.poster}
                                className="w-32 h-48 object-cover rounded-lg shadow-lg"
                                removeWrapper
                            />
                        </div>
                        
                        {/* 信息 */}
                        <div className="flex-1 text-white">
                            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                            <p className="text-lg text-gray-200 mb-2">{movie.originalTitle}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400">★</span>
                                    <span className="font-medium">{movie.rating}</span>
                                    <span className="text-gray-300">豆瓣</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400">★</span>
                                    <span className="font-medium">{movie.imdbRating}</span>
                                    <span className="text-gray-300">IMDb</span>
                                </div>
                                <Chip color="primary" size="sm" className="bg-blue-600">
                                    {movie.quality}
                                </Chip>
                                <span className="text-sm">{movie.year} · {movie.duration} · {movie.country}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {movie.genre.map((g) => (
                                    <Chip key={g} size="sm" variant="flat" className="bg-white/20 text-white">
                                        {g}
                                    </Chip>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                <span>导演: {movie.director}</span>
                                <span>{movie.views} 播放</span>
                                <span>{movie.likes} 点赞</span>
                                <span>票房: {movie.boxOffice}</span>
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
                    color={movie.isCollected ? "success" : "default"} 
                    variant={movie.isCollected ? "solid" : "bordered"}
                    size="lg"
                >
                    {movie.isCollected ? "已收藏" : "收藏"}
                </Button>
                <Button variant="bordered" size="lg">
                    分享
                </Button>
                <Button variant="bordered" size="lg">
                    下载
                </Button>
            </div>

            {/* 详细信息标签页 */}
            <Card className="bg-white dark:bg-gray-900">
                <CardHeader>
                    <div className="flex gap-4">
                        {[
                            { id: "overview", name: "简介" },
                            { id: "cast", name: "演职员" },
                            { id: "media", name: "剧照预告" },
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
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">剧情简介</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {movie.description}
                                </p>
                            </div>
                            
                            <Divider />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">基本信息</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">导演:</span>
                                            <span className="font-medium">{movie.director}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">上映日期:</span>
                                            <span className="font-medium">{movie.releaseDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">片长:</span>
                                            <span className="font-medium">{movie.duration}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">语言:</span>
                                            <span className="font-medium">{movie.language}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">票房:</span>
                                            <span className="font-medium">{movie.boxOffice}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">获奖情况</h3>
                                    <div className="space-y-2">
                                        {movie.awards.slice(0, 5).map((award, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="text-yellow-500">🏆</span>
                                                <span className="text-sm">{award}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "cast" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">主要演员</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {movie.cast.map((actor, index) => (
                                        <Card key={index} className="bg-gray-50 dark:bg-gray-800">
                                            <CardBody className="p-4 text-center">
                                                <Avatar src={actor.avatar} size="lg" className="mx-auto mb-3" />
                                                <h4 className="font-semibold text-sm mb-1">{actor.name}</h4>
                                                <p className="text-xs text-gray-500">{actor.character}</p>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                            
                            <Divider />
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-4">制作团队</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {movie.crew.map((member, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="text-gray-600 dark:text-gray-400">{member.role}:</span>
                                            <span className="font-medium">{member.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "media" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">剧照</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {movie.screenshots.map((screenshot, index) => (
                                        <div key={index} className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                                            <Image
                                                alt={`剧照 ${index + 1}`}
                                                src={screenshot}
                                                className="object-cover w-full h-full"
                                                removeWrapper
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <Divider />
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-4">预告片</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {movie.trailers.map((trailer, index) => (
                                        <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                                            <CardBody className="p-0">
                                                <div className="relative aspect-video">
                                                    <Image
                                                        alt={trailer.title}
                                                        src={trailer.thumbnail}
                                                        className="object-cover w-full h-full"
                                                        removeWrapper
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                                            <span className="text-black text-xl">▶</span>
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                        {trailer.duration}
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-medium text-sm">{trailer.title}</h4>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "comments" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">评论 ({movie.comments.length})</h3>
                                <Button size="sm" color="primary">
                                    发表评论
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                {movie.comments.map((comment) => (
                                    <Card key={comment.id} className="bg-gray-50 dark:bg-gray-800">
                                        <CardBody className="p-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar src={comment.avatar} size="sm" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium">{comment.username}</span>
                                                        <div className="flex text-yellow-400">
                                                            {Array.from({ length: 5 }, (_, i) => (
                                                                <span key={i}>
                                                                    {i < comment.rating ? "★" : "☆"}
                                                                </span>
                                                            ))}
                                                        </div>
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
                                {movie.related.map((related) => (
                                    <Link key={related.id} href={`/content/movies/${related.id}`}>
                                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                            <CardBody className="p-0">
                                                <div className="relative aspect-[2/3]">
                                                    <Image
                                                        alt={related.title}
                                                        src={related.poster}
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
