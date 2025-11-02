import { z } from 'zod';

/**
 * 用户 DTO 定义
 * 包含所有用户相关的数据传输对象和验证规则
 */

// ==================== 用户基础信息 ====================

/**
 * 用户信息 DTO
 * 表示系统中的用户对象
 */
export const UserSchema = z.object({
  id: z.string().describe('用户 ID'),
  username: z.string().min(1).describe('用户名'),
  email: z.string().email().describe('邮箱地址'),
  avatar: z.string().url().optional().describe('头像 URL'),
  createdAt: z.string().datetime().describe('创建时间'),
  updatedAt: z.string().datetime().describe('更新时间'),
});

export type User = z.infer<typeof UserSchema>;

// ==================== 认证相关 ====================

/**
 * 登录请求 DTO
 * 支持邮箱或用户名登录
 */
export const LoginRequestSchema = z.object({
  email: z.string().email('邮箱格式不正确').optional(),
  username: z.string().min(1, '用户名不能为空').optional(),
  password: z.string().min(6, '密码至少 6 个字符'),
}).refine(
  (data) => data.email || data.username,
  { message: '邮箱或用户名至少填写一个' }
);

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * 登录响应 DTO（后端实际返回格式）
 * 后端返回的字段名: user_id, name, email, token, expires_in
 */
export const LoginResponseSchema = z.object({
  token: z.string().describe('JWT token'),
  user_id: z.number().describe('用户 ID'),
  name: z.string().describe('用户名'),
  email: z.string().email().describe('邮箱地址'),
  expires_in: z.number().describe('token 过期时间（秒）'),
}).transform((data) => ({
  // 转换为前端期望的格式
  token: data.token,
  expiresIn: data.expires_in,
  user: {
    id: String(data.user_id),
    username: data.name,
    email: data.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}));

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * 注册请求 DTO
 */
export const RegisterRequestSchema = z.object({
  username: z.string().min(3, '用户名至少 3 个字符').max(20, '用户名最多 20 个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 个字符').max(50, '密码最多 50 个字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// ==================== 密码相关 ====================

/**
 * 修改密码请求 DTO
 */
export const ChangePasswordRequestSchema = z.object({
  oldPassword: z.string().min(1, '旧密码不能为空'),
  newPassword: z.string().min(6, '新密码至少 6 个字符'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的新密码不一致',
  path: ['confirmPassword'],
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

/**
 * 修改密码响应 DTO
 */
export const ChangePasswordResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponseSchema>;

// ==================== 用户更新 ====================

/**
 * 更新用户信息请求 DTO
 */
export const UpdateUserRequestSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
}).strict();

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

// ==================== 头像上传 ====================

/**
 * 头像上传响应 DTO
 */
export const AvatarUploadResponseSchema = z.object({
  url: z.string().url().describe('头像 URL'),
});

export type AvatarUploadResponse = z.infer<typeof AvatarUploadResponseSchema>;

