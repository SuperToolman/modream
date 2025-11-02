# Rust 后端缓存配置指南

## 问题分析

你的图片每次都重新请求的原因：

1. **后端没有设置 Cache-Control 响应头**
2. **浏览器不知道图片可以缓存**
3. **每次请求都是全新的 HTTP 请求**

---

## 解决方案

### 方案 1：在 Rust 后端添加缓存头（推荐）

#### 使用 Actix-web 框架

```rust
use actix_web::{web, HttpResponse, middleware};
use std::path::PathBuf;

// 添加缓存中间件
pub fn configure_cache_middleware(cfg: &mut web::ServiceConfig) {
    cfg.wrap(middleware::DefaultHeaders::new()
        .add(("Cache-Control", "public, max-age=2592000")) // 30 天
        .add(("ETag", "W/\"123\""))
    );
}

// 图片服务端点
#[get("/api/manga/{id}/cover")]
async fn get_manga_cover(id: web::Path<u32>) -> HttpResponse {
    let file_path = format!("./covers/{}.jpg", id);
    
    // 读取文件
    match std::fs::read(&file_path) {
        Ok(data) => {
            HttpResponse::Ok()
                // 设置缓存头
                .insert_header(("Cache-Control", "public, max-age=2592000"))
                .insert_header(("Content-Type", "image/jpeg"))
                .insert_header(("ETag", format!("\"{}\"", id)))
                .body(data)
        }
        Err(_) => HttpResponse::NotFound().finish(),
    }
}

// 在 main.rs 中配置
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::DefaultHeaders::new()
                .add(("Cache-Control", "public, max-age=2592000"))
            )
            .service(get_manga_cover)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

#### 使用 Axum 框架

```rust
use axum::{
    http::header,
    response::IntoResponse,
    Router,
};

async fn get_manga_cover(id: u32) -> impl IntoResponse {
    let file_path = format!("./covers/{}.jpg", id);
    
    match std::fs::read(&file_path) {
        Ok(data) => {
            (
                [
                    (header::CACHE_CONTROL, "public, max-age=2592000"),
                    (header::CONTENT_TYPE, "image/jpeg"),
                    (header::ETAG, &format!("\"{}\"", id)),
                ],
                data,
            )
                .into_response()
        }
        Err(_) => "Not Found".into_response(),
    }
}
```

#### 使用 Rocket 框架

```rust
use rocket::response::content::RawJpeg;
use rocket::http::Header;

#[get("/api/manga/<id>/cover")]
fn get_manga_cover(id: u32) -> Option<RawJpeg<Vec<u8>>> {
    let file_path = format!("./covers/{}.jpg", id);
    std::fs::read(&file_path).ok().map(RawJpeg)
}

// 在响应中添加缓存头
#[get("/api/manga/<id>/cover")]
fn get_manga_cover_with_cache(id: u32) -> Option<(Header<'static>, RawJpeg<Vec<u8>>)> {
    let file_path = format!("./covers/{}.jpg", id);
    std::fs::read(&file_path).ok().map(|data| {
        (
            Header::new("Cache-Control", "public, max-age=2592000"),
            RawJpeg(data),
        )
    })
}
```

---

### 方案 2：使用 CDN 或静态文件服务

#### 配置 Nginx 反向代理

```nginx
server {
    listen 8080;
    server_name localhost;

    # 图片缓存配置
    location /api/manga/ {
        proxy_pass http://backend:8080;
        
        # 设置缓存头
        proxy_cache_valid 200 30d;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        
        # 添加缓存状态头
        add_header X-Cache-Status $upstream_cache_status;
        add_header Cache-Control "public, max-age=2592000";
        add_header ETag "W/\"$request_uri\"";
    }

    # 静态文件直接服务
    location /covers/ {
        alias /data/covers/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

---

### 方案 3：前端浏览器缓存（已实现）

前端已经实现了内存缓存和浏览器缓存：

```typescript
// 1. 内存缓存（7 天）
const imageCache = new Map<string, { data: Blob; timestamp: number }>();

// 2. 浏览器缓存（由 Cache-Control 头控制）
// 3. Service Worker 缓存（可选）
```

---

## 推荐配置

### 缓存策略

| 资源类型 | Cache-Control | 说明 |
|---------|---------------|------|
| 图片 | `public, max-age=2592000` | 30 天 |
| 视频 | `public, max-age=2592000` | 30 天 |
| API 数据 | `no-cache, must-revalidate` | 不缓存 |
| HTML | `no-cache, must-revalidate` | 不缓存 |
| CSS/JS | `public, max-age=31536000` | 1 年 |

### 完整的 Cache-Control 头

```
Cache-Control: public, max-age=2592000, immutable
```

- `public` - 可以被任何缓存存储
- `max-age=2592000` - 缓存 30 天
- `immutable` - 内容永不改变

---

## 验证缓存是否生效

### 方法 1：使用 Chrome DevTools

1. 打开 Chrome DevTools → Network
2. 刷新页面
3. 查看图片请求的 Response Headers
4. 查看是否有 `Cache-Control` 头

### 方法 2：使用 curl 命令

```bash
curl -i http://localhost:8080/api/manga/1/cover
```

查看响应头中是否有：
```
Cache-Control: public, max-age=2592000
ETag: "1"
```

### 方法 3：使用 JavaScript 检查

```javascript
// 在浏览器控制台运行
fetch('http://localhost:8080/api/manga/1/cover')
  .then(r => {
    console.log('Cache-Control:', r.headers.get('cache-control'));
    console.log('ETag:', r.headers.get('etag'));
  });
```

---

## 前端已实现的缓存

### 1. 内存缓存（7 天）

```typescript
// 自动缓存所有图片请求
const imageCache = new Map<string, { data: Blob; timestamp: number }>();
```

### 2. 浏览器缓存

```typescript
// 由后端 Cache-Control 头控制
// 如果后端设置了缓存头，浏览器会自动缓存
```

### 3. 缓存管理工具

```typescript
import { getCacheStats, clearImageCache } from '@/lib/cacheManager';

// 查看缓存统计
getCacheStats();

// 清除缓存
clearImageCache();
```

---

## 下一步

1. **在 Rust 后端添加 Cache-Control 响应头**
2. **重启后端服务**
3. **刷新前端页面**
4. **验证缓存是否生效**

完成这些步骤后，图片将被缓存，不会每次都重新请求！

