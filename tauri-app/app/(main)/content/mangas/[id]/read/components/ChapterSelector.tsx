/**
 * 章节选择器组件
 * 用于在漫画阅读器中切换章节
 */

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import type { MangaChapter } from '@/types/manga';

interface ChapterSelectorProps {
    chapters: MangaChapter[];
    currentChapter: MangaChapter | null;
    onChapterChange: (chapter: MangaChapter) => void;
    className?: string;
}

export function ChapterSelector({
    chapters,
    currentChapter,
    onChapterChange,
    className = '',
}: ChapterSelectorProps) {
    if (chapters.length === 0) {
        return null;
    }

    // 找到当前章节的索引
    const currentIndex = currentChapter 
        ? chapters.findIndex(c => c.id === currentChapter.id) 
        : -1;

    // 上一章
    const handlePrevChapter = () => {
        if (currentIndex > 0) {
            onChapterChange(chapters[currentIndex - 1]);
        }
    };

    // 下一章
    const handleNextChapter = () => {
        if (currentIndex < chapters.length - 1) {
            onChapterChange(chapters[currentIndex + 1]);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* 上一章按钮 */}
            <Button
                size="sm"
                variant="flat"
                isDisabled={currentIndex <= 0}
                onPress={handlePrevChapter}
                className="min-w-unit-16"
            >
                上一章
            </Button>

            {/* 章节下拉选择器 */}
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        size="sm"
                        variant="flat"
                        className="min-w-unit-32"
                        endContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        }
                    >
                        {currentChapter?.title || '选择章节'}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="章节选择"
                    selectionMode="single"
                    selectedKeys={currentChapter ? new Set([currentChapter.id.toString()]) : new Set()}
                    onSelectionChange={(keys) => {
                        const selectedId = Array.from(keys)[0] as string;
                        const chapter = chapters.find(c => c.id.toString() === selectedId);
                        if (chapter) {
                            onChapterChange(chapter);
                        }
                    }}
                    className="max-h-96 overflow-y-auto"
                >
                    {chapters.map((chapter) => (
                        <DropdownItem
                            key={chapter.id.toString()}
                            description={`${chapter.page_count} 页`}
                        >
                            {chapter.title}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>

            {/* 下一章按钮 */}
            <Button
                size="sm"
                variant="flat"
                isDisabled={currentIndex >= chapters.length - 1}
                onPress={handleNextChapter}
                className="min-w-unit-16"
            >
                下一章
            </Button>

            {/* 章节信息 */}
            <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {currentIndex + 1} / {chapters.length}
            </div>
        </div>
    );
}

