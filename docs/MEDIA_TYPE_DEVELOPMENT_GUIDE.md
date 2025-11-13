# Modream 媒体库类型开发完整指南

> 📚 **相关文档**：[架构设计说明](ARCHITECTURE.md) | [部署指南](DEPLOYMENT_GUIDE.md)

本文档将指导你如何在 Modream 中开发一个新的媒体库类型（如音乐、照片等）。我们将以**音乐（Music）**为例，展示从零到完整功能的全流程开发。

---

## 📋 目录

1. [架构概览](#架构概览)
2. [开发流程总览](#开发流程总览)
3. [第一步：Domain 层 - 领域模型](#第一步domain-层---领域模型)
4. [第二步：Infrastructure 层 - 数据访问](#第二步infrastructure-层---数据访问)
5. [第三步：Application 层 - 应用服务](#第三步application-层---应用服务)
6. [第四步：Interfaces 层 - API 接口](#第四步interfaces-层---api-接口)
7. [第五步：文件扫描器](#第五步文件扫描器)
8. [第六步：配置系统](#第六步配置系统)
9. [第七步：依赖注入](#第七步依赖注入)
10. [第八步：数据库迁移](#第八步数据库迁移)
11. [第九步：前端开发](#第九步前端开发)
12. [测试与验证](#测试与验证)

---

## 🏗️ 架构概览

Modream 采用 **DDD（领域驱动设计）** 架构，分为四层：

```
┌─────────────────────────────────────────────────────────────┐
│                    Interfaces 层（接口层）                    │
│  - API 端点（Axum Router）                                   │
│  - DTO 转换                                                  │
│  - Swagger 文档                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Application 层（应用层）                     │
│  - 应用服务（Service）                                       │
│  - DTO 定义                                                  │
│  - 业务流程编排                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Domain 层（领域层）                         │
│  - 实体（Entity）                                            │
│  - 仓储接口（Repository Trait）                              │
│  - 领域服务（Domain Service）                                │
│  - 聚合根（Aggregate）                                       │
│  - 值对象（Value Object）                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               Infrastructure 层（基础设施层）                 │
│  - 仓储实现（Repository Impl）                               │
│  - 数据库访问（SeaORM）                                      │
│  - 文件扫描器                                                │
│  - 外部 API 集成                                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心原则

1. **依赖倒置**：Domain 层定义接口，Infrastructure 层实现接口
2. **自下而上开发**：从 Domain → Infrastructure → Application → Interfaces
3. **单一职责**：每层只关注自己的职责
4. **充血模型**：实体包含业务逻辑，不是贫血模型

---

## 🚀 开发流程总览

开发一个新的媒体库类型需要以下步骤：

| 步骤 | 层级 | 文件 | 说明 |
|------|------|------|------|
| 1 | Domain | `entity/music.rs` | 定义音乐实体 |
| 2 | Domain | `repository/music.rs` | 定义仓储接口 |
| 3 | Domain | `service/music_domain_service.rs` | 定义领域服务（可选） |
| 4 | Infrastructure | `repository/music.rs` | 实现仓储接口 |
| 5 | Application | `dto/music.rs` | 定义 DTO |
| 6 | Application | `music_service.rs` | 实现应用服务 |
| 7 | Interfaces | `api/music.rs` | 实现 API 端点 |
| 8 | Infrastructure | `file_scanner/music_scanner/` | 实现文件扫描器 |
| 9 | Shared | `config/music.rs` | 定义配置结构 |
| 10 | - | 数据库迁移 | 创建数据库表 |
| 11 | - | 依赖注入 | 注册服务 |
| 12 | Frontend | `web/` | 前端页面开发 |

**预计开发时间**：2-4 小时（熟练后）

---

## 第一步：Domain 层 - 领域模型

Domain 层是整个系统的核心，定义业务规则和数据模型。

### 1.1 创建音乐实体

**文件**：`crates/domain/src/entity/music.rs`

```rust
use sea_orm::entity::prelude::*;

/// 音乐实体
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "Music")]
pub struct Model {
    /// 主键 ID
    #[sea_orm(primary_key, auto_increment = true, column_name = "Id")]
    pub id: i32,

    /// 创建时间
    #[sea_orm(column_name = "CreateTime", column_type = "custom(\"DATETIME\")")]
    pub create_time: String,

    /// 更新时间
    #[sea_orm(column_name = "UpdateTime", column_type = "custom(\"DATETIME\")")]
    pub update_time: String,

    /// 音乐标题
    #[sea_orm(column_name = "Title", column_type = "Text")]
    pub title: String,

    /// 艺术家
    #[sea_orm(column_name = "Artist", column_type = "Text", nullable)]
    pub artist: Option<String>,

    /// 专辑名称
    #[sea_orm(column_name = "Album", column_type = "Text", nullable)]
    pub album: Option<String>,

    /// 音乐文件路径
    #[sea_orm(column_name = "Path", column_type = "Text")]
    pub path: String,

    /// 文件大小（字节）
    #[sea_orm(column_name = "ByteSize")]
    pub byte_size: i32,

    /// 文件扩展名
    #[sea_orm(column_name = "Extension", column_type = "Text", nullable)]
    pub extension: Option<String>,

    /// 时长（秒）
    #[sea_orm(column_name = "Duration")]
    pub duration: i32,

    /// 比特率（kbps）
    #[sea_orm(column_name = "Bitrate", nullable)]
    pub bitrate: Option<i32>,

    /// 采样率（Hz）
    #[sea_orm(column_name = "SampleRate", nullable)]
    pub sample_rate: Option<i32>,

    /// 发行年份
    #[sea_orm(column_name = "Year", nullable)]
    pub year: Option<i32>,

    /// 流派（JSON 数组）
    #[sea_orm(column_name = "Genres", column_type = "Text", nullable)]
    pub genres: Option<String>,

    /// 封面图片路径
    #[sea_orm(column_name = "Cover", column_type = "Text", nullable)]
    pub cover: Option<String>,

    /// 歌词
    #[sea_orm(column_name = "Lyrics", column_type = "Text", nullable)]
    pub lyrics: Option<String>,

    /// 所属媒体库 ID
    #[sea_orm(column_name = "MediaLibraryId")]
    pub media_library_id: i32,
}

/// 定义关系
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::media_library::Entity",
        from = "Column::MediaLibraryId",
        to = "super::media_library::Column::Id"
    )]
    MediaLibrary,
}

impl Related<super::media_library::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MediaLibrary.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

// ============================================================================
// 业务方法（充血模型）
// ============================================================================

impl Model {
    /// 创建新音乐实体（工厂方法）
    ///
    /// # 参数
    /// - `title`: 音乐标题
    /// - `path`: 音乐文件路径
    /// - `media_library_id`: 所属媒体库 ID
    ///
    /// # 返回
    /// - `Self` - 创建的音乐实体
    pub fn new(title: String, path: String, media_library_id: i32) -> Self {
        let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

        Self {
            id: 0, // 数据库会自动生成
            create_time: now.clone(),
            update_time: now,
            title,
            artist: None,
            album: None,
            path,
            byte_size: 0,
            extension: None,
            duration: 0,
            bitrate: None,
            sample_rate: None,
            year: None,
            genres: None,
            cover: None,
            lyrics: None,
            media_library_id,
        }
    }

    /// 更新元数据
    pub fn update_metadata(
        &mut self,
        artist: Option<String>,
        album: Option<String>,
        duration: i32,
        bitrate: Option<i32>,
        sample_rate: Option<i32>,
        year: Option<i32>,
    ) {
        self.artist = artist;
        self.album = album;
        self.duration = duration;
        self.bitrate = bitrate;
        self.sample_rate = sample_rate;
        self.year = year;
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    }

    /// 获取流派列表
    pub fn get_genres(&self) -> Vec<String> {
        self.genres
            .as_ref()
            .and_then(|s| serde_json::from_str(s).ok())
            .unwrap_or_default()
    }

    /// 设置流派列表
    pub fn set_genres(&mut self, genres: Vec<String>) -> anyhow::Result<()> {
        self.genres = Some(serde_json::to_string(&genres)?);
        self.update_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        Ok(())
    }

    /// 获取格式化的时长（MM:SS）
    pub fn get_formatted_duration(&self) -> String {
        let minutes = self.duration / 60;
        let seconds = self.duration % 60;
        format!("{:02}:{:02}", minutes, seconds)
    }

    /// 获取格式化的文件大小
    pub fn get_formatted_size(&self) -> String {
        let kb = self.byte_size as f64 / 1024.0;
        if kb < 1024.0 {
            format!("{:.2} KB", kb)
        } else {
            let mb = kb / 1024.0;
            format!("{:.2} MB", mb)
        }
    }
}
```

### 1.2 注册实体到模块

**文件**：`crates/domain/src/entity/mod.rs`

```rust
pub mod music;  // 添加这一行
```

**文件**：`crates/domain/src/entity/prelude.rs`

```rust
pub use super::music::Entity as Music;  // 添加这一行
```

### 1.3 创建仓储接口

**文件**：`crates/domain/src/repository/music.rs`

```rust
use crate::entity::music::Model as MusicModel;
use async_trait::async_trait;

/// 音乐仓储接口
/// 定义所有音乐数据访问操作的抽象接口
#[async_trait]
pub trait MusicRepository: Send + Sync {
    /// 根据 ID 查询音乐
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MusicModel>>;

    /// 分页查询音乐
    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<MusicModel>>>;

    /// 创建新音乐
    async fn create(&self, music: MusicModel) -> anyhow::Result<MusicModel>;

    /// 批量创建音乐
    async fn create_batch(&self, musics: Vec<MusicModel>) -> anyhow::Result<Vec<MusicModel>>;

    /// 更新音乐
    async fn update(&self, music: MusicModel) -> anyhow::Result<MusicModel>;

    /// 根据媒体库 ID 查询所有音乐
    async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<MusicModel>>;

    /// 根据艺术家查询音乐
    async fn find_by_artist(&self, artist: &str) -> anyhow::Result<Vec<MusicModel>>;

    /// 根据专辑查询音乐
    async fn find_by_album(&self, album: &str) -> anyhow::Result<Vec<MusicModel>>;

    /// 删除音乐
    async fn delete(&self, id: i32) -> anyhow::Result<()>;

    /// 获取所有音乐的总数
    async fn count_all(&self) -> anyhow::Result<i32>;

    /// 根据媒体库 ID 获取音乐数量
    async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32>;
}
```

**文件**：`crates/domain/src/repository/mod.rs`

```rust
pub mod music;  // 添加这一行

pub use music::MusicRepository;  // 添加这一行
```

### 1.4 创建领域服务（可选）

如果有复杂的业务逻辑，可以创建领域服务。

**文件**：`crates/domain/src/service/music_domain_service.rs`

```rust
/// 音乐领域服务
/// 封装音乐相关的业务规则和验证逻辑
pub struct MusicDomainService;

impl MusicDomainService {
    /// 验证标题
    pub fn validate_title(title: &str) -> anyhow::Result<()> {
        if title.trim().is_empty() {
            return Err(anyhow::anyhow!("Music title cannot be empty"));
        }
        if title.len() > 200 {
            return Err(anyhow::anyhow!("Music title cannot exceed 200 characters"));
        }
        Ok(())
    }

    /// 验证路径
    pub fn validate_path(path: &str) -> anyhow::Result<()> {
        if path.trim().is_empty() {
            return Err(anyhow::anyhow!("Music path cannot be empty"));
        }
        Ok(())
    }

    /// 从文件路径提取标题
    pub fn extract_title_from_path(path: &str) -> String {
        std::path::Path::new(path)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("未知音乐")
            .to_string()
    }

    /// 从文件路径提取扩展名
    pub fn extract_extension_from_path(path: &str) -> Option<String> {
        std::path::Path::new(path)
            .extension()
            .and_then(|s| s.to_str())
            .map(|s| s.to_lowercase())
    }

    /// 验证音频格式
    pub fn is_valid_audio_format(extension: &str) -> bool {
        matches!(
            extension.to_lowercase().as_str(),
            "mp3" | "flac" | "wav" | "aac" | "m4a" | "ogg" | "wma" | "ape" | "opus"
        )
    }
}
```

**文件**：`crates/domain/src/service/mod.rs`

```rust
pub mod music_domain_service;  // 添加这一行

pub use music_domain_service::MusicDomainService;  // 添加这一行
```

---

## 第二步：Infrastructure 层 - 数据访问

Infrastructure 层实现 Domain 层定义的接口。

### 2.1 实现仓储

**文件**：`crates/infrastructure/src/repository/music.rs`

```rust
use domain::entity::music::{Entity as Music, Model as MusicModel};
use domain::repository::MusicRepository;
use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryOrder, Set};
use async_trait::async_trait;

/// 音乐仓储实现
pub struct MusicRepositoryImpl {
    db: DatabaseConnection,
}

impl MusicRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl MusicRepository for MusicRepositoryImpl {
    async fn find_by_id(&self, id: i32) -> anyhow::Result<Option<MusicModel>> {
        let music = Music::find_by_id(id).one(&self.db).await?;
        Ok(music)
    }

    async fn find_by_paged(
        &self,
        page_size: i32,
        page_index: i32,
    ) -> anyhow::Result<Option<Vec<MusicModel>>> {
        if page_size <= 0 || page_index <= 0 {
            return Ok(None);
        }

        let offset = ((page_index - 1) * page_size) as u64;
        let limit = page_size as u64;

        let musics = Music::find()
            .offset(offset)
            .limit(limit)
            .order_by_desc(domain::entity::music::Column::CreateTime)
            .all(&self.db)
            .await?;

        Ok(Some(musics))
    }

    async fn create(&self, music: MusicModel) -> anyhow::Result<MusicModel> {
        let active_model = domain::entity::music::ActiveModel {
            title: Set(music.title),
            artist: Set(music.artist),
            album: Set(music.album),
            path: Set(music.path),
            byte_size: Set(music.byte_size),
            extension: Set(music.extension),
            duration: Set(music.duration),
            bitrate: Set(music.bitrate),
            sample_rate: Set(music.sample_rate),
            year: Set(music.year),
            genres: Set(music.genres),
            cover: Set(music.cover),
            lyrics: Set(music.lyrics),
            media_library_id: Set(music.media_library_id),
            create_time: Set(music.create_time),
            update_time: Set(music.update_time),
            ..Default::default()
        };

        let result = active_model.insert(&self.db).await?;
        Ok(result)
    }

    async fn create_batch(&self, musics: Vec<MusicModel>) -> anyhow::Result<Vec<MusicModel>> {
        let mut created_musics = Vec::new();

        for music in musics {
            let created = self.create(music).await?;
            created_musics.push(created);
        }

        Ok(created_musics)
    }

    async fn update(&self, music: MusicModel) -> anyhow::Result<MusicModel> {
        let active_model = domain::entity::music::ActiveModel {
            id: Set(music.id),
            title: Set(music.title),
            artist: Set(music.artist),
            album: Set(music.album),
            path: Set(music.path),
            byte_size: Set(music.byte_size),
            extension: Set(music.extension),
            duration: Set(music.duration),
            bitrate: Set(music.bitrate),
            sample_rate: Set(music.sample_rate),
            year: Set(music.year),
            genres: Set(music.genres),
            cover: Set(music.cover),
            lyrics: Set(music.lyrics),
            media_library_id: Set(music.media_library_id),
            update_time: Set(music.update_time),
            ..Default::default()
        };

        let result = active_model.update(&self.db).await?;
        Ok(result)
    }

    async fn find_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<Vec<MusicModel>> {
        let musics = Music::find()
            .filter(domain::entity::music::Column::MediaLibraryId.eq(media_library_id))
            .all(&self.db)
            .await?;
        Ok(musics)
    }

    async fn find_by_artist(&self, artist: &str) -> anyhow::Result<Vec<MusicModel>> {
        let musics = Music::find()
            .filter(domain::entity::music::Column::Artist.eq(artist))
            .all(&self.db)
            .await?;
        Ok(musics)
    }

    async fn find_by_album(&self, album: &str) -> anyhow::Result<Vec<MusicModel>> {
        let musics = Music::find()
            .filter(domain::entity::music::Column::Album.eq(album))
            .all(&self.db)
            .await?;
        Ok(musics)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        Music::delete_by_id(id).exec(&self.db).await?;
        Ok(())
    }

    async fn count_all(&self) -> anyhow::Result<i32> {
        let count = Music::find().count(&self.db).await? as i32;
        Ok(count)
    }

    async fn count_by_media_library_id(&self, media_library_id: i32) -> anyhow::Result<i32> {
        let count = Music::find()
            .filter(domain::entity::music::Column::MediaLibraryId.eq(media_library_id))
            .count(&self.db)
            .await? as i32;
        Ok(count)
    }
}
```

**文件**：`crates/infrastructure/src/repository/mod.rs`

```rust
pub mod music;  // 添加这一行

pub use music::MusicRepositoryImpl;  // 添加这一行
```

---

## 第三步：Application 层 - 应用服务

Application 层负责业务流程编排和 DTO 转换。

### 3.1 创建 DTO

**文件**：`crates/application/src/dto/music.rs`

```rust
use domain::entity::music::Model as MusicModel;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

/// 音乐信息 DTO
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct MusicInfo {
    pub id: i32,
    pub title: String,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub path: String,
    pub byte_size: i32,
    pub extension: Option<String>,
    pub duration: i32,
    pub bitrate: Option<i32>,
    pub sample_rate: Option<i32>,
    pub year: Option<i32>,
    pub genres: Vec<String>,
    pub cover: Option<String>,
    pub lyrics: Option<String>,
    pub media_library_id: i32,
    pub create_time: String,
    pub update_time: String,
}

impl From<MusicModel> for MusicInfo {
    fn from(model: MusicModel) -> Self {
        Self {
            id: model.id,
            title: model.title,
            artist: model.artist,
            album: model.album,
            path: model.path,
            byte_size: model.byte_size,
            extension: model.extension,
            duration: model.duration,
            bitrate: model.bitrate,
            sample_rate: model.sample_rate,
            year: model.year,
            genres: model.get_genres(),
            cover: model.cover,
            lyrics: model.lyrics,
            media_library_id: model.media_library_id,
            create_time: model.create_time,
            update_time: model.update_time,
        }
    }
}
```

**文件**：`crates/application/src/dto/mod.rs`

```rust
pub mod music;  // 添加这一行

pub use music::MusicInfo;  // 添加这一行
```

### 3.2 创建应用服务

**文件**：`crates/application/src/music_service.rs`

```rust
use domain::repository::MusicRepository;
use std::sync::Arc;

/// 音乐服务 - 处理音乐相关的业务逻辑
pub struct MusicService {
    repo: Arc<dyn MusicRepository>,
}

impl MusicService {
    /// 创建新的音乐服务实例
    pub fn new(repo: Arc<dyn MusicRepository>) -> Self {
        Self { repo }
    }

    /// 根据 ID 查询音乐
    pub async fn get_by_id(&self, id: i32) -> anyhow::Result<domain::entity::music::Model> {
        self.repo
            .find_by_id(id)
            .await?
            .ok_or_else(|| anyhow::anyhow!("Music not found with id: {}", id))
    }

    /// 根据媒体库 ID 查询所有音乐
    pub async fn get_by_media_library_id(
        &self,
        media_library_id: i32,
    ) -> anyhow::Result<Vec<domain::entity::music::Model>> {
        self.repo.find_by_media_library_id(media_library_id).await
    }

    /// 分页查询所有音乐
    pub async fn get_paged(
        &self,
        page_index: i32,
        page_size: i32,
    ) -> anyhow::Result<(Vec<domain::entity::music::Model>, i32)> {
        let musics = self
            .repo
            .find_by_paged(page_size, page_index)
            .await?
            .unwrap_or_default();

        let total = self.repo.count_all().await?;

        Ok((musics, total))
    }

    /// 根据艺术家查询音乐
    pub async fn get_by_artist(&self, artist: &str) -> anyhow::Result<Vec<domain::entity::music::Model>> {
        self.repo.find_by_artist(artist).await
    }

    /// 根据专辑查询音乐
    pub async fn get_by_album(&self, album: &str) -> anyhow::Result<Vec<domain::entity::music::Model>> {
        self.repo.find_by_album(album).await
    }

    /// 获取所有音乐的总数
    pub async fn count_all(&self) -> anyhow::Result<i32> {
        self.repo.count_all().await
    }

    /// 删除音乐
    pub async fn delete(&self, id: i32) -> anyhow::Result<()> {
        // 先检查音乐是否存在
        let _music = self.get_by_id(id).await?;

        // 删除音乐
        self.repo.delete(id).await?;

        tracing::info!("Deleted music with id: {}", id);

        Ok(())
    }

    /// 获取音乐文件路径（用于流式传输）
    pub async fn get_music_audio_path(&self, id: i32) -> anyhow::Result<String> {
        let music = self.get_by_id(id).await?;
        Ok(music.path)
    }
}
```

**文件**：`crates/application/src/lib.rs`

```rust
pub mod music_service;  // 添加这一行

pub use music_service::MusicService;  // 添加这一行
```

---

## 第四步：Interfaces 层 - API 接口

Interfaces 层提供 HTTP API 端点。

### 4.1 创建 API 处理器

**文件**：`crates/interfaces/src/api/music.rs`

```rust
use crate::app::AppState;
use crate::error::{ApiResult, AppError};
use crate::response::ApiResponse;
use application::dto::{MusicInfo, PagedResponse, PaginationQuery};
use axum::body::Body;
use axum::extract::{Path, Query, State};
use axum::http::{header, HeaderMap, Response, StatusCode};
use axum::response::IntoResponse;
use axum::routing;
use axum::Router;
use tokio_util::io::ReaderStream;

// region: 音乐查询接口

/// 获取单个音乐详情
#[utoipa::path(
    get,
    path = "/api/musics/{music_id}",
    tag = "music",
    params(
        ("music_id" = i32, Path, description = "音乐 ID")
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<MusicInfo>),
        (status = 404, description = "音乐不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_music(
    State(state): State<AppState>,
    Path(music_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    let music = state
        .music_service
        .get_by_id(music_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get music: {}", e)))?;

    let music_info: MusicInfo = music.into();

    let response = ApiResponse::ok(
        Some("Get music successful"),
        Some(music_info),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

/// 获取音乐分页列表
#[utoipa::path(
    get,
    path = "/api/musics",
    tag = "music",
    params(
        ("page_index" = i32, Query, description = "页码（从 1 开始），默认 1", example = 1),
        ("page_size" = i32, Query, description = "每页数量，默认 10", example = 10),
    ),
    responses(
        (status = 200, description = "获取成功", body = ApiResponse<PagedResponse<MusicInfo>>),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn get_musics_paged(
    State(state): State<AppState>,
    Query(params): Query<PaginationQuery>,
) -> ApiResult<impl IntoResponse> {
    if params.page_index <= 0 || params.page_size <= 0 {
        return Err(AppError::Biz(
            "page_index and page_size must be greater than 0".to_string(),
        ));
    }

    if params.page_size > 100 {
        return Err(AppError::Biz(
            "page_size must be less than or equal to 100".to_string(),
        ));
    }

    let total = state
        .music_service
        .count_all()
        .await
        .map_err(|e| AppError::Biz(e.to_string()))?;

    let (musics, _) = state
        .music_service
        .get_paged(params.page_index, params.page_size)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get musics: {}", e)))?;

    let music_infos: Vec<MusicInfo> = musics.into_iter().map(Into::into).collect();

    let total_pages = (total as f64 / params.page_size as f64).ceil() as i32;

    let paged_response = PagedResponse {
        page_index: params.page_index,
        page_size: params.page_size,
        total,
        total_pages,
        items: music_infos,
    };

    let response = ApiResponse::ok(
        Some("Get musics successful"),
        Some(paged_response),
        None,
        None,
    );

    Ok((StatusCode::OK, axum::Json(response)))
}

// endregion

// region: 音乐流式传输接口

/// 流式传输音乐音频
#[utoipa::path(
    get,
    path = "/api/musics/{music_id}/audio",
    tag = "music",
    params(
        ("music_id" = i32, Path, description = "音乐 ID")
    ),
    responses(
        (status = 200, description = "音频流", content_type = "audio/mpeg"),
        (status = 404, description = "音乐不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn stream_music_audio(
    State(state): State<AppState>,
    Path(music_id): Path<i32>,
    headers: HeaderMap,
) -> ApiResult<Response<Body>> {
    let audio_path = state
        .music_service
        .get_music_audio_path(music_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get music audio path: {}", e)))?;

    let file = tokio::fs::File::open(&audio_path)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to open audio file: {}", e)))?;

    let metadata = file
        .metadata()
        .await
        .map_err(|e| AppError::Biz(format!("Failed to get file metadata: {}", e)))?;

    let file_size = metadata.len();

    // 处理 Range 请求
    if let Some(range_header) = headers.get(header::RANGE) {
        if let Ok(range_str) = range_header.to_str() {
            if let Some(range) = range_str.strip_prefix("bytes=") {
                if let Some((start_str, end_str)) = range.split_once('-') {
                    let start: u64 = start_str.parse().unwrap_or(0);
                    let end: u64 = if end_str.is_empty() {
                        file_size - 1
                    } else {
                        end_str.parse().unwrap_or(file_size - 1)
                    };

                    let content_length = end - start + 1;

                    let file = tokio::fs::File::open(&audio_path)
                        .await
                        .map_err(|e| AppError::Biz(format!("Failed to open audio file: {}", e)))?;

                    use tokio::io::AsyncSeekExt;
                    let mut file = file;
                    file.seek(std::io::SeekFrom::Start(start))
                        .await
                        .map_err(|e| AppError::Biz(format!("Failed to seek file: {}", e)))?;

                    let limited_file = file.take(content_length);
                    let stream = ReaderStream::new(limited_file);
                    let body = Body::from_stream(stream);

                    return Ok(Response::builder()
                        .status(StatusCode::PARTIAL_CONTENT)
                        .header(header::CONTENT_TYPE, "audio/mpeg")
                        .header(header::CONTENT_LENGTH, content_length)
                        .header(
                            header::CONTENT_RANGE,
                            format!("bytes {}-{}/{}", start, end, file_size),
                        )
                        .header(header::ACCEPT_RANGES, "bytes")
                        .body(body)
                        .unwrap());
                }
            }
        }
    }

    // 完整文件传输
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "audio/mpeg")
        .header(header::CONTENT_LENGTH, file_size)
        .header(header::ACCEPT_RANGES, "bytes")
        .body(body)
        .unwrap())
}

// endregion

// region: 音乐删除接口

/// 删除音乐
#[utoipa::path(
    delete,
    path = "/api/musics/{music_id}",
    tag = "music",
    params(
        ("music_id" = i32, Path, description = "音乐 ID")
    ),
    responses(
        (status = 200, description = "删除成功"),
        (status = 404, description = "音乐不存在"),
        (status = 500, description = "服务器错误"),
    )
)]
pub async fn delete_music(
    State(state): State<AppState>,
    Path(music_id): Path<i32>,
) -> ApiResult<impl IntoResponse> {
    state
        .music_service
        .delete(music_id)
        .await
        .map_err(|e| AppError::Biz(format!("Failed to delete music: {}", e)))?;

    let response = ApiResponse::<()>::ok(Some("Delete music successful"), None, None, None);

    Ok((StatusCode::OK, axum::Json(response)))
}

// endregion

/// 创建音乐路由
pub fn create_music_router() -> Router<AppState> {
    Router::new()
        .route("/api/musics/:music_id", routing::get(get_music))
        .route("/api/musics", routing::get(get_musics_paged))
        .route("/api/musics/:music_id/audio", routing::get(stream_music_audio))
        .route("/api/musics/:music_id", routing::delete(delete_music))
}
```

**文件**：`crates/interfaces/src/api/mod.rs`

```rust
pub mod music;  // 添加这一行
```

### 4.2 注册到 Swagger

**文件**：`crates/interfaces/src/swagger.rs`

在 `#[derive(OpenApi)]` 的 `paths` 中添加：

```rust
crate::api::music::get_music,
crate::api::music::get_musics_paged,
crate::api::music::stream_music_audio,
crate::api::music::delete_music,
```

在 `components(schemas(...))` 中添加：

```rust
application::dto::MusicInfo,
```

---

## 第五步：文件扫描器

文件扫描器负责扫描本地文件夹并提取音乐文件信息。

### 5.1 创建扫描器

**文件**：`crates/infrastructure/src/file_scanner/music_scanner/mod.rs`

```rust
pub mod scanner;
pub mod helpers;

pub use scanner::MusicScanner;
```

**文件**：`crates/infrastructure/src/file_scanner/music_scanner/scanner.rs`

```rust
use domain::entity::music::Model as MusicModel;
use domain::service::MusicDomainService;
use std::path::Path;

/// 音乐扫描器
pub struct MusicScanner;

impl MusicScanner {
    /// 扫描音乐文件夹
    ///
    /// # 参数
    /// - `folder_path`: 音乐文件夹路径
    /// - `media_library_id`: 所属媒体库 ID
    ///
    /// # 返回
    /// - `Vec<MusicModel>` - 扫描到的音乐列表
    pub async fn scan_folder(
        folder_path: &str,
        media_library_id: i32,
    ) -> anyhow::Result<Vec<MusicModel>> {
        let mut musics = Vec::new();

        let path = Path::new(folder_path);
        if !path.exists() || !path.is_dir() {
            return Err(anyhow::anyhow!("Invalid folder path: {}", folder_path));
        }

        // 递归扫描文件夹
        Self::scan_directory(path, media_library_id, &mut musics).await?;

        tracing::info!("Scanned {} music files from {}", musics.len(), folder_path);

        Ok(musics)
    }

    /// 递归扫描目录
    async fn scan_directory(
        dir: &Path,
        media_library_id: i32,
        musics: &mut Vec<MusicModel>,
    ) -> anyhow::Result<()> {
        let mut entries = tokio::fs::read_dir(dir).await?;

        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();

            if path.is_dir() {
                // 递归扫描子目录
                Self::scan_directory(&path, media_library_id, musics).await?;
            } else if path.is_file() {
                // 检查是否是音频文件
                if let Some(extension) = path.extension() {
                    if let Some(ext_str) = extension.to_str() {
                        if MusicDomainService::is_valid_audio_format(ext_str) {
                            // 创建音乐实体
                            if let Some(music) = Self::create_music_from_file(&path, media_library_id).await {
                                musics.push(music);
                            }
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// 从文件创建音乐实体
    async fn create_music_from_file(
        file_path: &Path,
        media_library_id: i32,
    ) -> Option<MusicModel> {
        let path_str = file_path.to_str()?.to_string();

        // 提取标题
        let title = MusicDomainService::extract_title_from_path(&path_str);

        // 提取扩展名
        let extension = MusicDomainService::extract_extension_from_path(&path_str);

        // 获取文件大小
        let byte_size = match tokio::fs::metadata(file_path).await {
            Ok(metadata) => metadata.len() as i32,
            Err(e) => {
                tracing::warn!("Failed to get file size for {}: {}", path_str, e);
                0
            }
        };

        // 创建音乐实体
        let mut music = MusicModel::new(title, path_str, media_library_id);
        music.byte_size = byte_size;
        music.extension = extension;

        // TODO: 使用 ffprobe 或其他工具提取音频元数据（时长、比特率、采样率等）
        // 这里可以集成 id3 库来读取 MP3 标签，或使用 ffprobe 读取其他格式

        Some(music)
    }
}
```

**文件**：`crates/infrastructure/src/file_scanner/music_scanner/helpers.rs`

```rust
/// 音乐扫描器辅助函数
pub struct MusicScannerHelpers;

impl MusicScannerHelpers {
    /// 格式化文件大小
    pub fn format_file_size(bytes: i32) -> String {
        let kb = bytes as f64 / 1024.0;
        if kb < 1024.0 {
            format!("{:.2} KB", kb)
        } else {
            let mb = kb / 1024.0;
            format!("{:.2} MB", mb)
        }
    }

    /// 格式化时长
    pub fn format_duration(seconds: i32) -> String {
        let minutes = seconds / 60;
        let secs = seconds % 60;
        format!("{:02}:{:02}", minutes, secs)
    }
}
```

**文件**：`crates/infrastructure/src/file_scanner/mod.rs`

```rust
pub mod music_scanner;  // 添加这一行
```

---

## 第六步：配置系统

配置系统用于管理音乐相关的配置（如元数据 API 密钥等）。

### 6.1 创建配置结构

**文件**：`crates/shared/src/config/music.rs`

```rust
use serde::{Deserialize, Serialize};

/// 音乐配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MusicConfig {
    /// 是否启用元数据刮削
    pub enable_metadata_scraping: bool,

    /// Last.fm API Key（用于获取音乐元数据）
    pub lastfm_api_key: Option<String>,

    /// 是否自动下载封面
    pub auto_download_cover: bool,

    /// 是否自动下载歌词
    pub auto_download_lyrics: bool,
}

impl Default for MusicConfig {
    fn default() -> Self {
        Self {
            enable_metadata_scraping: false,
            lastfm_api_key: None,
            auto_download_cover: true,
            auto_download_lyrics: false,
        }
    }
}
```

**文件**：`crates/shared/src/config/mod.rs`

```rust
pub mod music;  // 添加这一行

pub use music::MusicConfig;  // 添加这一行
```

在 `Config` 结构体中添加字段：

```rust
#[serde(default)]
pub music: MusicConfig,
```

添加 getter 方法：

```rust
pub fn music(&self) -> &MusicConfig {
    &self.music
}
```

### 6.2 更新配置文件

**文件**：`application.yaml`

```yaml
# 音乐配置
music:
  enable_metadata_scraping: false
  lastfm_api_key: null
  auto_download_cover: true
  auto_download_lyrics: false
```

---

## 第七步：依赖注入

将所有组件注册到应用状态中。

### 7.1 更新 AppState

**文件**：`crates/interfaces/src/app.rs`

在 `AppState` 结构体中添加：

```rust
pub music_service: Arc<application::MusicService>,
```

在 `AppState::new()` 方法中添加：

```rust
// 创建音乐仓储和服务
let music_repo = Arc::new(infrastructure::MusicRepositoryImpl::new(db.clone()));
let music_service = Arc::new(application::MusicService::new(music_repo));
```

在返回的 `Self` 中添加：

```rust
music_service,
```

### 7.2 注册路由

**文件**：`crates/interfaces/src/app.rs`

在 `create_router()` 方法中添加：

```rust
.merge(crate::api::music::create_music_router())
```

---

## 第八步：数据库迁移

创建数据库表。

### 8.1 创建迁移 SQL

**文件**：`migrations/YYYYMMDD_create_music_table.sql`（替换 YYYYMMDD 为当前日期）

```sql
-- 创建音乐表
CREATE TABLE IF NOT EXISTS Music (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    CreateTime DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
    UpdateTime DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
    Title TEXT NOT NULL,
    Artist TEXT,
    Album TEXT,
    Path TEXT NOT NULL,
    ByteSize INTEGER NOT NULL DEFAULT 0,
    Extension TEXT,
    Duration INTEGER NOT NULL DEFAULT 0,
    Bitrate INTEGER,
    SampleRate INTEGER,
    Year INTEGER,
    Genres TEXT,
    Cover TEXT,
    Lyrics TEXT,
    MediaLibraryId INTEGER NOT NULL,
    FOREIGN KEY (MediaLibraryId) REFERENCES MediaLibrary(Id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_music_media_library_id ON Music(MediaLibraryId);
CREATE INDEX IF NOT EXISTS idx_music_artist ON Music(Artist);
CREATE INDEX IF NOT EXISTS idx_music_album ON Music(Album);
CREATE INDEX IF NOT EXISTS idx_music_title ON Music(Title);
```

### 8.2 运行迁移

```bash
# 如果使用 SeaORM CLI
sea-orm-cli migrate up

# 或者手动执行 SQL
sqlite3 modream.db < migrations/YYYYMMDD_create_music_table.sql
```

---

## 第九步：前端开发

前端开发包括列表页、详情页和播放页。

### 9.1 创建类型定义

**文件**：`web/types/music.ts`

```typescript
/**
 * 音乐相关类型定义
 */

// 音乐信息
export interface Music {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  path: string;
  byte_size: number;
  extension: string | null;
  duration: number;
  bitrate: number | null;
  sample_rate: number | null;
  year: number | null;
  genres: string[];
  cover: string | null;
  lyrics: string | null;
  media_library_id: number;
  create_time: string;
  update_time: string;
}

// 音乐分页响应
export interface MusicPaginatedResponse {
  page_index: number;
  page_size: number;
  total: number;
  total_pages: number;
  items: Music[];
}
```

### 9.2 创建 API 客户端

**文件**：`web/lib/api/musics.ts`

```typescript
import { Music, MusicPaginatedResponse } from '@/types/music';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const musicsApi = {
  /**
   * 获取音乐分页列表
   */
  async getPaginated(pageIndex: number = 1, pageSize: number = 20): Promise<MusicPaginatedResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/musics?page_index=${pageIndex}&page_size=${pageSize}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch musics');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * 根据 ID 获取音乐详情
   */
  async getById(id: number): Promise<Music> {
    const response = await fetch(`${API_BASE_URL}/api/musics/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch music');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * 获取音乐音频流 URL
   */
  getAudioUrl(id: number): string {
    return `${API_BASE_URL}/api/musics/${id}/audio`;
  },

  /**
   * 删除音乐
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/musics/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete music');
    }
  },
};
```

### 9.3 创建音乐列表页

**文件**：`web/app/(main)/content/musics/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { musicsApi } from '@/lib/api/musics';
import { Music } from '@/types/music';
import { Spinner } from '@heroui/react';

export default function MusicsPage() {
  const [musics, setMusics] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMusics();
  }, [currentPage]);

  const loadMusics = async () => {
    try {
      setLoading(true);
      const data = await musicsApi.getPaginated(currentPage, 20);
      setMusics(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load musics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">音乐库</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {musics.map((music) => (
          <div key={music.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h3 className="font-semibold truncate">{music.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {music.artist || '未知艺术家'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
              {music.album || '未知专辑'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 测试与验证

### 1. 编译检查

```bash
# 检查所有 crate 是否编译通过
cargo check --workspace

# 如果有错误，根据提示修复
```

### 2. 运行后端

```bash
# 启动后端服务
cargo run --bin desktop -- --server
```

### 3. 测试 API

访问 Swagger 文档：http://localhost:8080/swagger-ui

测试以下接口：
- `GET /api/musics` - 获取音乐列表
- `GET /api/musics/{id}` - 获取音乐详情
- `GET /api/musics/{id}/audio` - 流式播放音乐
- `DELETE /api/musics/{id}` - 删除音乐

### 4. 测试文件扫描

```rust
// 在代码中调用扫描器
use infrastructure::file_scanner::music_scanner::MusicScanner;

let musics = MusicScanner::scan_folder("/path/to/music/folder", 1).await?;
println!("Scanned {} musics", musics.len());
```

### 5. 运行前端

```bash
cd web
pnpm run dev
```

访问：http://localhost:3000/content/musics

---

## 📝 开发检查清单

完成以下所有步骤后，你的新媒体库类型就开发完成了：

### Domain 层
- [ ] 创建实体 `entity/music.rs`
- [ ] 注册实体到 `entity/mod.rs` 和 `entity/prelude.rs`
- [ ] 创建仓储接口 `repository/music.rs`
- [ ] 注册仓储到 `repository/mod.rs`
- [ ] 创建领域服务 `service/music_domain_service.rs`（可选）
- [ ] 注册领域服务到 `service/mod.rs`

### Infrastructure 层
- [ ] 实现仓储 `repository/music.rs`
- [ ] 注册仓储实现到 `repository/mod.rs`
- [ ] 创建文件扫描器 `file_scanner/music_scanner/`
- [ ] 注册扫描器到 `file_scanner/mod.rs`

### Application 层
- [ ] 创建 DTO `dto/music.rs`
- [ ] 注册 DTO 到 `dto/mod.rs`
- [ ] 创建应用服务 `music_service.rs`
- [ ] 注册服务到 `lib.rs`

### Interfaces 层
- [ ] 创建 API 处理器 `api/music.rs`
- [ ] 注册 API 到 `api/mod.rs`
- [ ] 更新 Swagger 文档 `swagger.rs`
- [ ] 更新 AppState `app.rs`
- [ ] 注册路由 `app.rs`

### 配置和数据库
- [ ] 创建配置结构 `shared/config/music.rs`
- [ ] 注册配置到 `shared/config/mod.rs`
- [ ] 更新 `application.yaml`
- [ ] 创建数据库迁移 SQL
- [ ] 运行数据库迁移

### 前端
- [ ] 创建类型定义 `web/types/music.ts`
- [ ] 创建 API 客户端 `web/lib/api/musics.ts`
- [ ] 创建列表页 `web/app/(main)/content/musics/page.tsx`
- [ ] 创建详情页 `web/app/(main)/content/musics/[id]/page.tsx`
- [ ] 创建播放页 `web/app/(main)/content/musics/[id]/play/page.tsx`

### 测试
- [ ] 编译检查通过
- [ ] API 测试通过
- [ ] 文件扫描测试通过
- [ ] 前端页面正常显示

---

## 🎯 常见问题

### Q1: 如何添加更多字段到实体？

在 `entity/music.rs` 的 `Model` 结构体中添加字段，然后：
1. 更新数据库迁移 SQL
2. 更新 DTO
3. 更新仓储实现的 `create` 和 `update` 方法

### Q2: 如何集成第三方 API（如 Last.fm）？

参考 `infrastructure/src/file_scanner/movie_scaner/provider/tmdb_provider.rs`：
1. 在 `infrastructure/src/file_scanner/music_scanner/provider/` 创建提供者
2. 使用 `reqwest` 发送 HTTP 请求
3. 解析 JSON 响应并更新实体

### Q3: 如何处理复杂的业务逻辑？

将业务逻辑放在：
- **领域服务**（Domain Service）：跨实体的业务规则
- **实体方法**：单个实体的业务规则
- **应用服务**：业务流程编排

### Q4: 如何优化大量文件的扫描性能？

1. 使用并发扫描（`tokio::spawn`）
2. 批量插入数据库（`create_batch`）
3. 添加进度回调
4. 使用缓存避免重复扫描

### Q5: 如何添加元数据刮削功能？

参考电影扫描器的 TMDB 集成：
1. 在配置中添加 API Key
2. 创建 Provider（如 `LastfmProvider`）
3. 在扫描器中调用 Provider
4. 更新实体的元数据字段

---

## 📚 参考资料

- **现有实现**：
  - 漫画：`crates/domain/src/entity/manga.rs`
  - 游戏：`crates/domain/src/entity/game.rs`
  - 电影：`crates/domain/src/entity/movie.rs`

- **DDD 架构**：
  - [架构设计说明](ARCHITECTURE.md)
  - [部署指南](DEPLOYMENT_GUIDE.md)

- **技术栈**：
  - [SeaORM 文档](https://www.sea-ql.org/SeaORM/)
  - [Axum 文档](https://docs.rs/axum/)
  - [Next.js 文档](https://nextjs.org/docs)

---

## 🎉 总结

恭喜！你已经学会了如何在 Modream 中开发一个完整的媒体库类型。

**核心要点**：
1. **自下而上开发**：Domain → Infrastructure → Application → Interfaces
2. **依赖倒置**：Domain 定义接口，Infrastructure 实现接口
3. **充血模型**：实体包含业务逻辑
4. **单一职责**：每层只关注自己的职责

**下一步**：
- 完善前端页面（详情页、播放页）
- 集成元数据 API（Last.fm、MusicBrainz）
- 添加歌词显示功能
- 实现播放列表功能
- 优化扫描性能

如有问题，请参考现有的漫画、游戏、电影模块的实现！

---

**文档版本**：v1.0
**最后更新**：2025-11-12
**作者**：Modream 开发团队
```