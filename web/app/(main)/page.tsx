'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useIsSSR } from '@react-aria/ssr';
import clsx from 'clsx';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { ChevronRightIcon } from '@heroui/shared-icons';
import AnimeCard from '@/components/cards/anime-card';
import MovieCard from '@/components/cards/movie-card';
import GameCard from '@/components/cards/game-card';
import MangaCard from '@/components/cards/manga-card';
import VideoCard from '@/components/cards/video-card';

export default function Home() {
    const { theme } = useTheme();
    const isSSR = useIsSSR();
    const isDark = theme === 'dark' && !isSSR;

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // 主题样式
    const themeStyles = {
        background: isDark
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
        sectionBg: isDark
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
            : 'bg-white/50 backdrop-blur-sm border border-gray-200/50',
        titleText: isDark
            ? 'text-white'
            : 'text-gray-900',
        subtitleText: isDark
            ? 'text-gray-400'
            : 'text-gray-600',
        divider: isDark
            ? 'bg-gradient-to-r from-transparent via-gray-700 to-transparent'
            : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent',
    };

    // 示例数据
    const animeData = [
        {
            id: '1',
            title: '进击的巨人 最终季',
            subtitle: 'Shingeki no Kyojin: The Final Season',
            studio: 'WIT Studio / MAPPA',
            rating: 9.8,
            year: '2023',
            season: '冬',
            status: '已完结' as const,
            episodes: 87,
            currentEpisode: 87,
            tags: ['动作', '剧情', '悬疑'],
            views: '2.1亿',
            followers: '1205万',
            updateDay: '周日',
        },
        {
            id: '2',
            title: '咒术回战',
            subtitle: 'Jujutsu Kaisen',
            studio: 'MAPPA',
            rating: 9.2,
            year: '2023',
            season: '秋',
            status: '连载中' as const,
            episodes: 0,
            currentEpisode: 25,
            tags: ['动作', '超能力', '学园'],
            views: '1.8亿',
            followers: '980万',
            updateDay: '周一',
            hasNewEpisode: true,
        },
    ];

    const movieData = [
        {
            id: '1',
            title: '奥本海默',
            originalTitle: 'Oppenheimer',
            director: '克里斯托弗·诺兰',
            year: '2023',
            duration: '180分钟',
            rating: 8.8,
            imdbRating: 8.3,
            genre: ['剧情', '传记', '历史'],
            country: '美国',
            language: '英语',
            views: '1250万',
            likes: '89万',
            quality: '4K' as const,
            type: '电影' as const,
        },
        {
            id: '2',
            title: '芭比',
            originalTitle: 'Barbie',
            director: '格蕾塔·葛韦格',
            year: '2023',
            duration: '114分钟',
            rating: 8.1,
            imdbRating: 7.9,
            genre: ['喜剧', '冒险', '奇幻'],
            country: '美国',
            language: '英语',
            views: '980万',
            likes: '76万',
            quality: '1080P' as const,
            type: '电影' as const,
        },
    ];

    const gameData = [
        {
            id: '1',
            title: 'Cyberpunk 2077',
            developer: 'CD PROJEKT RED',
            publisher: 'CD PROJEKT RED',
            price: '¥298',
            originalPrice: '¥398',
            discount: 25,
            rating: 4.2,
            tags: ['开放世界', 'RPG', '科幻', '动作'],
            releaseDate: '2020-12-10',
            platforms: ['Windows', 'Mac', 'Linux'],
        },
        {
            id: '2',
            title: '艾尔登法环',
            developer: 'FromSoftware',
            publisher: 'Bandai Namco',
            price: '¥298',
            originalPrice: '¥298',
            discount: 0,
            rating: 4.8,
            tags: ['RPG', '动作', '冒险', '黑暗'],
            releaseDate: '2022-02-25',
            platforms: ['Windows', 'PlayStation', 'Xbox'],
        },
    ];

    const mangaData = [
        {
            id: '1',
            title: '进击的巨人',
            author: '谏山创',
            rating: 9.5,
            status: '已完结' as const,
            tags: ['冒险', '热血', '悬疑'],
            chapters: 139,
        },
        {
            id: '2',
            title: '咒术回战',
            author: '芥见下下',
            rating: 9.1,
            status: '连载中' as const,
            tags: ['动作', '超能力', '学园'],
            chapters: 256,
        },
    ];

    const videoData = [
        {
            title: '【子丑】15天花20万元500克黄金做数字手绘手工打造三维...',
            uploader: '子丑寅卯',
            views: '11.5万',
            uploadTime: '2021-4-26',
            duration: '11:57',
        },
        {
            title: '【制作过程】用AI生成的图片制作一个完整的动画短片',
            uploader: '创意工坊',
            views: '25.3万',
            uploadTime: '2024-1-15',
            duration: '8:42',
        },
    ];

    // 最近观看数据 (支持多种内容类型)
    const continueWatchingData = [
        {
            id: '1',
            title: '进击的巨人 最终季 第四部分',
            progress: 65,
            currentEpisode: 56,
            totalEpisodes: 87,
            lastWatched: '2小时前',
            thumbnail: 'https://heroui.com/images/hero-card-complete.jpeg',
            type: 'anime',
            icon: '📺',
        },
        {
            id: '2',
            title: '奥本海默',
            progress: 42,
            currentTime: '75分钟',
            totalTime: '180分钟',
            lastWatched: '1天前',
            thumbnail: 'https://heroui.com/images/hero-card-complete.jpeg',
            type: 'movie',
            icon: '🎬',
        },
        {
            id: '3',
            title: '咒术回战 第二季',
            progress: 88,
            currentEpisode: 22,
            totalEpisodes: 25,
            lastWatched: '30分钟前',
            thumbnail: 'https://heroui.com/images/hero-card-complete.jpeg',
            type: 'anime',
            icon: '📺',
        },
        {
            id: '4',
            title: '芭比',
            progress: 15,
            currentTime: '17分钟',
            totalTime: '114分钟',
            lastWatched: '3天前',
            thumbnail: 'https://heroui.com/images/hero-card-complete.jpeg',
            type: 'movie',
            icon: '🎬',
        },
        {
            id: '5',
            title: '进击的巨人 漫画版',
            progress: 72,
            currentChapter: 128,
            totalChapters: 139,
            lastWatched: '5小时前',
            thumbnail: 'https://heroui.com/images/hero-card-complete.jpeg',
            type: 'manga',
            icon: '📚',
        },
        {
            id: '6',
            title: 'Cyberpunk 2077',
            progress: 35,
            currentHours: '45小时',
            totalHours: '120小时',
            lastWatched: '12小时前',
            thumbnail: 'https://heroui.com/images/hero-card-complete.jpeg',
            type: 'game',
            icon: '🎮',
        },
        {
            id: '7',
            title: '【制作过程】AI 动画短片制作教程',
            progress: 58,
            currentTime: '4分钟',
            totalTime: '8分钟',
            lastWatched: '6小时前',
            thumbnail: 'https://heroui.com/images/hero-card-complete.jpeg',
            type: 'video',
            icon: '🎥',
        },
        {
            id: '8',
            title: '黑神话：悟空',
            progress: 42,
            currentHours: '28小时',
            totalHours: '60小时',
            lastWatched: '2天前',
            thumbnail: 'https://heroui.com/images/hero-card-complete.jpeg',
            type: 'game',
            icon: '🎮',
        },
    ];

    // 我的媒体数据
    const myMediaData = [
        {
            id: '1',
            title: '我的收藏',
            icon: '❤️',
            count: 24,
            color: 'from-red-500 to-pink-500',
            description: '已收藏的内容',
        },
        {
            id: '2',
            title: '追番列表',
            icon: '📺',
            count: 18,
            color: 'from-blue-500 to-cyan-500',
            description: '正在追的动画',
        },
        {
            id: '3',
            title: '观影列表',
            icon: '🎬',
            count: 12,
            color: 'from-purple-500 to-pink-500',
            description: '想看的电影',
        },
        {
            id: '4',
            title: '游戏库',
            icon: '🎮',
            count: 8,
            color: 'from-green-500 to-emerald-500',
            description: '拥有的游戏',
        },
        {
            id: '5',
            title: '阅读列表',
            icon: '📚',
            count: 15,
            color: 'from-yellow-500 to-orange-500',
            description: '想读的漫画',
        },
        {
            id: '6',
            title: '最近观看',
            icon: '⏱️',
            count: 32,
            color: 'from-indigo-500 to-blue-500',
            description: '最近看过的',
        },
    ];

    return (
        <div className={clsx(
            'min-h-screen transition-colors duration-500 rounded-2xl',
            themeStyles.background
        )}>
            {/* 顶部 Hero 区域 */}
            <div className="relative overflow-hidden">
                {/* 背景装饰 */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className={clsx(
                        'absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse',
                        isDark ? 'bg-blue-600' : 'bg-blue-400'
                    )} />
                    <div className={clsx(
                        'absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse',
                        isDark ? 'bg-pink-600' : 'bg-pink-400'
                    )} />
                </div>

                {/* Hero 内容 */}
                <div className="relative z-10 px-6 py-8 md:py-12 text-center">
                    <div className="space-y-3 animate-fade-in">
                        <h1 className={clsx(
                            'text-3xl md:text-5xl font-bold transition-colors duration-300',
                            themeStyles.titleText
                        )}>
                            欢迎来到 <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">Modream</span>
                        </h1>
                        <p className={clsx(
                            'text-base md:text-lg transition-colors duration-300',
                            themeStyles.subtitleText
                        )}>
                            发现你喜爱的动画、电影、游戏和漫画
                        </p>
                        <div className="flex gap-3 justify-center pt-2">
                            <Button
                                color="primary"
                                size="md"
                                className="font-semibold"
                            >
                                开始探索
                            </Button>
                            <Button
                                variant="bordered"
                                size="md"
                                className="font-semibold"
                            >
                                了解更多
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 主要内容区域 */}
            <div className="relative z-10 px-4 md:px-6 py-8 max-w-7xl mx-auto space-y-10">
                {/* 继续观看区域 - 支持多种内容类型 */}
                <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={clsx(
                                'text-2xl md:text-3xl font-bold transition-colors duration-300',
                                themeStyles.titleText
                            )}>
                                最近观看
                            </h2>
                            <p className={clsx(
                                'text-xs md:text-sm transition-colors duration-300 mt-1',
                                themeStyles.subtitleText
                            )}>
                                你的观看历史和进度
                            </p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {continueWatchingData.map((item, index) => (
                            <div
                                key={item.id}
                                className="animate-fade-in group cursor-pointer"
                                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                            >
                                <div className={clsx(
                                    'relative rounded-lg overflow-hidden transition-all duration-300',
                                    'hover:shadow-lg hover:scale-105 flex flex-col h-full'
                                )}>
                                    {/* 缩略图 */}
                                    <div className="relative aspect-video overflow-hidden rounded-lg flex-shrink-0">
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {/* 类型标签 */}
                                        <div className="absolute top-2 left-2 text-xl">
                                            {item.icon}
                                        </div>
                                        {/* 播放按钮 */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* 进度条 */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/50">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-300"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    {/* 信息 */}
                                    <div className={clsx(
                                        'p-3 transition-colors duration-300 flex-1 flex flex-col',
                                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                                    )}>
                                        {/* 标题 - 固定 2 行高度 */}
                                        <h3 className={clsx(
                                            'text-sm font-semibold transition-colors duration-300',
                                            'line-clamp-2 h-10',
                                            themeStyles.titleText
                                        )}>
                                            {item.title}
                                        </h3>

                                        {/* 进度信息 */}
                                        <p className={clsx(
                                            'text-xs transition-colors duration-300 mt-2',
                                            themeStyles.subtitleText
                                        )}>
                                            {item.type === 'anime'
                                                ? `第 ${item.currentEpisode}/${item.totalEpisodes} 集`
                                                : item.type === 'manga'
                                                ? `第 ${item.currentChapter}/${item.totalChapters} 章`
                                                : item.type === 'game'
                                                ? `已游玩 ${item.currentHours}`
                                                : `${item.currentTime} / ${item.totalTime}`
                                            }
                                        </p>

                                        {/* 最后观看时间 */}
                                        <p className={clsx(
                                            'text-xs transition-colors duration-300 mt-1',
                                            themeStyles.subtitleText
                                        )}>
                                            {item.lastWatched}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <Divider className={clsx('my-6', themeStyles.divider)} />

                {/* 我的媒体区域 */}
                <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.08s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={clsx(
                                'text-2xl md:text-3xl font-bold transition-colors duration-300',
                                themeStyles.titleText
                            )}>
                                我的媒体
                            </h2>
                            <p className={clsx(
                                'text-xs md:text-sm transition-colors duration-300 mt-1',
                                themeStyles.subtitleText
                            )}>
                                快速访问你的媒体库
                            </p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                        {myMediaData.map((item, index) => (
                            <div
                                key={item.id}
                                className="animate-fade-in group cursor-pointer"
                                style={{ animationDelay: `${0.18 + index * 0.08}s` }}
                            >
                                <div className={clsx(
                                    'relative rounded-xl overflow-hidden transition-all duration-300',
                                    'hover:shadow-lg hover:scale-105 h-full'
                                )}>
                                    {/* 背景渐变 */}
                                    <div className={clsx(
                                        'absolute inset-0 bg-gradient-to-br transition-all duration-300',
                                        item.color
                                    )} />

                                    {/* 内容 */}
                                    <div className="relative h-full p-4 md:p-6 flex flex-col items-center justify-center text-center">
                                        {/* 图标 */}
                                        <div className="text-4xl md:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
                                            {item.icon}
                                        </div>

                                        {/* 标题 */}
                                        <h3 className="text-sm md:text-base font-bold text-white mb-1 line-clamp-2">
                                            {item.title}
                                        </h3>

                                        {/* 数量 */}
                                        <div className="text-2xl md:text-3xl font-bold text-white/90 mb-1">
                                            {item.count}
                                        </div>

                                        {/* 描述 */}
                                        <p className="text-xs md:text-sm text-white/70">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* 悬停效果 */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <Divider className={clsx('my-6', themeStyles.divider)} />

                {/* 动画区域 */}
                <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={clsx(
                                'text-2xl md:text-3xl font-bold transition-colors duration-300',
                                themeStyles.titleText
                            )}>
                                热门动画
                            </h2>
                            <p className={clsx(
                                'text-xs md:text-sm transition-colors duration-300 mt-1',
                                themeStyles.subtitleText
                            )}>
                                最新最热的动画作品
                            </p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {animeData.map((anime, index) => (
                            <div
                                key={anime.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                            >
                                <AnimeCard {...anime} />
                            </div>
                        ))}
                    </div>
                </section>

                <Divider className={clsx('my-6', themeStyles.divider)} />

                {/* 电影区域 */}
                <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={clsx(
                                'text-2xl md:text-3xl font-bold transition-colors duration-300',
                                themeStyles.titleText
                            )}>
                                热门电影
                            </h2>
                            <p className={clsx(
                                'text-xs md:text-sm transition-colors duration-300 mt-1',
                                themeStyles.subtitleText
                            )}>
                                精选优质电影作品
                            </p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {movieData.map((movie, index) => (
                            <div
                                key={movie.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                            >
                                <MovieCard {...movie} />
                            </div>
                        ))}
                    </div>
                </section>

                <Divider className={clsx('my-6', themeStyles.divider)} />

                {/* 游戏区域 */}
                <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={clsx(
                                'text-2xl md:text-3xl font-bold transition-colors duration-300',
                                themeStyles.titleText
                            )}>
                                热门游戏
                            </h2>
                            <p className={clsx(
                                'text-xs md:text-sm transition-colors duration-300 mt-1',
                                themeStyles.subtitleText
                            )}>
                                最受欢迎的游戏推荐
                            </p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {gameData.map((game, index) => (
                            <div
                                key={game.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                            >
                                <GameCard {...game} />
                            </div>
                        ))}
                    </div>
                </section>

                <Divider className={clsx('my-6', themeStyles.divider)} />

                {/* 漫画区域 */}
                <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={clsx(
                                'text-2xl md:text-3xl font-bold transition-colors duration-300',
                                themeStyles.titleText
                            )}>
                                热门漫画
                            </h2>
                            <p className={clsx(
                                'text-xs md:text-sm transition-colors duration-300 mt-1',
                                themeStyles.subtitleText
                            )}>
                                精彩漫画作品推荐
                            </p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {mangaData.map((manga, index) => (
                            <div
                                key={manga.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                            >
                                <MangaCard {...manga} />
                            </div>
                        ))}
                    </div>
                </section>

                <Divider className={clsx('my-6', themeStyles.divider)} />

                {/* 视频区域 */}
                <section className="space-y-4 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={clsx(
                                'text-2xl md:text-3xl font-bold transition-colors duration-300',
                                themeStyles.titleText
                            )}>
                                热门视频
                            </h2>
                            <p className={clsx(
                                'text-xs md:text-sm transition-colors duration-300 mt-1',
                                themeStyles.subtitleText
                            )}>
                                创意视频内容精选
                            </p>
                        </div>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {videoData.map((video, index) => (
                            <div
                                key={index}
                                className="animate-fade-in"
                                style={{ animationDelay: `${1.0 + index * 0.1}s` }}
                            >
                                <VideoCard {...video} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 底部 CTA */}
                <section className="py-6 text-center animate-fade-in" style={{ animationDelay: '1.2s' }}>
                    <div className={clsx(
                        'rounded-2xl p-8 md:p-10 transition-all duration-300',
                        themeStyles.sectionBg
                    )}>
                        <h3 className={clsx(
                            'text-xl md:text-2xl font-bold mb-2 transition-colors duration-300',
                            themeStyles.titleText
                        )}>
                            加入我们的社区
                        </h3>
                        <p className={clsx(
                            'text-sm md:text-base mb-4 transition-colors duration-300',
                            themeStyles.subtitleText
                        )}>
                            与数百万用户一起分享和发现精彩内容
                        </p>
                        <Button
                            color="primary"
                            size="md"
                            className="font-semibold"
                        >
                            立即加入
                        </Button>
                    </div>
                </section>
            </div>

            {/* 自定义动画 */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                :global(.animate-fade-in) {
                    animation: fade-in 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}