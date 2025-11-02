// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod server;

use std::env;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 读取配置
    let config = shared::config::get().server();

    // 解析命令行参数（命令行参数优先级高于配置文件）
    let args: Vec<String> = env::args().collect();

    // 确定启动模式
    let mode = if args.contains(&"--server-only".to_string()) || args.contains(&"--server".to_string()) {
        shared::config::ServerMode::Server
    } else if args.contains(&"--gui-only".to_string()) || args.contains(&"--gui".to_string()) {
        shared::config::ServerMode::Gui
    } else if args.contains(&"--desktop".to_string()) {
        shared::config::ServerMode::Desktop
    } else {
        // 使用配置文件中的模式
        config.mode()
    };

    // 根据模式启动
    match mode {
        shared::config::ServerMode::Server => {
            // 模式 1: 纯服务器模式
            println!("🚀 Starting in SERVER mode...");
            println!("📡 WebAPI will be accessible at http://0.0.0.0:{}", config.port());
            println!("📡 You can access it from other devices on your network");
            println!("💡 Tip: Press Ctrl+C to stop the server");
            server::start_webapi().await?;
        }

        shared::config::ServerMode::Gui => {
            // 模式 2: 纯桌面模式
            println!("🖥️  Starting in GUI mode...");
            println!("⚠️  WebAPI is NOT started. Make sure it's running elsewhere.");
            println!("📡 Expected API URL: {}", config.api_url());
            app_lib::run();
        }

        shared::config::ServerMode::Desktop => {
            // 模式 3: 桌面 + API 模式
            println!("🚀 Starting in DESKTOP mode...");

            if config.auto_start_api() {
                println!("📡 WebAPI: http://localhost:{}", config.port());
                println!("🖥️  Desktop window will open shortly...");

                // 在后台启动 WebAPI
                tokio::spawn(async move {
                    if let Err(e) = server::start_webapi().await {
                        tracing::error!("Failed to start WebAPI: {}", e);
                        eprintln!("❌ Failed to start WebAPI: {}", e);
                    }
                });

                // 等待 API 启动（确保 API 就绪）
                println!("⏳ Waiting for WebAPI to start...");
                tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
                println!("✅ WebAPI started successfully!");
            } else {
                println!("⚠️  auto_start_api is disabled in config");
                println!("📡 Expected API URL: {}", config.api_url());
            }

            println!("🖥️  Launching desktop application...");
            app_lib::run();
        }
    }

    Ok(())
}
