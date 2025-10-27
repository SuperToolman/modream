use crate::app::AppState;
use axum::Router;
use shared::config::ServerConfig;
use std::net::SocketAddr;

pub struct Server {
    config: &'static ServerConfig,
}

impl Server {
    pub fn new(config: &'static ServerConfig) -> Self {
        Self { config }
    }

    // 启动服务
    pub async fn start(&self, state: AppState, router: Router<AppState>) -> anyhow::Result<()> {
        // 构建路由
        let router = self.build_router(state, router);
        let port = self.config.port();

        // 启动服务 - 绑定到 0.0.0.0 以支持 IPv4 和 IPv6
        let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await?;

        tracing::info!("Server is listening on: http://127.0.0.1:{}", port);
        tracing::info!("Server is also accessible via: http://localhost:{}", port);
        tracing::info!("Swagger UI is available at: http://127.0.0.1:{}/swagger-ui", port);
        axum::serve(
            listener,
            router.into_make_service_with_connect_info::<SocketAddr>(),
        )
            .await?;
        Ok(())
    }

    fn build_router(&self, state: AppState, router: Router<AppState>) -> Router {
        Router::new().merge(router).with_state(state)
    }
}
