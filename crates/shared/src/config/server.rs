use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct ThumbnailConfig {
    /// 缩略图默认宽度（像素）
    pub default_width: Option<u32>,
    /// 缩略图默认高度（像素）
    pub default_height: Option<u32>,
    /// 缩略图默认质量（0-100）
    pub default_quality: Option<u8>,
}

impl ThumbnailConfig {
    pub fn default_width(&self) -> u32 {
        self.default_width.unwrap_or(200)
    }

    pub fn default_height(&self) -> u32 {
        self.default_height.unwrap_or(300)
    }

    pub fn default_quality(&self) -> u8 {
        self.default_quality.unwrap_or(85)
    }
}

#[derive(Debug, Deserialize)]
pub struct StreamingConfig {
    /// 流式传输缓冲区大小（字节），默认 64KB
    pub buffer_size: Option<usize>,
    /// 是否启用流式传输，默认 true
    pub enabled: Option<bool>,
}

impl StreamingConfig {
    pub fn buffer_size(&self) -> usize {
        self.buffer_size.unwrap_or(65536) // 64KB
    }

    pub fn enabled(&self) -> bool {
        self.enabled.unwrap_or(true)
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct MimeTypeConfig {
    /// 文件扩展名到 MIME 类型的映射
    pub types: Option<HashMap<String, String>>,
}

impl MimeTypeConfig {
    pub fn get_mime_type(&self, extension: &str) -> String {
        let ext = extension.to_lowercase();

        if let Some(types) = &self.types {
            if let Some(mime_type) = types.get(&ext) {
                return mime_type.clone();
            }
        }

        // 默认 MIME 类型映射
        match ext.as_str() {
            "jpg" | "jpeg" => "image/jpeg",
            "png" => "image/png",
            "gif" => "image/gif",
            "bmp" => "image/bmp",
            "webp" => "image/webp",
            "tiff" | "tif" => "image/tiff",
            "svg" => "image/svg+xml",
            "ico" => "image/x-icon",
            _ => "application/octet-stream",
        }.to_string()
    }
}

#[derive(Debug, Deserialize)]
pub struct CacheConfig {
    /// 图片缓存时间（秒），默认 30 天（2592000 秒）
    pub image_max_age: Option<u32>,
    /// 视频缓存时间（秒），默认 30 天（2592000 秒）
    pub video_max_age: Option<u32>,
    /// API 数据是否不缓存，默认 true
    pub api_no_cache: Option<bool>,
    /// HTML 是否不缓存，默认 true
    pub html_no_cache: Option<bool>,
    /// 静态资源（CSS/JS）缓存时间（秒），默认 1 年（31536000 秒）
    pub static_max_age: Option<u32>,
}

impl CacheConfig {
    pub fn image_max_age(&self) -> u32 {
        self.image_max_age.unwrap_or(2592000) // 30 days
    }

    pub fn video_max_age(&self) -> u32 {
        self.video_max_age.unwrap_or(2592000) // 30 days
    }

    pub fn api_no_cache(&self) -> bool {
        self.api_no_cache.unwrap_or(true)
    }

    pub fn html_no_cache(&self) -> bool {
        self.html_no_cache.unwrap_or(true)
    }

    pub fn static_max_age(&self) -> u32 {
        self.static_max_age.unwrap_or(31536000) // 1 year
    }

    /// 获取图片的 Cache-Control 响应头值
    pub fn image_cache_control(&self) -> String {
        format!("public, max-age={}", self.image_max_age())
    }

    /// 获取视频的 Cache-Control 响应头值
    pub fn video_cache_control(&self) -> String {
        format!("public, max-age={}", self.video_max_age())
    }

    /// 获取 API 的 Cache-Control 响应头值
    pub fn api_cache_control(&self) -> String {
        if self.api_no_cache() {
            "no-cache, must-revalidate".to_string()
        } else {
            "public, max-age=0".to_string()
        }
    }

    /// 获取 HTML 的 Cache-Control 响应头值
    pub fn html_cache_control(&self) -> String {
        if self.html_no_cache() {
            "no-cache, must-revalidate".to_string()
        } else {
            "public, max-age=0".to_string()
        }
    }

    /// 获取静态资源的 Cache-Control 响应头值
    pub fn static_cache_control(&self) -> String {
        format!("public, max-age={}", self.static_max_age())
    }
}

#[derive(Debug, Deserialize)]
pub struct ImageConfig {
    /// 支持的图片格式
    pub supported_formats: Option<Vec<String>>,
    /// 缩略图配置
    pub thumbnail: Option<ThumbnailConfig>,
    /// 流式传输配置
    pub streaming: Option<StreamingConfig>,
    /// MIME 类型配置
    pub mime_types: Option<MimeTypeConfig>,
    /// 缓存配置
    pub cache: Option<CacheConfig>,
}

impl ImageConfig {
    pub fn supported_formats(&self) -> Vec<&str> {
        self.supported_formats
            .as_ref()
            .map(|formats| formats.iter().map(|s| s.as_str()).collect())
            .unwrap_or_else(|| vec!["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff"])
    }

    pub fn thumbnail(&self) -> &ThumbnailConfig {
        self.thumbnail.as_ref().unwrap_or(&DEFAULT_THUMBNAIL_CONFIG)
    }

    pub fn streaming(&self) -> &StreamingConfig {
        self.streaming.as_ref().unwrap_or(&DEFAULT_STREAMING_CONFIG)
    }

    pub fn mime_types(&self) -> &MimeTypeConfig {
        self.mime_types.as_ref().unwrap_or(&DEFAULT_MIME_TYPE_CONFIG)
    }

    pub fn cache(&self) -> &CacheConfig {
        self.cache.as_ref().unwrap_or(&DEFAULT_CACHE_CONFIG)
    }
}

const DEFAULT_THUMBNAIL_CONFIG: ThumbnailConfig = ThumbnailConfig {
    default_width: None,
    default_height: None,
    default_quality: None,
};

const DEFAULT_STREAMING_CONFIG: StreamingConfig = StreamingConfig {
    buffer_size: None,
    enabled: None,
};

const DEFAULT_MIME_TYPE_CONFIG: MimeTypeConfig = MimeTypeConfig {
    types: None,
};

const DEFAULT_CACHE_CONFIG: CacheConfig = CacheConfig {
    image_max_age: None,
    video_max_age: None,
    api_no_cache: None,
    html_no_cache: None,
    static_max_age: None,
};

/// 启动模式
#[derive(Debug, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ServerMode {
    /// 桌面模式：启动桌面应用 + WebAPI（默认）
    Desktop,
    /// 服务器模式：只启动 WebAPI（适用于 Linux 服务器、Docker）
    Server,
    /// GUI 模式：只启动桌面应用（假设 API 已在其他地方运行）
    Gui,
}

impl Default for ServerMode {
    fn default() -> Self {
        ServerMode::Desktop
    }
}

#[derive(Debug, Deserialize)]
pub struct ServerConfig {
    port: Option<u16>,
    api_url: Option<String>,
    image: Option<ImageConfig>,
    #[serde(default)]
    mode: ServerMode,
    #[serde(default = "default_auto_start_api")]
    auto_start_api: bool,
}

fn default_auto_start_api() -> bool {
    true
}

impl ServerConfig {
    pub fn port(&self) -> u16 {
        self.port.unwrap_or(9876)
    }

    pub fn api_url(&self) -> &str {
        self.api_url.as_deref().unwrap_or("http://127.0.0.1:8080")
    }

    pub fn image(&self) -> &ImageConfig {
        self.image.as_ref().unwrap_or(&DEFAULT_IMAGE_CONFIG)
    }

    pub fn mode(&self) -> ServerMode {
        self.mode
    }

    pub fn auto_start_api(&self) -> bool {
        self.auto_start_api
    }
}

const DEFAULT_IMAGE_CONFIG: ImageConfig = ImageConfig {
    supported_formats: None,
    thumbnail: None,
    streaming: None,
    mime_types: None,
    cache: None,
};