import { invoke } from '@tauri-apps/api/core';

// 窗口控制API
export const windowControls = {
  // 最小化窗口
  minimize: async () => {
    try {
      console.log('Attempting to minimize window...');
      await invoke('minimize_window');
      console.log('Window minimized successfully');
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  },

  // 最大化窗口
  maximize: async () => {
    try {
      await invoke('maximize_window');
    } catch (error) {
      console.error('Failed to maximize window:', error);
    }
  },

  // 取消最大化窗口
  unmaximize: async () => {
    try {
      await invoke('unmaximize_window');
    } catch (error) {
      console.error('Failed to unmaximize window:', error);
    }
  },

  // 关闭窗口
  close: async () => {
    try {
      await invoke('close_window');
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  },

  // 检查窗口是否最大化
  isMaximized: async (): Promise<boolean> => {
    try {
      return await invoke('is_maximized');
    } catch (error) {
      console.error('Failed to check if window is maximized:', error);
      return false;
    }
  },

  // 切换最大化状态
  toggleMaximize: async () => {
    try {
      const isMaximized = await windowControls.isMaximized();
      if (isMaximized) {
        await windowControls.unmaximize();
      } else {
        await windowControls.maximize();
      }
    } catch (error) {
      console.error('Failed to toggle maximize:', error);
    }
  }
};

// 检查是否在Tauri环境中运行
export const isTauri = () => {
  if (typeof window === 'undefined') return false;

  // 检查多种可能的Tauri标识
  return (
    '__TAURI__' in window ||
    '__TAURI_INTERNALS__' in window ||
    'isTauri' in window ||
    navigator.userAgent.includes('Tauri')
  );
};
