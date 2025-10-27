/**
 * 通用 API
 * 处理分类、统计、健康检查等通用功能
 */

import { http } from '../http';

/**
 * 通用 API 服务
 */
export const commonApi = {
  /**
   * 获取分类列表
   * @returns 分类列表
   */
  async getCategories(): Promise<string[]> {
    return await http.get<string[]>('/categories');
  },

  /**
   * 获取统计信息
   * @returns 统计数据（总视频数、总用户数、总浏览数等）
   */
  async getStats(): Promise<{
    totalVideos: number;
    totalUsers: number;
    totalViews: number;
  }> {
    return await http.get('/stats');
  },

  /**
   * 健康检查
   * 用于检查 API 服务是否正常运行
   * @returns 健康检查结果
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return await http.get('/health');
  },
};

