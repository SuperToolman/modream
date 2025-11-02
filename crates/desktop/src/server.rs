use anyhow::Result;

/// 启动 WebAPI 服务
pub async fn start_webapi() -> Result<()> {
    // 初始化日志
    shared::logger::init();
    
    tracing::info!("🔧 Initializing WebAPI server...");
    
    // 创建路由
    let router = interfaces::api::create_router();
    
    // 启动服务（这会阻塞当前任务）
    interfaces::app::run(router).await?;
    
    Ok(())
}

