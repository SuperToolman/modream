use anyhow::Result;

/// 启动 WebAPI 服务
pub async fn start_webapi() -> Result<()> {
    // 创建路由
    let router = interfaces::api::create_router();

    // 启动服务（这会阻塞当前任务）
    // 注意：interfaces::app::run() 会初始化日志系统
    interfaces::app::run(router).await?;

    Ok(())
}

