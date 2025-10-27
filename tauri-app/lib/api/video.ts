/**
 * 视频相关 API
 * 处理视频列表、搜索、上传、删除等功能
 */

import { http } from '../http';
import * as DTOs from '@/types/dto';
import {
  validateVideoListResponse,
  validateVideoUploadResponse,
} from '../validators';

// 类型别名
type Video = DTOs.Video;
type VideoListParams = DTOs.VideoListParams;
type VideoListResponse = DTOs.VideoListResponse;
type VideoUploadResponse = DTOs.VideoUploadResponse;

/**
 * 视频 API 服务
 */
export const videoApi = {
  /**
   * 获取视频列表
   * @param params 查询参数（分页、排序等）
   * @returns 视频列表响应
   */
  async getVideoList(params?: VideoListParams): Promise<VideoListResponse> {
    const response = await http.get<VideoListResponse>('/videos', { params });

    // 验证响应数据
    const validation = validateVideoListResponse(response);
    if (!validation.success || !validation.data) {
      throw new Error(`视频列表响应验证失败: ${validation.error}`);
    }

    return validation.data;
  },

  /**
   * 获取视频详情
   * @param id 视频 ID
   * @returns 视频详情
   */
  async getVideoDetail(id: string): Promise<Video> {
    return await http.get<Video>(`/videos/${id}`);
  },

  /**
   * 搜索视频
   * @param keyword 搜索关键词
   * @param params 其他查询参数
   * @returns 搜索结果
   */
  async searchVideos(
    keyword: string,
    params?: Omit<VideoListParams, 'keyword'>
  ): Promise<VideoListResponse> {
    return await http.get<VideoListResponse>('/videos/search', {
      params: { keyword, ...params },
    });
  },

  /**
   * 获取热门视频
   * @param limit 获取数量
   * @returns 热门视频列表
   */
  async getPopularVideos(limit: number = 10): Promise<Video[]> {
    return await http.get<Video[]>('/videos/popular', { params: { limit } });
  },

  /**
   * 获取最新视频
   * @param limit 获取数量
   * @returns 最新视频列表
   */
  async getLatestVideos(limit: number = 10): Promise<Video[]> {
    return await http.get<Video[]>('/videos/latest', { params: { limit } });
  },

  /**
   * 按分类获取视频
   * @param category 分类名称
   * @param params 查询参数
   * @returns 分类视频列表
   */
  async getVideosByCategory(
    category: string,
    params?: VideoListParams
  ): Promise<VideoListResponse> {
    return await http.get<VideoListResponse>(`/videos/category/${category}`, { params });
  },

  /**
   * 上传视频
   * @param file 视频文件
   * @param metadata 视频元数据
   * @returns 上传后的视频信息
   */
  async uploadVideo(file: File, metadata: Partial<Video>): Promise<Video> {
    // 先上传文件
    const uploadResult = await http.upload<VideoUploadResponse>('/videos/upload', file);

    // 验证上传响应
    const uploadValidation = validateVideoUploadResponse(uploadResult);
    if (!uploadValidation.success || !uploadValidation.data) {
      throw new Error(`视频上传响应验证失败: ${uploadValidation.error}`);
    }

    // 然后创建视频记录
    const response = await http.post<Video>('/videos', {
      ...metadata,
      url: uploadValidation.data.url,
    });

    return response;
  },

  /**
   * 更新视频信息
   * @param id 视频 ID
   * @param data 更新数据
   * @returns 更新后的视频信息
   */
  async updateVideo(id: string, data: Partial<Video>): Promise<Video> {
    return await http.put<Video>(`/videos/${id}`, data);
  },

  /**
   * 删除视频
   * @param id 视频 ID
   */
  async deleteVideo(id: string): Promise<void> {
    await http.delete(`/videos/${id}`);
  },
};

// 导出类型
export type { Video, VideoListParams, VideoListResponse, VideoUploadResponse };

