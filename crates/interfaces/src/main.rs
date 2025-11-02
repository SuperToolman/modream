mod app;
mod server;
mod api;
mod error;
mod response;
mod swagger;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let router = api::create_router();
    app::run(router).await
}