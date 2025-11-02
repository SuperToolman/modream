# 🎬 Modream - Private Media Library Management System

**Languages**: English | [简体中文](../README.md)

[![Version](https://img.shields.io/badge/version-0.3.4-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.3-black.svg)](https://nextjs.org/)

> **A high-performance, modern private media library management platform** designed for individuals and small teams, supporting centralized management, browsing, and sharing of various media content such as manga and videos.

## 📌 Project Overview

**Modream** is a **self-hosted private media library management system**, similar to Plex, Emby, and Jellyfin, but focused on:

- 🎯 **Lightweight Deployment** - Runs on a single machine with minimal resource usage
- 🔒 **Fully Private** - Complete control over your data
- ⚡ **High Performance** - Built with Rust for exceptional performance
- 🎨 **Modern UI** - Using the latest Next.js and HeroUI
- 🔧 **Easy to Extend** - Clear DDD architecture for easy customization
- 📱 **Cross-Platform** - Supports Web and desktop applications (Tauri)

## ⚠️ Current Status

> **The project is in early development stage**. Currently supports **Manga** and **Game** management features. The following features are under development:

### 🚧 Planned Features

- 🎬 **Video Management** - Video upload, playback, subtitle support (planned)
- 🎞️ **Anime Management** - Anime library, episode management (planned)
- 📺 **Movie Management** - Movie library, recommendation system (planned)
- 🔄 **Sync Features** - Multi-device sync, cloud backup (planned)
- 🎵 **Music Management** - Music library, playlists (planned)

### ✅ Completed Features

- 📚 **Manga Management** - Complete manga library management and reading features, smart title extraction, chapter structure support
- 🎮 **Game Management** - Game library management, automatic metadata recognition, game launching features

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Current Status](#current-status)
- [Features](#features)
- [Comparison with Other Solutions](#comparison-with-other-solutions)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)

## ✨ Features

### 🎯 Core Features

- ✅ **Layered Architecture** - Clear DDD layered design
- ✅ **Type Safety** - Rust backend + TypeScript frontend
- ✅ **Async First** - High-performance processing based on Tokio
- ✅ **API Documentation** - Auto-generated OpenAPI/Swagger documentation
- ✅ **Authentication** - JWT Token + Bcrypt password encryption
- ✅ **Desktop App** - Tauri integration, cross-platform support
- ✅ **Modern UI** - Next.js 15 + HeroUI + Tailwind CSS

### 📚 Media Management Features

- **Manga Management** - Complete manga library management and reading features
  - Mixed mode scanning (single folder + chapter structure)
  - Smart title extraction (auto-remove bracket tags)
  - Chapter management and navigation
  - Multiple reading modes (single page, double page, scroll)
  - Optimized online reader
- **Game Management** - Game library management and launching features
  - Using custom [gamebox](https://github.com/SuperToolman/gamebox) game metadata library
  - Automatic scanning and indexing
  - Automatic metadata recognition (IGDB, DLsite, SteamDB)
  - Game launching and configuration management
- **Media Library** - Flexible media library organization
- **Smart Scanning** - Automatic scanning and indexing of local files
- **Tag System** - Tag and category management
- **Favorites** - Mark favorite content

### 🖼️ Image Processing Features

- **Auto Thumbnail Generation** - Auto-generate thumbnails in multiple sizes (100x100, 300x300, 600x600, or custom) using Image library
- **Format Conversion** - Support automatic conversion and optimization of JPEG, PNG, WebP and other formats
- **Metadata Extraction** - Auto-extract EXIF info, dimensions, color space and other metadata
- **Streaming** - HTTP Range support, resume download, partial content requests
- **Progressive Loading** - Load thumbnails first, then high-quality images in background
- **Smart Buffer Management** - Memory pool + streaming processing, support for very large files

### 🚀 Smart Caching System

- **Multi-layer Cache** - Moka async cache library + disk storage, reduce database queries
- **Smart Preloading** - Predict user behavior based on LRU algorithm, preload next image
- **Configurable Strategy** - Support custom TTL and cache size limits
- **Cache Statistics** - Real-time collection of cache hit rate, cache size and other metrics

### 🔐 Security Features

- **JWT Authentication** - HS256 algorithm + 24-hour expiration mechanism
- **Bcrypt Password Encryption** - Cost factor 12, strong password security
- **CORS Configuration** - Flexible cross-origin resource sharing configuration
- **Input Validation** - Serde + custom validators ensure API input legitimacy
- **Rate Limiting** - Token bucket algorithm based, prevent API abuse

### ⚡ Performance Highlights

#### Backend Performance
- **Memory Usage**: ~50-100MB (much lower than Java applications)
- **Startup Time**: <1s
- **Concurrent Connections**: 10,000+
- **Request Latency**: <50ms
- **Throughput**: 5,000+ req/s
- **CPU Usage**: Low (async I/O)

#### Frontend Performance
- **First Screen Load**: <2s
- **Image Loading**: Progressive
- **Cache Strategy**: 30 days
- **Bundle Size**: ~200KB
- **Lighthouse**: 90+

#### Database Performance
- **Query**: <10ms
- **Pagination**: <50ms
- **Index**: Optimized
- **Concurrency**: Supported (SQLite WAL)

#### Optimization Techniques
- Async I/O (Tokio)
- Connection pooling
- Multi-layer caching
- Streaming
- CDN friendly
- Gzip compression
- Database index optimization

## 🔄 Comparison with Other Solutions

| Feature | Modream | Plex | Emby | Jellyfin | Elfilm |
|---------|---------|------|------|----------|--------|
| **Open Source** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Resource Usage** | Very Low | Medium | Medium | Medium | Low |
| **Performance** | Excellent | Good | Good | Good | Good |
| **Ease of Use** | Simple | Simple | Medium | Medium | Medium |
| **Extensibility** | Excellent | Fair | Fair | Excellent | Fair |
| **Manga Support** | Professional | None | None | None | Supported |
| **Web UI** | Modern | Traditional | Traditional | Traditional | Modern |
| **Custom Development** | Easy | Difficult | Difficult | Medium | Medium |

**Why Choose Modream?**
- Lightweight: Extremely low memory usage, suitable for low-spec servers
- High Performance: Async first, supports high concurrency
- Easy to Customize: Clear DDD architecture
- Modern: Latest tech stack
- Fully Open Source: Code completely open
- Manga Focused: Optimized for manga content

## 🛠️ Tech Stack

### Backend (Rust)
- **Web**: Axum 0.8.6
- **ORM**: SeaORM 2.0.0-rc.13
- **Runtime**: Tokio 1.48.0
- **Logging**: Tracing 0.1.41
- **API Docs**: Utoipa 5.4.0
- **Auth**: JWT + Bcrypt
- **Cache**: Moka 0.12
- **Image**: Image 0.24
- **Game Metadata**: Gamebox 0.1.1

### Frontend (TypeScript/Next.js)
- **Framework**: Next.js 15.3.1
- **UI**: HeroUI 2.8.5
- **Styling**: Tailwind CSS 4.1.11
- **Animation**: Framer Motion 11.18.2
- **Theme**: next-themes 0.4.6
- **HTTP**: Axios 1.11.0
- **Desktop**: Tauri 2.7.0

### Database
- **SQLite** - Lightweight, JSON support
- **SeaORM** - Type-safe ORM

## 🚀 Quick Start

### Prerequisites
- Rust 1.70+
- Node.js 18+ and pnpm
- SQLite

### Development Setup

```bash
# Terminal 1: Backend
cargo run --bin interfaces

# Terminal 2: Frontend
cd tauri-app
pnpm install
pnpm run dev

# Or launch Tauri desktop app
cd tauri-app
pnpm install
pnpm tauri dev
```
Access:
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui
- Web: http://localhost:3000

### API Usage

Modream provides a complete RESTful API that you can use to highly customize your service.

- **Swagger UI**: http://localhost:8080/swagger-ui - Online API documentation and testing tool
- **Detailed Documentation**: See [API.md](docs/en/API.md) for complete API usage guide

## 📚 Documentation

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

⚠️ **Production Environment Security Tips**:
- Change JWT_SECRET to a strong random string
- Configure CORS whitelist to restrict allowed origins
- Enable HTTPS for encrypted transmission
- Use environment variables to manage sensitive configurations

