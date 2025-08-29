/**
 * 登录页面组件
 * 创建时间：2025年8月20日
 * 创建人：Erikwang
 * 功能：用户登录界面，包含用户名密码输入和登录功能
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import http from '../lib/http';

/**
 * 登录页面组件
 * @returns JSX.Element 登录页面
 */
const Login: React.FC = () => {
  // 状态管理
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('username');
  const [emailError, setEmailError] = useState('');
  
  // 路由和状态管理
  const navigate = useNavigate();
  const { login } = useAuthStore();

  /**
   * 邮箱格式验证
   * @param email - 邮箱地址
   * @returns 是否为有效邮箱格式
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * 处理邮箱输入变化
   * @param value - 邮箱值
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('请输入有效的邮箱格式');
    } else {
      setEmailError('');
    }
  };

  /**
   * 处理登录表单提交
   * @param e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 根据登录类型验证输入
    if (activeTab === 'username') {
      if (!username || !password) {
        alert('请输入用户名和密码');
        return;
      }
    } else {
      if (!email || !password) {
        alert('请输入邮箱和密码');
        return;
      }
      if (!validateEmail(email)) {
        alert('请输入有效的邮箱格式');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      console.log('=== Login Debug Info ===');
      console.log('Attempting login with username:', username);
      
      // 根据登录类型构建请求体
      const requestBody = activeTab === 'username' 
        ? {
            username: username,
            password: password,
            loginType: 'username'
          }
        : {
            email: email,
            password: password,
            loginType: 'email'
          };

      console.log('=== Login Debug Info ===');
      console.log('Login type:', activeTab);
      console.log('Request body:', requestBody);
      
      // 调用后端登录API
      const response = await http.post('/auth/login', requestBody);
      
      console.log('Login API response status:', response.status);
      console.log('Login API response data:', response.data);
      
      const data = response.data;
      
      // 检查响应是否成功（后端返回格式：{success: boolean, message: string, data: {...}}）
      if (data.success === false) {
        console.error('Login failed:', data);
        // 统一密码错误提示信息
        const errorMessage = data.message === '用户名或密码错误' || 
                             data.message === '邮箱或密码错误' ||
                             data.message === 'Invalid login credentials' ||
                             data.message?.includes('密码错误') ||
                             data.message?.includes('credentials') ||
                             data.message?.includes('用户名或密码') ||
                             data.message?.includes('邮箱或密码') ?
                             '账号或密码错误，请检查' : 
                             (data.message || '登录失败，请重试');
        alert(errorMessage);
        return;
      }
      
      if (data.success && data.data) {
        const { token, user } = data.data;
        console.log('Login successful, user data:', user);
        console.log('User permissions:', user.permissions);
        
        // 使用后端返回的真实数据登录
        login(token, user);
        navigate('/dashboard');
      } else {
        console.error('Login failed: missing data');
        alert('登录失败，服务器数据异常');
      }
    } catch (error) {
      console.error('Login network error:', error);
      alert('网络错误，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 切换密码显示状态
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-lg p-8">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartLIS</h1>
          <p className="text-gray-600">智能实验室管理系统</p>
        </div>

        {/* 标签页切换 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setActiveTab('username')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'username'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            用户名登录
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            邮箱登录
          </button>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 用户名/邮箱输入 */}
          <div>
            <label htmlFor={activeTab === 'username' ? 'username' : 'email'} className="block text-sm font-medium text-gray-700 mb-2">
              {activeTab === 'username' ? '用户名' : '邮箱'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {activeTab === 'username' ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                )}
              </div>
              {activeTab === 'username' ? (
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入用户名"
                  required
                />
              ) : (
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入邮箱地址"
                  required
                />
              )}
            </div>
            {/* 邮箱格式错误提示 */}
            {activeTab === 'email' && emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          {/* 密码输入 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </>
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 登录按钮 */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </div>

          {/* 忘记密码链接 */}
          <div className="text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
              忘记密码？
            </a>
          </div>
        </form>

        {/* 底部信息 */}
        <div className="text-center text-sm text-gray-600">
          <p className="mt-1">如需帮助，请联系系统管理员</p>
        </div>
      </div>
    </div>
  );
};

export default Login;