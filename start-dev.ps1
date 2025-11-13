# Modream 开发环境启动脚本
# 用法: .\start-dev.ps1
# 功能: 在单个窗口启动 WebAPI + 前端开发服务器 + Tauri 桌面窗口

# 设置控制台编码为 UTF-8（解决中文乱码问题）
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ' 启动 Modream 开发环境 (WebAPI + Web Dev + Tauri)...' -ForegroundColor Cyan
Write-Host ''

# 检查是否在项目根目录
if (-not (Test-Path 'Cargo.toml')) {
    Write-Host ' 错误：请在项目根目录运行此脚本' -ForegroundColor Red
    exit 1
}

# 检查 Rust 是否安装
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host ' 错误：未找到 Rust，请先安装 Rust' -ForegroundColor Red
    Write-Host '   访问: https://rustup.rs/' -ForegroundColor Yellow
    exit 1
}

# 检查 Node.js 是否安装
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host ' 错误：未找到 Node.js，请先安装 Node.js' -ForegroundColor Red
    Write-Host '   访问: https://nodejs.org/' -ForegroundColor Yellow
    exit 1
}

# 检查 pnpm 是否安装
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host ' 错误：未找到 pnpm，请先安装 pnpm' -ForegroundColor Red
    Write-Host '   运行: npm install -g pnpm' -ForegroundColor Yellow
    exit 1
}

Write-Host ' 环境检查通过' -ForegroundColor Green
Write-Host ''

# 创建日志目录
if (-not (Test-Path 'logs')) {
    New-Item -ItemType Directory -Path 'logs' | Out-Null
}

# 清理旧的日志文件
Remove-Item -Path 'logs\backend.log' -ErrorAction SilentlyContinue
Remove-Item -Path 'logs\frontend.log' -ErrorAction SilentlyContinue

# 启动后端 API（后台任务）
Write-Host ' 启动后端 API (端口 8080)...' -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    # 设置 UTF-8 编码
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8

    # 使用重定向而不是 Tee-Object，以保持 UTF-8 编码
    cargo run --bin desktop -- --server 2>&1 | ForEach-Object {
        $line = $_.ToString()
        Write-Output $line
        # 使用 UTF-8 编码追加到日志文件
        [System.IO.File]::AppendAllText("$using:PWD\logs\backend.log", "$line`n", [System.Text.Encoding]::UTF8)
    }
}

# 等待后端启动
Write-Host ' 等待后端启动 (5 秒)...' -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 检查后端是否启动成功
if ($backendJob.State -eq 'Failed') {
    Write-Host ' 后端启动失败！' -ForegroundColor Red
    Receive-Job -Job $backendJob
    exit 1
}

# 启动前端开发服务器（后台任务）
Write-Host ' 启动前端开发服务器 (端口 3000)...' -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location web
    # 设置 UTF-8 编码
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8

    # 使用重定向而不是 Tee-Object，以保持 UTF-8 编码
    pnpm run dev 2>&1 | ForEach-Object {
        $line = $_.ToString()
        Write-Output $line
        # 使用 UTF-8 编码追加到日志文件
        [System.IO.File]::AppendAllText("$using:PWD\logs\frontend.log", "$line`n", [System.Text.Encoding]::UTF8)
    }
}

# 等待前端启动
Write-Host ' 等待前端启动 (10 秒)...' -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 检查前端是否启动成功
if ($frontendJob.State -eq 'Failed') {
    Write-Host ' 前端启动失败！' -ForegroundColor Red
    Receive-Job -Job $frontendJob
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob
    exit 1
}

Write-Host ''
Write-Host ' 后端和前端已在后台运行' -ForegroundColor Green
Write-Host ''
Write-Host ' 日志文件：' -ForegroundColor Cyan
Write-Host '   后端: logs\backend.log' -ForegroundColor White
Write-Host '   前端: logs\frontend.log' -ForegroundColor White
Write-Host ''

# 启动 Tauri 桌面窗口
Write-Host '  启动 Tauri 桌面窗口...' -ForegroundColor Cyan
Write-Host ''
Write-Host ' 访问地址：' -ForegroundColor Cyan
Write-Host '   Tauri 窗口: 自动打开' -ForegroundColor White
Write-Host '   浏览器: http://localhost:3000' -ForegroundColor White
Write-Host '   API:  http://localhost:8080' -ForegroundColor White
Write-Host '   Swagger: http://localhost:8080/swagger-ui' -ForegroundColor White
Write-Host ''
Write-Host ' 提示：' -ForegroundColor Yellow
Write-Host '   - Tauri 窗口会加载前端开发服务器 (支持热重载)' -ForegroundColor White
Write-Host '   - 前端修改会自动刷新 Tauri 窗口' -ForegroundColor White
Write-Host '   - 后端修改需要重启此脚本' -ForegroundColor White
Write-Host '   - 按 Ctrl+C 可以停止所有服务' -ForegroundColor White
Write-Host '   - 日志输出在 logs/ 目录' -ForegroundColor White
Write-Host ''

# 注册清理函数（当脚本退出时自动停止后台任务）
$cleanup = {
    Write-Host ''
    Write-Host ' 正在停止服务...' -ForegroundColor Yellow
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host ' 所有服务已停止' -ForegroundColor Green
}

# 注册退出事件
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null

try {
    # 启动 Tauri（这会阻塞直到窗口关闭）
    cargo run --bin desktop -- --gui
} finally {
    # 清理后台任务
    & $cleanup
}
