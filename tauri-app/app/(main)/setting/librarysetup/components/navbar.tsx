'use client';

import { useState } from "react";
import clsx from "clsx";
import { Button } from "@heroui/button";
import { PlusIcon, ScanIcon } from "@/components/icons";
import { AddLibraryModal } from "./add-library-modal";
import { LocalLibraryForm } from "./local-library-form";
import { WebDAVLibraryForm } from "./webdav-library-form";
import type { LocalLibraryData } from "./local-library-form";
import type { WebDAVLibraryData } from "./webdav-library-form";

// 步骤1：先定义 props 的类型
interface NavbarProps {
    isDark: boolean;  // 组件需要接收一个叫 isDark 的 boolean 属性
    onAddLibrary?: (data: LocalLibraryData | WebDAVLibraryData) => void;
}


export const Navbar = (props: NavbarProps) => {
    const { isDark, onAddLibrary } = props;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showLocalForm, setShowLocalForm] = useState(false);
    const [showWebDAVForm, setShowWebDAVForm] = useState(false);
    const themeStyles = {
        background: isDark ? 'bg-gray-900' : 'bg-gray-50',
        text: isDark ? 'text-gray-100' : 'text-gray-900',
        buttonHover: isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100',
        shadow: isDark ? 'shadow-md shadow-black/20' : 'shadow-md shadow-black/10',
    };

    return (
        <>
            <div className={
                clsx(
                    "navbar-wrap h-16 w-full flex-shrink-0 flex items-center justify-between px-6 rounded-2xl",
                    themeStyles.background,
                    themeStyles.text,
                    themeStyles.shadow
                )
            }>
                <div className="text-lg font-semibold">媒体库设置</div>

                {/* 右侧按钮组 */}
                <div className="flex gap-3">
                    {/* 添加媒体库按钮 */}
                    <Button
                        isIconOnly={false}
                        size="sm"
                        variant="flat"
                        className={clsx(
                            "transition-colors duration-200",
                            themeStyles.buttonHover
                        )}
                        startContent={<PlusIcon size={18} />}
                        onPress={() => setShowAddModal(true)}
                    >
                        添加媒体库
                    </Button>

                    {/* 扫描媒体库文件按钮 */}
                    <Button
                        isIconOnly={false}
                        size="sm"
                        variant="flat"
                        className={clsx(
                            "transition-colors duration-200",
                            themeStyles.buttonHover
                        )}
                        startContent={<ScanIcon size={18} />}
                    >
                        扫描媒体库文件
                    </Button>
                </div>
            </div>

            {/* 添加媒体库模态窗 */}
            <AddLibraryModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSelectLocal={() => {
                    setShowAddModal(false);
                    setShowLocalForm(true);
                }}
                onSelectWebDAV={() => {
                    setShowAddModal(false);
                    setShowWebDAVForm(true);
                }}
            />

            {/* 本地媒体库表单 */}
            <LocalLibraryForm
                isOpen={showLocalForm}
                onClose={() => setShowLocalForm(false)}
                onSubmit={(data) => {
                    console.log("添加本地媒体库:", data);
                    onAddLibrary?.(data);
                }}
            />

            {/* WebDAV 媒体库表单 */}
            <WebDAVLibraryForm
                isOpen={showWebDAVForm}
                onClose={() => setShowWebDAVForm(false)}
                onSubmit={(data) => {
                    console.log("添加 WebDAV 媒体库:", data);
                    onAddLibrary?.(data);
                }}
            />
        </>
    )
}