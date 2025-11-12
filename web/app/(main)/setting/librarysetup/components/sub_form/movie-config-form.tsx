'use client';

import {Checkbox} from "@heroui/checkbox";
import {Tab, Tabs} from "@heroui/tabs";
import {Card, CardBody} from "@heroui/card";
import {Select, SelectItem} from "@heroui/select";
import {Input} from "@heroui/input";
import {useState} from "react";

interface MovieConfigFormProps {
    movieMetadataDownloaders?: string[];
    onMovieMetadataDownloadersChange?: (downloaders: string[]) => void;
    movieLanguage?: string;
    onMovieLanguageChange?: (language: string) => void;
    movieMinFileSize?: number;
    onMovieMinFileSizeChange?: (minFileSize: number) => void;
}

export function MovieConfigForm({
    movieMetadataDownloaders = ["theMovieDb", "theTVDB"],
    onMovieMetadataDownloadersChange,
    movieLanguage = "zh-CN",
    onMovieLanguageChange,
    movieMinFileSize = 300,
    onMovieMinFileSizeChange,
}: MovieConfigFormProps) {
    const [internalDownloaders, setInternalDownloaders] = useState<string[]>(movieMetadataDownloaders);
    const [internalLanguage, setInternalLanguage] = useState<string>(movieLanguage);
    const [internalMinFileSize, setInternalMinFileSize] = useState<number>(movieMinFileSize);

    const handleDownloaderChange = (downloader: string, checked: boolean) => {
        let updated: string[];
        if (checked) {
            updated = [...internalDownloaders, downloader];
        } else {
            updated = internalDownloaders.filter(d => d !== downloader);
        }
        setInternalDownloaders(updated);
        onMovieMetadataDownloadersChange?.(updated);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setInternalLanguage(value);
        onMovieLanguageChange?.(value);
    };

    const handleMinFileSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 300;
        setInternalMinFileSize(value);
        onMovieMinFileSizeChange?.(value);
    };

    const isDownloaderSelected = (downloader: string) => {
        return internalDownloaders.includes(downloader);
    };

    return (
        <div className="flex w-full flex-col">
            <Tabs aria-label="电影配置选项">
                <Tab key="metadata-downloader" title="影片元数据下载器">
                    <Card>
                        <CardBody className="gap-4">
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    选择用于获取影片元数据的数据源（可多选）
                                </p>

                                {/* TheMovieDb */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Checkbox
                                        isSelected={isDownloaderSelected("theMovieDb")}
                                        onChange={(e) => handleDownloaderChange("theMovieDb", e.target.checked)}
                                        color="primary"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">TheMovieDb</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            全球最大的电影数据库，提供详细的影片信息和海报
                                        </p>
                                    </div>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                        默认
                                    </span>
                                </div>

                                {/* The Open Movie Database */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Checkbox
                                        isSelected={isDownloaderSelected("openMovieDb")}
                                        onChange={(e) => handleDownloaderChange("openMovieDb", e.target.checked)}
                                        color="primary"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">The Open Movie Database</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            开源电影数据库，提供基础的影片信息
                                        </p>
                                    </div>
                                </div>

                                {/* TheTVDB */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Checkbox
                                        isSelected={isDownloaderSelected("theTVDB")}
                                        onChange={(e) => handleDownloaderChange("theTVDB", e.target.checked)}
                                        color="primary"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">TheTVDB</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            专业的电视剧数据库，特别适合电视节目和剧集信息
                                        </p>
                                    </div>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                        默认
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="metadata-language" title="元数据语言">
                    <Card>
                        <CardBody className="gap-4">
                            <Select
                                label="元数据语言"
                                placeholder="选择元数据语言"
                                className="w-full"
                                description="选择从 TMDB 获取的电影信息的语言"
                                selectedKeys={internalLanguage ? [internalLanguage] : []}
                                onChange={handleLanguageChange}
                            >
                                <SelectItem key="zh-CN" textValue="简体中文">
                                    🇨🇳 简体中文
                                </SelectItem>
                                <SelectItem key="zh-TW" textValue="繁體中文">
                                    🇹🇼 繁體中文
                                </SelectItem>
                                <SelectItem key="en-US" textValue="English">
                                    🇺🇸 English
                                </SelectItem>
                                <SelectItem key="ja-JP" textValue="日本語">
                                    🇯🇵 日本語
                                </SelectItem>
                                <SelectItem key="ko-KR" textValue="한국어">
                                    🇰🇷 한국어
                                </SelectItem>
                                <SelectItem key="fr-FR" textValue="Français">
                                    🇫🇷 Français
                                </SelectItem>
                                <SelectItem key="de-DE" textValue="Deutsch">
                                    🇩🇪 Deutsch
                                </SelectItem>
                                <SelectItem key="es-ES" textValue="Español">
                                    🇪🇸 Español
                                </SelectItem>
                                <SelectItem key="it-IT" textValue="Italiano">
                                    🇮🇹 Italiano
                                </SelectItem>
                                <SelectItem key="pt-BR" textValue="Português">
                                    🇧🇷 Português
                                </SelectItem>
                                <SelectItem key="ru-RU" textValue="Русский">
                                    🇷🇺 Русский
                                </SelectItem>
                            </Select>
                        </CardBody>
                    </Card>
                </Tab>
                <Tab key="file-filter" title="文件过滤">
                    <Card>
                        <CardBody className="gap-4">
                            <Input
                                type="number"
                                label="最小文件大小 (MB)"
                                placeholder="300"
                                description="小于此大小的视频文件将被忽略，用于过滤预告片、样本等非电影文件"
                                value={internalMinFileSize.toString()}
                                onChange={handleMinFileSizeChange}
                                min={0}
                                max={10000}
                                endContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-400 text-small">MB</span>
                                    </div>
                                }
                            />
                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <p>💡 <strong>建议值：</strong></p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>标清电影 (480p)：建议 200-300 MB</li>
                                    <li>高清电影 (720p)：建议 300-500 MB</li>
                                    <li>全高清电影 (1080p)：建议 500-1000 MB</li>
                                    <li>4K 电影：建议 1000+ MB</li>
                                </ul>
                                <p className="mt-2">⚠️ 设置过小可能会包含预告片、样本等非电影文件</p>
                            </div>
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}