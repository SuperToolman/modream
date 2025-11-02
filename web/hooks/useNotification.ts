'use client';

import { useCallback, useEffect } from 'react';
import { addToast } from '@heroui/toast';

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

/**
 * 通知 Hook
 * 用于显示 HeroUI Toast 通知
 *
 * 支持两种使用方式：
 * 1. 自动监听 API 响应通知事件
 * 2. 手动调用 showNotification 显示通知
 */
export function useNotification() {
  /**
   * 显示通知
   * @param config 通知配置
   */
  const showNotification = useCallback((config: NotificationConfig) => {
    // 将通知类型映射到 HeroUI Toast 的 severity
    const severityMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'default',
    };

    addToast({
      title: config.title,
      description: config.message,
      severity: severityMap[config.type],
      timeout: config.duration || 3000,
    });
  }, []);

  // 监听 API 通知事件
  useEffect(() => {
    const handleApiNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, code, message, title } = customEvent.detail;

      showNotification({
        type: type as 'success' | 'error' | 'warning' | 'info',
        title: title || `[${code}] ${message}`,
        message,
      });
    };

    window.addEventListener('api-notification', handleApiNotification);

    return () => {
      window.removeEventListener('api-notification', handleApiNotification);
    };
  }, [showNotification]);

  /**
   * 显示成功通知
   */
  const showSuccess = useCallback((message: string, title: string = '成功') => {
    showNotification({
      type: 'success',
      title,
      message,
    });
  }, [showNotification]);

  /**
   * 显示错误通知
   */
  const showError = useCallback((message: string, title: string = '错误') => {
    showNotification({
      type: 'error',
      title,
      message,
    });
  }, [showNotification]);

  /**
   * 显示警告通知
   */
  const showWarning = useCallback((message: string, title: string = '警告') => {
    showNotification({
      type: 'warning',
      title,
      message,
    });
  }, [showNotification]);

  /**
   * 显示信息通知
   */
  const showInfo = useCallback((message: string, title: string = '信息') => {
    showNotification({
      type: 'info',
      title,
      message,
    });
  }, [showNotification]);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

