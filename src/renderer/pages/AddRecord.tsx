import React, { useState, useEffect } from 'react'
import { Button, Input, DatePicker, InputNumber, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useStore } from '../store/useStore'
import { getDbAdapter } from '../adapters'
import type { TransactionType } from '@shared/types'

const AddRecord: React.FC = () => {
  const {
    categories, incomeCategories,
    transactionType, setTransactionType,
    selectedCategoryId, setSelectedCategoryId,
    selectedSubCategory, setSelectedSubCategory,
    editingRecord, setEditingRecord,
    triggerRefresh
  } = useStore()

  const [amount, setAmount] = useState<number | null>(null)
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [note, setNote] = useState('')

  // 当前类型对应的分类列表
  const currentCategories = transactionType === 'expense' ? categories : incomeCategories

  // 编辑模式：回填数据
  useEffect(() => {
    if (editingRecord) {
      setAmount(editingRecord.amount)
      setDate(dayjs(editingRecord.date))
      setNote(editingRecord.note)
      setTransactionType(editingRecord.type || 'expense')
      setSelectedCategoryId(editingRecord.categoryId)
      setSelectedSubCategory(editingRecord.subCategoryName)
    }
  }, [editingRecord])

  const currentCategory = currentCategories.find(c => c.id === selectedCategoryId)

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      message.warning('请输入金额')
      return
    }
    if (!selectedCategoryId) {
      message.warning('请选择分类')
      return
    }
    if (!selectedSubCategory) {
      message.warning('请选择二级分类')
      return
    }

    const record = {
      type: transactionType,
      amount,
      categoryId: selectedCategoryId,
      subCategoryName: selectedSubCategory,
      date: date.format('YYYY-MM-DD'),
      note
    }

    try {
      if (editingRecord) {
        await getDbAdapter().updateExpense(editingRecord.id, record)
        message.success('修改成功')
        setEditingRecord(null)
      } else {
        await getDbAdapter().addExpense(record)
        message.success(transactionType === 'expense' ? '记账成功' : '收入记录成功')
      }
      // 重置表单
      setAmount(null)
      setSelectedCategoryId(null)
      setSelectedSubCategory(null)
      setDate(dayjs())
      setNote('')
      setTransactionType('expense')
      triggerRefresh()
    } catch (err) {
      message.error('操作失败，请重试')
      console.error(err)
    }
  }

  const handleCancelEdit = () => {
    setEditingRecord(null)
    setAmount(null)
    setSelectedCategoryId(null)
    setSelectedSubCategory(null)
    setDate(dayjs())
    setNote('')
    setTransactionType('expense')
  }

  const isExpense = transactionType === 'expense'

  return (
    <div className="page-container">
      {/* 标题 */}
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 600 }}>
        {editingRecord ? '编辑账单' : '记一笔'}
      </h2>

      {/* 收入/支出切换 */}
      <div style={{
        display: 'flex',
        background: '#f0f0f0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16
      }}>
        <button
          onClick={() => setTransactionType('expense')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: isExpense ? 600 : 400,
            cursor: 'pointer',
            background: isExpense ? '#fff' : 'transparent',
            color: isExpense ? '#ff4d4f' : '#999',
            boxShadow: isExpense ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          💸 支出
        </button>
        <button
          onClick={() => setTransactionType('income')}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: !isExpense ? 600 : 400,
            cursor: 'pointer',
            background: !isExpense ? '#fff' : 'transparent',
            color: !isExpense ? '#52c41a' : '#999',
            boxShadow: !isExpense ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          💰 收入
        </button>
      </div>

      {/* 金额输入 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 16px',
        marginBottom: 16,
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
          {isExpense ? '支出金额（元）' : '收入金额（元）'}
        </div>
        <InputNumber
          value={amount}
          onChange={(val) => setAmount(val)}
          placeholder="0.00"
          style={{
            fontSize: 36,
            fontWeight: 700,
            width: '100%',
            border: 'none',
            textAlign: 'center',
            color: isExpense ? '#ff4d4f' : '#52c41a'
          }}
          controls={false}
          precision={2}
          min={0}
          max={9999999}
          size="large"
          variant="borderless"
          stringMode
          autoFocus
        />
      </div>

      {/* 一级分类选择 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: '#333' }}>
          {isExpense ? '选择支出分类' : '选择收入来源'}
        </div>
        <div className="category-grid">
          {currentCategories.map(cat => (
            <div
              key={cat.id}
              className={`category-item ${selectedCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 二级分类选择 */}
      {currentCategory && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#333' }}>
            {currentCategory.icon} {currentCategory.name} — 具体分类
          </div>
          <div className="subcategory-tags">
            {currentCategory.subCategories.map(sub => (
              <button
                key={sub.name}
                className={`subcategory-tag ${selectedSubCategory === sub.name ? 'active' : ''}`}
                onClick={() => setSelectedSubCategory(sub.name)}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 日期与备注 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>日期</div>
          <DatePicker
            value={date}
            onChange={(d) => setDate(d || dayjs())}
            style={{ width: '100%' }}
            allowClear={false}
            maxDate={dayjs()}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>备注（可选）</div>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isExpense ? '例如：和同事聚餐AA' : '例如：12月工资'}
            maxLength={100}
          />
        </div>
      </div>

      {/* 提交按钮 */}
      <div style={{ display: 'flex', gap: 12 }}>
        {editingRecord && (
          <Button size="large" style={{ flex: 1 }} onClick={handleCancelEdit}>
            取消编辑
          </Button>
        )}
        <Button
          type="primary"
          size="large"
          block
          onClick={handleSubmit}
          style={{
            height: 50,
            fontSize: 17,
            fontWeight: 600,
            borderRadius: 25,
            background: isExpense ? '#ff4d4f' : '#52c41a',
            borderColor: isExpense ? '#ff4d4f' : '#52c41a'
          }}
        >
          {editingRecord
            ? '保存修改'
            : isExpense
              ? '✓ 记录支出'
              : '✓ 记录收入'}
        </Button>
      </div>
    </div>
  )
}

export default AddRecord
