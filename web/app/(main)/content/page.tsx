import VideoCard from "@/components/cards/video-card";
// import { TauriDebug } from "@/components/tauri-debug";
// import { DragTest } from "@/components/drag-test";

// 示例视频数据
const videoData = [
    {
        title: "【子丑】15天花20万元500克黄金做数字手绘手工打造三维...",
        uploader: "子丑寅卯",
        views: "11.5万",
        uploadTime: "2021-4-26",
        duration: "11:57",
        thumbnail: "https://heroui.com/images/hero-card-complete.jpeg"
    },
    {
        title: "【回应】80年代的电脑能玩什么？平果金会员深度体验",
        uploader: "平果金会员",
        views: "8.2万",
        uploadTime: "2020-10-28",
        duration: "04:49",
        thumbnail: "https://heroui.com/images/hero-card-complete.jpeg"
    },
    {
        title: "【梦幻】童话",
        uploader: "梦幻西游",
        views: "1.2万",
        uploadTime: "2020-10-28",
        duration: "04:49",
        thumbnail: "https://heroui.com/images/hero-card-complete.jpeg"
    }
];

export default function ContentRoot() {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {Array.from({ length: 25 }, (_, index) => {
                    const data = videoData[index % videoData.length];
                    return (
                        <VideoCard
                            key={index}
                            title={`${data.title} - ${index + 1}`}
                            uploader={data.uploader}
                            views={data.views}
                            uploadTime={data.uploadTime}
                            duration={data.duration}
                            thumbnail={data.thumbnail}
                        />
                    );
                })}
            </div>
            {/* <TauriDebug /> */}
            {/* <DragTest /> */}
        </>
    )
}