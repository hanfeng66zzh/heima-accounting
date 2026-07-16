import React, { Component } from 'react'
import { Button } from 'antd'

interface Props {
  children: React.ReactNode
  pageName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * 错误边界组件
 * 类似"安全气囊"：当子组件渲染出错时，拦截错误并显示友好提示，
 * 避免整个页面变成白屏。
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 输出到控制台，方便调试
    console.error(`[ErrorBoundary] ${this.props.pageName || '页面'} 发生错误:`, error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: 32,
          textAlign: 'center',
          background: '#f5f5f5'
        }}>
          <span style={{ fontSize: 56, marginBottom: 16 }}>😵</span>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 8 }}>
            页面加载失败
          </div>
          <div style={{ fontSize: 14, color: '#999', marginBottom: 8, maxWidth: 300 }}>
            {this.state.error?.message || '发生了未知错误'}
          </div>
          <div style={{ fontSize: 12, color: '#bbb', marginBottom: 24 }}>
            请尝试刷新应用或联系开发者
          </div>
          <Button type="primary" onClick={this.handleReset}>
            重试
          </Button>

          {/* 底部导航栏占位（保持界面一致性） */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, background: '#fff', borderTop: '1px solid #f0f0f0' }} />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
