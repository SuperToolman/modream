'use client';

import { Checkbox } from "@heroui/checkbox";
import { Tab, Tabs } from "@heroui/tabs";
import { Card, CardBody } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { useState } from "react";

interface PhotoConfigFormProps {
    thumbnailMaxWidth?: number;
    onThumbnailMaxWidthChange?: (width: number) => void;
    thumbnailMaxHeight?: number;
    onThumbnailMaxHeightChange?: (height: number) => void;
    thumbnailResizeFilter?: 'triangle' | 'catmullrom' | 'lanczos3';
    onThumbnailResizeFilterChange?: (filter: 'triangle' | 'catmullrom' | 'lanczos3') => void;
    extractExif?: boolean;
    onExtractExifChange?: (extract: boolean) => void;
    calculateHash?: boolean;
    onCalculateHashChange?: (calculate: boolean) => void;
    supportedFormats?: string[];
    onSupportedFormatsChange?: (formats: string[]) => void;
}

export function PhotoConfigForm({
    thumbnailMaxWidth = 300,
    onThumbnailMaxWidthChange,
    thumbnailMaxHeight = 300,
    onThumbnailMaxHeightChange,
    thumbnailResizeFilter = 'triangle',
    onThumbnailResizeFilterChange,
    extractExif = true,
    onExtractExifChange,
    calculateHash = true,
    onCalculateHashChange,
    supportedFormats = ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
    onSupportedFormatsChange,
}: PhotoConfigFormProps) {
    const [internalThumbnailWidth, setInternalThumbnailWidth] = useState<number>(thumbnailMaxWidth);
    const [internalThumbnailHeight, setInternalThumbnailHeight] = useState<number>(thumbnailMaxHeight);
    const [internalResizeFilter, setInternalResizeFilter] = useState<'triangle' | 'catmullrom' | 'lanczos3'>(thumbnailResizeFilter);
    const [internalExtractExif, setInternalExtractExif] = useState<boolean>(extractExif);
    const [internalCalculateHash, setInternalCalculateHash] = useState<boolean>(calculateHash);
    const [internalFormats, setInternalFormats] = useState<string[]>(supportedFormats);

    const handleThumbnailWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 300;
        setInternalThumbnailWidth(value);
        onThumbnailMaxWidthChange?.(value);
    };

    const handleThumbnailHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 300;
        setInternalThumbnailHeight(value);
        onThumbnailMaxHeightChange?.(value);
    };

    const handleResizeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as 'triangle' | 'catmullrom' | 'lanczos3';
        setInternalResizeFilter(value);
        onThumbnailResizeFilterChange?.(value);
    };

    const handleExtractExifChange = (checked: boolean) => {
        setInternalExtractExif(checked);
        onExtractExifChange?.(checked);
    };

    const handleCalculateHashChange = (checked: boolean) => {
        setInternalCalculateHash(checked);
        onCalculateHashChange?.(checked);
    };

    const handleFormatsChange = (keys: any) => {
        const selected = Array.from(keys as Set<string>);
        setInternalFormats(selected);
        onSupportedFormatsChange?.(selected);
    };

    return (
        <div className="flex w-full flex-col">
            <Tabs aria-label="照片配置选项">
                <Tab key="thumbnail" title="缩略图设置">
                    <Card>
                        <CardBody className="gap-4">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    配置缩略图生成参数，用于快速预览照片
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="缩略图最大宽度"
                                        placeholder="300"
                                        description="缩略图的最大宽度（像素）"
                                        value={internalThumbnailWidth.toString()}
                                        onChange={handleThumbnailWidthChange}
                                        min={100}
                                        max={1000}
                                        endContent={
                                            <div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">px</span>
                                            </div>
                                        }
                                    />
                                    
                                    <Input
                                        type="number"
                                        label="缩略图最大高度"
                                        placeholder="300"
                                        description="缩略图的最大高度（像素）"
                                        value={internalThumbnailHeight.toString()}
                                        onChange={handleThumbnailHeightChange}
                                        min={100}
                                        max={1000}
                                        endContent={
                                            <div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">px</span>
                                            </div>
                                        }
                                    />
                                </div>

                                <Select
                                    label="缩放算法"
                                    placeholder="选择缩放算法"
                                    description="影响缩略图生成速度和质量"
                                    selectedKeys={[internalResizeFilter]}
                                    onChange={handleResizeFilterChange}
                                >
                                    <SelectItem key="triangle" value="triangle">
                                        Triangle（快速，推荐）⚡
                                    </SelectItem>
                                    <SelectItem key="catmullrom" value="catmullrom">
                                        CatmullRom（中等速度，高质量）⭐
                                    </SelectItem>
                                    <SelectItem key="lanczos3" value="lanczos3">
                                        Lanczos3（最慢，最高质量）🎨
                                    </SelectItem>
                                </Select>

                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-1">
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                        💡 提示：缩略图会保持原始照片的宽高比，实际尺寸可能小于设置值
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                        ⚡ Triangle 算法速度快 2-3 倍，适合大量照片扫描
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab key="scan-options" title="扫描选项">
                    <Card>
                        <CardBody className="gap-4">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    配置照片扫描时的处理选项
                                </p>

                                <div className="space-y-3">
                                    <Checkbox
                                        isSelected={internalExtractExif}
                                        onValueChange={handleExtractExifChange}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">提取 EXIF 信息</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                提取照片的拍摄参数、相机型号、GPS 位置等元数据
                                            </span>
                                        </div>
                                    </Checkbox>

                                    <Checkbox
                                        isSelected={internalCalculateHash}
                                        onValueChange={handleCalculateHashChange}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">计算文件哈希</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                计算 SHA-256 哈希值，用于检测重复照片（推荐开启）
                                            </span>
                                        </div>
                                    </Checkbox>
                                </div>

                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                        ⚠️ 注意：关闭这些选项可以加快扫描速度，但会丢失部分功能
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>

                <Tab key="formats" title="支持的图片格式">
                    <Card>
                        <CardBody className="gap-4">
                            <Select
                                label="支持的图片格式"
                                placeholder="选择支持的格式"
                                className="w-full"
                                selectionMode="multiple"
                                description="选择要扫描的图片文件格式"
                                selectedKeys={internalFormats}
                                onSelectionChange={handleFormatsChange}
                                renderValue={(items) => {
                                    return (
                                        <div className="flex flex-wrap gap-2">
                                            {items.map((item) => (
                                                <Chip
                                                    key={item.key}
                                                    size="sm"
                                                    color="success"
                                                    variant="flat"
                                                >
                                                    {item.textValue?.toUpperCase()}
                                                </Chip>
                                            ))}
                                        </div>
                                    );
                                }}
                            >
                                <SelectItem key="jpg" textValue="jpg">
                                    JPG - 最常见的照片格式
                                </SelectItem>
                                <SelectItem key="jpeg" textValue="jpeg">
                                    JPEG - JPG 的另一种扩展名
                                </SelectItem>
                                <SelectItem key="png" textValue="png">
                                    PNG - 支持透明背景的图片格式
                                </SelectItem>
                                <SelectItem key="gif" textValue="gif">
                                    GIF - 支持动画的图片格式
                                </SelectItem>
                                <SelectItem key="bmp" textValue="bmp">
                                    BMP - Windows 位图格式
                                </SelectItem>
                                <SelectItem key="webp" textValue="webp">
                                    WebP - Google 开发的现代图片格式
                                </SelectItem>
                                <SelectItem key="tiff" textValue="tiff">
                                    TIFF - 专业摄影常用的无损格式
                                </SelectItem>
                                <SelectItem key="heic" textValue="heic">
                                    HEIC - iPhone 默认的照片格式
                                </SelectItem>
                                <SelectItem key="heif" textValue="heif">
                                    HEIF - HEIC 的标准格式
                                </SelectItem>
                            </Select>

                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    ✅ 推荐：至少选择 JPG、JPEG、PNG 三种常见格式
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}

