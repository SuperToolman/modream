# 🎬 Modream（末梦）- 私有媒体库管理系统

**Languages**: [English](README.en.md) | 简体中文

[![Version](https://img.shields.io/badge/version-0.3.4-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.3-black.svg)](https://nextjs.org/)

> **一个高性能、现代化的私有媒体库管理平台**，专为个人和小型团队设计，支持漫画、视频等多种媒体内容的集中管理、浏览和分享。

## 📌 项目定位

**Modream（末梦）** 是一个 **自托管的私有媒体库管理系统**，类似于 Plex、Emby、Jellyfin 等媒体服务器，但专注于：

- 🎯 **轻量级部署** - 单机即可运行，资源占用少
- 🔒 **完全私有** - 数据完全掌握在自己手中
- ⚡ **高性能** - 基于 Rust 构建，性能优异
- 🎨 **现代化 UI** - 使用最新的 Next.js 和 HeroUI
- 🔧 **易于扩展** - 清晰的 DDD 架构，便于定制开发
- 📱 **跨平台** - 支持 Web、桌面应用（Tauri）

## ⚠️ 当前状态

> **项目处于早期开发阶段**，目前已支持 **漫画** 和 **游戏** 管理功能。以下功能正在开发中：

### 🚧 待完成功能

- 🎬 **视频管理** - 视频上传、播放、字幕支持（计划中）
- 🎞️ **动画管理** - 动画库、剧集管理（计划中）
- 📺 **电影管理** - 电影库、推荐系统（计划中）
- 🔄 **同步功能** - 多设备同步、云备份（计划中）
- 🎵 **音乐管理** - 音乐库、播放列表（计划中）

### ✅ 已完成功能

- 📚 **漫画管理** - 完整的漫画库管理和阅读功能、智能标题提取、章节结构支持
- 🎮 **游戏管理** - 游戏库管理、元数据自动识别、游戏启动功能

## 📋 目录
- [项目定位](#项目定位)
- [当前状态](#当前状态)
- [项目特性](#项目特性)
- [与其他方案对比](#与其他方案对比)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [部署指南](#部署指南)
- [相关文档](#相关文档)

## ✨ 项目特性

### 🎯 核心特性

- ✅ **分层架构** - 清晰的 DDD 分层设计
- ✅ **类型安全** - Rust 后端 + TypeScript 前端
- ✅ **异步优先** - 基于 Tokio 的高性能处理
- ✅ **API 文档** - 自动生成 OpenAPI/Swagger 文档
- ✅ **认证授权** - JWT Token + Bcrypt 密码加密
- ✅ **桌面应用** - Tauri 集成，跨平台支持
- ✅ **现代 UI** - Next.js 15 + HeroUI + Tailwind CSS

### 📚 媒体管理特性

- **漫画管理** - 完整的漫画库管理和阅读功能
  - 混合模式扫描（单文件夹 + 章节结构）
  - 智能标题提取（自动移除中括号标记）
  - 章节管理和导航
  - 多种阅读模式（单页、双页、滑动）
  - 在线阅读器优化
- **游戏管理** - 游戏库管理和启动功能
  - 使用自制[gamebox](https://github.com/SuperToolman/gamebox)游戏元数据库
  - 自动扫描和索引
  - 元数据自动识别（IGDB、DLsite、SteamDB）
  - 游戏启动和配置管理
- **媒体库** - 灵活的媒体库组织方式
- **智能扫描** - 自动扫描和索引本地文件
- **标签系统** - 标签和分类管理
- **收藏功能** - 标记喜爱的内容

### 🖼️ 图片处理特性

- **自动缩略图生成** - 使用 Image 库自动生成多种尺寸的缩略图（100x100、300x300、600x600、或自定义）
- **格式转换** - 支持 JPEG、PNG、WebP 等多种格式的自动转换和优化
- **元数据提取** - 自动提取图片的 EXIF 信息、尺寸、色彩空间等元数据
- **流式传输** - HTTP Range 支持，断点续传、部分内容请求
- **渐进式加载** - 先加载缩略图，再后台加载高质量原图
- **智能缓冲区管理** - 内存池 + 流式处理，支持超大文件传输

### 🚀 智能缓存系统

- **多层缓存** - Moka 异步缓存库 + 磁盘存储，减少数据库查询
- **智能预加载** - 基于 LRU 算法预测用户行为，提前加载下一张图片
- **可配置策略** - 支持自定义 TTL 和缓存大小限制
- **缓存统计** - 实时收集缓存命中率、缓存大小等指标

### 🔐 安全性特性

- **JWT 认证** - HS256 算法 + 24小时过期机制
- **Bcrypt 密码加密** - 成本因子 12，强大的密码安全保护
- **CORS 配置** - 灵活的跨域资源共享配置
- **输入验证** - Serde + 自定义验证器确保 API 输入合法性
- **速率限制** - 基于令牌桶算法，防止 API 滥用

### ⚡ 性能亮点

#### 后端性能
- **内存占用**: ~50-100MB（远低于 Java 应用）
- **启动时间**: <1s
- **并发连接**: 10,000+
- **请求延迟**: <50ms
- **吞吐量**: 5,000+ req/s
- **CPU 占用**: 低（异步 I/O）

#### 前端性能
- **首屏加载**: <2s
- **图片加载**: 渐进式
- **缓存策略**: 30天
- **包体积**: ~200KB
- **Lighthouse**: 90+

#### 数据库性能
- **查询**: <10ms
- **分页**: <50ms
- **索引**: 优化
- **并发**: 支持（SQLite WAL）

#### 优化技术
- 异步 I/O（Tokio）
- 连接池
- 多层缓存
- 流式传输
- CDN 友好
- Gzip 压缩
- 数据库索引优化

## 🔄 与其他方案对比

| 特性 | Modream | Plex | Emby | Jellyfin | Elfilm |
|------|---------|------|------|----------|--------|
| **开源** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **资源占用** | 极低 | 中等 | 中等 | 中等 | 低 |
| **性能** | 优异 | 良好 | 良好 | 良好 | 良好 |
| **易用性** | 简单 | 简单 | 中等 | 中等 | 中等 |
| **可扩展性** | 优秀 | 一般 | 一般 | 优秀 | 一般 |
| **漫画支持** | 专业 | 无 | 无 | 无 | 支持 |
| **Web UI** | 现代 | 传统 | 传统 | 传统 | 现代 |
| **定制开发** | 容易 | 困难 | 困难 | 中等 | 中等 |

**为什么选择 Modream？**
- 轻量级：内存占用极低，适合低配置服务器
- 高性能：异步优先，支持高并发
- 易定制：清晰的 DDD 架构
- 现代化：最新技术栈
- 完全开源：代码完全开放
- 专注漫画：针对漫画内容优化

## 🛠️ 技术栈

### 后端 (Rust)
- **Web**: Axum 0.8.6
- **ORM**: SeaORM 2.0.0-rc.13
- **运行时**: Tokio 1.48.0
- **日志**: Tracing 0.1.41
- **API 文档**: Utoipa 5.4.0
- **认证**: JWT + Bcrypt
- **缓存**: Moka 0.12
- **图片**: Image 0.24
- **游戏元数据**: Gamebox 0.1.1

### 前端 (TypeScript/Next.js)
- **框架**: Next.js 15.3.1
- **UI**: HeroUI 2.8.5
- **样式**: Tailwind CSS 4.1.11
- **动画**: Framer Motion 11.18.2
- **主题**: next-themes 0.4.6
- **HTTP**: Axios 1.11.0
- **桌面**: Tauri 2.7.0

### 数据库
- **SQLite** - 轻量级，支持 JSON
- **SeaORM** - 类型安全 ORM

## � 项目结构

```
modream/
├── Cargo.toml                    # Workspace 配置
├── application.yaml              # 应用配置
├── DEPLOYMENT_GUIDE.md           # 部署指南
├── crates/                       # Rust 代码
│   ├── application/              # 应用层（服务、DTO）
│   ├── domain/                   # 领域层（实体、仓储接口）
│   ├── infrastructure/           # 基础设施层（数据库、文件扫描）
│   ├── interfaces/               # 接口层（API 端点）
│   ├── shared/                   # 共享模块（配置、日志）
│   └── desktop/                  # 桌面应用（Tauri + WebAPI 集成）
│       ├── src/
│       │   ├── main.rs           # 统一入口（支持三种启动模式）
│       │   ├── lib.rs            # Tauri 逻辑
│       │   └── server.rs         # WebAPI 启动逻辑
│       └── tauri.conf.json       # Tauri 配置
└── web/                          # Next.js 前端
    ├── package.json
    ├── app/                      # Next.js 应用路由
    ├── components/               # React 组件
    ├── lib/                      # 工具函数和 API 客户端
    └── public/                   # 静态资源
```

**架构特点**：
- **DDD 分层架构** - 清晰的职责分离
- **Cargo Workspace** - 统一的依赖管理
- **模块化设计** - 易于扩展和维护
- **前后端分离** - `crates/` 存放 Rust 代码，`web/` 存放前端代码

## �🚀 快速开始

### 前置要求
- Rust 1.70+
- Node.js 18+ 和 pnpm
- SQLite

### 方式 1：桌面应用模式（推荐）

**一键启动桌面应用 + WebAPI**

```bash
# 1. 克隆项目
git clone <repo>
cd modream

# 2. 编译前端
cd web
pnpm install
pnpm run build

# 3. 启动桌面应用（自动启动 WebAPI）
cd ..
cargo run --bin desktop
```

**访问**：
- 桌面应用会自动打开
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui

### 方式 2：开发模式

**分离启动前后端（适合开发调试）**

```bash
# 终端 1：启动 WebAPI
cargo run --bin desktop -- --server

# 终端 2：启动前端开发服务器
cd web
pnpm install
pnpm run dev

# 终端 3：启动桌面应用（可选）
cargo run --bin desktop -- --gui
```

**访问**：
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui
- Web: http://localhost:3000

### 方式 3：服务器模式

**只启动 WebAPI（适用于 Linux 服务器、Docker）**

```bash
# 编辑配置文件
nano application.yaml
# 设置 server.mode: server

# 启动服务
cargo run --bin desktop
# 或使用命令行参数
cargo run --bin desktop -- --server
```

**访问**：
- API: http://0.0.0.0:8080（可从其他设备访问）
- Swagger: http://0.0.0.0:8080/swagger-ui

### API 使用

Modream 提供完整的 RESTful API，你可以根据这些 API 来高度定制自己的服务。

- **Swagger UI**: http://localhost:8080/swagger-ui - 在线 API 文档和测试工具
- **详细文档**: 查看 [API.md](API.md) 了解完整的 API 使用指南

## 📦 部署指南

Modream 支持三种灵活的部署模式，详见 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)：

### 🖥️ 桌面应用部署

```bash
# 编译发布版本
cargo build --release --bin desktop

# 运行（默认 desktop 模式）
./target/release/desktop
```

### 🐧 Linux 服务器部署

**使用 systemd**：

```ini
# /etc/systemd/system/modream.service
[Unit]
Description=Modream Media Library Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/opt/modream
ExecStart=/opt/modream/desktop
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable modream
sudo systemctl start modream
```

### 🐳 Docker 部署

```bash
docker build -t modream .
docker run -d -p 8080:8080 -v /path/to/data:/data modream
```

### ⚙️ 配置文件

编辑 `application.yaml` 控制启动模式：

```yaml
server:
  mode: desktop  # desktop | server | gui
  auto_start_api: true
  port: 8080
```

**更多详情**：查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 相关文档

### 中文文档
- **[API 文档](docs/zh-CN/API.md)** - 完整的 API 使用指南和接口说明
- **[开发指南](docs/zh-CN/DEVELOPMENT.md)** - 开发环境搭建、代码规范、贡献指南
- **[更新日志](CHANGELOG.md)** - 版本历史和功能更新记录
- **[安全指南](docs/zh-CN/SECURITY.md)** - 安全配置和最佳实践

### English Documentation
- **[API Documentation](docs/en/API.md)** - Complete API usage guide and interface documentation
- **[Development Guide](docs/en/DEVELOPMENT.md)** - Development setup, code standards, and contribution guide
- **[Changelog](CHANGELOG.en.md)** - Version history and feature updates
- **[Security Guide](docs/en/SECURITY.md)** - Security configuration and best practices

⚠️ **生产环境安全提示**:
- 修改 JWT_SECRET 为强随机字符串
- 配置 CORS 白名单，限制允许的来源
- 启用 HTTPS 加密传输
- 使用环境变量管理敏感配置