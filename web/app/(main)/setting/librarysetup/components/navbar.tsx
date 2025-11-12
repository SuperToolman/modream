'use client';

import { useState } from "react";
import { Button } from "@heroui/button";
import { PlusIcon, ScanIcon } from "@/components/icons";
import { AddLibraryModal } from "./add-library-modal";
import { LocalLibraryForm } from "./local-library-form";
import { WebDAVLibraryForm } from "./webdav-library-form";
import type { LocalLibraryData } from "./local-library-form";
import type { WebDAVLibraryData } from "./webdav-library-form";

// 步骤1：先定义 props 的类型
interface NavbarProps {
    onAddLibrary?: (data: LocalLibraryData | WebDAVLibraryData) => void;
}


export const Navbar = (props: NavbarProps) => {
    const { onAddLibrary } = props;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showLocalForm, setShowLocalForm] = useState(false);
    const [showWebDAVForm, setShowWebDAVForm] = useState(false);

    return (
        <>
            {/* 操作按钮组 */}
            <div className="flex gap-3 justify-end">
                {/* 添加媒体库按钮 */}
                <Button
                    size="md"
                    color="primary"
                    variant="flat"
                    startContent={<PlusIcon size={18} />}
                    onPress={() => setShowAddModal(true)}
                >
                    添加媒体库
                </Button>

                {/* 扫描媒体库文件按钮 */}
                <Button
                    size="md"
                    variant="flat"
                    startContent={<ScanIcon size={18} />}
                >
                    扫描媒体库文件
                </Button>
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