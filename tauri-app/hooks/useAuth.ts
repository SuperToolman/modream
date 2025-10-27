'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * 认证 Hook
 * 用于检查用户是否已登录，以及管理登录/登出状态
 */
export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 检查是否有有效的 token
   */
  const checkAuth = () => {
    if (typeof window === 'undefined') {
      return false;
    }

    // 从 Cookie 中获取 token
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token' && value) {
        return true;
      }
    }
    return false;
  };

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    const authenticated = checkAuth();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  /**
   * 登出
   */
  const logout = () => {
    // 删除 Cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    setIsAuthenticated(false);
    router.push('/login');
  };

  /**
   * 登录成功后的处理
   */
  const handleLoginSuccess = (token: string) => {
    // Token 已由 API 保存，这里只需要更新状态
    setIsAuthenticated(true);

    // 获取重定向 URL（如果有的话）
    const from = searchParams.get('from');
    if (from) {
      router.push(from);
    } else {
      router.push('/');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    handleLoginSuccess,
    checkAuth,
  };
}

