import { z, ZodType } from 'zod';
import * as DTOs from '@/types/dto';

/**
 * 数据验证工具
 * 用于验证 API 响应数据是否符合 DTO 定义
 */

// ==================== 验证函数 ====================

/**
 * 验证数据是否符合指定的 Schema
 * @param data 要验证的数据
 * @param schema Zod Schema
 * @returns 验证结果
 */
export function validateData<T>(data: unknown, schema: ZodType): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return { success: false, error: message };
    }
    return { success: false, error: '数据验证失败' };
  }
}

/**
 * 安全验证数据（不抛出异常）
 * @param data 要验证的数据
 * @param schema Zod Schema
 * @returns 验证结果
 */
export function safeValidate<T>(data: unknown, schema: ZodType): { success: boolean; data?: T; errors?: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as T };
  }
  return { success: false, errors: result.error.issues };
}

// ==================== 用户验证 ====================

export const validateUser = (data: unknown) => validateData<DTOs.User>(data, DTOs.UserSchema);
export const validateLoginRequest = (data: unknown) => validateData<DTOs.LoginRequest>(data, DTOs.LoginRequestSchema);
export const validateLoginResponse = (data: unknown) => validateData<DTOs.LoginResponse>(data, DTOs.LoginResponseSchema);
export const validateRegisterRequest = (data: unknown) => validateData<DTOs.RegisterRequest>(data, DTOs.RegisterRequestSchema);
export const validateChangePasswordRequest = (data: unknown) => validateData<DTOs.ChangePasswordRequest>(data, DTOs.ChangePasswordRequestSchema);
export const validateChangePasswordResponse = (data: unknown) => validateData<DTOs.ChangePasswordResponse>(data, DTOs.ChangePasswordResponseSchema);
export const validateUpdateUserRequest = (data: unknown) => validateData<DTOs.UpdateUserRequest>(data, DTOs.UpdateUserRequestSchema);
export const validateAvatarUploadResponse = (data: unknown) => validateData<DTOs.AvatarUploadResponse>(data, DTOs.AvatarUploadResponseSchema);

// ==================== 视频验证 ====================

export const validateVideo = (data: unknown) => validateData<DTOs.Video>(data, DTOs.VideoSchema);
export const validateVideoListParams = (data: unknown) => validateData<DTOs.VideoListParams>(data, DTOs.VideoListParamsSchema);
export const validateVideoListResponse = (data: unknown) => validateData<DTOs.VideoListResponse>(data, DTOs.VideoListResponseSchema);
export const validateCreateVideoRequest = (data: unknown) => validateData<DTOs.CreateVideoRequest>(data, DTOs.CreateVideoRequestSchema);
export const validateUpdateVideoRequest = (data: unknown) => validateData<DTOs.UpdateVideoRequest>(data, DTOs.UpdateVideoRequestSchema);
export const validateVideoUploadResponse = (data: unknown) => validateData<DTOs.VideoUploadResponse>(data, DTOs.VideoUploadResponseSchema);
export const validateVideoUploadMetadata = (data: unknown) => validateData<DTOs.VideoUploadMetadata>(data, DTOs.VideoUploadMetadataSchema);
export const validateVideoSearchRequest = (data: unknown) => validateData<DTOs.VideoSearchRequest>(data, DTOs.VideoSearchRequestSchema);

// ==================== 设置验证 ====================

export const validateUserSettings = (data: unknown) => validateData<DTOs.UserSettings>(data, DTOs.UserSettingsSchema);
export const validateSettingsUpdateRequest = (data: unknown) => validateData<DTOs.SettingsUpdateRequest>(data, DTOs.SettingsUpdateRequestSchema);
export const validateThemeSettings = (data: unknown) => validateData<DTOs.ThemeSettings>(data, DTOs.ThemeSettingsSchema);
export const validatePrivacySettings = (data: unknown) => validateData<DTOs.PrivacySettings>(data, DTOs.PrivacySettingsSchema);
export const validateNotificationSettings = (data: unknown) => validateData<DTOs.NotificationSettings>(data, DTOs.NotificationSettingsSchema);
export const validateLanguageSettings = (data: unknown) => validateData<DTOs.LanguageSettings>(data, DTOs.LanguageSettingsSchema);

// ==================== 通用验证 ====================

export const validateApiSuccessResponse = (data: unknown) => validateData<DTOs.ApiSuccessResponse>(data, DTOs.ApiSuccessResponseSchema);
export const validateApiErrorResponse = (data: unknown) => validateData<DTOs.ApiErrorResponse>(data, DTOs.ApiErrorResponseSchema);
export const validatePaginationParams = (data: unknown) => validateData<DTOs.PaginationParams>(data, DTOs.PaginationParamsSchema);
export const validatePaginationResponse = (data: unknown) => validateData<DTOs.PaginationResponse>(data, DTOs.PaginationResponseSchema);
export const validateStats = (data: unknown) => validateData<DTOs.Stats>(data, DTOs.StatsSchema);
export const validateHealthCheckResponse = (data: unknown) => validateData<DTOs.HealthCheckResponse>(data, DTOs.HealthCheckResponseSchema);
export const validateCategoriesResponse = (data: unknown) => validateData<DTOs.CategoriesResponse>(data, DTOs.CategoriesResponseSchema);
export const validateFileUploadResponse = (data: unknown) => validateData<DTOs.FileUploadResponse>(data, DTOs.FileUploadResponseSchema);
export const validateMessageResponse = (data: unknown) => validateData<DTOs.MessageResponse>(data, DTOs.MessageResponseSchema);

