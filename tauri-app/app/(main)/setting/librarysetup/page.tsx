'use client';

import {useState, useEffect} from "react";
import {Navbar} from "./components/navbar"
import {LibraryCar} from "./components/librarycar"
import {LoadingLibraryCar} from "./components/loading-library-car"
import {useTheme} from "next-themes";
import {useIsSSR} from "@react-aria/ssr";
import clsx from "clsx";
import type {LocalLibraryData} from "./components/local-library-form";
import type {WebDAVLibraryData} from "./components/webdav-library-form";
import {api} from "@/lib/api";
import type {MediaLibrary} from "@/types/dto";

// 创建中的媒体库信息
interface CreatingLibrary {
    title: string;
    type: string;
    source: "local" | "webdav";
    message: string;
    isSuccess: boolean;
    isError: boolean;
}

export default function LibrarySetup() {
    const {theme} = useTheme() // 获取主题
    const isSSR = useIsSSR();
    const isDark = theme === 'dark' && !isSSR;
    const [libraries, setLibraries] = useState<MediaLibrary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creatingLibrary, setCreatingLibrary] = useState<CreatingLibrary | null>(null); // 创建中的媒体库

    // 加载媒体库列表
    useEffect(() => {
        const loadLibraries = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.mediaLibraries.getAll();
                // 响应直接是数组
                setLibraries(Array.isArray(response) ? response : []);
            } catch (err: any) {
                console.error('加载媒体库失败:', err);
                setError(err.message || '加载媒体库失败');
            } finally {
                setLoading(false);
            }
        };

        loadLibraries();
    }, []);

    const handleRename = (index: number) => {
        console.log("重命名媒体库:", libraries[index]);
        // TODO: 实现重命名功能
    };

    const handleEditImage = (index: number) => {
        console.log("编辑图像:", libraries[index]);
        // TODO: 实现编辑图像功能
    };

    const handleEdit = (index: number) => {
        console.log("编辑媒体库:", libraries[index]);
        // TODO: 实现编辑媒体库功能
    };

    const handleChangeType = (index: number) => {
        console.log("更改内容类型:", libraries[index]);
        // TODO: 实现更改内容类型功能
    };

    const handleAddLibrary = async (data: LocalLibraryData | WebDAVLibraryData) => {
        try {
            console.log("添加新媒体库:", data);

            // 设置创建中状态
            const source = 'folders' in data ? 'local' : 'webdav';
            setCreatingLibrary({
                title: data.name,
                type: data.type,
                source: source,
                message: `正在创建 ${data.type} 媒体库 "${data.name}"...`,
                isSuccess: false,
                isError: false,
            });

            // 根据数据类型调用相应的 API
            if ('folders' in data) {
                // 本地媒体库
                // 构建 config 对象（根据媒体类型动态添加配置）
                const config: Record<string, any> = {};

                // 游戏类型配置
                if (data.type === "游戏" && data.gameProviders) {
                    config.gameProviders = data.gameProviders;
                    if (data.metadataStorage) {
                        config.metadataStorage = data.metadataStorage;
                    }
                    setCreatingLibrary(prev => prev ? {
                        ...prev,
                        message: `正在扫描游戏文件夹并从 ${data.gameProviders} 获取元数据...`
                    } : null);
                }

                // 漫画类型配置
                if (data.type === "漫画" && data.comicFormats) {
                    config.comicFormats = data.comicFormats;
                    if (data.metadataStorage) {
                        config.metadataStorage = data.metadataStorage;
                    }
                    setCreatingLibrary(prev => prev ? {
                        ...prev,
                        message: `正在扫描漫画文件夹（支持格式: ${data.comicFormats}）...`
                    } : null);
                }

                // 其他类型也可以添加 metadataStorage
                if (data.metadataStorage && !config.metadataStorage) {
                    config.metadataStorage = data.metadataStorage;
                }

                await api.mediaLibraries.createLocalLibrary({
                    title: data.name,
                    type: data.type as any,
                    paths_json: JSON.stringify(data.folders),
                    source: "local",
                    config: Object.keys(config).length > 0 ? config : undefined,
                });
            } else {
                // WebDAV 媒体库
                // 构建 config 对象（根据媒体类型动态添加配置）
                const config: Record<string, any> = {};

                // 游戏类型配置
                if (data.type === "游戏" && data.gameProviders) {
                    config.gameProviders = data.gameProviders;
                    if (data.metadataStorage) {
                        config.metadataStorage = data.metadataStorage;
                    }
                    setCreatingLibrary(prev => prev ? {
                        ...prev,
                        message: `正在连接 WebDAV 并扫描游戏...`
                    } : null);
                }

                // 漫画类型配置
                if (data.type === "漫画" && data.comicFormats) {
                    config.comicFormats = data.comicFormats;
                    if (data.metadataStorage) {
                        config.metadataStorage = data.metadataStorage;
                    }
                    setCreatingLibrary(prev => prev ? {
                        ...prev,
                        message: `正在连接 WebDAV 并扫描漫画...`
                    } : null);
                }

                // 其他类型也可以添加 metadataStorage
                if (data.metadataStorage && !config.metadataStorage) {
                    config.metadataStorage = data.metadataStorage;
                }

                await api.mediaLibraries.createWebDAVLibrary({
                    name: data.name,
                    type: data.type as any,
                    url: data.url,
                    username: data.username,
                    password: data.password,
                    path: data.path,
                    config: Object.keys(config).length > 0 ? config : undefined,
                });
            }

            // 重新加载媒体库列表
            setCreatingLibrary(prev => prev ? {
                ...prev,
                message: '正在加载媒体库列表...'
            } : null);
            const response = await api.mediaLibraries.getAll();
            setLibraries(Array.isArray(response) ? response : []);

            // 成功提示
            setCreatingLibrary(prev => prev ? {
                ...prev,
                message: `媒体库 "${data.name}" 创建成功！`,
                isSuccess: true,
            } : null);
            setTimeout(() => {
                setCreatingLibrary(null);
            }, 2000);
        } catch (err: any) {
            console.error('添加媒体库失败:', err);
            setCreatingLibrary(prev => prev ? {
                ...prev,
                message: `创建失败: ${err.message || '未知错误'}`,
                isError: true,
            } : null);
            setTimeout(() => {
                setCreatingLibrary(null);
            }, 3000);
        }
    };

    const handleRemoveLibrary = async (index: number) => {
        try {
            const library = libraries[index];
            console.log("移除媒体库:", library);
            await api.mediaLibraries.delete(String(library.id));
            // 重新加载媒体库列表
            const response = await api.mediaLibraries.getAll();
            setLibraries(Array.isArray(response) ? response : []);
        } catch (err: any) {
            console.error('删除媒体库失败:', err);
        }
    };

    const handleScanLibrary = async (index: number) => {
        try {
            const library = libraries[index];
            console.log("扫描媒体库文件:", library);
            await api.mediaLibraries.scan(String(library.id));
            // 重新加载媒体库列表
            const response = await api.mediaLibraries.getAll();
            setLibraries(Array.isArray(response) ? response : []);
        } catch (err: any) {
            console.error('扫描媒体库失败:', err);
        }
    };

    return (
        <div className={clsx(
            "librarysetup-wrap flex flex-col gap-6 p-6",
            isDark ? "bg-gray-950" : "bg-white"
        )}>
            <Navbar isDark={isDark} onAddLibrary={handleAddLibrary}/>

            {/* 加载状态 */}
            {loading && (
                <div className="text-center py-8">
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>加载中...</p>
                </div>
            )}

            {/* 错误状态 */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>加载失败: {error}</p>
                </div>
            )}

            {/* 媒体库卡片网格 */}
            {!loading && (libraries.length > 0 || creatingLibrary) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* 创建中的媒体库卡片 */}
                    {creatingLibrary && (
                        <LoadingLibraryCar
                            title={creatingLibrary.title}
                            type={creatingLibrary.type as any}
                            source={creatingLibrary.source}
                            message={creatingLibrary.message}
                            isSuccess={creatingLibrary.isSuccess}
                            isError={creatingLibrary.isError}
                        />
                    )}

                    {/* 已有的媒体库卡片 */}
                    {libraries.map((library, index) => {
                        // 解析 paths_json 获取第一个路径
                        let firstPath = '';
                        try {
                            const paths = JSON.parse(library.paths_json);
                            firstPath = Array.isArray(paths) ? paths[0] : library.paths_json;
                        } catch {
                            firstPath = library.paths_json;
                        }

                        return (
                            <LibraryCar
                                key={String(library.id)}
                                id={String(library.id)}
                                title={library.title}
                                cover={library.cover}
                                type={library.type}
                                path={firstPath}
                                source={library.source}
                                itemCount={library.item_count}
                                lastScanned={library.last_scanned}
                                onRemove={() => handleRemoveLibrary(index)}
                                onRename={() => handleRename(index)}
                                onScan={() => handleScanLibrary(index)}
                                onEditImage={() => handleEditImage(index)}
                                onEdit={() => handleEdit(index)}
                                onChangeType={() => handleChangeType(index)}
                            />
                        );
                    })}
                </div>
            ) : !loading && (
                <div className={clsx(
                    "text-center py-8 rounded-lg",
                    isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                )}>
                    <p>暂无媒体库，请添加一个新的媒体库</p>
                </div>
            )}
        </div>
    )
}