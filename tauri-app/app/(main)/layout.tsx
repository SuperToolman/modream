import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* 左侧固定侧边栏 */}
            <Sidebar />

            {/* 右侧主容器：包含导航栏和主内容 */}
            <div className="flex-col ml-16 min-h-screen flex">
                <Navbar />
                <main className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-4 py-4 overflow-y-auto flex-1 flex flex-col box-border">
                        {children}
                    </div>
                </main>
            </div>
        </>
    )
}