'use client';

import { useRouter } from 'next/navigation';
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { Avatar } from "@heroui/avatar";

interface MangaCardProps {
    id?: string;
    title?: string;
    cover_url?: string;
    page_count?: number;
    author_id?: number | null;
    author_name?: string;
    priority?: boolean;
}

export default function MangaCard({
    id = "1",
    title = "未命名漫画",
    cover_url = "https://heroui.com/images/card-example-3.jpeg",
    page_count = 0,
    author_id = null,
    author_name = undefined,
    priority = false
}: MangaCardProps) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/content/mangas/${id}`);
    };

    // 判断是否有作者
    const hasAuthor = author_id !== null && author_id !== undefined;
    // 作者名称：如果有 author_name 则使用，否则根据 author_id 判断
    const displayAuthorName = author_name || (hasAuthor ? `作者 ${author_id}` : '未知作者');
    // 作者头像：如果有作者则使用 author_id，否则使用默认用户头像
    const authorAvatarUrl = hasAuthor
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${author_id}`
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

    return (
        <Card
            className="w-full bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
            isPressable
            onPress={handleCardClick}
        >
            {/* 图片容器 */}
            <CardBody className="p-0 relative overflow-hidden">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-lg">
                    <Image
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={cover_url}
                        removeWrapper
                        isBlurred
                        loading={priority ? "eager" : "lazy"}
                    />

                    {/* 页数标签 - 右下角 */}
                    {page_count > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 z-20 shadow-lg">
                            <span className="text-white text-xs font-semibold">{page_count}P</span>
                        </div>
                    )}
                </div>
            </CardBody>

            {/* 信息容器 */}
            <CardFooter className="flex-col items-start p-3 gap-2.5">
                {/* 标题 - 固定两行高度，超出显示省略号，带背景 */}
                <div className="w-full px-2 py-2 rounded-lg bg-gradient-to-r from-purple-100/60 to-blue-100/60 dark:from-purple-900/30 dark:to-blue-900/30 h-10 flex items-center">
                    <h3 className="w-full text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug break-words">
                        {title}
                    </h3>
                </div>

                {/* 作者信息 - 显示头像和名称 */}
                <div className="w-full flex items-center gap-2 px-1">
                    <Avatar
                        size="sm"
                        src={authorAvatarUrl}
                        name={displayAuthorName}
                        className="flex-shrink-0"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                        {displayAuthorName}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}