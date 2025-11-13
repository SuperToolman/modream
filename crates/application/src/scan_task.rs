use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

/// 扫描任务状态
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ScanTaskStatus {
    /// 排队中
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

/// 扫描任务信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanTask {
    /// 任务 ID（媒体库 ID）
    pub task_id: String,
    /// 媒体库标题
    pub title: String,
    /// 媒体类型
    pub media_type: String,
    /// 任务状态
    pub status: ScanTaskStatus,
    /// 总文件数
    pub total_files: usize,
    /// 已处理文件数
    pub processed_files: usize,
    /// 成功处理数
    pub success_count: usize,
    /// 失败数
    pub failed_count: usize,
    /// 当前处理的文件路径
    pub current_file: Option<String>,
    /// 错误信息
    pub error_message: Option<String>,
    /// 创建时间
    pub created_at: chrono::DateTime<chrono::Local>,
    /// 更新时间
    pub updated_at: chrono::DateTime<chrono::Local>,
    /// 完成时间
    pub completed_at: Option<chrono::DateTime<chrono::Local>>,
}

impl ScanTask {
    /// 创建新的扫描任务
    pub fn new(task_id: String, title: String, media_type: String) -> Self {
        let now = chrono::Local::now();
        Self {
            task_id,
            title,
            media_type,
            status: ScanTaskStatus::Pending,
            total_files: 0,
            processed_files: 0,
            success_count: 0,
            failed_count: 0,
            current_file: None,
            error_message: None,
            created_at: now,
            updated_at: now,
            completed_at: None,
        }
    }

    /// 开始扫描
    pub fn start_scanning(&mut self, total_files: usize) {
        self.status = ScanTaskStatus::Scanning;
        self.total_files = total_files;
        self.updated_at = chrono::Local::now();
    }

    /// 更新进度
    pub fn update_progress(&mut self, current_file: Option<String>, success: bool) {
        self.processed_files += 1;
        if success {
            self.success_count += 1;
        } else {
            self.failed_count += 1;
        }
        self.current_file = current_file;
        self.updated_at = chrono::Local::now();
    }

    /// 完成扫描
    pub fn complete(&mut self) {
        self.status = ScanTaskStatus::Completed;
        self.current_file = None;
        self.updated_at = chrono::Local::now();
        self.completed_at = Some(chrono::Local::now());
    }

    /// 标记为失败
    pub fn fail(&mut self, error_message: String) {
        self.status = ScanTaskStatus::Failed;
        self.error_message = Some(error_message);
        self.current_file = None;
        self.updated_at = chrono::Local::now();
        self.completed_at = Some(chrono::Local::now());
    }

    /// 取消扫描
    pub fn cancel(&mut self) {
        self.status = ScanTaskStatus::Cancelled;
        self.current_file = None;
        self.updated_at = chrono::Local::now();
        self.completed_at = Some(chrono::Local::now());
    }

    /// 计算进度百分比
    pub fn progress_percentage(&self) -> f32 {
        if self.total_files == 0 {
            0.0
        } else {
            (self.processed_files as f32 / self.total_files as f32) * 100.0
        }
    }
}

/// 扫描任务管理器
#[derive(Clone)]
pub struct ScanTaskManager {
    tasks: Arc<RwLock<HashMap<String, ScanTask>>>,
}

impl ScanTaskManager {
    /// 创建新的任务管理器
    pub fn new() -> Self {
        Self {
            tasks: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// 创建新任务
    pub async fn create_task(&self, task_id: String, title: String, media_type: String) -> ScanTask {
        let task = ScanTask::new(task_id.clone(), title, media_type);
        let mut tasks = self.tasks.write().await;
        tasks.insert(task_id, task.clone());
        task
    }

    /// 获取任务
    pub async fn get_task(&self, task_id: &str) -> Option<ScanTask> {
        let tasks = self.tasks.read().await;
        tasks.get(task_id).cloned()
    }

    /// 更新任务
    pub async fn update_task<F>(&self, task_id: &str, updater: F) -> Option<ScanTask>
    where
        F: FnOnce(&mut ScanTask),
    {
        let mut tasks = self.tasks.write().await;
        if let Some(task) = tasks.get_mut(task_id) {
            updater(task);
            Some(task.clone())
        } else {
            None
        }
    }

    /// 删除任务
    pub async fn remove_task(&self, task_id: &str) -> Option<ScanTask> {
        let mut tasks = self.tasks.write().await;
        tasks.remove(task_id)
    }

    /// 获取所有任务
    pub async fn get_all_tasks(&self) -> Vec<ScanTask> {
        let tasks = self.tasks.read().await;
        tasks.values().cloned().collect()
    }

    /// 清理已完成的任务（超过指定时间）
    pub async fn cleanup_completed_tasks(&self, max_age_seconds: i64) {
        let mut tasks = self.tasks.write().await;
        let now = chrono::Local::now();
        tasks.retain(|_, task| {
            if let Some(completed_at) = task.completed_at {
                let age = now.signed_duration_since(completed_at);
                age.num_seconds() < max_age_seconds
            } else {
                true // 未完成的任务保留
            }
        });
    }
}

impl Default for ScanTaskManager {
    fn default() -> Self {
        Self::new()
    }
}

