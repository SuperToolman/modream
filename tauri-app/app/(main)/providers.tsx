"use client"; // 客户端组件标识，告诉 Next.js 这个组件需要在客户端（浏览器）运行，而不是服务端，因为这个组件使用了浏览器特有的功能（如主题切换、路由导航）

import type { ThemeProviderProps } from "next-themes"; // 导入 next-themes 的主题提供者属性类型，用于 TypeScript 类型检查，确保传入的主题配置是正确的
import * as React from "react"; // 导入 React 库，使用 * as React 的方式导入所有 React 功能
import { HeroUIProvider } from "@heroui/system"; // 导入 HeroUI 的系统提供者，这个提供者为整个应用提供 HeroUI 组件库的上下文和配置
import { useRouter } from "next/navigation"; //导入 Next.js 的路由钩子（用于在 HeroUI 组件中进行页面导航）
import { ThemeProvider as NextThemesProvider } from "next-themes"; // 导入 next-themes 的主题提供者，并重命名为 NextThemesProvider（这个提供者负责管理整个应用的主题状态（深色/浅色模式））
import { ToastProvider } from "@heroui/toast"; // 导入 HeroUI 的 Toast 提供者，用于支持 addToast 函数

// 定义 Providers 组件的属性接口
// 这是 TypeScript 的类型定义，确保组件接收正确的参数
export interface ProvidersProps {
  // children: 子组件，代表被这个提供者包装的所有内容
  // React.ReactNode 是 React 中最宽泛的类型，可以是任何可渲染的内容
  children: React.ReactNode;
  themeProps?: ThemeProviderProps; // themeProps: 主题相关的配置属性（可选， ? 表示这个属性是可选的，可以不传）ThemeProviderProps 来自 next-themes，包含主题配置选项
}

// TypeScript 模块声明扩展
// 这是一个高级的 TypeScript 技巧，用于扩展第三方库的类型定义
declare module "@react-types/shared" {
  // 为 @react-types/shared 模块添加路由配置接口
  // 这样做是为了让 HeroUI 组件能够正确识别 Next.js 的路由类型
  interface RouterConfig {
    // 定义路由选项的类型
    // 这个复杂的类型定义确保 HeroUI 的导航功能与 Next.js 路由兼容
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

// 主要的提供者组件
// 这个组件将多个上下文提供者组合在一起，为整个应用提供统一的配置
export function Providers({ children, themeProps }: ProvidersProps) {
  // 获取 Next.js 的路由对象
  // router.push 方法用于程序化导航（跳转到其他页面）
  const router = useRouter();

  return (
    // HeroUI 提供者 - 最外层
    // navigate={router.push}: 将 Next.js 的导航方法传递给 HeroUI
    // 这样 HeroUI 的组件（如 Link、Button 等）就能使用 Next.js 的路由系统
    <HeroUIProvider navigate={router.push}>
      {/* 主题提供者 */}
      {/* {...themeProps}: 展开传入的主题配置属性 */}
      {/* 这个提供者管理整个应用的主题状态（深色/浅色模式） */}
      <NextThemesProvider {...themeProps}>
        {/* 渲染子组件 - 这里是整个应用的内容 */}
        {children}
      </NextThemesProvider>
      {/* Toast 提供者 - 用于支持 addToast 函数 */}
      <ToastProvider />
    </HeroUIProvider>
  );
}
