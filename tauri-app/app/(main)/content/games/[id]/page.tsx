"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { Spinner } from "@heroui/spinner";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { api } from "@/lib/api";
import type { GameInfo } from "@/types/dto";

interface GameDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function GameDetail({ params }: GameDetailProps) {
    const [game, setGame] = useState<GameInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedScreenshot, setSelectedScreenshot] = useState(0);
    const [isLaunching, setIsLaunching] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isUpdatingDefaultPath, setIsUpdatingDefaultPath] = useState(false);

    // 解析 params Promise 并获取游戏详情
    useEffect(() => {
        params.then(async (resolvedParams) => {
            try {
                const gameId = parseInt(resolvedParams.id, 10);
                const data = await api.games.getById(gameId);
                setGame(data);
            } catch (err) {
                console.error('Failed to load game detail:', err);
                setError(err instanceof Error ? err.message : '获取游戏详情失败');
            } finally {
                setLoading(false);
            }
        });
    }, [params]);

    // 启动游戏
    const handleLaunch = async () => {
        if (!game) return;

        try {
            setIsLaunching(true);
            // 调用后端 API 启动游戏（后端会在服务器端启动游戏）
            const fullPath = await api.games.launch(game.id);
            console.log('Game launched successfully:', fullPath);
        } catch (err) {
            console.error('Failed to launch game:', err);
            setError(err instanceof Error ? err.message : '启动游戏失败');
        } finally {
            setIsLaunching(false);
        }
    };

    // 更新默认启动路径
    const handleUpdateDefaultStartPath = async (startPath: string) => {
        if (!game) return;

        try {
            setIsUpdatingDefaultPath(true);
            const updatedGame = await api.games.updateDefaultStartPath(game.id, startPath);
            setGame(updatedGame);
            console.log('Default start path updated:', startPath);
        } catch (err) {
            console.error('Failed to update default start path:', err);
            setError(err instanceof Error ? err.message : '更新默认启动路径失败');
        } finally {
            setIsUpdatingDefaultPath(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 mb-4">{error || '游戏不存在'}</p>
                <Link href="/content/games">
                    <Button color="primary">返回游戏列表</Button>
                </Link>
            </div>
        );
    }

    const screenshots = game.covers || [];
    const defaultCover = "/assets/image/game_cover_defualt.png";
    const mainCover = screenshots.length > 0 ? screenshots[0] : defaultCover;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* 返回按钮 */}
            <div className="p-4">
                <Link href="/content/games">
                    <Button
                        variant="light"
                        startContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        }
                    >
                        返回
                    </Button>
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-8">
                {/* 头部区域 - Steam 风格 */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-950 dark:to-black rounded-lg overflow-hidden mb-6">
                    {/* 背景模糊图 */}
                    <div className="absolute inset-0 opacity-20">
                        <Image
                            alt={game.title}
                            src={mainCover}
                            className="object-cover w-full h-full blur-xl scale-110"
                            removeWrapper
                        />
                    </div>

                    {/* 渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />

                    {/* 内容 */}
                    <div className="relative flex flex-col md:flex-row gap-6 p-6 md:p-8 min-h-[500px]">
                        {/* 左侧：游戏封面 */}
                        <div className="flex-shrink-0 md:w-72">
                            <Image
                                alt={game.title}
                                src={mainCover}
                                className="w-full h-full object-cover rounded-lg shadow-2xl"
                                removeWrapper
                            />
                        </div>

                        {/* 右侧：游戏信息 */}
                        <div className="flex-1 flex flex-col justify-between text-white">
                            {/* 顶部信息 */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">{game.title}</h1>
                                {game.sub_title && (
                                    <p className="text-lg text-gray-300 mb-4">{game.sub_title}</p>
                                )}

                                {/* 游戏描述 */}
                                {game.description && (
                                    <p className="text-gray-300 leading-relaxed mb-6 line-clamp-3">
                                        {game.description}
                                    </p>
                                )}

                                {/* 标签 */}
                                {game.tabs && game.tabs.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {game.tabs.map((tag) => (
                                            <Chip key={tag} size="sm" variant="flat" className="bg-white/10 text-white border border-white/20">
                                                {tag}
                                            </Chip>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 底部信息 - 带渐变阴影增强 */}
                            <div className="relative">
                                {/* 渐变阴影背景 */}
                                <div className="absolute -inset-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                                <div className="relative space-y-4">
                                    {/* 基本信息网格 */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {game.developer && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">开发商</p>
                                                <p className="text-sm font-medium">{game.developer}</p>
                                            </div>
                                        )}
                                        {game.publisher && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">发行商</p>
                                                <p className="text-sm font-medium">{game.publisher}</p>
                                            </div>
                                        )}
                                        {game.release_date && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">发行日期</p>
                                                <p className="text-sm font-medium">{game.release_date}</p>
                                            </div>
                                        )}
                                        {game.platform && (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">平台</p>
                                                <p className="text-sm font-medium">{game.platform}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 操作按钮 */}
                                    <div className="flex gap-3 items-center">
                                        <Button
                                            color="primary"
                                            size="lg"
                                            className="font-semibold px-8"
                                            isLoading={isLaunching}
                                            onPress={handleLaunch}
                                            startContent={
                                                !isLaunching && (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                    </svg>
                                                )
                                            }
                                        >
                                            {isLaunching ? '启动中...' : '启动游戏'}
                                        </Button>

                                        <Button variant="bordered" size="lg" className="border-white/30 text-white hover:bg-white/10">
                                            编辑信息
                                        </Button>
                                        <Button variant="bordered" size="lg" color="danger" className="border-red-500/50">
                                            删除
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 截图横向列表 */}
                {screenshots.length > 0 && (
                    <Card className="mb-6">
                        <CardBody className="p-6">
                            <h2 className="text-xl font-bold mb-4">游戏截图</h2>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                                {screenshots.map((screenshot, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedScreenshot(index);
                                            setIsPreviewOpen(true);
                                        }}
                                        className="flex-shrink-0 rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl"
                                    >
                                        <Image
                                            alt={`截图 ${index + 1}`}
                                            src={screenshot}
                                            className="w-48 h-28 object-cover"
                                            removeWrapper
                                        />
                                    </button>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* 截图预览模态框 */}
                <Modal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    size="5xl"
                    classNames={{
                        base: "bg-transparent shadow-none",
                        backdrop: "bg-black/90"
                    }}
                >
                    <ModalContent>
                        <ModalBody className="p-0">
                            <div className="relative">
                                <Image
                                    alt={`截图 ${selectedScreenshot + 1}`}
                                    src={screenshots[selectedScreenshot]}
                                    className="w-full h-auto max-h-[90vh] object-contain"
                                    removeWrapper
                                />

                                {/* 关闭按钮 */}
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* 左右切换按钮 */}
                                {selectedScreenshot > 0 && (
                                    <button
                                        onClick={() => setSelectedScreenshot(selectedScreenshot - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}
                                {selectedScreenshot < screenshots.length - 1 && (
                                    <button
                                        onClick={() => setSelectedScreenshot(selectedScreenshot + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}

                                {/* 截图计数 */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                                    {selectedScreenshot + 1} / {screenshots.length}
                                </div>
                            </div>
                        </ModalBody>
                    </ModalContent>
                </Modal>

                {/* 详细描述区域 */}
                {game.description && (
                    <Card className="mb-6">
                        <CardBody className="p-6">
                            <h2 className="text-2xl font-bold mb-4">关于这款游戏</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {game.description}
                            </p>
                        </CardBody>
                    </Card>
                )}

                {/* 系统详情和启动路径 - 左右布局 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 左侧：系统详情 */}
                    <Card className="h-full">
                        <CardBody className="p-6 flex flex-col h-full">
                            <h2 className="text-2xl font-bold mb-4">系统详情</h2>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-400">基本信息</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">平台</p>
                                            <p className="font-medium">{game.platform || '未知'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">文件大小</p>
                                            <p className="font-medium">{game.formatted_size}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">版本</p>
                                            <p className="font-medium">{game.version || '未知'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-600 dark:text-gray-400">游戏路径</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                                                {game.root_path}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 右侧：启动路径 */}
                    <Card className="h-full">
                        <CardBody className="p-6 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">启动路径</h2>
                                {game.start_paths && game.start_paths.length > 0 && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        共 {game.start_paths.length} 个启动项
                                    </span>
                                )}
                            </div>
                            {game.start_paths && game.start_paths.length > 0 ? (
                                <div className="space-y-2 flex-1 overflow-y-auto max-h-96 pr-2">
                                    {game.start_paths.map((path, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleUpdateDefaultStartPath(path)}
                                            className={`text-xs font-mono p-3 rounded break-all transition-all cursor-pointer ${
                                                path === game.start_path_default
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 shadow-sm'
                                                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-100 dark:hover:bg-gray-750'
                                            } ${isUpdatingDefaultPath ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {path === game.start_path_default ? (
                                                    <span className="inline-flex items-center bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold flex-shrink-0">
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        默认
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded font-semibold flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        点击设为默认
                                                    </span>
                                                )}
                                                <span className="flex-1">{path}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    暂无启动路径
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

