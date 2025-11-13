/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param dateStr - 日期字符串
 * @returns 格式化后的日期字符串 (YYYY/MM/DD HH:mm)
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '未知';
  
  try {
    const date = new Date(dateStr);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '未知';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Failed to format date:', error);
    return '未知';
  }
};

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  // 如果是字节，不显示小数
  if (unitIndex === 0) {
    return `${size} ${units[unitIndex]}`;
  }
  
  // 其他单位显示 2 位小数
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * 格式化数字（添加千分位分隔符）
 * @param num - 数字
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

/**
 * 格式化时长（秒转换为 HH:mm:ss）
 * @param seconds - 秒数
 * @returns 格式化后的时长字符串
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

