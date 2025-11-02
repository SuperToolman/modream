#!/bin/bash
# Modream 开发环境停止脚本 (Linux/Mac)
# 用法: ./stop-dev.sh

echo "🛑 停止 Modream 开发环境..."
echo ""

# 检查 PID 文件是否存在
if [ ! -f "logs/backend.pid" ] && [ ! -f "logs/frontend.pid" ]; then
    echo "⚠️  未找到运行中的服务"
    exit 0
fi

# 停止后端
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "📡 停止后端 API (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "   ✅ 后端已停止"
    else
        echo "   ⚠️  后端进程不存在"
    fi
    rm logs/backend.pid
fi

# 停止前端
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🌐 停止前端开发服务器 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "   ✅ 前端已停止"
    else
        echo "   ⚠️  前端进程不存在"
    fi
    rm logs/frontend.pid
fi

echo ""
echo "✅ 开发环境已停止"
echo ""

