//! 照片扫描结果数据模型

use serde::{Deserialize, Serialize};

/// 照片扫描结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhotoScanResult {
    /// 文件路径
    pub path: String,

    /// 文件大小（字节）
    pub byte_size: i64,

    /// 文件扩展名
    pub extension: Option<String>,

    /// 图片宽度（像素）
    pub width: Option<i32>,

    /// 图片高度（像素）
    pub height: Option<i32>,

    /// 分辨率字符串（如 "1920x1080"）
    pub resolution: Option<String>,

    /// 缩略图路径
    pub thumbnail_path: Option<String>,

    /// 文件哈希值（SHA-256）
    pub hash: Option<String>,

    /// EXIF 信息
    pub exif: Option<ExifData>,

    /// 文件创建时间（从文件系统获取）
    pub file_created_time: Option<String>,

    /// 文件最后修改时间（从文件系统获取）
    pub file_modified_time: Option<String>,
}

/// EXIF 数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExifData {
    // ========== 设备信息 ==========
    /// 相机品牌
    pub camera_make: Option<String>,
    
    /// 相机型号
    pub camera_model: Option<String>,
    
    /// 拍摄软件或固件版本
    pub software: Option<String>,
    
    // ========== 拍摄参数 ==========
    /// 光圈值
    pub f_number: Option<f32>,
    
    /// 曝光时间（如：1/10）
    pub exposure_time: Option<String>,
    
    /// ISO 感光度
    pub iso_speed: Option<i32>,
    
    /// 焦距（单位：mm）
    pub focal_length: Option<f32>,
    
    /// 35mm 等效焦距（单位：mm）
    pub focal_length_in_35mm: Option<f32>,
    
    /// 曝光程序
    pub exposure_program: Option<String>,
    
    /// 曝光模式
    pub exposure_mode: Option<String>,
    
    /// 测光模式
    pub metering_mode: Option<String>,
    
    /// 白平衡
    pub white_balance: Option<String>,
    
    /// 闪光灯状态
    pub flash: Option<String>,
    
    /// 场景捕捉类型
    pub scene_capture_type: Option<String>,
    
    // ========== 时间地点信息 ==========
    /// 原始拍摄时间
    pub date_time_original: Option<String>,
    
    /// GPS 纬度坐标
    pub gps_latitude: Option<f64>,
    
    /// GPS 经度坐标
    pub gps_longitude: Option<f64>,
    
    /// GPS 海拔高度
    pub gps_altitude: Option<f64>,
    
    // ========== 图像技术信息 ==========
    /// 图像宽度（像素）
    pub image_width: Option<i32>,
    
    /// 图像高度（像素）
    pub image_height: Option<i32>,
    
    /// 图像方向（旋转角度）
    pub orientation: Option<i32>,
    
    /// 色彩空间
    pub color_space: Option<String>,
    
    /// 分辨率单位
    pub resolution_unit: Option<String>,
    
    /// 水平分辨率
    pub x_resolution: Option<i32>,
    
    /// 垂直分辨率
    pub y_resolution: Option<i32>,
    
    // ========== 标记字段 ==========
    /// 是否包含 GPS 信息
    pub has_gps: bool,
    
    /// 是否包含缩略图
    pub has_thumbnail: bool,
}

impl Default for ExifData {
    fn default() -> Self {
        Self {
            camera_make: None,
            camera_model: None,
            software: None,
            f_number: None,
            exposure_time: None,
            iso_speed: None,
            focal_length: None,
            focal_length_in_35mm: None,
            exposure_program: None,
            exposure_mode: None,
            metering_mode: None,
            white_balance: None,
            flash: None,
            scene_capture_type: None,
            date_time_original: None,
            gps_latitude: None,
            gps_longitude: None,
            gps_altitude: None,
            image_width: None,
            image_height: None,
            orientation: None,
            color_space: None,
            resolution_unit: None,
            x_resolution: None,
            y_resolution: None,
            has_gps: false,
            has_thumbnail: false,
        }
    }
}

