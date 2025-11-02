# Modream 开发环境启动脚本 (Windows PowerShell)
# 用法: .\start-dev.ps1

Write-Host "🚀 启动 Modream 开发环境..." -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "Cargo.toml")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 Rust 是否安装
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误：未找到 Rust，请先安装 Rust" -ForegroundColor Red
    Write-Host "   访问: https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}

# 检查 Node.js 是否安装
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误：未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "   访问: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查 pnpm 是否安装
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误：未找到 pnpm，请先安装 pnpm" -ForegroundColor Red
    Write-Host "   运行: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 环境检查通过" -ForegroundColor Green
Write-Host ""

# 启动后端 API
Write-Host "📡 启动后端 API (端口 8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '📡 后端 API 服务器' -ForegroundColor Green; Write-Host ''; cargo run --bin desktop -- --server"
)

# 等待后端启动
Write-Host "⏳ 等待后端启动 (5 秒)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 启动前端开发服务器
Write-Host "🌐 启动前端开发服务器 (端口 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '🌐 前端开发服务器' -ForegroundColor Green; Write-Host ''; cd web; pnpm run dev"
)

Write-Host ""
Write-Host "✅ 开发环境启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 访问地址：" -ForegroundColor Cyan
Write-Host "   前端: http://localhost:3000" -ForegroundColor White
Write-Host "   API:  http://localhost:8080" -ForegroundColor White
Write-Host "   Swagger: http://localhost:8080/swagger-ui" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "   - 前端支持热重载，修改代码会自动刷新" -ForegroundColor White
Write-Host "   - 后端修改需要重启服务" -ForegroundColor White
Write-Host "   - 关闭窗口即可停止服务" -ForegroundColor White
Write-Host ""

