'use client';

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { FolderIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { FolderPickerModal } from "./folder-picker-modal";

interface LocalLibraryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LocalLibraryData) => void;
  onSelectFolder?: (callback: (path: string) => void) => void;
}

export interface LocalLibraryData {
  name: string;
  folders: string[];
  type: string;
}

const LIBRARY_TYPES = [
  { key: "电影", label: "电影" },
  { key: "视频", label: "视频" },
  { key: "音乐", label: "音乐" },
  { key: "电视节目", label: "电视节目" },
  { key: "有声读物", label: "有声读物" },
  { key: "书籍", label: "书籍" },
  { key: "游戏", label: "游戏" },
  { key: "漫画", label: "漫画" },
  { key: "音乐视频", label: "音乐视频" },
  { key: "照片", label: "照片" },
  { key: "混合内容", label: "混合内容" },
];

/**
 * 本地媒体库表单
 */
export const LocalLibraryForm = ({
  isOpen,
  onClose,
  onSubmit,
}: LocalLibraryFormProps) => {
  const { theme } = useTheme();
  const isSSR = useIsSSR();
  const isDark = theme === 'dark' && !isSSR;

  const [formData, setFormData] = useState<LocalLibraryData>({
    name: "",
    folders: [],
    type: "影片",
  });

  const [errors, setErrors] = useState<{ name?: string; folders?: string }>({});
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const themeStyles = {
    background: isDark ? 'bg-gray-900' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    cardBg: isDark ? 'bg-gray-800' : 'bg-gray-50',
  };

  const validateForm = () => {
    const newErrors: { name?: string; folders?: string } = {};
    if (!formData.name.trim()) newErrors.name = "请输入媒体库名称";
    if (formData.folders.length === 0) newErrors.folders = "请至少添加一个文件夹";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddFolder = () => {
    setShowFolderPicker(true);
  };

  const handleFolderSelected = (path: string) => {
    setFormData({
      ...formData,
      folders: [...formData.folders, path],
    });
  };

  const handleRemoveFolder = (index: number) => {
    setFormData({
      ...formData,
      folders: formData.folders.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      setFormData({ name: "", folders: [], type: "视频" });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: "", folders: [], type: "视频" });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      backdrop="blur"
    >
      <ModalContent className={themeStyles.background}>
        <ModalHeader className={clsx("flex flex-col gap-1", themeStyles.text)}>
          <h2 className="text-2xl font-bold">添加本地媒体库</h2>
          <p className={clsx("text-sm font-normal", themeStyles.textSecondary)}>
            配置本地媒体库的基本信息
          </p>
        </ModalHeader>
        <ModalBody className="gap-4">
          {/* 媒体库名称 */}
          <Input
            label="媒体库名称"
            placeholder="例如：我的电影库"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            startContent={<span className="text-gray-400">📝</span>}
          />

          {/* 文件夹列表 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={clsx("text-sm font-medium", themeStyles.text)}>
                文件夹
              </label>
              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<PlusIcon size={16} />}
                onPress={handleAddFolder}
              >
                添加文件夹
              </Button>
            </div>

            {/* 文件夹列表显示 */}
            {formData.folders.length > 0 ? (
              <Card className={themeStyles.cardBg}>
                <CardBody className="gap-2 p-3">
                  {formData.folders.map((folder, index) => (
                    <div
                      key={index}
                      className={clsx(
                        "flex items-center justify-between p-2 rounded-lg",
                        isDark ? "bg-gray-700/50" : "bg-white/50"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="text-blue-500 flex-shrink-0">
                          <FolderIcon size={16} />
                        </div>
                        <span className={clsx("text-sm truncate", themeStyles.text)}>
                          {folder}
                        </span>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleRemoveFolder(index)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  ))}
                </CardBody>
              </Card>
            ) : (
              <div className={clsx(
                "p-4 rounded-lg text-center",
                themeStyles.cardBg,
                themeStyles.textSecondary
              )}>
                <p className="text-sm">还没有添加文件夹</p>
              </div>
            )}

            {errors.folders && (
              <p className="text-sm text-red-500">{errors.folders}</p>
            )}
          </div>

          {/* 媒体库类型 */}
          <Select
            label="媒体库类型"
            selectedKeys={[formData.type]}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full"
          >
            {LIBRARY_TYPES.map((type) => (
              <SelectItem key={type.key}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={handleClose}
          >
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
          >
            创建媒体库
          </Button>
        </ModalFooter>
      </ModalContent>

      {/* 文件夹选择模态窗 */}
      <FolderPickerModal
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelect={handleFolderSelected}
      />
    </Modal>
  );
};

