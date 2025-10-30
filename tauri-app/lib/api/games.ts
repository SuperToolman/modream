/**
 * 游戏 API 服务
 */

import { http } from '@/lib/http';
import type {
  GameInfo,
  GamePaginationRequest,
  GamePaginationResponse,
  CreateGameRequest,
  ScanGamesRequest,
} from '@/types/dto';
import {
  validateGameInfo,
  validateGamePaginationResponse,
} from '@/types/dto';

export const gamesApi = {
  /**
   * 获取游戏分页列表
   * @param params 分页参数
   * @returns 游戏分页响应
   */
  async getPaginated(params: GamePaginationRequest = {}): Promise<GamePaginationResponse> {
    const pageIndex = params.page_index || 1;
    const pageSize = params.page_size || 20;
    
    const response = await http.get<GamePaginationResponse>(
      `/games?page_index=${pageIndex}&page_size=${pageSize}`
    );

    // 验证响应数据
    const validation = validateGamePaginationResponse(response);
    if (!validation.success || !validation.data) {
      throw new Error(`游戏列表响应验证失败: ${validation.error}`);
    }

    return validation.data;
  },

  /**
   * 获取单个游戏详情
   * @param id 游戏 ID
   * @returns 游戏详情
   */
  async getById(id: number): Promise<GameInfo> {
    const response = await http.get<GameInfo>(`/games/${id}`);

    // 验证响应数据
    const validation = validateGameInfo(response);
    if (!validation.success || !validation.data) {
      throw new Error(`游戏详情响应验证失败: ${validation.error}`);
    }

    return validation.data;
  },

  /**
   * 根据媒体库 ID 获取游戏列表
   * @param mediaLibraryId 媒体库 ID
   * @returns 游戏列表
   */
  async getByMediaLibraryId(mediaLibraryId: number): Promise<GameInfo[]> {
    return await http.get<GameInfo[]>(`/media-libraries/${mediaLibraryId}/games`);
  },

  /**
   * 创建游戏
   * @param data 创建游戏请求数据
   * @returns 创建的游戏信息
   */
  async create(data: CreateGameRequest): Promise<GameInfo> {
    return await http.post<GameInfo>('/games', data);
  },

  /**
   * 删除游戏
   * @param id 游戏 ID
   */
  async delete(id: number): Promise<void> {
    await http.delete(`/games/${id}`);
  },

  /**
   * 扫描游戏文件夹
   * @param data 扫描请求数据
   * @returns 扫描到的游戏列表
   */
  async scan(data: ScanGamesRequest): Promise<GameInfo[]> {
    return await http.post<GameInfo[]>('/games/scan', data);
  },

  /**
   * 启动游戏
   * @param id 游戏 ID
   * @param startPath 启动路径（可选）
   * @returns 启动路径
   */
  async launch(id: number, startPath?: string): Promise<string> {
    return await http.post<string>(`/games/${id}/launch`, {
      start_path: startPath,
    });
  },

  /**
   * 更新默认启动路径
   * @param id 游戏 ID
   * @param startPath 默认启动路径
   * @returns 更新后的游戏信息
   */
  async updateDefaultStartPath(id: number, startPath: string): Promise<GameInfo> {
    return await http.put<GameInfo>(`/games/${id}/default-start-path`, {
      start_path_default: startPath,
    });
  },
};

