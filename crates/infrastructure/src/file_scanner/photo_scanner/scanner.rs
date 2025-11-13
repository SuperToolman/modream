//! 照片扫描器 - 扫描照片文件并提取元数据

use super::models::photo::{ExifData, PhotoScanResult};
use super::models::scan_options::ScanOptions;
use ignore::WalkBuilder;
use image::GenericImageView;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use tracing::{debug, info, warn};

// kamadak-exif 在代码中使用 exif 作为模块名
use exif;

/// 照片扫描器
///
/// 使用构建器模式，支持链式调用
///
/// # 示例
/// ```no_run
/// use photo_scanner::PhotoScanner;
/// use photo_scanner::models::scan_options::ScanOptions;
///
/// #[tokio::main]
/// async fn main() {
///     let results = PhotoScanner::new()
///         .with_options(ScanOptions::default())
///         .scan("./photos".to_string())
///         .await
///         .unwrap();
/// }
/// ```
pub struct PhotoScanner {
    /// 扫描选项
    options: ScanOptions,
}

impl PhotoScanner {
    /// 创建新的照片扫描器实例
    pub fn new() -> Self {
        Self {
            options: ScanOptions::default(),
        }
    }

    /// 设置扫描选项
    ///
    /// # 参数
    /// * `options` - 扫描选项
    pub fn with_options(mut self, options: ScanOptions) -> Self {
        self.options = options;
        self
    }

    /// 扫描指定目录中的照片文件并提取元数据
    ///
    /// # 参数
    /// * `dir_path` - 要扫描的目录路径
    ///
    /// # 返回值
    /// 返回 `Result<Vec<PhotoScanResult>, String>`，包含扫描到的照片列表（含元数据）或错误信息
    pub async fn scan(self, dir_path: String) -> Result<Vec<PhotoScanResult>, String> {
        info!("开始扫描照片目录: {}", dir_path);

        // 1. 扫描照片文件
        let photo_files = self.scan_photo_files(&dir_path)?;
        info!("找到 {} 个照片文件", photo_files.len());

        // 2. 提取元数据
        let mut results = Vec::new();
        for photo_path in photo_files {
            match self.process_photo(&photo_path).await {
                Ok(result) => results.push(result),
                Err(e) => {
                    warn!("处理照片失败 {}: {}", photo_path.display(), e);
                }
            }
        }

        info!("成功处理 {} 个照片", results.len());
        Ok(results)
    }

    /// 扫描目录中的照片文件
    fn scan_photo_files(&self, dir_path: &str) -> Result<Vec<PathBuf>, String> {
        let mut photo_files = Vec::new();

        let walker = WalkBuilder::new(dir_path)
            .hidden(false)
            .git_ignore(false)
            .build();

        for entry in walker {
            match entry {
                Ok(entry) => {
                    let path = entry.path();
                    if path.is_file() {
                        if let Some(ext) = path.extension() {
                            let ext_str = ext.to_string_lossy().to_lowercase();
                            if self.options.supported_formats.contains(&ext_str) {
                                photo_files.push(path.to_path_buf());
                            }
                        }
                    }
                }
                Err(e) => {
                    warn!("扫描文件时出错: {}", e);
                }
            }
        }

        Ok(photo_files)
    }

    /// 处理单个照片文件
    pub async fn process_photo(&self, path: &Path) -> Result<PhotoScanResult, String> {
        debug!("处理照片: {}", path.display());

        // 获取文件基本信息
        let metadata = fs::metadata(path).map_err(|e| format!("读取文件元数据失败: {}", e))?;
        let byte_size = metadata.len() as i64;
        let extension = path
            .extension()
            .map(|e| e.to_string_lossy().to_lowercase());

        // 🚀 优化：一次性读取文件到内存，避免重复 I/O
        let file_data = fs::read(path).map_err(|e| format!("读取文件失败: {}", e))?;

        // 1. 从内存读取图片尺寸（不完整解码）
        let reader = image::ImageReader::new(std::io::Cursor::new(&file_data))
            .with_guessed_format()
            .map_err(|e| format!("识别图片格式失败: {}", e))?;

        let (width, height) = reader
            .into_dimensions()
            .map_err(|e| format!("读取图片尺寸失败: {}", e))?;
        let resolution = Some(format!("{}x{}", width, height));

        // 2. 从内存计算哈希值（复用 file_data）
        let hash = if self.options.calculate_hash {
            Some(self.calculate_file_hash_from_memory(&file_data))
        } else {
            None
        };

        // 3. 从内存解码图片并生成缩略图（复用 file_data）
        let thumbnail_path = if self.options.generate_thumbnail {
            let img = image::load_from_memory(&file_data)
                .map_err(|e| format!("从内存解码图片失败: {}", e))?;
            Some(self.generate_thumbnail(path, &img).await?)
        } else {
            None
        };

        // 4. 从内存提取 EXIF 信息（复用 file_data）
        let exif = if self.options.extract_exif {
            self.extract_exif_from_memory(path, &file_data)?
        } else {
            None
        };

        // 5. 提取文件时间信息
        let file_created_time = metadata.created()
            .ok()
            .and_then(|t| {
                use std::time::SystemTime;
                t.duration_since(SystemTime::UNIX_EPOCH)
                    .ok()
                    .map(|d| {
                        let datetime = chrono::DateTime::<chrono::Local>::from(SystemTime::UNIX_EPOCH + d);
                        datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                    })
            });

        let file_modified_time = metadata.modified()
            .ok()
            .and_then(|t| {
                use std::time::SystemTime;
                t.duration_since(SystemTime::UNIX_EPOCH)
                    .ok()
                    .map(|d| {
                        let datetime = chrono::DateTime::<chrono::Local>::from(SystemTime::UNIX_EPOCH + d);
                        datetime.format("%Y-%m-%d %H:%M:%S").to_string()
                    })
            });

        Ok(PhotoScanResult {
            path: path.to_string_lossy().to_string(),
            byte_size,
            extension,
            width: Some(width as i32),
            height: Some(height as i32),
            resolution,
            thumbnail_path,
            hash,
            exif,
            file_created_time,
            file_modified_time,
        })
    }

    /// 计算文件哈希值（SHA-256）- 从内存计算
    fn calculate_file_hash_from_memory(&self, file_data: &[u8]) -> String {
        use sha2::{Digest, Sha256};

        let mut hasher = Sha256::new();
        hasher.update(file_data);
        let result = hasher.finalize();
        format!("{:x}", result)
    }

    /// 计算文件哈希值（SHA-256）- 从文件路径（已废弃，保留用于兼容）
    #[allow(dead_code)]
    fn calculate_file_hash(&self, path: &Path) -> Result<String, String> {
        use sha2::{Digest, Sha256};

        let mut file = fs::File::open(path).map_err(|e| format!("打开文件失败: {}", e))?;
        let mut hasher = Sha256::new();
        let mut buffer = [0; 8192];

        loop {
            let n = file
                .read(&mut buffer)
                .map_err(|e| format!("读取文件失败: {}", e))?;
            if n == 0 {
                break;
            }
            hasher.update(&buffer[..n]);
        }

        let result = hasher.finalize();
        Ok(format!("{:x}", result))
    }

    /// 生成缩略图
    async fn generate_thumbnail(
        &self,
        original_path: &Path,
        img: &image::DynamicImage,
    ) -> Result<String, String> {
        // 计算缩略图尺寸（保持宽高比）
        let (width, height) = img.dimensions();
        let max_width = self.options.thumbnail_max_width;
        let max_height = self.options.thumbnail_max_height;

        let (thumb_width, thumb_height) = if width > height {
            let ratio = max_width as f32 / width as f32;
            (max_width, (height as f32 * ratio) as u32)
        } else {
            let ratio = max_height as f32 / height as f32;
            ((width as f32 * ratio) as u32, max_height)
        };

        // 生成缩略图（使用配置的缩放算法）
        let thumbnail = img.resize(
            thumb_width,
            thumb_height,
            self.options.thumbnail_resize_filter.to_image_filter(),
        );

        // 确定缩略图保存路径
        let thumbnail_dir = self
            .options
            .thumbnail_dir
            .as_ref()
            .map(PathBuf::from)
            .unwrap_or_else(|| {
                original_path
                    .parent()
                    .unwrap_or(Path::new("."))
                    .join(".thumbnails")
            });

        // 创建缩略图目录
        fs::create_dir_all(&thumbnail_dir)
            .map_err(|e| format!("创建缩略图目录失败: {}", e))?;

        // 生成缩略图文件名
        let file_stem = original_path
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy();
        let thumbnail_path = thumbnail_dir.join(format!("{}_thumb.jpg", file_stem));

        // 转换为 RGB 格式（JPEG 不支持透明度）
        // 如果图片有 Alpha 通道（如 PNG），需要先转换为 RGB
        let rgb_thumbnail = match thumbnail.color() {
            image::ColorType::Rgba8 | image::ColorType::Rgba16 | image::ColorType::Rgba32F => {
                // 有 Alpha 通道，转换为 RGB（使用白色背景）
                image::DynamicImage::ImageRgb8(thumbnail.to_rgb8())
            }
            _ => {
                // 已经是 RGB 或其他兼容格式，直接使用
                thumbnail
            }
        };

        // 保存缩略图为 JPEG 格式
        rgb_thumbnail
            .save(&thumbnail_path)
            .map_err(|e| format!("保存缩略图失败: {}", e))?;

        Ok(thumbnail_path.to_string_lossy().to_string())
    }

    /// 提取 EXIF 信息 - 从内存
    fn extract_exif_from_memory(&self, path: &Path, file_data: &[u8]) -> Result<Option<ExifData>, String> {
        use std::io::Cursor;

        let mut cursor = Cursor::new(file_data);
        let exif_reader = exif::Reader::new();
        let exif_data = match exif_reader.read_from_container(&mut cursor) {
            Ok(exif_result) => exif_result,
            Err(exif::Error::NotFound(_)) => {
                debug!("照片不包含 EXIF 信息: {}", path.display());
                return Ok(None);
            }
            Err(e) => {
                warn!("读取 EXIF 信息失败 {}: {}", path.display(), e);
                return Ok(None);
            }
        };

        Ok(Some(self.parse_exif_data(&exif_data)))
    }

    /// 提取 EXIF 信息 - 从文件路径（已废弃，保留用于兼容）
    #[allow(dead_code)]
    fn extract_exif(&self, path: &Path) -> Result<Option<ExifData>, String> {
        let file = fs::File::open(path).map_err(|e| format!("打开文件失败: {}", e))?;
        let mut bufreader = std::io::BufReader::new(&file);

        let exif_reader = exif::Reader::new();
        let exif_data = match exif_reader.read_from_container(&mut bufreader) {
            Ok(exif_result) => exif_result,
            Err(exif::Error::NotFound(_)) => {
                debug!("照片不包含 EXIF 信息: {}", path.display());
                return Ok(None);
            }
            Err(e) => {
                warn!("读取 EXIF 信息失败 {}: {}", path.display(), e);
                return Ok(None);
            }
        };

        Ok(Some(self.parse_exif_data(&exif_data)))
    }

    /// 解析 EXIF 数据（提取公共逻辑）
    fn parse_exif_data(&self, exif_data: &exif::Exif) -> ExifData {

        let mut data = ExifData::default();

        // 提取设备信息
        data.camera_make = self.get_exif_string(&exif_data, exif::Tag::Make);
        data.camera_model = self.get_exif_string(&exif_data, exif::Tag::Model);
        data.software = self.get_exif_string(&exif_data, exif::Tag::Software);

        // 提取拍摄参数
        data.f_number = self.get_exif_rational(&exif_data, exif::Tag::FNumber);
        data.exposure_time = self.get_exif_string(&exif_data, exif::Tag::ExposureTime);
        data.iso_speed = self.get_exif_u32(&exif_data, exif::Tag::PhotographicSensitivity)
            .map(|v| v as i32);
        data.focal_length = self.get_exif_rational(&exif_data, exif::Tag::FocalLength);
        data.focal_length_in_35mm = self
            .get_exif_u32(&exif_data, exif::Tag::FocalLengthIn35mmFilm)
            .map(|v| v as f32);

        // 提取时间信息
        data.date_time_original = self.get_exif_string(&exif_data, exif::Tag::DateTimeOriginal);

        // 提取 GPS 信息
        if let Some(lat) = self.get_gps_coordinate(&exif_data, exif::Tag::GPSLatitude) {
            data.gps_latitude = Some(lat);
            data.has_gps = true;
        }
        if let Some(lon) = self.get_gps_coordinate(&exif_data, exif::Tag::GPSLongitude) {
            data.gps_longitude = Some(lon);
            data.has_gps = true;
        }
        data.gps_altitude = self.get_exif_rational(&exif_data, exif::Tag::GPSAltitude)
            .map(|v| v as f64);

        // 提取图像技术信息
        data.image_width = self
            .get_exif_u32(&exif_data, exif::Tag::PixelXDimension)
            .map(|v| v as i32);
        data.image_height = self
            .get_exif_u32(&exif_data, exif::Tag::PixelYDimension)
            .map(|v| v as i32);
        data.orientation = self
            .get_exif_u32(&exif_data, exif::Tag::Orientation)
            .map(|v| v as i32);

        data
    }

    /// 获取 EXIF 字符串字段
    fn get_exif_string(&self, exif_data: &exif::Exif, tag: exif::Tag) -> Option<String> {
        exif_data.get_field(tag, exif::In::PRIMARY)
            .map(|f| f.display_value().to_string())
    }

    /// 获取 EXIF 有理数字段
    fn get_exif_rational(&self, exif_data: &exif::Exif, tag: exif::Tag) -> Option<f32> {
        exif_data.get_field(tag, exif::In::PRIMARY).and_then(|f| {
            if let exif::Value::Rational(ref rationals) = f.value {
                if !rationals.is_empty() {
                    let r = rationals[0];
                    return Some(r.num as f32 / r.denom as f32);
                }
            }
            None
        })
    }

    /// 获取 EXIF 无符号整数字段
    fn get_exif_u32(&self, exif_data: &exif::Exif, tag: exif::Tag) -> Option<u32> {
        exif_data.get_field(tag, exif::In::PRIMARY).and_then(|f| {
            if let exif::Value::Short(ref shorts) = f.value {
                if !shorts.is_empty() {
                    return Some(shorts[0] as u32);
                }
            }
            if let exif::Value::Long(ref longs) = f.value {
                if !longs.is_empty() {
                    return Some(longs[0]);
                }
            }
            None
        })
    }

    /// 获取 GPS 坐标
    fn get_gps_coordinate(&self, exif_data: &exif::Exif, tag: exif::Tag) -> Option<f64> {
        exif_data.get_field(tag, exif::In::PRIMARY).and_then(|f| {
            if let exif::Value::Rational(ref rationals) = f.value {
                if rationals.len() >= 3 {
                    let degrees = rationals[0].num as f64 / rationals[0].denom as f64;
                    let minutes = rationals[1].num as f64 / rationals[1].denom as f64;
                    let seconds = rationals[2].num as f64 / rationals[2].denom as f64;
                    return Some(degrees + minutes / 60.0 + seconds / 3600.0);
                }
            }
            None
        })
    }
}

impl Default for PhotoScanner {
    fn default() -> Self {
        Self::new()
    }
}

