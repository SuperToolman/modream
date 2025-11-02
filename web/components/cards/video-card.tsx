import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Avatar } from "@heroui/avatar";

interface VideoCardProps {
    title?: string;
    uploader?: string;
    views?: string;
    uploadTime?: string;
    duration?: string;
    thumbnail?: string;
    avatar?: string;
}

export default function VideoCard({
    title = "【子丑】15天花20万元500克黄金做数字手绘手工打造三维...",
    uploader = "子丑寅卯",
    views = "11.5万",
    uploadTime = "2021-4-26",
    duration = "11:57",
    thumbnail = "https://heroui.com/images/hero-card-complete.jpeg",
    avatar = "https://i0.hdslb.com/bfs/face/54ca0d8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b8e8b.jpg@96w_96h_1c_1s.webp"
}: VideoCardProps) {
    return (
        <Card className="w-full hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-white dark:bg-gray-800" radius="lg" shadow="sm">
            <CardBody className="p-0">
                {/* 视频缩略图容器 */}
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                        isZoomed
                        alt={title}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                        src={thumbnail}
                        removeWrapper
                    />
                    {/* 视频时长 */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded z-10">
                        {duration}
                    </div>

                    {/* 底部渐变遮罩和播放量时间信息 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent h-20 flex items-end z-10">
                        <div className="flex items-center gap-2 text-xs text-white p-3 pb-3 font-medium">
                            <span>{views}观看</span>
                            <span>•</span>
                            <span>{uploadTime}</span>
                        </div>
                    </div>
                </div>

                {/* 视频信息 */}
                <div className="p-3">
                    {/* 视频标题 */}
                    <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 leading-tight overflow-hidden"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}>
                        {title}
                    </h3>

                    {/* UP主信息 */}
                    <div className="flex items-center gap-2 mb-2">
                        <Avatar
                            src={avatar}
                            size="sm"
                            className="w-6 h-6"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-500 cursor-pointer">
                            {uploader}
                        </span>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}
