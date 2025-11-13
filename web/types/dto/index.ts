/**
 * DTO 导出文件
 * 集中导出所有 DTO 类型和验证 Schema
 */

// ==================== 用户相关 ====================
export {
  UserSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RegisterRequestSchema,
  ChangePasswordRequestSchema,
  ChangePasswordResponseSchema,
  UpdateUserRequestSchema,
  AvatarUploadResponseSchema,
  type User,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type ChangePasswordRequest,
  type ChangePasswordResponse,
  type UpdateUserRequest,
  type AvatarUploadResponse,
} from './user.dto';

// ==================== 视频相关 ====================
export {
  VideoSchema,
  VideoListParamsSchema,
  VideoListResponseSchema,
  CreateVideoRequestSchema,
  UpdateVideoRequestSchema,
  VideoUploadResponseSchema,
  VideoUploadMetadataSchema,
  VideoSearchRequestSchema,
  PopularVideosParamsSchema,
  LatestVideosParamsSchema,
  type Video,
  type VideoListParams,
  type VideoListResponse,
  type CreateVideoRequest,
  type UpdateVideoRequest,
  type VideoUploadResponse,
  type VideoUploadMetadata,
  type VideoSearchRequest,
  type PopularVideosParams,
  type LatestVideosParams,
} from './video.dto';

// ==================== 设置相关 ====================
export {
  UserSettingsSchema,
  SettingsUpdateRequestSchema,
  ThemeSettingsSchema,
  PrivacySettingsSchema,
  NotificationSettingsSchema,
  LanguageSettingsSchema,
  type UserSettings,
  type SettingsUpdateRequest,
  type ThemeSettings,
  type PrivacySettings,
  type NotificationSettings,
  type LanguageSettings,
} from './settings.dto';

// ==================== 媒体库相关 ====================
export {
  LibraryTypeEnum,
  LibrarySourceEnum,
  MediaLibrarySchema,
  MediaLibraryListResponseSchema,
  CreateLocalLibraryRequestSchema,
  CreateWebDAVLibraryRequestSchema,
  UpdateMediaLibraryRequestSchema,
  type LibraryType,
  type LibrarySource,
  type MediaLibrary,
  type MediaLibraryListResponse,
  type CreateLocalLibraryRequest,
  type CreateWebDAVLibraryRequest,
  type UpdateMediaLibraryRequest,
} from './media_library.dto';

// ==================== 游戏相关 ====================
export {
  GameInfoSchema,
  GamePaginationRequestSchema,
  GamePaginationResponseSchema,
  CreateGameRequestSchema,
  ScanGamesRequestSchema,
  LaunchGameRequestSchema,
  UpdateDefaultStartPathRequestSchema,
  validateGameInfo,
  validateGamePaginationResponse,
  validateCreateGameRequest,
  validateScanGamesRequest,
  type GameInfo,
  type GamePaginationRequest,
  type GamePaginationResponse,
  type CreateGameRequest,
  type ScanGamesRequest,
  type LaunchGameRequest,
  type UpdateDefaultStartPathRequest,
} from './game.dto';

// ==================== 扫描任务相关 ====================
export {
  ScanTaskStatusEnum,
  ScanTaskInfoSchema,
  type ScanTaskStatus,
  type ScanTaskInfo,
} from './scan_task.dto';

// ==================== 通用相关 ====================
export {
  ApiSuccessResponseSchema,
  ApiErrorResponseSchema,
  PaginationParamsSchema,
  PaginationResponseSchema,
  SortParamsSchema,
  StatsSchema,
  HealthCheckResponseSchema,
  CategoriesResponseSchema,
  FileUploadResponseSchema,
  MessageResponseSchema,
  type ApiSuccessResponse,
  type ApiErrorResponse,
  type PaginationParams,
  type PaginationResponse,
  type SortParams,
  type Stats,
  type HealthCheckResponse,
  type CategoriesResponse,
  type FileUploadResponse,
  type MessageResponse,
} from './common.dto';

