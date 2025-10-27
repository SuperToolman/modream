'use client';

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { CloudIcon } from "@/components/icons";

interface WebDAVLibraryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WebDAVLibraryData) => void;
}

export interface WebDAVLibraryData {
  name: string;
  url: string;
  username: string;
  password: string;
  path: string;
  type: string;
}

const LIBRARY_TYPES = [
  { key: "影片", label: "影片" },
  { key: "音乐", label: "音乐" },
  { key: "电视节目", label: "电视节目" },
  { key: "有声读物", label: "有声读物" },
  { key: "数据", label: "数据" },
  { key: "游戏", label: "游戏" },
  { key: "音乐视频", label: "音乐视频" },
  { key: "家庭视频和照片", label: "家庭视频和照片" },
  { key: "混合内容", label: "混合内容" },
  { key: "漫画", label: "漫画" },
];

/**
 * WebDAV 媒体库表单
 */
export const WebDAVLibraryForm = ({
  isOpen,
  onClose,
  onSubmit,
}: WebDAVLibraryFormProps) => {
  const { theme } = useTheme();
  const isSSR = useIsSSR();
  const isDark = theme === 'dark' && !isSSR;

  const [formData, setFormData] = useState<WebDAVLibraryData>({
    name: "",
    url: "",
    username: "",
    password: "",
    path: "",
    type: "影片",
  });

  const [errors, setErrors] = useState<Partial<WebDAVLibraryData>>({});

  const themeStyles = {
    background: isDark ? 'bg-gray-900' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
  };

  const validateForm = () => {
    const newErrors: Partial<WebDAVLibraryData> = {};
    if (!formData.name.trim()) newErrors.name = "请输入媒体库名称";
    if (!formData.url.trim()) newErrors.url = "请输入 WebDAV 服务器地址";
    if (!formData.username.trim()) newErrors.username = "请输入用户名";
    if (!formData.password.trim()) newErrors.password = "请输入密码";
    if (!formData.path.trim()) newErrors.path = "请输入媒体库路径";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        name: "",
        url: "",
        username: "",
        password: "",
        path: "",
        type: "影片",
      });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      url: "",
      username: "",
      password: "",
      path: "",
      type: "影片",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent className={themeStyles.background}>
        <ModalHeader className={clsx("flex flex-col gap-1", themeStyles.text)}>
          <h2 className="text-2xl font-bold">添加 WebDAV 媒体库</h2>
          <p className={clsx("text-sm font-normal", themeStyles.textSecondary)}>
            配置 WebDAV 服务器连接信息
          </p>
        </ModalHeader>
        <ModalBody className="gap-4">
          {/* 媒体库名称 */}
          <Input
            label="媒体库名称"
            placeholder="例如：NAS 电影库"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            startContent={<span className="text-gray-400">📝</span>}
          />

          {/* WebDAV 服务器地址 */}
          <Input
            label="WebDAV 服务器地址"
            placeholder="例如：https://nas.example.com/webdav"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            isInvalid={!!errors.url}
            errorMessage={errors.url}
            startContent={<div className="text-gray-400"><CloudIcon size={18} /></div>}
          />

          {/* 用户名 */}
          <Input
            label="用户名"
            placeholder="输入 WebDAV 用户名"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            isInvalid={!!errors.username}
            errorMessage={errors.username}
            startContent={<span className="text-gray-400">👤</span>}
          />

          {/* 密码 */}
          <Input
            label="密码"
            type="password"
            placeholder="输入 WebDAV 密码"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            isInvalid={!!errors.password}
            errorMessage={errors.password}
            startContent={<span className="text-gray-400">🔒</span>}
          />

          {/* 媒体库路径 */}
          <Input
            label="媒体库路径"
            placeholder="例如：/movies 或 /media/films"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            isInvalid={!!errors.path}
            errorMessage={errors.path}
            startContent={<span className="text-gray-400">📂</span>}
          />

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
    </Modal>
  );
};

