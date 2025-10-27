'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * 受保护的路由组件
 * 用于包装需要认证的页面
 * 
 * 使用方式：
 * export default function MyPage() {
 *   return (
 *     <ProtectedRoute>
 *       <YourContent />
 *     </ProtectedRoute>
 *   );
 * }
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  useEffect(() => {
    // 检查是否有 token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      // 没有 token，重定向到登录页面
      router.push('/login');
      return;
    }

    // 有 token，允许访问
    setIsAuthenticated(true);
  }, [router]);

  // 正在检查认证状态
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="加载中..." />
      </div>
    );
  }

  // 未认证，不显示内容
  if (!isAuthenticated) {
    return null;
  }

  // 已认证，显示内容
  return <>{children}</>;
}

// 为了支持 React.useState，需要导入 React
import * as React from 'react';

