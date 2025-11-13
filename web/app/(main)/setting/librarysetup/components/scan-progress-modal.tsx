'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Chip,
} from '@heroui/react';
import { media_librariesApi, type ScanTaskInfo } from '@/lib/api/media_libraries';
import { toast } from 'sonner';

interface ScanProgressModalProps {
  /** 是否显示对话框 */
  isOpen: boolean;
  /** 关闭对话框回调 */
  onClose: () => void;
  /** 媒体库 ID */
  mediaLibraryId: number;
  /** 媒体库标题 */
  mediaLibraryTitle: string;
}

/**
 * 扫描进度对话框组件
 * 显示媒体库扫描的实时进度
 */
export function ScanProgressModal({
  isOpen,
  onClose,
  mediaLibraryId,
  mediaLibraryTitle,
}: ScanProgressModalProps) {
  const [taskInfo, setTaskInfo] = useState<ScanTaskInfo | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // 轮询扫描状态
  const pollScanStatus = useCallback(async () => {
    if (!isPolling) return;

    try {
      const info = await media_librariesApi.getScanStatus(mediaLibraryId);
      console.log('📊 扫描状态:', info);
      console.log('📊 total_files:', info.total_files, 'processed_files:', info.processed_files);
      setTaskInfo(info);

      // 如果任务已完成、失败或取消，停止轮询
      if (info.status === 'completed' || info.status === 'failed' || info.status === 'cancelled') {
        setIsPolling(false);

        // 显示结果通知
        if (info.status === 'completed') {
          toast.success(`扫描完成！成功处理 ${info.success_count} 个文件`);
        } else if (info.status === 'failed') {
          toast.error(`扫描失败：${info.error_message || '未知错误'}`);
        } else if (info.status === 'cancelled') {
          toast.info('扫描已取消');
        }
      }
    } catch (error) {
      console.error('Failed to fetch scan status:', error);
      // 如果任务不存在，可能已经完成或被删除
      setIsPolling(false);
    }
  }, [mediaLibraryId, isPolling]);

  // 启动轮询
  useEffect(() => {
    if (!isOpen || !isPolling) return;

    // 立即执行一次
    pollScanStatus();

    // 每 1.5 秒轮询一次
    const interval = setInterval(pollScanStatus, 1500);

    return () => clearInterval(interval);
  }, [isOpen, isPolling, pollScanStatus]);

  // 取消扫描
  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await media_librariesApi.cancelScan(mediaLibraryId);
      toast.info('正在取消扫描...');
      setIsPolling(false);
    } catch (error) {
      console.error('Failed to cancel scan:', error);
      toast.error('取消扫描失败');
    } finally {
      setIsCancelling(false);
    }
  };

  // 关闭对话框
  const handleClose = () => {
    setIsPolling(false);
    onClose();
  };

  // 计算进度百分比
  const progressPercentage = taskInfo
    ? taskInfo.total_files > 0
      ? Math.round((taskInfo.processed_files / taskInfo.total_files) * 100)
      : 0
    : 0;

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'scanning':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'scanning':
        return '扫描中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      isDismissable={false}
      hideCloseButton={taskInfo?.status === 'scanning'}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>扫描进度</span>
            {taskInfo && (
              <Chip color={getStatusColor(taskInfo.status)} variant="flat" size="sm">
                {getStatusText(taskInfo.status)}
              </Chip>
            )}
          </div>
          <p className="text-sm font-normal text-default-500">{mediaLibraryTitle}</p>
        </ModalHeader>

        <ModalBody>
          {taskInfo ? (
            <div className="space-y-4">
              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-default-600">
                    已处理 {taskInfo.processed_files} / {taskInfo.total_files} 个文件
                  </span>
                  <span className="font-semibold">{progressPercentage}%</span>
                </div>
                <Progress
                  value={progressPercentage}
                  color={getStatusColor(taskInfo.status) as any}
                  size="md"
                  className="w-full"
                />
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-success-50 p-3 dark:bg-success-900/20">
                  <p className="text-xs text-success-600 dark:text-success-400">成功</p>
                  <p className="text-2xl font-bold text-success-700 dark:text-success-300">
                    {taskInfo.success_count}
                  </p>
                </div>
                <div className="rounded-lg bg-danger-50 p-3 dark:bg-danger-900/20">
                  <p className="text-xs text-danger-600 dark:text-danger-400">失败</p>
                  <p className="text-2xl font-bold text-danger-700 dark:text-danger-300">
                    {taskInfo.failed_count}
                  </p>
                </div>
              </div>

              {/* 当前处理的文件 */}
              {taskInfo.current_file && taskInfo.status === 'scanning' && (
                <div className="rounded-lg bg-default-100 p-3 dark:bg-default-50/10">
                  <p className="mb-1 text-xs text-default-500">当前文件</p>
                  <p className="truncate text-sm font-mono text-default-700 dark:text-default-300">
                    {taskInfo.current_file}
                  </p>
                </div>
              )}

              {/* 错误信息 */}
              {taskInfo.error_message && taskInfo.status === 'failed' && (
                <div className="rounded-lg bg-danger-50 p-3 dark:bg-danger-900/20">
                  <p className="mb-1 text-xs text-danger-600 dark:text-danger-400">错误信息</p>
                  <p className="text-sm text-danger-700 dark:text-danger-300">
                    {taskInfo.error_message}
                  </p>
                </div>
              )}

              {/* 时间信息 */}
              <div className="space-y-1 text-xs text-default-500">
                <p>开始时间：{taskInfo.created_at}</p>
                {taskInfo.completed_at && <p>完成时间：{taskInfo.completed_at}</p>}
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-default-500">正在加载扫描信息...</p>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {taskInfo?.status === 'scanning' ? (
            <Button
              color="warning"
              variant="flat"
              onPress={handleCancel}
              isLoading={isCancelling}
            >
              取消扫描
            </Button>
          ) : (
            <Button color="primary" onPress={handleClose}>
              关闭
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

