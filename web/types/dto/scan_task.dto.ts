import { z } from 'zod';

// ==================== 扫描任务状态 ====================

/**
 * 扫描任务状态枚举
 */
export const ScanTaskStatusEnum = z.enum([
  'pending',
  'scanning',
  'completed',
  'failed',
  'cancelled',
]);

export type ScanTaskStatus = z.infer<typeof ScanTaskStatusEnum>;

// ==================== 扫描任务信息 ====================

/**
 * 扫描任务信息 DTO
 */
export const ScanTaskInfoSchema = z.object({
  task_id: z.string().describe('任务 ID'),
  title: z.string().describe('任务标题'),
  media_type: z.string().describe('媒体类型'),
  status: ScanTaskStatusEnum.describe('任务状态'),
  total_files: z.number().int().nonnegative().describe('总文件数'),
  processed_files: z.number().int().nonnegative().describe('已处理文件数'),
  success_count: z.number().int().nonnegative().describe('成功数量'),
  failed_count: z.number().int().nonnegative().describe('失败数量'),
  current_file: z.string().optional().nullable().describe('当前处理的文件'),
  error_message: z.string().optional().nullable().describe('错误信息'),
  created_at: z.string().describe('创建时间'),
  updated_at: z.string().describe('更新时间'),
  completed_at: z.string().optional().nullable().describe('完成时间'),
});

export type ScanTaskInfo = z.infer<typeof ScanTaskInfoSchema>;

