use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 照片信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct PhotoInfo {
    /// 照片 ID
    #[schema(example = 1)]
    pub id: i32,

    /// 创建时间
    #[schema(example = "2025-11-11 17:50:54")]
    pub create_time: String,

    /// 更新时间
    #[schema(example = "2025-11-11 17:50:54")]
    pub update_time: String,

    /// 照片文件路径
    #[schema(example = "G:\\Photos\\IMG_001.jpg")]
    pub path: String,

    /// 文件大小（字节）
    #[schema(example = 5242880i64)]
    pub byte_size: i64,

    /// 格式化后的文件大小（如 "5.0 MB"）
    #[schema(example = "5.0 MB")]
    pub formatted_size: String,

    /// 分辨率字符串（如 "1920x1080"）
    #[schema(example = "1920x1080")]
    pub resolution: Option<String>,

    /// 文件扩展名
    #[schema(example = "jpg")]
    pub extension: Option<String>,

    /// 图片宽度（像素）
    #[schema(example = 1920)]
    pub width: Option<i32>,

    /// 图片高度（像素）
    #[schema(example = 1080)]
    pub height: Option<i32>,

    /// 缩略图路径
    #[schema(example = "/thumbnails/IMG_001_thumb.jpg")]
    pub thumbnail_path: Option<String>,

    /// 文件哈希值（SHA256）
    #[schema(example = "a1b2c3d4e5f6...")]
    pub hash: Option<String>,

    /// 是否已删除
    #[schema(example = false)]
    pub is_deleted: bool,

    /// 是否收藏
    #[schema(example = true)]
    pub is_favorite: bool,

    /// 标签列表
    #[schema(example = json!(["风景", "旅行", "2024"]))]
    pub tags: Option<Vec<String>>,

    /// 所属媒体库 ID
    #[schema(example = 1)]
    pub media_library_id: i32,
}

/// 照片详细信息 DTO（包含 EXIF 信息）
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct PhotoDetailInfo {
    /// 基本照片信息
    #[serde(flatten)]
    pub photo: PhotoInfo,

    /// EXIF 信息（可选）
    pub exif: Option<PhotoExifInfo>,
}

/// 照片 EXIF 信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct PhotoExifInfo {
    /// 相机品牌
    #[schema(example = "Canon")]
    pub camera_make: Option<String>,

    /// 相机型号
    #[schema(example = "Canon EOS 5D Mark IV")]
    pub camera_model: Option<String>,

    /// 拍摄软件
    #[schema(example = "Adobe Lightroom")]
    pub software: Option<String>,

    /// 光圈值
    #[schema(example = 2.8)]
    pub f_number: Option<f32>,

    /// 曝光时间
    #[schema(example = "1/125")]
    pub exposure_time: Option<String>,

    /// ISO 感光度
    #[schema(example = 400)]
    pub iso_speed: Option<i32>,

    /// 焦距（mm）
    #[schema(example = 50.0)]
    pub focal_length: Option<f32>,

    /// 35mm 等效焦距
    #[schema(example = 50.0)]
    pub focal_length_in_35mm: Option<f32>,

    /// 曝光程序
    #[schema(example = "光圈优先")]
    pub exposure_program: Option<String>,

    /// 曝光模式
    #[schema(example = "自动")]
    pub exposure_mode: Option<String>,

    /// 测光模式
    #[schema(example = "中央重点平均测光")]
    pub metering_mode: Option<String>,

    /// 白平衡
    #[schema(example = "自动")]
    pub white_balance: Option<String>,

    /// 闪光灯状态
    #[schema(example = "自动，未闪光")]
    pub flash: Option<String>,

    /// 场景捕捉类型
    #[schema(example = "标准")]
    pub scene_capture_type: Option<String>,

    /// 原始拍摄时间
    #[schema(example = "2024-11-11 14:30:00")]
    pub date_time_original: Option<String>,

    /// GPS 纬度
    #[schema(example = 39.9042)]
    pub gps_latitude: Option<f64>,

    /// GPS 经度
    #[schema(example = 116.4074)]
    pub gps_longitude: Option<f64>,

    /// GPS 海拔
    #[schema(example = 50.0)]
    pub gps_altitude: Option<f64>,

    /// 图像宽度
    #[schema(example = 1920)]
    pub image_width: Option<i32>,

    /// 图像高度
    #[schema(example = 1080)]
    pub image_height: Option<i32>,

    /// 图像方向
    #[schema(example = 1)]
    pub orientation: Option<i32>,

    /// 色彩空间
    #[schema(example = "sRGB")]
    pub color_space: Option<String>,

    /// 分辨率单位
    #[schema(example = "英寸")]
    pub resolution_unit: Option<String>,

    /// 水平分辨率
    #[schema(example = 72)]
    pub x_resolution: Option<i32>,

    /// 垂直分辨率
    #[schema(example = 72)]
    pub y_resolution: Option<i32>,

    /// 是否包含 GPS 信息
    #[schema(example = true)]
    pub has_gps: bool,

    /// 是否包含缩略图
    #[schema(example = true)]
    pub has_thumbnail: bool,
}

/// 照片相册信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct PhotoAlbumInfo {
    /// 相册 ID
    #[schema(example = 1)]
    pub id: i32,

    /// 相册名称
    #[schema(example = "2024 旅行")]
    pub name: String,

    /// 相册描述
    #[schema(example = "2024年的旅行照片")]
    pub description: Option<String>,

    /// 封面照片 ID
    #[schema(example = 10)]
    pub cover_photo_id: Option<i32>,

    /// 排序顺序
    #[schema(example = 0)]
    pub sort_order: i32,

    /// 是否系统相册
    #[schema(example = false)]
    pub is_system_album: bool,

    /// 是否私密相册
    #[schema(example = false)]
    pub is_private: bool,

    /// 创建时间
    #[schema(example = "2024-01-01 00:00:00")]
    pub created_time: String,

    /// 更新时间
    #[schema(example = "2024-11-11 17:50:54")]
    pub updated_time: String,

    /// 照片数量
    #[schema(example = 42)]
    pub photo_count: Option<i32>,
}

/// 照片扫描选项 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct PhotoScanOptions {
    /// 缩略图最大尺寸
    #[schema(example = 300)]
    #[serde(default = "default_thumbnail_size")]
    pub thumbnail_size: u32,

    /// 是否生成缩略图
    #[schema(example = true)]
    #[serde(default = "default_true")]
    pub generate_thumbnail: bool,

    /// 是否计算文件哈希
    #[schema(example = true)]
    #[serde(default = "default_true")]
    pub calculate_hash: bool,

    /// 是否提取 EXIF 信息
    #[schema(example = true)]
    #[serde(default = "default_true")]
    pub extract_exif: bool,
}

fn default_thumbnail_size() -> u32 {
    300
}

fn default_true() -> bool {
    true
}

/// 照片扫描结果 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct PhotoScanResult {
    /// 扫描的照片总数
    pub total: usize,

    /// 成功导入的照片数
    pub imported: usize,

    /// 跳过的照片数（已存在）
    pub skipped: usize,

    /// 失败的照片数
    pub failed: usize,
}

// ==================== From 实现 ====================

/// 从 Domain 层的 Photo Model 转换为 PhotoInfo DTO
impl From<domain::entity::photo::Model> for PhotoInfo {
    fn from(model: domain::entity::photo::Model) -> Self {
        // 解析标签
        let tags = model.tags.and_then(|t| {
            t.split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect::<Vec<_>>()
                .into()
        });

        // 格式化文件大小
        let formatted_size = format_byte_size(model.byte_size);

        PhotoInfo {
            id: model.id,
            create_time: model.create_time,
            update_time: model.update_time,
            path: model.path,
            byte_size: model.byte_size,
            formatted_size,
            resolution: model.resolution,
            extension: model.extension,
            width: model.width,
            height: model.height,
            thumbnail_path: model.thumbnail_path,
            hash: model.hash,
            is_deleted: model.is_deleted,
            is_favorite: model.is_favorite,
            tags,
            media_library_id: model.media_library_id,
        }
    }
}

/// 从 Domain 层的 PhotoExif Model 转换为 PhotoExifInfo DTO
impl From<domain::entity::photo_exif::Model> for PhotoExifInfo {
    fn from(model: domain::entity::photo_exif::Model) -> Self {
        PhotoExifInfo {
            camera_make: model.camera_make,
            camera_model: model.camera_model,
            software: model.software,
            f_number: model.f_number,
            exposure_time: model.exposure_time,
            iso_speed: model.iso_speed,
            focal_length: model.focal_length,
            focal_length_in_35mm: model.focal_length_in_35mm,
            exposure_program: model.exposure_program,
            exposure_mode: model.exposure_mode,
            metering_mode: model.metering_mode,
            white_balance: model.white_balance,
            flash: model.flash,
            scene_capture_type: model.scene_capture_type,
            date_time_original: model.date_time_original,
            gps_latitude: model.gps_latitude,
            gps_longitude: model.gps_longitude,
            gps_altitude: model.gps_altitude,
            image_width: model.image_width,
            image_height: model.image_height,
            orientation: model.orientation,
            color_space: model.color_space,
            resolution_unit: model.resolution_unit,
            x_resolution: model.x_resolution,
            y_resolution: model.y_resolution,
            has_gps: model.has_gps,
            has_thumbnail: model.has_thumbnail,
        }
    }
}

/// 从 Domain 层的 PhotoAlbum Model 转换为 PhotoAlbumInfo DTO
impl From<domain::entity::photo_album::Model> for PhotoAlbumInfo {
    fn from(model: domain::entity::photo_album::Model) -> Self {
        PhotoAlbumInfo {
            id: model.id,
            name: model.name,
            description: model.description,
            cover_photo_id: model.cover_photo_id,
            sort_order: model.sort_order,
            is_system_album: model.is_system_album,
            is_private: model.is_private,
            created_time: model.created_time,
            updated_time: model.updated_time,
            photo_count: None, // 需要单独查询
        }
    }
}

/// 格式化字节大小为人类可读格式
fn format_byte_size(bytes: i64) -> String {
    const KB: i64 = 1024;
    const MB: i64 = KB * 1024;
    const GB: i64 = MB * 1024;
    const TB: i64 = GB * 1024;

    if bytes >= TB {
        format!("{:.1} TB", bytes as f64 / TB as f64)
    } else if bytes >= GB {
        format!("{:.1} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.1} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.1} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

