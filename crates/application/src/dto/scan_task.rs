use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 扫描任务状态
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum ScanTaskStatus {
    /// 等待中
    Pending,
    /// 扫描中
    Scanning,
    /// 已完成
    Completed,
    /// 失败
    Failed,
    /// 已取消
    Cancelled,
}

impl From<crate::scan_task::ScanTaskStatus> for ScanTaskStatus {
    fn from(status: crate::scan_task::ScanTaskStatus) -> Self {
        match status {
            crate::scan_task::ScanTaskStatus::Pending => ScanTaskStatus::Pending,
            crate::scan_task::ScanTaskStatus::Scanning => ScanTaskStatus::Scanning,
            crate::scan_task::ScanTaskStatus::Completed => ScanTaskStatus::Completed,
            crate::scan_task::ScanTaskStatus::Failed => ScanTaskStatus::Failed,
            crate::scan_task::ScanTaskStatus::Cancelled => ScanTaskStatus::Cancelled,
        }
    }
}

/// 扫描任务信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct ScanTaskInfo {
    /// 任务 ID
    pub task_id: String,
    
    /// 任务标题
    pub title: String,
    
    /// 媒体类型
    pub media_type: String,
    
    /// 任务状态
    pub status: ScanTaskStatus,
    
    /// 总文件数
    pub total_files: usize,
    
    /// 已处理文件数
    pub processed_files: usize,
    
    /// 成功数量
    pub success_count: usize,
    
    /// 失败数量
    pub failed_count: usize,
    
    /// 当前处理的文件
    pub current_file: Option<String>,
    
    /// 错误信息
    pub error_message: Option<String>,
    
    /// 创建时间
    pub created_at: String,
    
    /// 更新时间
    pub updated_at: String,
    
    /// 完成时间
    pub completed_at: Option<String>,
}

impl From<crate::scan_task::ScanTask> for ScanTaskInfo {
    fn from(task: crate::scan_task::ScanTask) -> Self {
        ScanTaskInfo {
            task_id: task.task_id,
            title: task.title,
            media_type: task.media_type,
            status: task.status.into(),
            total_files: task.total_files,
            processed_files: task.processed_files,
            success_count: task.success_count,
            failed_count: task.failed_count,
            current_file: task.current_file,
            error_message: task.error_message,
            created_at: task.created_at.format("%Y-%m-%d %H:%M:%S").to_string(),
            updated_at: task.updated_at.format("%Y-%m-%d %H:%M:%S").to_string(),
            completed_at: task.completed_at.map(|t| t.format("%Y-%m-%d %H:%M:%S").to_string()),
        }
    }
}

