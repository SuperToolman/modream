'use client';

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { FolderIcon, CloudIcon } from "@/components/icons";

interface AddLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocal: () => void;
  onSelectWebDAV: () => void;
}

/**
 * 添加媒体库模态窗
 * 显示两个选项：本地选择和 WebDAV 选择
 */
export const AddLibraryModal = ({
  isOpen,
  onClose,
  onSelectLocal,
  onSelectWebDAV,
}: AddLibraryModalProps) => {
  const { theme } = useTheme();
  const isSSR = useIsSSR();
  const isDark = theme === 'dark' && !isSSR;

  const themeStyles = {
    background: isDark ? 'bg-gray-900' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    cardBg: isDark ? 'bg-gray-800' : 'bg-gray-50',
    cardHover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent className={themeStyles.background}>
        <ModalHeader className={clsx("flex flex-col gap-1", themeStyles.text)}>
          <h2 className="text-2xl font-bold">添加媒体库</h2>
          <p className={clsx("text-sm font-normal", themeStyles.textSecondary)}>
            选择媒体库的来源类型
          </p>
        </ModalHeader>
        <ModalBody className="gap-6 pb-8">
          {/* 本地选择卡片 */}
          <Card
            isPressable
            onPress={onSelectLocal}
            className={clsx(
              "transition-all duration-300 cursor-pointer border-2",
              themeStyles.cardBg,
              themeStyles.border,
              "hover:border-blue-500 dark:hover:border-blue-400",
              "hover:shadow-lg"
            )}
          >
            <CardBody className="gap-4 p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      <FolderIcon size={32} />
                    </div>
                    <div>
                      <h3 className={clsx("text-xl font-bold", themeStyles.text)}>
                        从本地选择
                      </h3>
                      <p className={clsx("text-sm", themeStyles.textSecondary)}>
                        Local Storage
                      </p>
                    </div>
                  </div>
                  <p className={clsx("text-sm leading-relaxed", themeStyles.textSecondary)}>
                    从您的计算机或本地网络存储中选择媒体库文件夹。支持所有本地存储设备。
                  </p>
                </div>
                <div className="text-3xl ml-4">📁</div>
              </div>
            </CardBody>
          </Card>

          {/* WebDAV 选择卡片 */}
          <Card
            isPressable
            onPress={onSelectWebDAV}
            className={clsx(
              "transition-all duration-300 cursor-pointer border-2",
              themeStyles.cardBg,
              themeStyles.border,
              "hover:border-purple-500 dark:hover:border-purple-400",
              "hover:shadow-lg"
            )}
          >
            <CardBody className="gap-4 p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      <CloudIcon size={32} />
                    </div>
                    <div>
                      <h3 className={clsx("text-xl font-bold", themeStyles.text)}>
                        从 WebDAV 选择
                      </h3>
                      <p className={clsx("text-sm", themeStyles.textSecondary)}>
                        WebDAV Server
                      </p>
                    </div>
                  </div>
                  <p className={clsx("text-sm leading-relaxed", themeStyles.textSecondary)}>
                    连接到 WebDAV 服务器（如 Nextcloud、Synology 等）来访问远程媒体库。
                  </p>
                </div>
                <div className="text-3xl ml-4">☁️</div>
              </div>
            </CardBody>
          </Card>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

