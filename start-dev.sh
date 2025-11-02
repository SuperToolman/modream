#!/bin/bash
# Modream 开发环境启动脚本 (Linux/Mac)
# 用法: ./start-dev.sh

set -e

echo "🚀 启动 Modream 开发环境..."
echo ""

# 检查是否在项目根目录
if [ ! -f "Cargo.toml" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Rust 是否安装
if ! command -v cargo &> /dev/null; then
    echo "❌ 错误：未找到 Rust，请先安装 Rust"
    echo "   访问: https://rustup.rs/"
    exit 1
fi

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    echo "   访问: https://nodejs.org/"
    exit 1
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误：未找到 pnpm，请先安装 pnpm"
    echo "   运行: npm install -g pnpm"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 创建日志目录
mkdir -p logs

# 启动后端 API
echo "📡 启动后端 API (端口 8080)..."
cargo run --bin desktop -- --server > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端 PID: $BACKEND_PID"

# 等待后端启动
echo "⏳ 等待后端启动 (5 秒)..."
sleep 5

# 启动前端开发服务器
echo "🌐 启动前端开发服务器 (端口 3000)..."
cd web
pnpm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "   前端 PID: $FRONTEND_PID"

# 保存 PID 到文件
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

echo ""
echo "✅ 开发环境启动完成！"
echo ""
echo "📝 访问地址："
echo "   前端: http://localhost:3000"
echo "   API:  http://localhost:8080"
echo "   Swagger: http://localhost:8080/swagger-ui"
echo ""
echo "📋 进程信息："
echo "   后端 PID: $BACKEND_PID"
echo "   前端 PID: $FRONTEND_PID"
echo ""
echo "📄 日志文件："
echo "   后端: logs/backend.log"
echo "   前端: logs/frontend.log"
echo ""
echo "💡 提示："
echo "   - 前端支持热重载，修改代码会自动刷新"
echo "   - 后端修改需要重启服务"
echo "   - 停止服务: ./stop-dev.sh"
echo "   - 查看日志: tail -f logs/backend.log"
echo ""

