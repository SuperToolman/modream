/**
 * 媒体库相关 API
 * 处理媒体库的获取、创建、更新、删除等功能
 */

import { http } from '../http';
import * as DTOs from '@/types/dto';

// 类型别名
type MediaLibrary = DTOs.MediaLibrary;
type MediaLibraryListResponse = DTOs.MediaLibraryListResponse;
type CreateLocalLibraryRequest = DTOs.CreateLocalLibraryRequest;
type CreateWebDAVLibraryRequest = DTOs.CreateWebDAVLibraryRequest;
type UpdateMediaLibraryRequest = DTOs.UpdateMediaLibraryRequest;
type ScanTaskInfo = DTOs.ScanTaskInfo;

/**
 * 媒体库 API 服务
 */
export const media_librariesApi = {
  /**
   * 获取所有媒体库
   * @returns 媒体库列表响应
   */
  async getAll(): Promise<MediaLibraryListResponse> {
    return await http.get<MediaLibraryListResponse>('/media_libraries');
  },

  /**
   * 获取媒体库详情
   * @param id 媒体库 ID
   * @returns 媒体库详情
   */
  async getById(id: string): Promise<MediaLibrary> {
    return await http.get<MediaLibrary>(`/media_libraries/${id}`);
  },

  /**
   * 创建本地媒体库
   * @param data 本地媒体库创建数据
   * @returns 创建的媒体库信息
   */
  async createLocalLibrary(data: CreateLocalLibraryRequest): Promise<MediaLibrary> {
    return await http.post<MediaLibrary>('/media_libraries/local', data);
  },

  /**
   * 创建 WebDAV 媒体库
   * @param data WebDAV 媒体库创建数据
   * @returns 创建的媒体库信息
   */
  async createWebDAVLibrary(data: CreateWebDAVLibraryRequest): Promise<MediaLibrary> {
    return await http.post<MediaLibrary>('/media_libraries/webdav', data);
  },

  /**
   * 更新媒体库
   * @param id 媒体库 ID
   * @param data 更新数据
   * @returns 更新后的媒体库信息
   */
  async update(id: string, data: UpdateMediaLibraryRequest): Promise<MediaLibrary> {
    return await http.put<MediaLibrary>(`/media_libraries/${id}`, data);
  },

  /**
   * 删除媒体库
   * @param id 媒体库 ID
   */
  async delete(id: string): Promise<void> {
    await http.delete(`/media_libraries/${id}`);
  },

  /**
   * 扫描媒体库
   * @param id 媒体库 ID
   * @returns 扫描结果
   */
  async scan(id: string): Promise<{ scannedCount: number; addedCount: number }> {
    return await http.post(`/media_libraries/${id}/scan`, {});
  },

  /**
   * 获取扫描任务状态
   * @param id 媒体库 ID
   * @returns 扫描任务信息
   */
  async getScanStatus(id: string | number): Promise<ScanTaskInfo> {
    return await http.get<ScanTaskInfo>(`/media_libraries/${id}/scan-status`);
  },

  /**
   * 取消扫描任务
   * @param id 媒体库 ID
   */
  async cancelScan(id: string | number): Promise<void> {
    await http.post(`/media_libraries/${id}/scan-cancel`, {});
  },
};

// 导出类型
export type {
  MediaLibrary,
  MediaLibraryListResponse,
  CreateLocalLibraryRequest,
  CreateWebDAVLibraryRequest,
  UpdateMediaLibraryRequest,
  ScanTaskInfo,
};