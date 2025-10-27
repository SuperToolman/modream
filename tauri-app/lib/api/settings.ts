/**
 * 设置相关 API
 * 处理用户设置、主题、隐私等功能
 */

import { http } from '../http';
import * as DTOs from '@/types/dto';
import { validateUserSettings } from '../validators';

// 类型别名
type UserSettings = DTOs.UserSettings;
type SettingsUpdateRequest = DTOs.SettingsUpdateRequest;

/**
 * 设置 API 服务
 */
export const settingsApi = {
  /**
   * 获取用户设置
   * @returns 用户设置信息
   */
  async getUserSettings(): Promise<UserSettings> {
    const response = await http.get<UserSettings>('/settings');

    // 验证响应数据
    const validation = validateUserSettings(response);
    if (!validation.success || !validation.data) {
      throw new Error(`用户设置响应验证失败: ${validation.error}`);
    }

    return validation.data;
  },

  /**
   * 更新用户设置
   * @param data 设置更新数据
   * @returns 更新后的设置信息
   */
  async updateUserSettings(data: SettingsUpdateRequest): Promise<UserSettings> {
    const response = await http.put<UserSettings>('/settings', data);

    // 验证响应数据
    const validation = validateUserSettings(response);
    if (!validation.success || !validation.data) {
      throw new Error(`用户设置响应验证失败: ${validation.error}`);
    }

    return validation.data;
  },
};

// 导出类型
export type { UserSettings, SettingsUpdateRequest };

