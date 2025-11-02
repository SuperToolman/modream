'use client';

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
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
  gameProviders?: string; // 游戏数据库提供者（逗号分隔字符串）
  metadataStorage?: string; // 元数据存储方式
  comicFormats?: string; // 漫画格式（逗号分隔字符串）
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

  // 内部状态使用数组，方便管理
  const [internalGameProviders, setInternalGameProviders] = useState<string[]>(["igdb", "dlsite"]);
  const [internalComicFormats, setInternalComicFormats] = useState<string[]>(["cbz", "cbr"]);

  const [formData, setFormData] = useState<WebDAVLibraryData>({
    name: "",
    url: "",
    username: "",
    password: "",
    path: "",
    type: "影片",
    metadataStorage: "database",
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
      // 将数组转换为逗号分隔的字符串
      const submitData: WebDAVLibraryData = {
        ...formData,
        gameProviders: internalGameProviders.length > 0
          ? internalGameProviders.map(p => p.toUpperCase()).join(',')
          : undefined,
        comicFormats: internalComicFormats.length > 0
          ? internalComicFormats.map(f => f.toUpperCase()).join(',')
          : undefined,
      };

      onSubmit(submitData);
      setFormData({
        name: "",
        url: "",
        username: "",
        password: "",
        path: "",
        type: "影片",
        metadataStorage: "database",
      });
      setInternalGameProviders(["igdb", "dlsite"]);
      setInternalComicFormats(["cbz", "cbr"]);
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
      metadataStorage: "database",
    });
    setInternalGameProviders(["igdb", "dlsite"]);
    setInternalComicFormats(["cbz", "cbr"]);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="5xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "max-w-[800px]",
      }}
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

          {/* 媒体库类型 */}
          <Select
            label="媒体库类型"
            selectedKeys={[formData.type]}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full"
            description="选择媒体库类型后，将显示相应的配置选项"
          >
            {LIBRARY_TYPES.map((type) => (
              <SelectItem key={type.key}>
                {type.label}
              </SelectItem>
            ))}
          </Select>

          <div className="webdav_Config_group space-y-4 pt-2">
            <div className={clsx(
              "p-4 rounded-lg border-2 border-dashed space-y-4",
              isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
            )}>
              <h3 className={clsx("text-sm font-semibold mb-3", themeStyles.text)}>
                WebDAV 服务器配置
              </h3>

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
            </div>
          </div>

          {/* 动态表单区域 - 根据媒体类型显示不同的配置 */}
          {formData.type && (
            <div className="space-y-4 pt-2">
              {/* 游戏类型的特殊配置 */}
              {formData.type === "游戏" && (
                <div className="space-y-4">
                  <div className={clsx(
                    "p-4 rounded-lg border-2 border-dashed",
                    isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
                  )}>
                    <h3 className={clsx("text-sm font-semibold mb-3", themeStyles.text)}>
                      🎮 游戏库配置
                    </h3>

                    {/* 游戏数据库提供者 */}
                    <Select
                      label="游戏数据库提供者"
                      placeholder="选择游戏数据库"
                      className="w-full mb-3"
                      description="用于获取游戏元数据和封面（可多选）"
                      selectionMode="multiple"
                      defaultSelectedKeys={["igdb", "dlsite"]}
                      selectedKeys={internalGameProviders}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys as Set<string>);
                        setInternalGameProviders(selected);
                      }}
                      renderValue={(items) => {
                        return (
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <Chip
                                key={item.key}
                                size="sm"
                                color="primary"
                                variant="flat"
                              >
                                {item.key === "igdb" ? "IGDB" :
                                  item.key === "dlsite" ? "DLsite" :
                                    item.key === "steamdb" ? "SteamDB" : item.textValue}
                              </Chip>
                            ))}
                          </div>
                        );
                      }}
                    >
                      <SelectItem
                        key="igdb"
                        textValue="IGDB"
                        description="全球最大的游戏数据库，支持主流游戏平台"
                      >
                        IGDB
                      </SelectItem>
                      <SelectItem
                        key="dlsite"
                        textValue="DLsite"
                        description="日本同人游戏平台，丰富的日式RPG游戏（⚠️使用此库需要VPN）"
                      >
                        DLsite
                      </SelectItem>
                      <SelectItem
                        key="steamdb"
                        textValue="SteamDB"
                        description="Steam 游戏数据库，适合 PC 游戏"
                      >
                        SteamDB
                      </SelectItem>
                    </Select>

                    {/* 元数据存储方式 */}
                    <Select
                      label="元数据存储方式"
                      placeholder="选择存储方式"
                      className="w-full"
                      description="选择如何存储游戏元数据"
                      selectedKeys={formData.metadataStorage ? [formData.metadataStorage] : []}
                      onChange={(e) => setFormData({ ...formData, metadataStorage: e.target.value })}
                    >
                      <SelectItem key="local">本地存储</SelectItem>
                      <SelectItem key="database">数据库存储</SelectItem>
                      <SelectItem key="mixed">混合存储</SelectItem>
                    </Select>
                  </div>
                </div>
              )}

              {/* 漫画类型的特殊配置 */}
              {formData.type === "漫画" && (
                <div className="space-y-4">
                  <div className={clsx(
                    "p-4 rounded-lg border-2 border-dashed",
                    isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
                  )}>
                    <h3 className={clsx("text-sm font-semibold mb-3", themeStyles.text)}>
                      📚 漫画库配置
                    </h3>

                    {/* 元数据存储方式 */}
                    <Select
                      label="元数据存储方式"
                      placeholder="选择存储方式"
                      className="w-full mb-3"
                      description="选择如何存储漫画元数据"
                      selectedKeys={formData.metadataStorage ? [formData.metadataStorage] : []}
                      onChange={(e) => setFormData({ ...formData, metadataStorage: e.target.value })}
                    >
                      <SelectItem key="local">本地存储</SelectItem>
                      <SelectItem key="database">数据库存储</SelectItem>
                      <SelectItem key="mixed">混合存储</SelectItem>
                    </Select>

                    {/* 漫画格式支持 */}
                    <Select
                      label="支持的漫画格式"
                      placeholder="选择支持的格式"
                      className="w-full"
                      selectionMode="multiple"
                      description="选择要扫描的漫画文件格式"
                      defaultSelectedKeys={["cbz", "cbr"]}
                      selectedKeys={internalComicFormats}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys as Set<string>);
                        setInternalComicFormats(selected);
                      }}
                      renderValue={(items) => {
                        return (
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => (
                              <Chip
                                key={item.key}
                                size="sm"
                                color="secondary"
                                variant="flat"
                              >
                                {item.textValue}
                              </Chip>
                            ))}
                          </div>
                        );
                      }}
                    >
                      <SelectItem key="cbz" textValue="CBZ">CBZ (ZIP压缩)</SelectItem>
                      <SelectItem key="cbr" textValue="CBR">CBR (RAR压缩)</SelectItem>
                      <SelectItem key="pdf" textValue="PDF">PDF</SelectItem>
                      <SelectItem key="epub" textValue="EPUB">EPUB</SelectItem>
                    </Select>
                  </div>
                </div>
              )}

              {/* 其他媒体类型可以在这里添加配置 */}
              {!["游戏", "漫画"].includes(formData.type) && (
                <div className={clsx(
                  "p-4 rounded-lg text-center",
                  isDark ? "bg-gray-800/50" : "bg-gray-50"
                )}>
                  <p className={clsx("text-sm", themeStyles.textSecondary)}>
                    此媒体类型暂无额外配置选项
                  </p>
                </div>
              )}
            </div>
          )}
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

