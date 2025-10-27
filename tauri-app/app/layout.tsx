import "@/styles/globals.css"; // 导入全局样式文件，包含 Tailwind CSS 和自定义样式
import { Link } from "@heroui/link"; // 从 HeroUI 组件库导入 Link 组件，用于创建链接
import clsx from "clsx"; // clsx 是一个用于条件性组合 CSS 类名的工具库（可以根据条件动态添加或移除类名）
import { fontSans } from "@/config/fonts"; // 导入字体配置，定义了应用使用的字体样式
import { Providers } from "./(main)/providers"; // 导入 Providers 组件，用于包装整个应用的上下文提供者（通常包含主题提供者、状态管理等全局配置 ）

import { Navbar } from "@/components/navbar"; // 导入导航栏组件
import { Sidebar } from "@/components/sidebar"; // 导入侧边栏组件
// 从 Next.js 导入类型定义
// Metadata: 用于定义页面的元数据（标题、描述、图标等）
// Viewport: 用于定义视口相关设置（主题颜色、缩放等）
import { Metadata, Viewport } from "next";


export default function RootLayout({ children, }: { children: React.ReactNode; }) {
    return (
        <html suppressHydrationWarning lang="en">
            <head />{/* Next.js 会自动填充 head 标签内容 */}
            <body className={clsx(
                "min-h-screen text-foreground bg-background font-sans antialiased", // 固定的样式名
                fontSans.variable,
            )}>
                {/* themeProps: 主题配置，使用 class 属性切换主题，默认为深色主题 */}
                <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
                    <div className="min-h-screen">
                        {children}
                    </div>
                </Providers>

            </body>
        </html>
    )
}