'use client';

import {useState, useEffect} from 'react';
import {useTheme} from 'next-themes';
import {useIsSSR} from '@react-aria/ssr';
import {
    Input,
    Button,
    Link,
    Spinner,
    Card,
    CardBody,
} from '@heroui/react';
import {api} from '@/lib/api';
import {useNotification} from '@/hooks/useNotification';
import {useAuth} from '@/hooks/useAuth';
import {validateLoginRequest} from '@/lib/validators';

export default function LoginPage() {
    const {showSuccess, showError} = useNotification();
    const {handleLoginSuccess} = useAuth();
    const {theme} = useTheme();
    const isSSR = useIsSSR();
    const isDark = theme === 'dark' && !isSSR;

    const [mounted, setMounted] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    /**
     * 处理登录
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            // 1. 验证表单数据
            const validation = validateLoginRequest({
                email,
                password,
            });

            if (!validation.success || !validation.data) {
                // 显示验证错误
                const errorMessage = validation.error || '表单验证失败';
                showError(errorMessage, '验证失败');
                setLoading(false);
                return;
            }

            // 2. 调用登录 API
            const response = await api.auth.login(validation.data);

            // 3. 登录成功
            showSuccess('登录成功，正在跳转...', '欢迎回来');

            // 4. 延迟跳转，让用户看到成功提示
            setTimeout(() => {
                handleLoginSuccess(response.token);
            }, 1000);
        } catch (error: any) {
            // 错误已由 HTTP 客户端自动处理并显示通知
            console.error('登录失败:', error);

            // 如果错误没有被自动处理，手动显示错误
            if (error && error.message) {
                showError(error.message, '登录失败');
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * 处理忘记密码
     */
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotLoading(true);

        try {
            // 验证邮箱
            if (!forgotEmail || !forgotEmail.includes('@')) {
                showError('请输入有效的邮箱地址', '验证失败');
                return;
            }

            // 调用忘记密码 API（暂时注释）
            // await api.auth.forgotPassword({ email: forgotEmail });

            showSuccess('重置链接已发送到您的邮箱，请检查收件箱', '发送成功');
            setShowForgotPassword(false);
            setForgotEmail('');
        } catch (error: any) {
            console.error('忘记密码失败:', error);
        } finally {
            setForgotLoading(false);
        }
    };

    // 主题样式
    const themeStyles = {
        background: isDark
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
        cardBg: isDark
            ? 'bg-gray-800/40 backdrop-blur-xl border border-gray-700/50'
            : 'bg-white/40 backdrop-blur-xl border border-white/60',
        titleText: isDark ? 'text-white' : 'text-gray-900',
        subtitleText: isDark ? 'text-gray-400' : 'text-gray-600',
        inputBg: isDark
            ? 'bg-gray-700/50 border-gray-600/50'
            : 'bg-white/50 border-white/60',
        buttonGradient: isDark
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center ${themeStyles.background} p-4 relative overflow-hidden`}>
            {/* 背景装饰元素 - 视觉差效果 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* 浮动球体 1 */}
                <div
                    className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-purple-600' : 'bg-blue-400'} animate-pulse`}/>

                {/* 浮动球体 2 */}
                <div
                    className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${isDark ? 'bg-pink-600' : 'bg-purple-400'} animate-pulse`}
                    style={{animationDelay: '1s'}}/>

                {/* 浮动球体 3 */}
                <div
                    className={`absolute top-1/2 right-1/4 w-60 h-60 rounded-full blur-3xl opacity-10 ${isDark ? 'bg-cyan-600' : 'bg-pink-300'}`}/>
            </div>

            {/* 主容器 */}
            <div className="relative z-10 w-full max-w-md">
                {/* 登录表单 */}
                {!showForgotPassword ? (
                    <Card className={`${themeStyles.cardBg} shadow-2xl`}>
                        <CardBody className="gap-8 p-8">
                            {/* 头部 */}
                            <div className="text-center space-y-2">
                                <div className="flex justify-center mb-4">
                                    <div
                                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${isDark ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-purple-600'} flex items-center justify-center shadow-lg`}>
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                                        </svg>
                                    </div>
                                </div>
                                <h1 className={`text-3xl font-bold ${themeStyles.titleText}`}>Modream</h1>
                                <p className={`text-sm ${themeStyles.subtitleText}`}>欢迎回到您的媒体世界</p>
                            </div>

                            {/* 登录表单 */}
                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* 邮箱输入框 */}
                                <div>
                                    <Input
                                        type="email"
                                        label="邮箱地址"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        isDisabled={loading}
                                        isInvalid={!!errors.email}
                                        errorMessage={errors.email}
                                        className="w-full"
                                        classNames={{
                                            input: [themeStyles.inputBg],
                                            label: [themeStyles.subtitleText],
                                        }}
                                        startContent={
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                            </svg>
                                        }
                                    />
                                </div>

                                {/* 密码输入框 */}
                                <div>
                                    <Input
                                        type="password"
                                        label="密码"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        isDisabled={loading}
                                        isInvalid={!!errors.password}
                                        errorMessage={errors.password}
                                        className="w-full"
                                        classNames={{
                                            input: [themeStyles.inputBg],
                                            label: [themeStyles.subtitleText],
                                        }}
                                        startContent={
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                            </svg>
                                        }
                                    />
                                </div>

                                {/* 忘记密码链接 */}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className={`text-sm font-medium transition-colors ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-700'}`}
                                    >
                                        忘记密码？
                                    </button>
                                </div>

                                {/* 登录按钮 */}
                                <Button
                                    type="submit"
                                    className={`w-full ${themeStyles.buttonGradient} text-white font-semibold text-base h-12 shadow-lg transition-all duration-300 hover:shadow-xl`}
                                    isDisabled={loading || !email || !password}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" color="current"/>
                                            登录中...
                                        </>
                                    ) : (
                                        '登录'
                                    )}
                                </Button>
                            </form>

                            {/* 分割线 */}
                            <div className="flex items-center gap-3">
                                <div className={`flex-1 h-px ${isDark ? 'bg-gray-700/50' : 'bg-gray-300/50'}`}/>
                                <span className={`text-xs ${themeStyles.subtitleText}`}>或</span>
                                <div className={`flex-1 h-px ${isDark ? 'bg-gray-700/50' : 'bg-gray-300/50'}`}/>
                            </div>

                            {/* 注册链接 */}
                            <div className={`text-center text-sm ${themeStyles.subtitleText}`}>
                                还没有账户？
                                <Link href="/register"
                                      className={`ml-1 font-semibold ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-700'}`}>
                                    立即注册
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    /* 忘记密码表单 */
                    <Card className={`${themeStyles.cardBg} shadow-2xl`}>
                        <CardBody className="gap-8 p-8">
                            {/* 头部 */}
                            <div className="text-center space-y-2">
                                <h2 className={`text-2xl font-bold ${themeStyles.titleText}`}>重置密码</h2>
                                <p className={`text-sm ${themeStyles.subtitleText}`}>输入您的邮箱地址，我们将发送重置链接</p>
                            </div>

                            {/* 忘记密码表单 */}
                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                {/* 邮箱输入框 */}
                                <div>
                                    <Input
                                        type="email"
                                        label="邮箱地址"
                                        placeholder="name@example.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        isDisabled={forgotLoading}
                                        className="w-full"
                                        classNames={{
                                            input: [themeStyles.inputBg],
                                            label: [themeStyles.subtitleText],
                                        }}
                                        startContent={
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                            </svg>
                                        }
                                    />
                                </div>

                                {/* 发送按钮 */}
                                <Button
                                    type="submit"
                                    className={`w-full ${themeStyles.buttonGradient} text-white font-semibold text-base h-12 shadow-lg transition-all duration-300 hover:shadow-xl`}
                                    isDisabled={forgotLoading || !forgotEmail}
                                >
                                    {forgotLoading ? (
                                        <>
                                            <Spinner size="sm" color="current"/>
                                            发送中...
                                        </>
                                    ) : (
                                        '发送重置链接'
                                    )}
                                </Button>
                            </form>

                            {/* 返回登录 */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setForgotEmail('');
                                    }}
                                    className={`text-sm font-medium transition-colors ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                    返回登录
                                </button>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );
}
