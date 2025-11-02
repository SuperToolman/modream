import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UsePageNavigationProps {
    mangaId: number;
    initialPage: number;
    totalPages: number;
}

export function usePageNavigation({ mangaId, initialPage, totalPages }: UsePageNavigationProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(initialPage);

    // 同步 URL 中的页码
    useEffect(() => {
        setCurrentPage(initialPage);
    }, [initialPage]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            router.push(`/content/mangas/${mangaId}/read?page=${newPage}`);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            router.push(`/content/mangas/${mangaId}/read?page=${newPage}`);
        }
    };

    return {
        currentPage,
        setCurrentPage,
        handlePrevPage,
        handleNextPage,
    };
}

