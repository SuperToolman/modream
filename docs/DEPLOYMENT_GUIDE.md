# Modream 部署指南

> 📚 **相关文档**：[架构设计说明](ARCHITECTURE.md) | [快速开始](../README.md#快速开始)

## 📦 启动模式概览

Modream 支持多种灵活的启动模式，可以通过配置文件或命令行参数控制。

| 模式 | 命令 | 用途 | 前端 | API |
|------|------|------|------|-----|
| **开发模式** | `./start-dev.ps1` 或 `./start-dev.sh` | 日常开发 | ✅ (热重载) | ✅ |
| **桌面模式** | `cargo run --bin desktop` | 个人使用 | ✅ (Tauri) | ✅ |
| **服务器模式** | `cargo run --bin desktop -- --server` | 服务器部署 | ❌ | ✅ |
| **GUI 模式** | `cargo run --bin desktop -- --gui` | 连接远程 API | ✅ (Tauri) | ❌ |

---

## 🛠️ 模式 0：开发模式（Development Mode）⭐

**适用场景**：日常开发、前端热重载、后端调试

### 一键启动（推荐）

**Windows**：
```powershell
# 安装依赖（首次运行）
cd web
pnpm install⌘K

cd ..
⌘K

# 启动开发环境
.\start-dev.ps1
```

**Linux/Mac**：
```bash
# 安装依赖（首次运行）
cd web
pnpm install
cd ..

# 启动开发环境
chmod +x start-dev.sh
./start-dev.sh

# 停止服务
./stop-dev.sh
```

### 手动启动

如果你需要更精细的控制，可以手动启动：

```bash
# 终端 1：启动 WebAPI
cargo run --bin desktop -- --server

# 终端 2：启动前端开发服务器
cd web
pnpm run dev
```

### 访问地址

- **前端**：http://localhost:3000（支持热重载）
- **API**：http://localhost:8080
- **Swagger**：http://localhost:8080/swagger-ui

### 特点

- ✅ 前端支持热重载，修改代码自动刷新
- ✅ 后端可以随时重启调试
- ✅ 前后端完全独立，互不干扰
- ✅ 适合日常开发和调试

---

## 🎯 模式 1：桌面模式（Desktop Mode）

**适用场景**：个人电脑使用，一键启动桌面应用和 WebAPI

### 配置方式

**方法 1：配置文件（推荐）**

编辑 `application.yaml`：

```yaml
server:
  mode: desktop
  auto_start_api: true
  port: 8080
```

然后运行：

```bash
cargo run --bin desktop
# 或编译后
./target/release/desktop
```

**方法 2：命令行参数**

```bash
cargo run --bin desktop -- --desktop
# 或
./target/release/desktop --desktop
```

### 行为

- ✅ 自动启动 WebAPI 服务（http://localhost:8080）
- ✅ 启动 Tauri 桌面窗口
- ✅ 桌面窗口加载 Next.js 前端
- ✅ 前端通过 localhost:8080 调用 API

---

## 🖥️ 模式 2：服务器模式（Server Mode）

**适用场景**：Linux 服务器、NAS、Docker 部署，只需要 WebAPI

### 配置方式

**方法 1：配置文件（推荐）**

编辑 `application.yaml`：

```yaml
server:
  mode: server
  port: 8080
```

然后运行：

```bash
cargo run --bin desktop
# 或编译后
./target/release/desktop
```

**方法 2：命令行参数**

```bash
cargo run --bin desktop -- --server-only
# 或简写
cargo run --bin desktop -- --server
```

### 行为

- ✅ 只启动 WebAPI 服务（http://0.0.0.0:8080）
- ✅ 可以从其他设备访问（http://192.168.x.x:8080）
- ❌ 不启动桌面窗口
- 💡 按 Ctrl+C 停止服务

### Linux Systemd 服务示例

创建 `/etc/systemd/system/modream.service`：

```ini
[Unit]
Description=Modream Media Library Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/opt/modream
ExecStart=/opt/modream/desktop
Restart=on-failure
Environment="RUST_LOG=info"

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable modream
sudo systemctl start modream
sudo systemctl status modream
```

### Docker 部署示例

```dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release --bin desktop

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libsqlite3-0 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/desktop /usr/local/bin/
COPY application.yaml /etc/modream/application.yaml
WORKDIR /etc/modream
EXPOSE 8080
CMD ["desktop"]
```

`application.yaml` 配置：

```yaml
server:
  mode: server
  port: 8080
database:
  sqlite_database_url: sqlite:///data/modream.db?mode=rwc
```

运行：

```bash
docker build -t modream .
docker run -d -p 8080:8080 -v /path/to/data:/data modream
```

---

## 🎨 模式 3：GUI 模式（GUI Only Mode）

**适用场景**：开发调试，API 已在其他地方运行

### 配置方式

**方法 1：配置文件**

编辑 `application.yaml`：

```yaml
server:
  mode: gui
  api_url: http://localhost:8080  # 指向已运行的 API
```

**方法 2：命令行参数**

```bash
cargo run --bin desktop -- --gui-only
# 或简写
cargo run --bin desktop -- --gui
```

### 行为

- ❌ 不启动 WebAPI
- ✅ 只启动桌面窗口
- 💡 需要确保 API 已在其他地方运行

---

## 🔧 配置文件详解

### application.yaml

```yaml
server:
  # 启动模式：desktop | server | gui
  mode: desktop
  
  # 是否在桌面模式下自动启动 WebAPI
  auto_start_api: true
  
  # WebAPI 端口
  port: 8080
  
  # API URL（用于前端调用）
  api_url: http://localhost:8080
  
  # 图片处理配置
  image:
    supported_formats: [jpg, jpeg, png, gif, bmp, webp, tiff]
    thumbnail:
      default_width: 200
      default_height: 300
      default_quality: 85
    cache:
      image_max_age: 2592000  # 30 天

database:
  sqlite_database_url: sqlite://data/my_app.db?mode=rwc

gamebox:
  igdb:
    client_id: "your_client_id"
    client_secret: "your_client_secret"
    enabled: true
```

---

## 📊 模式对比

| 特性 | Desktop 模式 | Server 模式 | GUI 模式 |
|------|-------------|------------|---------|
| **启动 WebAPI** | ✅ | ✅ | ❌ |
| **启动桌面窗口** | ✅ | ❌ | ✅ |
| **远程访问** | ❌ (localhost) | ✅ (0.0.0.0) | N/A |
| **适用场景** | 个人电脑 | 服务器/NAS | 开发调试 |
| **资源占用** | 中等 | 低 | 低 |

---

## 🚀 快速开始

### 个人使用（推荐）

```bash
# 1. 克隆项目
git clone <repo>
cd modream

# 2. 编译
cargo build --release --bin desktop

# 3. 运行（默认 desktop 模式）
./target/release/desktop
```

### 服务器部署

```bash
# 1. 编辑配置
nano application.yaml
# 设置 mode: server

# 2. 编译
cargo build --release --bin desktop

# 3. 运行
./target/release/desktop
```

### 开发调试

```bash
# 终端 1：启动 API
cargo run --bin desktop -- --server

# 终端 2：启动前端开发服务器
cd web
pnpm run dev

# 终端 3：启动桌面应用（可选）
cargo run --bin desktop -- --gui
```

---

## 💡 常见问题

### Q: 如何更改端口？

A: 编辑 `application.yaml`：

```yaml
server:
  port: 9000  # 改为你想要的端口
```

### Q: 如何从其他设备访问？

A: 使用 `server` 模式，API 会绑定到 `0.0.0.0`，然后通过服务器 IP 访问：

```
http://192.168.1.100:8080
```

### Q: 命令行参数优先级？

A: 命令行参数 > 配置文件

例如：配置文件设置 `mode: desktop`，但运行 `./desktop --server`，会使用 `server` 模式。

### Q: 如何查看日志？

A: 设置环境变量：

```bash
RUST_LOG=debug ./desktop
```

---

---

## 🏗️ DDD 架构开发流程

### 开发场景示例：添加 Video 模块接口

假设我们要为视频管理功能添加一个新的 API 接口：`GET /api/videos/{id}`，用于获取视频详情。

以下是完整的开发流程，严格遵循 DDD 分层架构：

---

### 步骤 1：领域层（Domain Layer）- 定义核心模型

**目录**：`crates/domain/`

#### 1.1 定义实体（Entity）

**文件**：`crates/domain/src/entity/video.rs`

```rust
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// 视频实体
#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "videos")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub title: String,
    pub file_path: String,
    pub duration: Option<i32>,  // 时长（秒）
    pub resolution: Option<String>,  // 分辨率（如 "1920x1080"）
    pub media_library_id: i32,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::media_library::Entity",
        from = "Column::MediaLibraryId",
        to = "super::media_library::Column::Id"
    )]
    MediaLibrary,
}

impl ActiveModelBehavior for ActiveModel {}
```

**注册实体**：`crates/domain/src/entity/mod.rs`

```rust
pub mod video;
```

#### 1.2 定义仓储接口（Repository Trait）

**文件**：`crates/domain/src/repository/video.rs`

```rust
use crate::entity::video;
use anyhow::Result;

/// 视频仓储接口
#[async_trait::async_trait]
pub trait VideoRepository: Send + Sync {
    /// 根据 ID 查询视频
    async fn find_by_id(&self, id: i32) -> Result<Option<video::Model>>;

    /// 查询所有视频
    async fn find_all(&self) -> Result<Vec<video::Model>>;

    /// 根据媒体库 ID 查询视频
    async fn find_by_media_library_id(&self, media_library_id: i32) -> Result<Vec<video::Model>>;

    /// 创建视频
    async fn create(&self, video: video::ActiveModel) -> Result<video::Model>;

    /// 更新视频
    async fn update(&self, video: video::ActiveModel) -> Result<video::Model>;

    /// 删除视频
    async fn delete(&self, id: i32) -> Result<()>;
}
```

**注册仓储**：`crates/domain/src/repository/mod.rs`

```rust
pub mod video;
```

---

### 步骤 2：基础设施层（Infrastructure Layer）- 实现数据访问

**目录**：`crates/infrastructure/`

#### 2.1 实现仓储（Repository Implementation）

**文件**：`crates/infrastructure/src/repository/video.rs`

```rust
use crate::database::DbPool;
use domain::entity::video;
use domain::repository::video::VideoRepository;
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, ActiveModelTrait, Set};
use anyhow::Result;

/// 视频仓储实现
pub struct VideoRepositoryImpl {
    db: DbPool,
}

impl VideoRepositoryImpl {
    pub fn new(db: DbPool) -> Self {
        Self { db }
    }
}

#[async_trait::async_trait]
impl VideoRepository for VideoRepositoryImpl {
    async fn find_by_id(&self, id: i32) -> Result<Option<video::Model>> {
        let video = video::Entity::find_by_id(id)
            .one(&self.db)
            .await?;
        Ok(video)
    }

    async fn find_all(&self) -> Result<Vec<video::Model>> {
        let videos = video::Entity::find()
            .all(&self.db)
            .await?;
        Ok(videos)
    }

    async fn find_by_media_library_id(&self, media_library_id: i32) -> Result<Vec<video::Model>> {
        let videos = video::Entity::find()
            .filter(video::Column::MediaLibraryId.eq(media_library_id))
            .all(&self.db)
            .await?;
        Ok(videos)
    }

    async fn create(&self, video: video::ActiveModel) -> Result<video::Model> {
        let video = video.insert(&self.db).await?;
        Ok(video)
    }

    async fn update(&self, video: video::ActiveModel) -> Result<video::Model> {
        let video = video.update(&self.db).await?;
        Ok(video)
    }

    async fn delete(&self, id: i32) -> Result<()> {
        video::Entity::delete_by_id(id)
            .exec(&self.db)
            .await?;
        Ok(())
    }
}
```

**注册仓储**：`crates/infrastructure/src/repository/mod.rs`

```rust
pub mod video;
```

---

### 步骤 3：应用层（Application Layer）- 编排业务逻辑

**目录**：`crates/application/`

#### 3.1 定义 DTO（Data Transfer Object）

**文件**：`crates/application/src/dto/video.rs`

```rust
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 视频信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct VideoInfo {
    pub id: i32,
    pub title: String,
    pub file_path: String,
    pub duration: Option<i32>,
    pub resolution: Option<String>,
    pub media_library_id: i32,
    pub created_at: String,
    pub updated_at: String,
}

impl From<domain::entity::video::Model> for VideoInfo {
    fn from(video: domain::entity::video::Model) -> Self {
        Self {
            id: video.id,
            title: video.title,
            file_path: video.file_path,
            duration: video.duration,
            resolution: video.resolution,
            media_library_id: video.media_library_id,
            created_at: video.created_at.to_rfc3339(),
            updated_at: video.updated_at.to_rfc3339(),
        }
    }
}

/// 创建视频请求 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateVideoRequest {
    pub title: String,
    pub file_path: String,
    pub duration: Option<i32>,
    pub resolution: Option<String>,
    pub media_library_id: i32,
}
```

**注册 DTO**：`crates/application/src/dto/mod.rs`

```rust
pub mod video;
pub use video::{VideoInfo, CreateVideoRequest};
```

#### 3.2 实现服务（Service）

**文件**：`crates/application/src/video_service.rs`

```rust
use domain::repository::video::VideoRepository;
use crate::dto::{VideoInfo, CreateVideoRequest};
use anyhow::Result;
use std::sync::Arc;

/// 视频服务
pub struct VideoService {
    video_repo: Arc<dyn VideoRepository>,
}

impl VideoService {
    pub fn new(video_repo: Arc<dyn VideoRepository>) -> Self {
        Self { video_repo }
    }

    /// 根据 ID 获取视频
    pub async fn get_video_by_id(&self, id: i32) -> Result<Option<VideoInfo>> {
        let video = self.video_repo.find_by_id(id).await?;
        Ok(video.map(VideoInfo::from))
    }

    /// 获取所有视频
    pub async fn get_all_videos(&self) -> Result<Vec<VideoInfo>> {
        let videos = self.video_repo.find_all().await?;
        Ok(videos.into_iter().map(VideoInfo::from).collect())
    }

    /// 根据媒体库 ID 获取视频
    pub async fn get_videos_by_media_library(&self, media_library_id: i32) -> Result<Vec<VideoInfo>> {
        let videos = self.video_repo.find_by_media_library_id(media_library_id).await?;
        Ok(videos.into_iter().map(VideoInfo::from).collect())
    }

    /// 创建视频
    pub async fn create_video(&self, req: CreateVideoRequest) -> Result<VideoInfo> {
        use domain::entity::video;
        use sea_orm::Set;

        let now = chrono::Utc::now();
        let video = video::ActiveModel {
            title: Set(req.title),
            file_path: Set(req.file_path),
            duration: Set(req.duration),
            resolution: Set(req.resolution),
            media_library_id: Set(req.media_library_id),
            created_at: Set(now.into()),
            updated_at: Set(now.into()),
            ..Default::default()
        };

        let video = self.video_repo.create(video).await?;
        Ok(VideoInfo::from(video))
    }
}
```

**注册服务**：`crates/application/src/lib.rs`

```rust
pub mod video_service;
pub use video_service::VideoService;
```

---

### 步骤 4：接口层（Interfaces Layer）- 暴露 HTTP API

**目录**：`crates/interfaces/`

#### 4.1 实现 API 处理器（Handler）

**文件**：`crates/interfaces/src/api/video.rs`

```rust
use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{VideoInfo, CreateVideoRequest};
use axum::Router;
use axum::extract::{State, Path};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing;

/// 获取视频详情
#[utoipa::path(
    get,
    path = "/api/videos/{id}",
    tag = "video",
    params(
        ("id" = i32, Path, description = "视频 ID")
    ),
    responses(
        (status = 200, description = "成功获取视频详情", body = ApiResponse<VideoInfo>),
        (status = 404, description = "视频不存在"),
    )
)]
pub async fn get_video(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let video = state.video_service
        .get_video_by_id(id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get video: {}", e)))?;

    match video {
        Some(video) => {
            let response = ApiResponse::ok(
                Some("Get video successful"),
                Some(video),
                None,
                None,
            );
            Ok((StatusCode::OK, axum::Json(response)))
        }
        None => {
            Err(AppError::Biz("Video not found".to_string()))
        }
    }
}

/// 获取所有视频
#[utoipa::path(
    get,
    path = "/api/videos",
    tag = "video",
    responses(
        (status = 200, description = "成功获取视频列表", body = ApiResponse<Vec<VideoInfo>>),
    )
)]
pub async fn get_all_videos(
    State(state): State<AppState>,
) -> ApiResult<impl IntoResponse> {
    let videos = state.video_service
        .get_all_videos()
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get videos: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Get videos successful"),
        Some(videos),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 创建视频
#[utoipa::path(
    post,
    path = "/api/videos",
    tag = "video",
    request_body = CreateVideoRequest,
    responses(
        (status = 201, description = "成功创建视频", body = ApiResponse<VideoInfo>),
    )
)]
pub async fn create_video(
    State(state): State<AppState>,
    axum::Json(req): axum::Json<CreateVideoRequest>,
) -> ApiResult<impl IntoResponse> {
    let video = state.video_service
        .create_video(req)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to create video: {}", e)))?;

    let response = ApiResponse::ok(
        Some("Create video successful"),
        Some(video),
        None,
        None,
    );

    Ok((StatusCode::CREATED, axum::Json(response)))
}

/// 视频路由
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", routing::get(get_all_videos))
        .route("/", routing::post(create_video))
        .route("/:id", routing::get(get_video))
}
```

**注册路由**：`crates/interfaces/src/api/mod.rs`

```rust
pub mod video;

pub fn routes() -> Router<AppState> {
    Router::new()
        // ... 其他路由
        .nest("/videos", video::routes())
}
```

#### 4.2 更新 Swagger 文档

**文件**：`crates/interfaces/src/swagger.rs`

```rust
use application::dto::{VideoInfo, CreateVideoRequest, /* ... 其他 DTO */};
use crate::api::{video, /* ... 其他 API */};

#[derive(OpenApi)]
#[openapi(
    paths(
        // ... 其他接口
        video::get_video,
        video::get_all_videos,
        video::create_video,
    ),
    components(
        schemas(
            // ... 其他 Schema
            VideoInfo,
            CreateVideoRequest,
        )
    ),
    tags(
        // ... 其他 Tag
        (name = "video", description = "视频相关接口"),
    )
)]
pub struct ApiDoc;
```

---

### 步骤 5：依赖注入 - 组装服务

**文件**：`crates/interfaces/src/app.rs`

```rust
use application::VideoService;
use infrastructure::repository::video::VideoRepositoryImpl;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    // ... 其他服务
    pub video_service: Arc<VideoService>,
}

impl AppState {
    pub fn new(db: DbPool) -> Self {
        // ... 其他仓储和服务

        // 创建 Video 仓储和服务
        let video_repo = Arc::new(VideoRepositoryImpl::new(db.clone()));
        let video_service = Arc::new(VideoService::new(video_repo));

        Self {
            // ... 其他服务
            video_service,
        }
    }
}
```

---

### 步骤 6：数据库迁移

**创建迁移文件**：

```bash
# 使用 SeaORM CLI 创建迁移
sea-orm-cli migrate generate create_videos_table
```

**编辑迁移文件**：`migration/src/m20240101_000001_create_videos_table.rs`

```rust
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Video::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Video::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Video::Title).string().not_null())
                    .col(ColumnDef::new(Video::FilePath).string().not_null())
                    .col(ColumnDef::new(Video::Duration).integer())
                    .col(ColumnDef::new(Video::Resolution).string())
                    .col(ColumnDef::new(Video::MediaLibraryId).integer().not_null())
                    .col(ColumnDef::new(Video::CreatedAt).timestamp().not_null())
                    .col(ColumnDef::new(Video::UpdatedAt).timestamp().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .from(Video::Table, Video::MediaLibraryId)
                            .to(MediaLibrary::Table, MediaLibrary::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Video::Table).to_owned())
            .await
    }
}

#[derive(Iden)]
enum Video {
    Table,
    Id,
    Title,
    FilePath,
    Duration,
    Resolution,
    MediaLibraryId,
    CreatedAt,
    UpdatedAt,
}

#[derive(Iden)]
enum MediaLibrary {
    Table,
    Id,
}
```

**运行迁移**：

```bash
sea-orm-cli migrate up
```

---

### 步骤 7：测试

#### 7.1 编译检查

```bash
cargo check --bin desktop
```

#### 7.2 启动服务

```bash
# 方式 1：开发模式（推荐）
./start-dev.ps1  # Windows
./start-dev.sh   # Linux/Mac

# 方式 2：手动启动
cargo run --bin desktop -- --server
```

#### 7.3 测试 API

**访问 Swagger UI**：
```
http://localhost:8080/swagger-ui
```

**使用 curl 测试**：

```bash
# 创建视频
curl -X POST http://localhost:8080/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试视频",
    "file_path": "/path/to/video.mp4",
    "duration": 3600,
    "resolution": "1920x1080",
    "media_library_id": 1
  }'

# 获取视频详情
curl http://localhost:8080/api/videos/1

# 获取所有视频
curl http://localhost:8080/api/videos
```

---

### 开发流程总结

```
1. Domain Layer (领域层)
   ├── 定义实体 (Entity)
   └── 定义仓储接口 (Repository Trait)

2. Infrastructure Layer (基础设施层)
   └── 实现仓储 (Repository Implementation)

3. Application Layer (应用层)
   ├── 定义 DTO (Data Transfer Object)
   └── 实现服务 (Service)

4. Interfaces Layer (接口层)
   ├── 实现 API 处理器 (Handler)
   ├── 注册路由 (Router)
   └── 更新 Swagger 文档

5. 依赖注入
   └── 在 AppState 中组装服务

6. 数据库迁移
   └── 创建和运行迁移

7. 测试
   ├── 编译检查
   ├── 启动服务
   └── 测试 API
```

**关键原则**：
- ✅ **自下而上开发**：从 Domain → Infrastructure → Application → Interfaces
- ✅ **依赖倒置**：高层模块不依赖低层模块，都依赖抽象（Trait）
- ✅ **单一职责**：每一层只负责自己的职责
- ✅ **DTO 必须在 Application 层**：不要在 Interfaces 层定义 DTO
- ✅ **使用 Arc<dyn Trait>**：通过依赖注入实现解耦

---

## 📝 总结

- **个人使用**：使用 `desktop` 模式，一键启动
- **服务器部署**：使用 `server` 模式，配合 systemd 或 Docker
- **开发调试**：使用开发模式（`start-dev.ps1` 或 `start-dev.sh`），前端热重载
- **灵活切换**：通过配置文件或命令行参数随时切换模式
- **DDD 开发**：严格遵循分层架构，自下而上开发新功能

