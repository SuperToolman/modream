"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";

interface IgdbConfig {
  client_id_masked: string | null;
  has_client_id: boolean;
  has_client_secret: boolean;
  enabled: boolean;
}

interface GameboxConfig {
  igdb: IgdbConfig;
}

export default function General() {
  const { theme } = useTheme();
  const isSSR = useIsSSR();
  const isDark = theme === 'dark' && !isSSR;

  const [config, setConfig] = useState<GameboxConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const themeStyles = {
    background: isDark ? 'bg-gray-900' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    cardBg: isDark ? 'bg-gray-800' : 'bg-gray-50',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/config/gamebox');
      const data = await response.json();

      if (data.status_code === 200 && data.data) {
        setConfig(data.data);
      } else {
        setError('获取配置失败');
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
      setError('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className={clsx("text-center", themeStyles.textSecondary)}>
          加载中...
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          {error || '配置加载失败'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className={clsx("text-2xl font-bold mb-2", themeStyles.text)}>
          通用设置
        </h1>
        <p className={themeStyles.textSecondary}>
          配置 Modream 的全局设置和数据库提供者
        </p>
      </div>

      <Divider />

      {/* Gamebox 配置 */}
      <Card className={themeStyles.cardBg}>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h2 className={clsx("text-xl font-semibold", themeStyles.text)}>
              游戏数据库提供者配置
            </h2>
            <p className={clsx("text-sm", themeStyles.textSecondary)}>
              配置游戏元数据提供者的 API 凭证
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* IGDB 配置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={clsx("text-lg font-medium", themeStyles.text)}>
                  IGDB (Internet Game Database)
                </h3>
                <p className={clsx("text-sm mt-1", themeStyles.textSecondary)}>
                  全球最大的游戏数据库，支持主流游戏平台
                </p>
              </div>
              <div className="flex items-center gap-2">
                {config.igdb.enabled ? (
                  <Chip color="success" variant="flat" size="sm">已启用</Chip>
                ) : (
                  <Chip color="default" variant="flat" size="sm">未启用</Chip>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Client ID 状态 */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className={clsx("text-sm font-medium mb-1", themeStyles.text)}>
                    Client ID
                  </div>
                  {config.igdb.has_client_id ? (
                    <div className="flex items-center gap-2">
                      <code className={clsx(
                        "px-3 py-2 rounded text-sm font-mono",
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      )}>
                        {config.igdb.client_id_masked || "****"}
                      </code>
                      <Chip color="success" variant="flat" size="sm">已配置</Chip>
                    </div>
                  ) : (
                    <Chip color="warning" variant="flat" size="sm">未配置</Chip>
                  )}
                </div>
              </div>

              {/* Client Secret 状态 */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className={clsx("text-sm font-medium mb-1", themeStyles.text)}>
                    Client Secret
                  </div>
                  {config.igdb.has_client_secret ? (
                    <div className="flex items-center gap-2">
                      <code className={clsx(
                        "px-3 py-2 rounded text-sm font-mono",
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      )}>
                        ********
                      </code>
                      <Chip color="success" variant="flat" size="sm">已配置</Chip>
                    </div>
                  ) : (
                    <Chip color="warning" variant="flat" size="sm">未配置</Chip>
                  )}
                </div>
              </div>

              {/* 配置说明 */}
              <div className={clsx(
                "p-4 rounded-lg border",
                isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
              )}>
                <div className={clsx("text-sm font-medium mb-2", themeStyles.text)}>
                  📝 如何配置 IGDB
                </div>
                <ol className={clsx("text-sm space-y-1 list-decimal list-inside", themeStyles.textSecondary)}>
                  <li>访问 <a href="https://api-docs.igdb.com/#account-creation" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">IGDB API 文档</a> 创建账号并获取凭证</li>
                  <li>打开项目根目录下的 <code className="px-1 py-0.5 rounded bg-gray-700 text-gray-200">application.yaml</code> 文件</li>
                  <li>在 <code className="px-1 py-0.5 rounded bg-gray-700 text-gray-200">gamebox.igdb</code> 部分填入你的凭证</li>
                  <li>将 <code className="px-1 py-0.5 rounded bg-gray-700 text-gray-200">enabled</code> 设置为 <code className="px-1 py-0.5 rounded bg-gray-700 text-gray-200">true</code></li>
                  <li>重启 Modream 服务使配置生效</li>
                </ol>
              </div>

              {/* 配置示例 */}
              <div className={clsx(
                "p-4 rounded-lg border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
              )}>
                <div className={clsx("text-sm font-medium mb-2", themeStyles.text)}>
                  配置示例 (application.yaml)
                </div>
                <pre className={clsx(
                  "text-xs font-mono p-3 rounded overflow-x-auto",
                  isDark ? "bg-gray-900" : "bg-white"
                )}>
{`gamebox:
  igdb:
    client_id: "your_client_id_here"
    client_secret: "your_client_secret_here"
    enabled: true`}
                </pre>
              </div>
            </div>
          </div>

          <Divider />

          {/* 其他提供者说明 */}
          <div className="space-y-3">
            <h3 className={clsx("text-lg font-medium", themeStyles.text)}>
              其他数据库提供者
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 1)',
                borderColor: isDark ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)'
              }}>
                <div>
                  <div className={clsx("font-medium", themeStyles.text)}>DLsite</div>
                  <div className={clsx("text-sm", themeStyles.textSecondary)}>
                    日本同人游戏平台，无需配置
                  </div>
                </div>
                <Chip color="success" variant="flat" size="sm">默认启用</Chip>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border" style={{
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 1)',
                borderColor: isDark ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)'
              }}>
                <div>
                  <div className={clsx("font-medium", themeStyles.text)}>SteamDB / TheGamesDB</div>
                  <div className={clsx("text-sm", themeStyles.textSecondary)}>
                    Steam 游戏数据库，无需配置
                  </div>
                </div>
                <Chip color="success" variant="flat" size="sm">默认启用</Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}