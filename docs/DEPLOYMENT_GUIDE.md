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
pnpm install
cd ..

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

## 📝 总结

- **个人使用**：使用 `desktop` 模式，一键启动
- **服务器部署**：使用 `server` 模式，配合 systemd 或 Docker
- **开发调试**：使用 `gui` 模式，分离前后端
- **灵活切换**：通过配置文件或命令行参数随时切换模式

