use serde::{Deserialize, Serialize, Serializer};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ApiResponse<T: ToSchema> {
    /// HTTP 状态码
    #[schema(example = 200)]
    pub status_code: i32,
    /// 响应消息
    #[schema(example = "OK")]
    pub message: String,
    /// 响应数据
    pub data: Option<T>,
    /// 通知类型
    #[serde(serialize_with = "serialize_notice")]
    #[schema(value_type = String)]
    pub is_notice: NoticeType,
    /// 是否写入日志
    #[schema(example = false)]
    pub is_write_log: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, ToSchema)]
pub enum NoticeType {
    None,
    Info,
    Warning,
    Error,
    Success,
}

// 自定义序列化方法
fn serialize_notice<S>(notice: &NoticeType, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match notice {
        NoticeType::None => serializer.serialize_bool(false), // 如果type为None则序列化为false
        NoticeType::Info => serializer.serialize_str("info"),
        NoticeType::Warning => serializer.serialize_str("warning"),
        NoticeType::Error => serializer.serialize_str("error"),
        NoticeType::Success => serializer.serialize_str("success"),
    }
}

impl<T: ToSchema> ApiResponse<T> {
    pub fn new(
        status_code: i32,
        message: Option<impl Into<String>>, // 使用 Into<String> 更灵活
        data: Option<T>,
        is_notice: Option<NoticeType>,
        is_write_log: Option<bool>,
    ) -> Self {
        let is_write_log = is_write_log.unwrap_or(false);
        let default_message = match status_code {
            200 => "OK",
            201 => "Created",
            400 => "Bad Request",
            404 => "Not Found",
            500 => "Internal Server Error",
            _ => "Unknown",
        };

        let response = Self {
            status_code,
            message: message
                .map(|m| m.into())
                .unwrap_or_else(|| default_message.to_string()),
            data,
            is_notice: is_notice.unwrap_or(NoticeType::None),
            is_write_log: is_write_log,
        };

        if is_write_log {
            // TODO: 实现日志写入功能
            tracing::info!("Response logged with status code: {}", response.status_code);
        }
        response
    }

    pub fn ok(
        message: Option<impl Into<String>>,
        data: Option<T>,
        is_notice: Option<NoticeType>,
        is_write_log: Option<bool>,
    ) -> Self {
        Self::new(200, message, data, is_notice, is_write_log)
    }

    #[allow(dead_code)]
    pub fn internal_server_error(message: String) -> Self {
        Self::new(
            500,
            Some(message),
            None,
            Some(NoticeType::Error),
            Some(true),
        )
    }
}