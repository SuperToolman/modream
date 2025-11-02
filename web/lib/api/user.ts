/**
 * 用户相关 API
 * 处理用户信息、头像上传、密码修改等功能
 */

import { http } from '../http';
import * as DTOs from '@/types/dto';
import {
  validateAvatarUploadResponse,
  validateChangePasswordResponse,
} from '../validators';

// 类型别名
type User = DTOs.User;
type ChangePasswordRequest = DTOs.ChangePasswordRequest;
type ChangePasswordResponse = DTOs.ChangePasswordResponse;
type AvatarUploadResponse = DTOs.AvatarUploadResponse;

/**
 * 用户 API 服务
 */
export const userApi = {
  /**
   * 更新用户信息
   * @param data 用户信息更新数据
   * @returns 更新后的用户信息
   */
  async updateUser(data: Partial<User>): Promise<User> {
    return await http.put<User>('/users/profile', data);
  },

  /**
   * 上传用户头像
   * @param file 头像文件
   * @returns 上传响应（包含头像 URL）
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const response = await http.upload<AvatarUploadResponse>('/users/avatar', file);

    // 验证响应数据
    const validation = validateAvatarUploadResponse(response);
    if (!validation.success || !validation.data) {
      throw new Error(`头像上传响应验证失败: ${validation.error}`);
    }

    return validation.data;
  },

  /**
   * 修改用户密码
   * @param data 密码修改请求数据
   * @returns 修改响应
   */
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await http.post<ChangePasswordResponse>('/users/change-password', data);

    // 验证响应数据
    const validation = validateChangePasswordResponse(response);
    if (!validation.success || !validation.data) {
      throw new Error(`修改密码响应验证失败: ${validation.error}`);
    }

    return validation.data;
  },
};

// 导出类型
export type { User, ChangePasswordRequest, ChangePasswordResponse, AvatarUploadResponse };

