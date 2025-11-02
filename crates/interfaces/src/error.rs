use crate::response::{ApiResponse, NoticeType};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

pub type ApiResult<T> = Result<T, AppError>;
/// 应用程序错误类型枚举
/// 使用 thiserror 宏自动实现 Error 和 Display trait
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not Found")]
    NotFound,
    #[error("Method not allowed")]
    MethodNotAllowed,
    #[error("{0}")]
    Biz(String),
    #[error("Error: {0}")]
    Internal(#[from] anyhow::Error),
}

impl AppError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            AppError::NotFound => StatusCode::NOT_FOUND,
            AppError::MethodNotAllowed => StatusCode::METHOD_NOT_ALLOWED,
            AppError::Biz(_) => StatusCode::BAD_REQUEST,
            AppError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    pub fn response_code(&self) -> i32 {
        self.status_code().as_u16() as i32
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status_code = self.status_code();
        let response_code = self.response_code();
        let error_message = self.to_string();

        // 根据错误类型记录不同级别的日志
        match &self {
            AppError::NotFound => {
                tracing::warn!(
                    status_code = response_code,
                    error = %error_message,
                    "❌ Not Found Error (404)"
                );
            }
            AppError::MethodNotAllowed => {
                tracing::warn!(
                    status_code = response_code,
                    error = %error_message,
                    "❌ Method Not Allowed Error (405)"
                );
            }
            AppError::Biz(msg) => {
                tracing::warn!(
                    status_code = response_code,
                    error = %error_message,
                    business_error = msg,
                    "⚠️ Business Logic Error (400)"
                );
            }
            AppError::Internal(err) => {
                tracing::error!(
                    status_code = response_code,
                    error = %error_message,
                    internal_error = ?err,
                    "🔴 Internal Server Error (500)"
                );
            }
        }

        let response = ApiResponse::<()> {
            status_code: response_code,
            message: error_message,
            data: None,
            is_notice: NoticeType::Error,
            is_write_log: true,
        };

        (status_code, axum::Json(response)).into_response()
    }
}
