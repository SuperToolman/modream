# 📝 更新日志

所有重要的项目变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased] - 2025-11-02

### 📚 文档和配置管理改进

#### 新增

- ✅ **配置管理 API** - 完整的配置文件读写接口
  - `GET /api/config` - 读取完整的 `application.yaml` 配置
  - `PUT /api/config` - 修改 `application.yaml` 配置（需重启服务）
  - `GET /api/config/gamebox` - 读取 Gamebox 配置（包含 igdb、dlsite、steamdb）
  - `PUT /api/config/gamebox` - 更新 Gamebox 配置提示
  - 所有配置接口统一归类到 `config` tag
  - 添加 `serde_yaml` 依赖用于 YAML 文件处理

- ✅ **DDD 架构开发流程文档** - 完整的开发指南
  - 在 `docs/DEPLOYMENT_GUIDE.md` 中添加 "DDD 架构开发流程" 章节
  - 以 Video 模块为例，详细讲解从 Domain 到 Interfaces 的完整开发流程
  - 包含实体定义、仓储接口、服务实现、API 处理器等完整代码示例
  - 涵盖数据库迁移、依赖注入、测试等关键步骤
  - 强调 DDD 开发的关键原则（自下而上、依赖倒置、单一职责等）

#### 改进

- ✅ **文档组织优化** - 统一文档管理
  - 将 `CHANGELOG.md` 移动到 `docs/CHANGELOG.md`
  - 将 `README.en.md` 移动到 `docs/README.en.md`
  - 更新 `README.md` 中的文档引用链接
  - 简化项目根目录结构
  - 所有文档统一放在 `docs/` 目录下

- ✅ **Gamebox 配置 DTO 完善** - 返回完整配置
  - 扩展 `GameboxConfigResponse` 包含 `dlsite` 和 `steamdb` 配置
  - 添加 `DlsiteConfigResponse` 和 `SteamdbConfigResponse` DTO
  - 添加 `UpdateDlsiteConfigRequest` 和 `UpdateSteamdbConfigRequest` DTO
  - 更新 Swagger 文档包含所有新增的 Schema

---

## [0.4.2] - 2025-11-02

### � 开发体验优化

#### 改进

- ✅ **启动脚本优化** - 单窗口运行所有服务
  - 优化 `start-dev.ps1` - 使用 `Start-Job` 在后台运行服务
  - 不再打开多个 PowerShell 窗口
  - 日志输出到 `logs/` 目录（`backend.log` 和 `frontend.log`）
  - 按 `Ctrl+C` 自动停止所有服务
  - 自动启动 Tauri 桌面窗口（加载开发服务器）
  - 支持前端热重载

- ✅ **脚本简化** - 移除冗余脚本
  - 移除 `start-dev.sh` 和 `stop-dev.sh`（Linux/Mac）
  - 只保留 `start-dev.ps1`（Windows）
  - 简化项目结构

- ✅ **README 更新** - 反映最新的启动方式
  - 更新快速开始指南
  - 说明单窗口运行的优势
  - 更新启动方式对比表格

---

## [0.4.1] - 2025-11-02

### 📚 文档和开发体验改进

#### 新增

- ✅ **开发启动脚本** - 一键启动开发环境
  - `start-dev.ps1` - Windows PowerShell 脚本
  - 自动检查环境依赖（Rust、Node.js、pnpm）
  - 自动启动后端 API 和前端开发服务器
  - 支持热重载和独立调试

- ✅ **文档组织优化** - 创建 `docs/` 目录
  - `docs/ARCHITECTURE.md` - 详细的架构设计说明
  - `docs/DEPLOYMENT_GUIDE.md` - 部署指南（从根目录移动）
  - 说明前后端解耦的设计理念
  - 解释为什么不使用 `pnpm run tauri dev`

#### 改进

- ✅ **README 优化** - 更清晰的架构说明
  - 添加架构设计章节，说明 DDD 分层和前后端解耦
  - 更新快速开始指南，推荐使用启动脚本
  - 添加启动方式对比表格
  - 说明动态路由不支持静态导出的原因

- ✅ **前端配置修正** - Next.js 配置
  - 移除静态导出配置（`output: 'export'`）
  - 支持动态路由（`/mangas/[id]`, `/games/[id]` 等）
  - 启用图片优化
  - 修复 `useAuth` hook 的 `useSearchParams` 兼容性问题

- ✅ **类型定义修复** - Zod v4 兼容性
  - 修复 `z.record()` 参数错误（需要 2-3 个参数）
  - `web/types/dto/media_library.dto.ts` 中的类型定义

#### 架构说明

本项目采用**前后端完全解耦**的架构设计：

- **后端**：`crates/` 目录，DDD 分层架构（domain, application, infrastructure, interfaces, shared）
- **前端**：`web/` 目录，Next.js + React，完全独立
- **优势**：可以单独开发、测试、部署；支持多种启动模式；团队协作友好

**为什么不使用 `pnpm run tauri dev`？**

Tauri CLI 期望前后端紧密耦合的目录结构，而我们故意选择了解耦架构，以获得：
- ✅ 更大的灵活性（可以单独部署 API、桌面应用、Web 应用）
- ✅ 更清晰的代码组织（DDD 分层）
- ✅ 更适合团队协作（前后端分离）

详见 [架构设计说明](docs/ARCHITECTURE.md)。

---

## [0.4.0] - 2025-11-02

### 🏗️ 架构重构 - Workspace 扁平化

本次更新是一个**重大架构重构**，将项目从嵌套结构重构为扁平化 Workspace 结构，并实现了 Tauri 桌面应用与 WebAPI 的深度集成。

#### 核心变更

- ✅ **目录结构重构** - 扁平化 Workspace 结构
  - 所有 Rust 代码移动到 `crates/` 目录
  - 所有前端代码移动到 `web/` 目录
  - 移除 `tauri-app/src-tauri/` 嵌套结构
  - 使用 `git mv` 保留完整的文件历史

- ✅ **统一入口实现** - 三种启动模式
  - **Desktop 模式**（默认）：自动启动 WebAPI + Tauri 桌面窗口
  - **Server 模式**（`--server`）：只启动 WebAPI，适用于 Linux 服务器、Docker 部署
  - **GUI 模式**（`--gui`）：只启动桌面窗口，假设 API 已在其他地方运行

- ✅ **配置文件控制** - 灵活的启动模式配置
  - 在 `application.yaml` 中配置默认启动模式
  - 命令行参数优先级高于配置文件
  - 支持 `auto_start_api` 开关

#### 新增文件

- `crates/desktop/src/main.rs` - 统一入口，支持三种启动模式
- `crates/desktop/src/server.rs` - WebAPI 启动逻辑
- `crates/interfaces/src/lib.rs` - 导出公共模块
- `DEPLOYMENT_GUIDE.md` - 详细的部署指南

#### 目录结构变更

**重构前**：
```
modream/
├── application/
├── domain/
├── infrastructure/
├── interfaces/
├── shared/
└── tauri-app/
    ├── app/
    ├── components/
    └── src-tauri/
```

**重构后**：
```
modream/
├── crates/                       # Rust 代码
│   ├── application/              # 应用层
│   ├── domain/                   # 领域层
│   ├── infrastructure/           # 基础设施层
│   ├── interfaces/               # 接口层（WebAPI）
│   ├── shared/                   # 共享模块
│   └── desktop/                  # Tauri 桌面应用
└── web/                          # Next.js 前端
    ├── app/
    └── components/
```

#### 配置文件更新

- ✅ **application.yaml** - 添加启动模式配置
  ```yaml
  server:
    mode: desktop  # desktop | server | gui
    auto_start_api: true
  ```

- ✅ **Cargo.toml** - 更新 workspace members
  ```toml
  [workspace]
  members = [
     "crates/application",
     "crates/domain",
     "crates/infrastructure",
     "crates/interfaces",
     "crates/shared",
     "crates/desktop",
  ]
  ```

- ✅ **crates/desktop/Cargo.toml** - 集成 WebAPI 依赖
  - 添加 `interfaces`、`application`、`shared` 依赖
  - 添加 `[[bin]]` 配置
  - 重命名包名为 `desktop`

#### 启动方式

**1. 桌面应用模式（默认）**
```bash
cargo run --bin desktop
# 或
./target/release/desktop.exe
```
**行为**：自动启动 WebAPI（http://localhost:8080）+ 打开桌面窗口

**2. 纯服务器模式**
```bash
cargo run --bin desktop -- --server
# 或
./target/release/desktop.exe --server
```
**行为**：只启动 WebAPI（http://0.0.0.0:8080），可从其他设备访问

**3. 纯桌面模式**
```bash
cargo run --bin desktop -- --gui
# 或
./target/release/desktop.exe --gui
```
**行为**：只启动桌面窗口（假设 API 已在其他地方运行）

#### 部署场景

- ✅ **Windows/macOS 桌面应用** - Desktop 模式，一键启动
- ✅ **Linux 服务器** - Server 模式，systemd 服务
- ✅ **Docker 容器** - Server 模式，容器化部署
- ✅ **开发调试** - GUI 模式，API 和前端分离调试

#### 技术改进

- ✅ **日志系统优化** - 修复重复初始化问题
- ✅ **模块可见性** - 导出 `interfaces::api` 和 `interfaces::app` 模块
- ✅ **配置系统增强** - 添加 `ServerMode` 枚举和相关配置
- ✅ **Git 历史保留** - 使用 `git mv` 保留完整的文件移动历史

#### 文档更新

- ✅ **DEPLOYMENT_GUIDE.md** - 新增详细的部署指南
  - 三种启动模式说明
  - systemd 服务配置示例
  - Docker 部署示例
  - 配置文件说明

- ✅ **README.md** - 更新项目文档
  - 添加"项目结构"章节
  - 更新"快速开始"章节
  - 添加"部署指南"章节

#### Bug 修复

- ✅ 修复日志系统重复初始化导致的 panic
- ✅ 修复 Tauri 配置文件路径问题

#### 版本号更新

- ✅ 所有 crates 版本号从 `0.1.0` 或 `0.3.4` 更新到 `0.4.0`
- ✅ 更新内部依赖版本号

#### 统计

- **移动文件**: 230+ 个（使用 `git mv` 保留历史）
- **新增文件**: 3 个
- **修改文件**: 10+ 个
- **代码行数**: 200+ 行（新增）
- **功能模块**: 架构重构、启动模式、配置管理、部署指南

#### 破坏性变更 ⚠️

- **目录结构变更** - 所有 Rust 代码路径从根目录移动到 `crates/` 子目录
- **前端代码路径变更** - 从 `tauri-app/` 移动到 `web/`
- **启动命令变更** - 从 `cargo run --bin interfaces` 改为 `cargo run --bin desktop`
- **配置文件新增字段** - `application.yaml` 新增 `server.mode` 和 `server.auto_start_api` 字段

#### 迁移指南

如果你从 v0.3.x 升级到 v0.4.0：

1. **拉取最新代码**
   ```bash
   git pull origin main
   ```

2. **更新配置文件** - 在 `application.yaml` 中添加：
   ```yaml
   server:
     mode: desktop
     auto_start_api: true
   ```

3. **重新编译**
   ```bash
   cargo build --release --bin desktop
   ```

4. **更新启动脚本** - 将 `cargo run --bin interfaces` 改为 `cargo run --bin desktop`

---

## [0.3.4] - 2025-10-31

### 🎨 用户体验优化

#### 漫画阅读器优化
- ✅ **滑动阅读模式** - 无缝图片连接
  - 移除图片间距（`gap-4` → 无间距）
  - 移除阴影和圆角效果（`shadow-lg rounded-lg` → 无装饰）
  - 实现类似真实漫画书的无缝阅读体验
- ✅ **分页模式** - 固定容器宽度，避免翻页跳动
  - 单页模式：容器宽度固定 100%，图片宽度自适应（`w-auto`）
  - 双页模式：左右两页宽度固定 1:1（各 50vw），图片宽度自适应
  - 翻页时容器不再变化，阅读体验更流畅
- ✅ **控制栏显示逻辑** - 简化控制栏逻辑
  - 移除自动隐藏/显示逻辑（约 100+ 行代码）
  - 控制栏始终显示，用户可随时操作
  - 简化代码，提升稳定性

### 🐛 Bug 修复
- ✅ **修复双页模式第一页图片位置异常** - 第一页图片现在正确居中显示
  - 修改前：第一页图片会移动到右侧
  - 修改后：第一页图片居中显示，第二页及以后左右两页正常贴合

### **布局优化**
- **响应式布局** - 优化阅读器布局以适应不同屏幕尺寸
- **控制栏优化** - 优化控制栏布局和交互
- **漫画内容页** - 优化漫画内容页布局
- **漫画详细页** - 优化漫画列表页布局
- **漫画阅读页** - 优化漫画阅读页布局


### 🛠️ 技术改进
- 修改 `ScrollView.tsx`：移除图片间距和装饰效果
- 修改 `SinglePageView.tsx`：固定容器宽度，图片宽度自适应
- 修改 `DoublePageView.tsx`：固定左右两页宽度，动态调整对齐方式
- 修改 `page.tsx`：移除控制栏自动隐藏逻辑
- 修改 `ReadingControls.tsx`：移除鼠标事件处理

---

## [0.3.3] - 2025-10-31

### 🚀 性能优化

#### 图片路径存储优化
- ✅ **减少存储空间 73-80%** - 优化图片路径存储策略
  - 修改前：存储完整路径（`G:\Manga2\漫画名\0001.jpg`，约 30-40 字符）
  - 修改后：只存储文件名（`0001.jpg`，约 8 字符）
  - 读取时动态拼接完整路径（`Manga.path` + 文件名）
- ✅ **数据库持久化** - 将图片路径列表存储到数据库
  - 添加 `ImagePaths` 字段到 `Manga` 和 `MangaChapter` 表（TEXT 类型，JSON 格式）
  - 创建时自动保存图片路径列表
  - 读取时优先从数据库获取，避免重复扫描文件夹
  - 向后兼容：旧数据自动降级到扫描文件夹
- ✅ **性能提升 100-250 倍** - 图片列表获取速度
  - 扫描文件夹：200-500ms（1000 张图片）
  - 数据库读取：1-5ms（1000 张图片）
  - 重启服务后仍然有效（数据持久化）

#### 技术实现
- 修改 `infrastructure/src/file_scanner/scan_by_manga.rs`：只返回文件名
- 修改 `application/src/image_service.rs`：读取时拼接完整路径
- 修改 `domain/src/entity/manga.rs` 和 `manga_chapter.rs`：添加 `image_paths` 字段和业务方法
- 修改 `infrastructure/src/repository/`：所有 CRUD 方法支持 `image_paths` 字段
- 修改 `application/src/media_library_service.rs`：创建时保存图片路径到数据库

#### 空间节省效果
- 非章节漫画（200 张图片）：6 KB → 1.6 KB（节省 73%）
- 章节漫画（27 章 × 200 张）：216 KB → 43 KB（节省 80%）
- 大型媒体库（1000 个漫画 × 500 张）：15 MB → 4 MB（节省 73%）

---

## [0.3.0] - 2025-10-31

### 📚 漫画章节功能上线

本次更新实现了完整的漫画章节管理系统，支持混合模式扫描（单文件夹 + 章节结构）。

#### 核心功能
- ✅ **章节实体和仓储** - 完整的章节领域模型（`domain/src/entity/manga_chapter.rs`）
- ✅ **混合模式扫描** - 支持两种漫画组织方式（`infrastructure/src/file_scanner/manga_scanner.rs`）
  - 单文件夹漫画：图片直接放在漫画文件夹中
  - 章节结构漫画：每个章节一个子目录（支持"第1话"、"Chapter 1"等多种命名模式）
- ✅ **智能标题提取** - 改进的标题提取逻辑（`domain/src/service/manga_service.rs`）
  - 自动移除所有中括号及其内容（作者、翻译组标记）
  - 智能截断超长标题（超过 200 字符自动截断）
  - 示例：`[超勇汉化组] [むりぽよ] 标题 [中国翻译]` → `标题`
- ✅ **章节 API** - RESTful API 端点（`interfaces/src/api/manga_chapter.rs`）
  - `GET /api/manga_chapter/{manga_id}/chapters` - 获取漫画章节列表
  - `GET /api/manga_chapter/{manga_id}/cover` - 获取章节漫画封面（第一章第一张图）
  - `GET /api/manga_chapter/{manga_id}/{chapter_id}/images` - 获取章节图片列表
  - `GET /api/manga_chapter/{manga_id}/{chapter_id}/images/{idx}` - 获取章节指定图片
- ✅ **章节服务** - 章节业务逻辑和应用服务（`application/src/manga_chapter_service.rs`）

#### 前端功能
- ✅ **章节选择器组件** - 章节切换组件（`tauri-app/app/(main)/content/mangas/[id]/read/components/ChapterSelector.tsx`）
  - 上一章/下一章按钮
  - 章节下拉选择器
  - URL 参数同步
- ✅ **漫画阅读器增强** - 支持章节导航（`tauri-app/app/(main)/content/mangas/[id]/read/page.tsx`）
  - 自动检测漫画是否有章节
  - 章节切换时自动跳转到第一页
  - URL 参数管理（`?chapter=1`）
- ✅ **漫画详情页增强** - 显示章节列表（`tauri-app/app/(main)/content/mangas/[id]/page.tsx`）
  - 章节结构漫画显示章节列表
  - 单文件夹漫画显示总页数
- ✅ **章节 API 客户端** - TypeScript API 封装（`tauri-app/lib/api/manga-chapters.ts`）

#### 数据库迁移
- ✅ **章节表** - 完整的章节数据表结构
  - 基本信息（标题、章节号、页数）
  - 关联信息（漫画 ID）
  - 文件信息（路径、字节大小）
  - 时间戳（创建时间、更新时间）

#### 技术改进
- ✅ **聚合根增强** - `MediaLibraryAggregate` 支持章节管理
  - `add_manga_with_chapters()` - 添加带章节的漫画
  - 自动计算总页数和总字节大小
- ✅ **图片服务增强** - 支持章节图片缓存（`application/src/image_service.rs`）
  - `get_chapter_images()` - 获取章节图片列表（带缓存）
  - 独立的章节图片缓存（Moka）
- ✅ **类型安全** - 完整的 TypeScript 类型定义
  - `MangaChapter` 接口
  - `OptimizedChapterImageListResponse` 接口

#### Bug 修复
- ✅ 修复漫画类型验证错误（空字符串 → "漫画"）
- ✅ 修复标题长度验证错误（改进标题提取逻辑）
- ✅ 修复章节漫画封面显示问题（自动检测章节结构）
- ✅ 添加调试日志以追踪标题提取过程

#### 统计
- **新增文件**: 7 个
- **修改文件**: 20+ 个
- **代码行数**: 1500+ 行
- **功能模块**: 章节管理、混合模式扫描、智能标题提取

---

## [0.2.0] - 2025-10-30

### 🎮 游戏管理功能上线

本次更新是一个大型功能更新，完整实现了游戏管理系统，包括前后端完整功能。

#### 核心功能
- ✅ **游戏实体和仓储** - 完整的游戏领域模型（`domain/src/entity/game.rs`）
- ✅ **游戏服务** - 游戏业务逻辑和应用服务（`application/src/game_service.rs`）
- ✅ **游戏 API** - RESTful API 端点（`interfaces/src/api/game.rs`）
  - `GET /api/games` - 获取游戏列表
  - `GET /api/games/{id}` - 获取游戏详情
  - `POST /api/games/{id}/launch` - 启动游戏
  - `PUT /api/games/{id}/default-start-path` - 设置默认启动路径
- ✅ **游戏扫描器** - 自动扫描游戏文件夹（`infrastructure/src/file_scanner/scan_by_game.rs`）
- ✅ **元数据刮削** - 集成 gamebox 库，支持多个游戏数据库
  - IGDB（需要 API 凭证）
  - DLsite（无需配置）
  - SteamDB（无需配置）

#### 前端功能
- ✅ **游戏卡片组件** - 精美的游戏卡片展示（`tauri-app/components/cards/game-card.tsx`）
  - 默认封面支持
  - 标题固定 2 行高度
  - 悬停显示开发商/发行商（带渐变阴影）
  - 悬停 2 秒后轮播封面
- ✅ **游戏列表页** - 游戏库浏览页面（`tauri-app/app/(main)/content/games/page.tsx`）
- ✅ **游戏详情页** - Steam 风格的详情页（`tauri-app/app/(main)/content/games/[id]/page.tsx`）
  - 大型封面展示（带标题渐变阴影）
  - 截图轮播和预览
  - 游戏描述和详细信息
  - 标签、平台、开发商等元数据
  - 启动游戏按钮
  - 启动路径选择和配置
- ✅ **游戏 API 客户端** - TypeScript API 封装（`tauri-app/lib/api/games.ts`）

#### 配置管理系统
- ✅ **Gamebox 配置** - 游戏数据库提供者配置（`shared/src/config/gamebox.rs`）
  - IGDB API 凭证配置
  - 启用/禁用提供者
- ✅ **配置 API** - 配置管理端点（`interfaces/src/api/config.rs`）
  - `GET /api/config/gamebox` - 获取配置
  - `PUT /api/config/gamebox` - 更新配置
- ✅ **配置页面** - 前端配置界面（`tauri-app/app/(main)/setting/general/page.tsx`）
  - 显示 IGDB 配置状态
  - 显示脱敏的 Client ID
  - 配置说明和示例

#### 游戏启动功能
- ✅ **跨平台启动** - 支持 Windows、macOS、Linux
  - Windows: `cmd /C start`
  - macOS: `open`
  - Linux: `xdg-open`
- ✅ **Tauri 集成** - 桌面应用游戏启动命令（`tauri-app/src-tauri/src/lib.rs`）
- ✅ **启动路径管理** - 支持多个可执行文件，可设置默认启动路径

#### 媒体库增强
- ✅ **游戏媒体库** - 支持创建游戏类型的媒体库
- ✅ **聚合根增强** - `MediaLibraryAggregate` 支持游戏管理
  - `add_games_from_game_info_batch()` - 批量添加游戏
  - 保留完整的游戏元数据（JSON 格式）
- ✅ **媒体库表单** - 前端支持游戏库配置
  - 游戏数据库提供者选择
  - 多路径扫描支持

#### 数据库迁移
- ✅ **游戏表** - 完整的游戏数据表结构（`migrations/`）
  - 基本信息（标题、描述、开发商、发行商）
  - 元数据（标签、平台、发行日期、版本）
  - 媒体资源（封面、截图、视频）
  - 启动配置（启动路径、默认路径）
  - 文件信息（路径、大小、格式化大小）

#### 技术改进
- ✅ **DDD 架构完善** - 严格遵循领域驱动设计
  - Domain 层：游戏实体、仓储接口、领域服务
  - Application 层：游戏应用服务、DTO
  - Infrastructure 层：游戏仓储实现、文件扫描器
  - Interfaces 层：游戏 API 端点
- ✅ **类型安全** - 完整的 TypeScript 类型定义（`tauri-app/types/dto/game.dto.ts`）
- ✅ **错误处理** - 完善的错误处理和日志记录
- ✅ **配置系统** - 灵活的 YAML 配置支持

#### 文档
- ✅ **设计文档** - 媒体库配置设计文档（`docs/media-library-config-design.md`）
- ✅ **README 更新** - 更新项目说明和功能列表

#### Bug 修复
- ✅ 修复默认封面路径问题（复制到 `public/assets/image/`）
- ✅ 修复 Tauri 配置文件 JSON 注释问题
- ✅ 修复配置文件键名不匹配问题（`game_providers` → `gamebox`）
- ✅ 修复前端 API 响应解析问题

#### 统计
- **新增文件**: 15+ 个
- **修改文件**: 40+ 个
- **代码行数**: 3000+ 行
- **功能模块**: 游戏管理、配置管理、文件扫描、元数据刮削

---

## [0.1.0] - 2025-10-27

### 🎉 初始版本

- ✅ 基础架构搭建（DDD 分层架构）
- ✅ 用户认证系统（JWT + Bcrypt）
- ✅ 漫画管理功能
- ✅ 媒体库管理
- ✅ 图片处理和缓存
- ✅ Next.js + Tauri 前端
- ✅ Swagger API 文档

---

**格式说明**：
- 🚀 性能优化
- ✨ 新功能
- 🐛 Bug 修复
- 📚 文档更新
- 🔧 技术改进
- 🗄️ 数据库变更

