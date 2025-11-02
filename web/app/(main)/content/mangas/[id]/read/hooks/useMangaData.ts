import { useState, useEffect } from 'react';
import { mangasApi, mangaChaptersApi } from '@/lib/api';
import type { Manga, MangaImage, MangaChapter } from '@/types/manga';

interface UseMangaDataProps {
    mangaId: number;
    chapterId?: number | null;
}

export function useMangaData(props: UseMangaDataProps | number) {
    // 兼容旧的调用方式：useMangaData(mangaId)
    const { mangaId, chapterId } = typeof props === 'number'
        ? { mangaId: props, chapterId: null }
        : props;

    const [manga, setManga] = useState<Manga | null>(null);
    const [chapters, setChapters] = useState<MangaChapter[]>([]);
    const [currentChapter, setCurrentChapter] = useState<MangaChapter | null>(null);
    const [images, setImages] = useState<MangaImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMangaData = async () => {
            try {
                setLoading(true);

                // 获取漫画信息
                const mangaData = await mangasApi.getById(mangaId);
                setManga(mangaData);

                if (mangaData.has_chapters) {
                    // 章节结构漫画
                    const chaptersData = await mangaChaptersApi.getByMangaId(mangaId);
                    setChapters(chaptersData);

                    // 确定当前章节
                    let targetChapter: MangaChapter | null = null;
                    if (chapterId) {
                        targetChapter = chaptersData.find(c => c.id === chapterId) || null;
                    }
                    if (!targetChapter && chaptersData.length > 0) {
                        targetChapter = chaptersData[0]; // 默认第一章
                    }

                    if (targetChapter) {
                        setCurrentChapter(targetChapter);

                        // 获取章节图片列表
                        const imageList = await mangaChaptersApi.getImages(mangaId, targetChapter.id);
                        const imagesData: MangaImage[] = [];
                        for (let i = 0; i < imageList.count; i++) {
                            imagesData.push({
                                index: i,
                                path: '',
                                url: mangaChaptersApi.getImageUrl(mangaId, targetChapter.id, i),
                            });
                        }
                        setImages(imagesData);
                    }
                } else {
                    // 单文件夹漫画
                    const imagesData: MangaImage[] = [];
                    for (let i = 0; i < mangaData.page_count; i++) {
                        imagesData.push({
                            index: i,
                            path: '',
                            url: mangasApi.getImageUrl(mangaId, i),
                        });
                    }
                    setImages(imagesData);
                }

                setError(null);
            } catch (err) {
                let errorMsg = '获取漫画数据失败';
                if (err instanceof Error) {
                    errorMsg = err.message;
                } else if (typeof err === 'object' && err !== null && 'message' in err) {
                    errorMsg = (err as any).message;
                }
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchMangaData();
    }, [mangaId, chapterId]);

    return {
        manga,
        chapters,
        currentChapter,
        images,
        loading,
        error,
        setCurrentChapter,
    };
}

