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

                const mangaData = await mangasApi.getById(mangaId);
                const imagesData = await mangasApi.getImages(mangaId);

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

