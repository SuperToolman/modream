'use client';

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { FolderIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { FolderPickerModal } from "./folder-picker-modal";
import { MovieConfigForm } from "@/app/(main)/setting/librarysetup/components/sub_form/movie-config-form";
import { GameConfigForm } from "@/app/(main)/setting/librarysetup/components/sub_form/game-config-form";
import { ComicConfigForm } from "@/app/(main)/setting/librarysetup/components/sub_form/comic-config-form";
import { PhotoConfigForm } from "@/app/(main)/setting/librarysetup/components/sub_form/photo-config-form";

interface LocalLibraryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LocalLibraryData) => void;
    onSelectFolder?: (callback: (path: string) => void) => void;
}

export interface LocalLibraryData {
    name: string;
    folders: string[];
    type: string;
    gameProviders?: string; // 游戏数据库提供者（逗号分隔字符串，如 "IGDB,DLsite"）
    metadataStorage?: string; // 元数据存储方式
    comicFormats?: string; // 漫画格式（逗号分隔字符串）
    movieMetadataDownloaders?: string; // 影片元数据下载器（逗号分隔字符串，如 "theMovieDb,theTVDB"）
    movieLanguage?: string; // 电影元数据语言（如 "zh-CN", "en-US"）
    movieMinFileSize?: number; // 电影最小文件大小（MB）
    photoThumbnailMaxWidth?: number; // 照片缩略图最大宽度（像素）
    photoThumbnailMaxHeight?: number; // 照片缩略图最大高度（像素）
    photoThumbnailResizeFilter?: 'triangle' | 'catmullrom' | 'lanczos3'; // 缩略图缩放算法
    photoExtractExif?: boolean; // 是否提取 EXIF 信息
    photoCalculateHash?: boolean; // 是否计算文件哈希
    photoSupportedFormats?: string; // 支持的图片格式（逗号分隔字符串）
}

const LIBRARY_TYPES = [
    { key: "电影", label: "电影" },
    { key: "视频", label: "视频" },
    { key: "音乐", label: "音乐" },
    { key: "电视节目", label: "电视节目" },
    { key: "有声读物", label: "有声读物" },
    { key: "书籍", label: "书籍" },
    { key: "游戏", label: "游戏" },
    { key: "漫画", label: "漫画" },
    { key: "音乐视频", label: "音乐视频" },
    { key: "照片", label: "照片" },
    { key: "混合内容", label: "混合内容" },
];

/**
 * 本地媒体库表单
 */
export const LocalLibraryForm = ({
    isOpen,
    onClose,
    onSubmit,
}: LocalLibraryFormProps) => {
    const { theme } = useTheme();
    const isSSR = useIsSSR();
    const isDark = theme === 'dark' && !isSSR;

    // 内部状态使用数组，方便管理
    const [internalGameProviders, setInternalGameProviders] = useState<string[]>(["igdb", "dlsite"]);
    const [internalComicFormats, setInternalComicFormats] = useState<string[]>(["cbz", "cbr"]);
    const [internalMovieDownloaders, setInternalMovieDownloaders] = useState<string[]>(["theMovieDb", "theTVDB"]);
    const [internalMovieLanguage, setInternalMovieLanguage] = useState<string>("zh-CN");
    const [internalMovieMinFileSize, setInternalMovieMinFileSize] = useState<number>(300);
    const [internalPhotoThumbnailWidth, setInternalPhotoThumbnailWidth] = useState<number>(300);
    const [internalPhotoThumbnailHeight, setInternalPhotoThumbnailHeight] = useState<number>(300);
    const [internalPhotoResizeFilter, setInternalPhotoResizeFilter] = useState<'triangle' | 'catmullrom' | 'lanczos3'>('triangle');
    const [internalPhotoExtractExif, setInternalPhotoExtractExif] = useState<boolean>(true);
    const [internalPhotoCalculateHash, setInternalPhotoCalculateHash] = useState<boolean>(true);
    const [internalPhotoFormats, setInternalPhotoFormats] = useState<string[]>(["jpg", "jpeg", "png", "gif", "bmp", "webp"]);

    const [formData, setFormData] = useState<LocalLibraryData>({
        name: "",
        folders: [],
        type: "影片",
        metadataStorage: "database",
    });

    const [errors, setErrors] = useState<{ name?: string; folders?: string }>({});
    const [showFolderPicker, setShowFolderPicker] = useState(false);

    const themeStyles = {
        background: isDark ? 'bg-gray-900' : 'bg-white',
        text: isDark ? 'text-gray-100' : 'text-gray-900',
        textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
        cardBg: isDark ? 'bg-gray-800' : 'bg-gray-50',
    };

    const validateForm = () => {
        const newErrors: { name?: string; folders?: string } = {};
        if (!formData.name.trim()) newErrors.name = "请输入媒体库名称";
        if (formData.folders.length === 0) newErrors.folders = "请至少添加一个文件夹";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddFolder = () => {
        setShowFolderPicker(true);
    };

    const handleFolderSelected = (path: string) => {
        setFormData({
            ...formData,
            folders: [...formData.folders, path],
        });
    };

    const handleRemoveFolder = (index: number) => {
        setFormData({
            ...formData,
            folders: formData.folders.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = () => {
        if (validateForm()) {
            // 将数组转换为逗号分隔的字符串
            const submitData: LocalLibraryData = {
                ...formData,
                gameProviders: internalGameProviders.length > 0
                    ? internalGameProviders.map(p => p.toUpperCase()).join(',')
                    : undefined,
                comicFormats: internalComicFormats.length > 0
                    ? internalComicFormats.map(f => f.toUpperCase()).join(',')
                    : undefined,
                movieMetadataDownloaders: internalMovieDownloaders.length > 0
                    ? internalMovieDownloaders.join(',')
                    : undefined,
                movieLanguage: internalMovieLanguage,
                movieMinFileSize: internalMovieMinFileSize,
                photoThumbnailMaxWidth: internalPhotoThumbnailWidth,
                photoThumbnailMaxHeight: internalPhotoThumbnailHeight,
                photoThumbnailResizeFilter: internalPhotoResizeFilter,
                photoExtractExif: internalPhotoExtractExif,
                photoCalculateHash: internalPhotoCalculateHash,
                photoSupportedFormats: internalPhotoFormats.length > 0
                    ? internalPhotoFormats.join(',')
                    : undefined,
            };

            onSubmit(submitData);
            setFormData({ name: "", folders: [], type: "视频", metadataStorage: "database" });
            setInternalGameProviders(["igdb", "dlsite"]);
            setInternalComicFormats(["cbz", "cbr"]);
            setInternalMovieDownloaders(["theMovieDb", "theTVDB"]);
            setInternalMovieLanguage("zh-CN");
            setInternalMovieMinFileSize(300);
            setInternalPhotoThumbnailWidth(300);
            setInternalPhotoThumbnailHeight(300);
            setInternalPhotoExtractExif(true);
            setInternalPhotoCalculateHash(true);
            setInternalPhotoFormats(["jpg", "jpeg", "png", "gif", "bmp", "webp"]);
            onClose();
        }
    };

    const handleClose = () => {
        setFormData({ name: "", folders: [], type: "视频", metadataStorage: "database" });
        setInternalGameProviders(["igdb", "dlsite"]);
        setInternalComicFormats(["cbz", "cbr"]);
        setInternalMovieDownloaders(["theMovieDb", "theTVDB"]);
        setInternalMovieLanguage("zh-CN");
        setInternalMovieMinFileSize(300);
        setErrors({});
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="5xl"
            backdrop="blur"
            classNames={{
                base: "max-w-[800px]",
            }}
        >
            <ModalContent className={themeStyles.background}>
                <ModalHeader className={clsx("flex flex-col gap-1", themeStyles.text)}>
                    <h2 className="text-2xl font-bold">添加本地媒体库</h2>
                    <p className={clsx("text-sm font-normal", themeStyles.textSecondary)}>
                        配置本地媒体库的基本信息
                    </p>
                </ModalHeader>
                <ModalBody className="gap-4">
                    {/* 媒体库名称 */}
                    <Input
                        label="媒体库名称"
                        placeholder="例如：我的媒体库"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        isInvalid={!!errors.name}
                        errorMessage={errors.name}
                        startContent={<span className="text-gray-400">📝</span>}
                    />

                    {/* 媒体库类型 */}
                    <Select
                        label="媒体库类型"
                        selectedKeys={[formData.type]}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full"
                        description="选择媒体库类型后，将显示相应的配置选项"
                    >
                        {LIBRARY_TYPES.map((type) => (
                            <SelectItem key={type.key}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </Select>

                    {/* 动态表单区域 - 根据媒体类型显示不同的配置 */}
                    {formData.type && (
                        <div className="space-y-4 pt-2">
                            <div className={clsx(
                                "p-4 rounded-lg border-2 border-dashed",
                                isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
                            )}>
                                {/* 电影配置 */}
                                {formData.type === "电影" && (
                                    <>
                                        <h3 className={clsx("text-sm font-semibold mb-3", themeStyles.text)}>
                                            🎬 电影库配置
                                        </h3>
                                        <MovieConfigForm
                                            movieMetadataDownloaders={internalMovieDownloaders}
                                            onMovieMetadataDownloadersChange={setInternalMovieDownloaders}
                                            movieLanguage={internalMovieLanguage}
                                            onMovieLanguageChange={setInternalMovieLanguage}
                                            movieMinFileSize={internalMovieMinFileSize}
                                            onMovieMinFileSizeChange={setInternalMovieMinFileSize}
                                        />
                                    </>
                                )}

                                {/* 游戏配置 */}
                                {formData.type === "游戏" && (
                                    <>
                                        <GameConfigForm
                                            gameProviders={internalGameProviders}
                                            onGameProvidersChange={setInternalGameProviders}
                                            metadataStorage={formData.metadataStorage}
                                            onMetadataStorageChange={(value) => setFormData({ ...formData, metadataStorage: value })}
                                        />
                                    </>
                                )}

                                {/* 漫画配置 */}
                                {formData.type === "漫画" && (
                                    <>
                                        <ComicConfigForm
                                            metadataStorage={formData.metadataStorage}
                                            onMetadataStorageChange={(value) => setFormData({ ...formData, metadataStorage: value })}
                                            comicFormats={internalComicFormats}
                                            onComicFormatsChange={setInternalComicFormats}
                                        />
                                    </>
                                )}

                                {/* 照片配置 */}
                                {formData.type === "照片" && (
                                    <>
                                        <h3 className={clsx("text-sm font-semibold mb-3", themeStyles.text)}>
                                            📷 照片库配置
                                        </h3>
                                        <PhotoConfigForm
                                            thumbnailMaxWidth={internalPhotoThumbnailWidth}
                                            onThumbnailMaxWidthChange={setInternalPhotoThumbnailWidth}
                                            thumbnailMaxHeight={internalPhotoThumbnailHeight}
                                            onThumbnailMaxHeightChange={setInternalPhotoThumbnailHeight}
                                            thumbnailResizeFilter={internalPhotoResizeFilter}
                                            onThumbnailResizeFilterChange={setInternalPhotoResizeFilter}
                                            extractExif={internalPhotoExtractExif}
                                            onExtractExifChange={setInternalPhotoExtractExif}
                                            calculateHash={internalPhotoCalculateHash}
                                            onCalculateHashChange={setInternalPhotoCalculateHash}
                                            supportedFormats={internalPhotoFormats}
                                            onSupportedFormatsChange={setInternalPhotoFormats}
                                        />
                                    </>
                                )}

                                {/* 其他媒体类型 */}
                                {!["电影", "游戏", "漫画", "照片"].includes(formData.type) && (
                                    <p className={clsx("text-sm text-center", themeStyles.textSecondary)}>
                                        此媒体类型暂无额外配置选项
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 文件夹列表 */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className={clsx("text-sm font-medium", themeStyles.text)}>
                                文件夹
                            </label>
                            <Button
                                size="sm"
                                variant="light"
                                color="primary"
                                startContent={<PlusIcon size={16} />}
                                onPress={handleAddFolder}
                            >
                                添加文件夹
                            </Button>
                        </div>

                        {/* 文件夹列表显示 */}
                        {formData.folders.length > 0 ? (
                            <Card className={themeStyles.cardBg}>
                                <CardBody className="gap-2 p-3">
                                    {formData.folders.map((folder, index) => (
                                        <div
                                            key={index}
                                            className={clsx(
                                                "flex items-center justify-between p-2 rounded-lg",
                                                isDark ? "bg-gray-700/50" : "bg-white/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="text-blue-500 flex-shrink-0">
                                                    <FolderIcon size={16} />
                                                </div>
                                                <span className={clsx("text-sm truncate", themeStyles.text)}>
                                                    {folder}
                                                </span>
                                            </div>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                onPress={() => handleRemoveFolder(index)}
                                            >
                                                <TrashIcon size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </CardBody>
                            </Card>
                        ) : (
                            <div className={clsx(
                                "p-4 rounded-lg text-center",
                                themeStyles.cardBg,
                                themeStyles.textSecondary
                            )}>
                                <p className="text-sm">还没有添加文件夹</p>
                            </div>
                        )}

                        {errors.folders && (
                            <p className="text-sm text-red-500">{errors.folders}</p>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="default"
                        variant="light"
                        onPress={handleClose}
                    >
                        取消
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSubmit}
                    >
                        创建媒体库
                    </Button>
                </ModalFooter>
            </ModalContent>

            {/* 文件夹选择模态窗 */}
            <FolderPickerModal
                isOpen={showFolderPicker}
                onClose={() => setShowFolderPicker(false)}
                onSelect={handleFolderSelected}
            />
        </Modal>
    );
};

