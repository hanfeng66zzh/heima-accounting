import React, { useEffect, useState } from 'react'
import { Select, DatePicker, Popconfirm, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { useStore } from '../store/useStore'
import { getDbAdapter } from '../adapters'
import type { ExpenseRecord, Category } from '@shared/types'

const RecordList: React.FC = () => {
  const {
    records, setRecords,
    categories, incomeCategories,
    refreshKey,
    filterCategoryId, setFilterCategoryId,
    filterMonth, setFilterMonth,
    setEditingRecord,
    triggerRefresh
  } = useStore()

  // 所有分类（支出 + 收入），用于筛选
  const allCategories = [...categories, ...incomeCategories]

  const [loading, setLoading] = useState(false)

  // 加载数据
  useEffect(() => {
    loadRecords()
  }, [refreshKey, filterCategoryId, filterMonth])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (filterCategoryId) filters.categoryId = filterCategoryId
      if (filterMonth) {
        filters.startDate = `${filterMonth}-01`
        // 计算月底
        const [y, m] = filterMonth.split('-').map(Number)
        const lastDay = new Date(y, m, 0).getDate()
        filters.endDate = `${filterMonth}-${String(lastDay).padStart(2, '0')}`
      }
      const data = await getDbAdapter().getExpenses(filters)
      setRecords(data)
    } catch (err) {
      console.error('加载账单失败:', err)
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record: ExpenseRecord) => {
    setEditingRecord(record)
  }

  const handleDelete = async (id: number) => {
    try {
      await getDbAdapter().deleteExpense(id)
      message.success('已删除')
      triggerRefresh()
    } catch (err) {
      message.error('删除失败')
    }
  }

  const getCategoryInfo = (categoryId: string): Category | undefined => {
    return allCategories.find(c => c.id === categoryId)
  }

  // 按日期分组
  const groupByDate = (): Map<string, ExpenseRecord[]> => {
    const map = new Map<string, ExpenseRecord[]>()
    records.forEach(r => {
      const key = r.date
      const existing = map.get(key) || []
      existing.push(r)
      map.set(key, existing)
    })
    return map
  }

  const groupedRecords = groupByDate()

  // 计算日汇总（区分收支）
  const getDayTotal = (records: ExpenseRecord[]): { expense: number; income: number } => {
    let expense = 0
    let income = 0
    records.forEach(r => {
      if (r.type === 'income') {
        income += r.amount
      } else {
        expense += r.amount
      }
    })
    return { expense, income }
  }

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: 16, fontSize: 22, fontWeight: 600 }}>账单列表</h2>

      {/* 筛选栏 */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16
      }}>
        <Select
          placeholder="全部分类"
          allowClear
          value={filterCategoryId}
          onChange={(val) => setFilterCategoryId(val || null)}
          style={{ flex: 1 }}
          options={allCategories.map(c => ({
            value: c.id,
            label: `${c.icon} ${c.name}`
          }))}
        />
        <DatePicker
          picker="month"
          placeholder="选择月份"
          value={filterMonth ? dayjs(filterMonth) : null}
          onChange={(d: Dayjs | null) => setFilterMonth(d ? d.format('YYYY-MM') : null)}
          allowClear
          style={{ flex: 1 }}
          maxDate={dayjs()}
        />
      </div>

      {/* 账单列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>加载中...</div>
      ) : records.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60, color: '#999',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 48 }}>📝</span>
          <div style={{ fontSize: 16 }}>还没有账单记录</div>
          <div style={{ fontSize: 13, color: '#bbb' }}>去「记账」页面添加第一笔吧</div>
        </div>
      ) : (
        Array.from(groupedRecords.entries()).map(([date, dayRecords]) => {
          const dayTotal = getDayTotal(dayRecords)
          const dayLabel = dayjs(date).format('M月D日 dddd')

          return (
            <div key={date} style={{ marginBottom: 16 }}>
              {/* 日期标题 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 4px 8px',
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}>{dayLabel}</span>
                <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                  {dayTotal.expense > 0 && (
                    <span style={{ color: '#999' }}>
                      支出 <span style={{ color: '#ff4d4f', fontWeight: 500 }}>¥{dayTotal.expense.toFixed(2)}</span>
                    </span>
                  )}
                  {dayTotal.income > 0 && (
                    <span style={{ color: '#999' }}>
                      收入 <span style={{ color: '#52c41a', fontWeight: 500 }}>¥{dayTotal.income.toFixed(2)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 该日账单 */}
              {dayRecords.map(record => {
                const cat = getCategoryInfo(record.categoryId)
                const isIncome = record.type === 'income'
                return (
                  <div key={record.id} className="expense-card fade-in">
                    <div className="expense-card-left">
                      <div className="expense-card-icon" style={{
                        background: isIncome ? '#f0fff0' : '#f0f5ff'
                      }}>
                        {cat?.icon || '📦'}
                      </div>
                      <div className="expense-card-info">
                        <span className="expense-card-category">
                          {cat?.name || record.categoryId}
                        </span>
                        <span className="expense-card-subcategory">
                          {record.subCategoryName}
                          {record.note ? ` · ${record.note}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="expense-card-right">
                      <div style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: isIncome ? '#52c41a' : '#ff4d4f'
                      }}>
                        {isIncome ? '+' : '-'}¥{record.amount.toFixed(2)}
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                        <EditOutlined
                          style={{ fontSize: 14, color: '#999', cursor: 'pointer' }}
                          onClick={() => {
                            handleEdit(record)
                          }}
                        />
                        <Popconfirm
                          title="确定要删除这条记录吗？"
                          onConfirm={() => handleDelete(record.id)}
                          okText="删除"
                          cancelText="取消"
                        >
                          <DeleteOutlined
                            style={{ fontSize: 14, color: '#ff7875', cursor: 'pointer' }}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}

export default RecordList
