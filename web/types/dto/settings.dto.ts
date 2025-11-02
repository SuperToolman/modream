import { z } from 'zod';

/**
 * 设置 DTO 定义
 * 包含所有用户设置相关的数据传输对象和验证规则
 */

// ==================== 用户设置 ====================

/**
 * 用户设置 DTO
 * 表示用户的各种偏好设置
 */
export const UserSettingsSchema = z.object({
  id: z.string().describe('设置 ID'),
  userId: z.string().describe('用户 ID'),
  theme: z.enum(['light', 'dark', 'auto']).describe('主题'),
  language: z.string().describe('语言'),
  emailNotifications: z.boolean().describe('邮件通知'),
  pushNotifications: z.boolean().describe('推送通知'),
  privacyLevel: z.enum(['public', 'friends', 'private']).describe('隐私级别'),
  showOnlineStatus: z.boolean().describe('显示在线状态'),
  allowComments: z.boolean().describe('允许评论'),
  allowMessages: z.boolean().describe('允许私信'),
  createdAt: z.string().datetime().describe('创建时间'),
  updatedAt: z.string().datetime().describe('更新时间'),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// ==================== 设置更新 ====================

/**
 * 更新用户设置请求 DTO
 */
export const SettingsUpdateRequestSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  privacyLevel: z.enum(['public', 'friends', 'private']).optional(),
  showOnlineStatus: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
}).strict();

export type SettingsUpdateRequest = z.infer<typeof SettingsUpdateRequestSchema>;

// ==================== 主题设置 ====================

/**
 * 主题设置 DTO
 */
export const ThemeSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).describe('主题类型'),
});

export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>;

// ==================== 隐私设置 ====================

/**
 * 隐私设置 DTO
 */
export const PrivacySettingsSchema = z.object({
  privacyLevel: z.enum(['public', 'friends', 'private']).describe('隐私级别'),
  showOnlineStatus: z.boolean().describe('显示在线状态'),
  allowComments: z.boolean().describe('允许评论'),
  allowMessages: z.boolean().describe('允许私信'),
});

export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;

// ==================== 通知设置 ====================

/**
 * 通知设置 DTO
 */
export const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().describe('邮件通知'),
  pushNotifications: z.boolean().describe('推送通知'),
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

// ==================== 语言设置 ====================

/**
 * 语言设置 DTO
 */
export const LanguageSettingsSchema = z.object({
  language: z.string().describe('语言代码'),
});

export type LanguageSettings = z.infer<typeof LanguageSettingsSchema>;

