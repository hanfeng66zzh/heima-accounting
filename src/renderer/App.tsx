import React, { useState, useEffect } from 'react'
import { HomeOutlined, UnorderedListOutlined, PieChartOutlined, SettingOutlined } from '@ant-design/icons'
import AddRecord from './pages/AddRecord'
import RecordList from './pages/RecordList'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import ErrorBoundary from './components/ErrorBoundary'
import { useStore } from './store/useStore'

type TabKey = 'add' | 'list' | 'stats' | 'settings'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'add', label: '记账', icon: <HomeOutlined /> },
  { key: 'list', label: '账单', icon: <UnorderedListOutlined /> },
  { key: 'stats', label: '统计', icon: <PieChartOutlined /> },
  { key: 'settings', label: '设置', icon: <SettingOutlined /> }
]

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('add')
  const editingRecord = useStore(s => s.editingRecord)

  // 编辑记录时自动跳转到记账页
  useEffect(() => {
    if (editingRecord) {
      setActiveTab('add')
    }
  }, [editingRecord])

  const renderPage = () => {
    switch (activeTab) {
      case 'add': return <ErrorBoundary pageName="记账"><AddRecord /></ErrorBoundary>
      case 'list': return <ErrorBoundary pageName="账单"><RecordList /></ErrorBoundary>
      case 'stats': return <ErrorBoundary pageName="统计"><Statistics /></ErrorBoundary>
      case 'settings': return <ErrorBoundary pageName="设置"><Settings /></ErrorBoundary>
      default: return <ErrorBoundary pageName="记账"><AddRecord /></ErrorBoundary>
    }
  }

  return (
    <div>
      {renderPage()}

      {/* 底部导航栏 */}
      <div className="bottom-nav">
        {TABS.map(tab => (
          <div
            key={tab.key}
            className={`bottom-nav-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
