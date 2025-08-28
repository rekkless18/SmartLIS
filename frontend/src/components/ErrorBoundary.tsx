/**
 * 错误边界组件
 * 用于捕获和处理React组件中的错误
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 错误边界组件
 * 捕获子组件中的JavaScript错误，记录错误并显示备用UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * 静态方法，用于更新state以渲染备用UI
   * @param error 捕获的错误
   * @returns 新的state
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * 组件捕获错误时调用
   * @param error 错误对象
   * @param errorInfo 错误信息
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  /**
   * 重试处理函数
   * 重置错误状态，重新渲染子组件
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                页面出现错误
              </h2>
              <p className="text-gray-600 mb-4">
                抱歉，页面加载时出现了问题。请尝试刷新页面或联系技术支持。
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 p-4 rounded-md mb-4">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    错误详情（开发模式）
                  </summary>
                  <pre className="text-sm text-red-600 whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex space-x-3">
              <Button onClick={this.handleRetry} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>重试</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>刷新页面</span>
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;