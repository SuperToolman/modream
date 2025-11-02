import * as DTOs from '@/types/dto';

/**
 * 数据转换工具
 * 用于在 API 响应和应用内部数据之间进行转换
 */

// ==================== 用户转换 ====================

/**
 * 将用户 DTO 转换为显示格式
 */
export function transformUserForDisplay(user: DTOs.User): DTOs.User & { displayName: string } {
  return {
    ...user,
    displayName: user.username,
  };
}

/**
 * 将用户列表转换为显示格式
 */
export function transformUsersForDisplay(users: DTOs.User[]): (DTOs.User & { displayName: string })[] {
  return users.map(transformUserForDisplay);
}

// ==================== 视频转换 ====================

/**
 * 将视频 DTO 转换为显示格式
 */
export function transformVideoForDisplay(video: DTOs.Video): DTOs.Video & {
  displayDuration: string;
  displayViews: string;
  displayUploadTime: string;
} {
  return {
    ...video,
    displayDuration: formatDuration(video.duration),
    displayViews: formatViews(video.views),
    displayUploadTime: formatTime(video.uploadTime),
  };
}

/**
 * 将视频列表转换为显示格式
 */
export function transformVideosForDisplay(videos: DTOs.Video[]): (DTOs.Video & {
  displayDuration: string;
  displayViews: string;
  displayUploadTime: string;
})[] {
  return videos.map(transformVideoForDisplay);
}

/**
 * 将视频列表响应转换为显示格式
 */
export function transformVideoListResponseForDisplay(response: DTOs.VideoListResponse): DTOs.VideoListResponse & {
  videos: (DTOs.Video & {
    displayDuration: string;
    displayViews: string;
    displayUploadTime: string;
  })[];
} {
  return {
    ...response,
    videos: transformVideosForDisplay(response.videos),
  };
}

// ==================== 设置转换 ====================

/**
 * 将设置 DTO 转换为表单格式
 */
export function transformSettingsForForm(settings: DTOs.UserSettings): Partial<DTOs.SettingsUpdateRequest> {
  return {
    theme: settings.theme,
    language: settings.language,
    emailNotifications: settings.emailNotifications,
    pushNotifications: settings.pushNotifications,
    privacyLevel: settings.privacyLevel,
    showOnlineStatus: settings.showOnlineStatus,
    allowComments: settings.allowComments,
    allowMessages: settings.allowMessages,
  };
}

// ==================== 格式化工具 ====================

/**
 * 格式化时长
 * @param duration 时长字符串（如 "3600" 秒或 "01:00:00" 格式）
 */
export function formatDuration(duration: string): string {
  // 如果已经是格式化的时间，直接返回
  if (duration.includes(':')) {
    return duration;
  }

  // 假设是秒数
  const seconds = parseInt(duration, 10);
  if (isNaN(seconds)) return duration;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * 格式化观看次数
 * @param views 观看次数字符串
 */
export function formatViews(views: string): string {
  const num = parseInt(views, 10);
  if (isNaN(num)) return views;

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * 格式化时间
 * @param time ISO 时间字符串
 */
export function formatTime(time: string): string {
  try {
    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-CN');
  } catch {
    return time;
  }
}

/**
 * 格式化日期
 * @param date ISO 日期字符串
 */
export function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString('zh-CN');
  } catch {
    return date;
  }
}

/**
 * 格式化日期时间
 * @param datetime ISO 日期时间字符串
 */
export function formatDateTime(datetime: string): string {
  try {
    return new Date(datetime).toLocaleString('zh-CN');
  } catch {
    return datetime;
  }
}

// ==================== 数据聚合 ====================

/**
 * 聚合多个视频列表
 */
export function aggregateVideoLists(...lists: DTOs.VideoListResponse[]): DTOs.VideoListResponse {
  const allVideos = lists.flatMap(list => list.videos);
  const total = lists.reduce((sum, list) => sum + list.total, 0);

  return {
    videos: allVideos,
    total,
    page: 1,
    pageSize: allVideos.length,
    totalPages: 1,
  };
}

/**
 * 去重视频列表
 */
export function deduplicateVideos(videos: DTOs.Video[]): DTOs.Video[] {
  const seen = new Set<string>();
  return videos.filter(video => {
    if (seen.has(video.id)) {
      return false;
    }
    seen.add(video.id);
    return true;
  });
}

