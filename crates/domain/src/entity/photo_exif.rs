//! PhotoExif Entity - 照片 EXIF 信息实体

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "PhotoExif")]
pub struct Model {
    /// 主键 ID
    #[sea_orm(column_name = "Id", primary_key)]
    pub id: i32,
    
    /// 关联的照片 ID
    #[sea_orm(column_name = "PhotoId", unique)]
    pub photo_id: i32,
    
    // ========== 设备信息 ==========
    
    /// 相机品牌（如：vivo）
    #[sea_orm(column_name = "CameraMake", column_type = "Text", nullable)]
    pub camera_make: Option<String>,
    
    /// 相机型号（如：vivo Y66）
    #[sea_orm(column_name = "CameraModel", column_type = "Text", nullable)]
    pub camera_model: Option<String>,
    
    /// 拍摄软件或固件版本
    #[sea_orm(column_name = "Software", column_type = "Text", nullable)]
    pub software: Option<String>,
    
    // ========== 拍摄参数 ==========
    
    /// 光圈值（如：2.2）
    #[sea_orm(column_name = "FNumber", nullable)]
    pub f_number: Option<f32>,
    
    /// 曝光时间（如：1/10）
    #[sea_orm(column_name = "ExposureTime", column_type = "Text", nullable)]
    pub exposure_time: Option<String>,
    
    /// ISO 感光度（如：429）
    #[sea_orm(column_name = "ISOSpeed", nullable)]
    pub iso_speed: Option<i32>,
    
    /// 焦距（单位：mm，如：3.0）
    #[sea_orm(column_name = "FocalLength", nullable)]
    pub focal_length: Option<f32>,
    
    /// 35mm 等效焦距（单位：mm，如：3.0）
    #[sea_orm(column_name = "FocalLengthIn35mm", nullable)]
    pub focal_length_in_35mm: Option<f32>,
    
    /// 曝光程序（如：手动模式、光圈优先）
    #[sea_orm(column_name = "ExposureProgram", column_type = "Text", nullable)]
    pub exposure_program: Option<String>,
    
    /// 曝光模式（如：自动、手动）
    #[sea_orm(column_name = "ExposureMode", column_type = "Text", nullable)]
    pub exposure_mode: Option<String>,
    
    /// 测光模式（如：中央重点平均测光）
    #[sea_orm(column_name = "MeteringMode", column_type = "Text", nullable)]
    pub metering_mode: Option<String>,
    
    /// 白平衡（如：自动、日光）
    #[sea_orm(column_name = "WhiteBalance", column_type = "Text", nullable)]
    pub white_balance: Option<String>,
    
    /// 闪光灯状态（如：自动，未闪光）
    #[sea_orm(column_name = "Flash", column_type = "Text", nullable)]
    pub flash: Option<String>,
    
    /// 场景捕捉类型（如：标准、风景、人像）
    #[sea_orm(column_name = "SceneCaptureType", column_type = "Text", nullable)]
    pub scene_capture_type: Option<String>,
    
    // ========== 时间地点信息 ==========
    
    /// 原始拍摄时间（如：2019-11-09 22:22:37）
    #[sea_orm(column_name = "DateTimeOriginal", column_type = "custom(\"DATETIME\")", nullable)]
    pub date_time_original: Option<String>,
    
    /// GPS 纬度坐标
    #[sea_orm(column_name = "GPSLatitude", nullable)]
    pub gps_latitude: Option<f64>,
    
    /// GPS 经度坐标
    #[sea_orm(column_name = "GPSLongitude", nullable)]
    pub gps_longitude: Option<f64>,
    
    /// GPS 海拔高度
    #[sea_orm(column_name = "GPSAltitude", nullable)]
    pub gps_altitude: Option<f64>,
    
    // ========== 图像技术信息 ==========
    
    /// 图像宽度（像素，如：1920）
    #[sea_orm(column_name = "ImageWidth", nullable)]
    pub image_width: Option<i32>,
    
    /// 图像高度（像素，如：2560）
    #[sea_orm(column_name = "ImageHeight", nullable)]
    pub image_height: Option<i32>,
    
    /// 图像方向（旋转角度）
    #[sea_orm(column_name = "Orientation", nullable)]
    pub orientation: Option<i32>,
    
    /// 色彩空间（如：sRGB）
    #[sea_orm(column_name = "ColorSpace", column_type = "Text", nullable)]
    pub color_space: Option<String>,
    
    /// 分辨率单位（如：英寸）
    #[sea_orm(column_name = "ResolutionUnit", column_type = "Text", nullable)]
    pub resolution_unit: Option<String>,
    
    /// 水平分辨率（如：72）
    #[sea_orm(column_name = "XResolution", nullable)]
    pub x_resolution: Option<i32>,
    
    /// 垂直分辨率（如：72）
    #[sea_orm(column_name = "YResolution", nullable)]
    pub y_resolution: Option<i32>,
    
    // ========== 标记字段 ==========
    
    /// 是否包含 GPS 信息
    #[sea_orm(column_name = "HasGPS")]
    pub has_gps: bool,
    
    /// 是否包含缩略图
    #[sea_orm(column_name = "HasThumbnail")]
    pub has_thumbnail: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// 关联到 Photo（一对一）
    #[sea_orm(
        belongs_to = "super::photo::Entity",
        from = "Column::PhotoId",
        to = "super::photo::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Photo,
}

impl Related<super::photo::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Photo.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

