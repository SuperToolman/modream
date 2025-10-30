import { useState, useEffect } from 'react';
import { mangasApi } from '@/lib/api/mangas';
import type { Manga, MangaImage } from '@/types/manga';

export function useMangaData(mangaId: number) {
    const [manga, setManga] = useState<Manga | null>(null);
    const [images, setImages] = useState<MangaImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMangaData = async () => {
            try {
                setLoading(true);

                // 只需要获取漫画信息，图片列表直接根据 page_count 生成
                const mangaData = await mangasApi.getById(mangaId);

                // 根据 page_count 生成图片数组
                const imagesData: MangaImage[] = [];
                for (let i = 0; i < mangaData.page_count; i++) {
                    imagesData.push({
                        index: i,
                        path: '', // 不需要路径信息
                        url: mangasApi.getImageUrl(mangaId, i),
                    });
                }

                setManga(mangaData);
                setImages(imagesData);
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
    }, [mangaId]);

    return { manga, images, loading, error };
}

