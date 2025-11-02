import MangaCard from "@/components/cards/manga-card"

export default function Test() {
    return (
        <>
            <div>
                这是测试页面
                漫画卡片：
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">
                    <MangaCard title='test'/>
                    <MangaCard />
                    <MangaCard />
                    <MangaCard />
                    <MangaCard />
                    <MangaCard />
                    <MangaCard />
                    <MangaCard />
                </div>
            </div>
        </>
    )
}