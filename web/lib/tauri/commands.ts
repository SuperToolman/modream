/**
 * 检查是否在 Tauri 环境中运行
 */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Tauri 命令封装
 */
export const tauriCommands = {
  /**
   * 启动游戏
   * @param gamePath 游戏完整路径
   * @returns 启动结果消息
   */
  async launchGame(gamePath: string): Promise<string> {
    if (!isTauri()) {
      console.warn('Not running in Tauri environment, skipping game launch');
      return 'Game launch is only available in Tauri desktop app';
    }

    // 动态导入 Tauri API
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<string>('launch_game', { gamePath });
  },
};

