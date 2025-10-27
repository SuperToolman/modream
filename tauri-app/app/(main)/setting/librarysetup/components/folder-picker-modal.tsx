'use client';

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { FolderIcon } from "@/components/icons";

interface FolderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
}

interface FolderItem {
  name: string;
  path: string;
  isFolder: boolean;
}

/**
 * 文件夹选择模态窗
 * 允许用户浏览系统文件夹或输入路径
 */
export const FolderPickerModal = ({
  isOpen,
  onClose,
  onSelect,
}: FolderPickerModalProps) => {
  const { theme } = useTheme();
  const isSSR = useIsSSR();
  const isDark = theme === 'dark' && !isSSR;

  const [folderPath, setFolderPath] = useState("");
  const [error, setError] = useState("");
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const themeStyles = {
    background: isDark ? 'bg-gray-900' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    cardBg: isDark ? 'bg-gray-800' : 'bg-gray-50',
    hoverBg: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
  };

  // 获取常见的文件夹路径
  const getCommonFolders = () => {
    const commonPaths: FolderItem[] = [];

    // 检测操作系统
    const isWindows = typeof window !== 'undefined' && navigator.platform.includes('Win');

    if (isWindows) {
      commonPaths.push(
        { name: '📁 我的文档', path: 'C:\\Users\\Documents', isFolder: true },
        { name: '📁 下载', path: 'C:\\Users\\Downloads', isFolder: true },
        { name: '📁 视频', path: 'C:\\Users\\Videos', isFolder: true },
        { name: '📁 音乐', path: 'C:\\Users\\Music', isFolder: true },
        { name: '📁 图片', path: 'C:\\Users\\Pictures', isFolder: true },
        { name: '💾 D 盘', path: 'D:\\', isFolder: true },
        { name: '💾 E 盘', path: 'E:\\', isFolder: true },
      );
    } else {
      commonPaths.push(
        { name: '📁 主目录', path: '~', isFolder: true },
        { name: '📁 下载', path: '~/Downloads', isFolder: true },
        { name: '📁 视频', path: '~/Videos', isFolder: true },
        { name: '📁 音乐', path: '~/Music', isFolder: true },
        { name: '📁 图片', path: '~/Pictures', isFolder: true },
        { name: '📁 媒体', path: '/media', isFolder: true },
        { name: '📁 mnt', path: '/mnt', isFolder: true },
      );
    }

    return commonPaths;
  };

  useEffect(() => {
    if (isOpen) {
      setFolders(getCommonFolders());
      setFolderPath("");
      setError("");
    }
  }, [isOpen]);

  const handleSelect = () => {
    if (!folderPath.trim()) {
      setError("请输入或选择文件夹路径");
      return;
    }
    onSelect(folderPath.trim());
    setFolderPath("");
    setError("");
    onClose();
  };

  const handleFolderClick = (path: string) => {
    setFolderPath(path);
    setError("");
  };

  const handleClose = () => {
    setFolderPath("");
    setError("");
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
          <h2 className="text-xl font-bold">选择文件夹</h2>
          <p className={clsx("text-sm font-normal", themeStyles.textSecondary)}>
            选择或输入要添加的文件夹路径
          </p>
        </ModalHeader>
        <ModalBody className="gap-4">
          {/* 路径输入框 */}
          <Input
            label="文件夹路径"
            placeholder="例如：/media/movies 或 D:\Movies"
            value={folderPath}
            onChange={(e) => {
              setFolderPath(e.target.value);
              setError("");
            }}
            isInvalid={!!error}
            errorMessage={error}
            startContent={<FolderIcon size={18} />}
          />

          <Divider />

          {/* 常见文件夹列表 */}
          <div>
            <p className={clsx("text-sm font-medium mb-2", themeStyles.text)}>
              常见文件夹
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {folders.map((folder, index) => (
                <Card
                  key={index}
                  isPressable
                  onPress={() => handleFolderClick(folder.path)}
                  className={clsx(
                    "transition-colors duration-200",
                    themeStyles.cardBg,
                    themeStyles.hoverBg,
                    folderPath === folder.path && (isDark ? 'bg-blue-900/30' : 'bg-blue-50')
                  )}
                >
                  <CardBody className="flex-row items-center gap-3 p-3">
                    <span className="text-lg">{folder.name.split(' ')[0]}</span>
                    <div className="flex-1 min-w-0">
                      <p className={clsx("text-sm font-medium truncate", themeStyles.text)}>
                        {folder.name.split(' ').slice(1).join(' ')}
                      </p>
                      <p className={clsx("text-xs truncate", themeStyles.textSecondary)}>
                        {folder.path}
                      </p>
                    </div>
                    {folderPath === folder.path && (
                      <div className="text-blue-500">✓</div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* 提示信息 */}
          <div className={clsx(
            "p-3 rounded-lg text-sm",
            isDark ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-700"
          )}>
            <p className="font-medium mb-1">💡 提示：</p>
            <p className="text-xs">
              您可以从上面的常见文件夹中选择，或直接输入自定义路径。
            </p>
          </div>
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
            onPress={handleSelect}
          >
            确定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

