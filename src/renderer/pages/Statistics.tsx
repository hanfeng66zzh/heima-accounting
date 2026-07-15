import React, { useEffect, useState } from 'react'
import { Select, Spin, Empty } from 'antd'
import dayjs from 'dayjs'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useStore } from '../store/useStore'
import { getDbAdapter } from '../adapters'

// 按需注册 ECharts 组件
echarts.use([PieChart, BarChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

const Statistics: React.FC = () => {
  const { categories, incomeCategories } = useStore()
  const allCategories = [...categories, ...incomeCategories]

  const currentYear = dayjs().year()
  const currentMonth = dayjs().month() + 1

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{
    totalExpense: number
    totalIncome: number
    categoryBreakdown: { categoryId: string; total: number }[]
    dailyExpenses: { date: string; total: number }[]
    dailyIncomes: { date: string; total: number }[]
  } | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear])

  useEffect(() => {
    loadYears()
  }, [])

  useEffect(() => {
    loadStats()
  }, [selectedYear, selectedMonth])

  const loadYears = async () => {
    const years = await getDbAdapter().getAllYears()
    if (years.length > 0) {
      setAvailableYears(years)
    }
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await getDbAdapter().getMonthlyStats(selectedYear, selectedMonth)
      setStats(data)
    } catch (err) {
      console.error('加载统计数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (categoryId: string): string => {
    const cat = allCategories.find(c => c.id === categoryId)
    return cat ? `${cat.icon} ${cat.name}` : categoryId
  }

  // 支出分类饼图（原有）
  const pieOption = stats && stats.categoryBreakdown.length > 0 ? {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: ¥{c} ({d}%)'
    },
    series: [{
      type: 'pie' as const,
      radius: ['45%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: stats.categoryBreakdown.map(item => ({
        name: getCategoryName(item.categoryId),
        value: Math.round(item.total * 100) / 100
      }))
    }]
  } : null

  // 每日收支对比图
  const barOption = (() => {
    const allDates = new Set<string>()
    stats?.dailyExpenses.forEach(d => allDates.add(dayjs(d.date).format('D')))
    stats?.dailyIncomes.forEach(d => allDates.add(dayjs(d.date).format('D')))
    const sortedDates = Array.from(allDates).sort((a, b) => parseInt(a) - parseInt(b))

    const expenseMap = new Map(stats?.dailyExpenses.map(d => [dayjs(d.date).format('D'), d.total]) || [])
    const incomeMap = new Map(stats?.dailyIncomes.map(d => [dayjs(d.date).format('D'), d.total]) || [])

    return sortedDates.length > 0 ? {
      tooltip: {
        trigger: 'axis' as const,
        formatter: (params: any) => {
          let result = `${params[0].axisValue}日`
          params.forEach((p: any) => {
            result += `<br/>${p.marker} ${p.seriesName}: ¥${p.value}`
          })
          return result
        }
      },
      legend: {
        data: ['支出', '收入'],
        bottom: 0,
        textStyle: { fontSize: 11 }
      },
      grid: { left: 8, right: 16, top: 12, bottom: 30 },
      xAxis: {
        type: 'category' as const,
        data: sortedDates,
        axisLabel: { fontSize: 11 }
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: { fontSize: 10, formatter: '¥{value}' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } }
      },
      series: [
        {
          name: '支出',
          data: sortedDates.map(d => Math.round((expenseMap.get(d) || 0) * 100) / 100),
          type: 'bar' as const,
          itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 20,
          barGap: '20%'
        },
        {
          name: '收入',
          data: sortedDates.map(d => Math.round((incomeMap.get(d) || 0) * 100) / 100),
          type: 'bar' as const,
          itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 20
        }
      ]
    } : null
  })()

  const hasData = stats && (stats.totalExpense > 0 || stats.totalIncome > 0)

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: 16, fontSize: 22, fontWeight: 600 }}>月度统计</h2>

      {/* 月份选择 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 100 }}
          options={availableYears.map(y => ({ value: y, label: `${y}年` }))}
        />
        <Select
          value={selectedMonth}
          onChange={setSelectedMonth}
          style={{ width: 90 }}
          options={Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: `${i + 1}月`
          }))}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : !hasData ? (
        <Empty
          description="该月暂无记录"
          style={{ marginTop: 60 }}
          image={<span style={{ fontSize: 48 }}>📊</span>}
        />
      ) : (
        <>
          {/* 月度汇总：支出 + 收入 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="stat-label">总支出</div>
              <div className="stat-value expense">
                ¥{stats!.totalExpense.toFixed(2)}
              </div>
            </div>
            <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="stat-label">总收入</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>
                ¥{stats!.totalIncome.toFixed(2)}
              </div>
            </div>
          </div>

          {/* 结余 */}
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-label">
              {selectedYear}年{selectedMonth}月 结余
            </div>
            <div style={{
              fontSize: 28,
              fontWeight: 700,
              color: (stats!.totalIncome - stats!.totalExpense) >= 0 ? '#52c41a' : '#ff4d4f'
            }}>
              ¥{(stats!.totalIncome - stats!.totalExpense).toFixed(2)}
            </div>
          </div>

          {/* 支出分类饼图 */}
          {pieOption && (
            <div className="stat-card">
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: '#333' }}>
                支出分类占比
              </div>
              <ReactEChartsCore
                echarts={echarts}
                option={pieOption}
                style={{ height: 260 }}
                notMerge
              />
            </div>
          )}

          {/* 每日收支对比图 */}
          {barOption && (
            <div className="stat-card">
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: '#333' }}>
                每日收支对比
              </div>
              <ReactEChartsCore
                echarts={echarts}
                option={barOption}
                style={{ height: 240 }}
                notMerge
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Statistics
