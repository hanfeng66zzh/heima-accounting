// ===== Web 适配器 =====
// 手机版/浏览器版：在浏览器内存中运行 sql.js
// 数据持久化到 localStorage（Capacitor 环境下可用 Capacitor Filesystem 替代）

import type { DbAdapter } from './dbAdapter'
import type { ExpenseRecord, CreateExpenseInput } from '@shared/types'

const STORAGE_KEY = 'heima_accounting_db'

// 简单的 localStorage JSON 存储（浏览器兼容，无需 WASM）
// 数据量不大的记账场景完全够用
function loadRecords(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecords(records: ExpenseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (err) {
    console.error('保存数据失败:', err)
  }
}

let nextId = 1

export function createWebAdapter(): DbAdapter {
  // 初始化：计算下一个 ID
  const existing = loadRecords()
  if (existing.length > 0) {
    nextId = Math.max(...existing.map(r => r.id)) + 1
  }

  return {
    async addExpense(record) {
      const records = loadRecords()
      const newRecord: ExpenseRecord = {
        id: nextId++,
        type: record.type,
        amount: record.amount,
        categoryId: record.categoryId,
        subCategoryName: record.subCategoryName,
        date: record.date,
        note: record.note,
        createdAt: new Date().toISOString()
      }
      records.push(newRecord)
      saveRecords(records)
      return newRecord.id
    },

    async getExpenses(filters) {
      let records = loadRecords()

      if (filters?.startDate) {
        records = records.filter(r => r.date >= filters.startDate!)
      }
      if (filters?.endDate) {
        records = records.filter(r => r.date <= filters.endDate!)
      }
      if (filters?.categoryId) {
        records = records.filter(r => r.categoryId === filters.categoryId)
      }
      if (filters?.type) {
        records = records.filter(r => r.type === filters.type)
      }

      // 按日期和 ID 倒序
      records.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      return records
    },

    async updateExpense(id, record) {
      const records = loadRecords()
      const idx = records.findIndex(r => r.id === id)
      if (idx !== -1) {
        records[idx] = {
          ...records[idx],
          type: record.type,
          amount: record.amount,
          categoryId: record.categoryId,
          subCategoryName: record.subCategoryName,
          date: record.date,
          note: record.note
        }
        saveRecords(records)
      }
    },

    async deleteExpense(id) {
      let records = loadRecords()
      records = records.filter(r => r.id !== id)
      saveRecords(records)
    },

    async getMonthlyStats(year, month) {
      const records = loadRecords()
      const monthStr = `${year}-${String(month).padStart(2, '0')}`
      const monthRecords = records.filter(r => r.date.startsWith(monthStr))

      const expenseRecords = monthRecords.filter(r => r.type !== 'income')
      const incomeRecords = monthRecords.filter(r => r.type === 'income')

      const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0)
      const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0)

      // 支出分类汇总
      const catMap = new Map<string, number>()
      expenseRecords.forEach(r => {
        catMap.set(r.categoryId, (catMap.get(r.categoryId) || 0) + r.amount)
      })
      const categoryBreakdown = Array.from(catMap.entries())
        .map(([categoryId, total]) => ({ categoryId, total }))
        .sort((a, b) => b.total - a.total)

      // 每日支出汇总
      const dailyExpMap = new Map<string, number>()
      expenseRecords.forEach(r => {
        dailyExpMap.set(r.date, (dailyExpMap.get(r.date) || 0) + r.amount)
      })
      const dailyExpenses = Array.from(dailyExpMap.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // 每日收入汇总
      const dailyIncMap = new Map<string, number>()
      incomeRecords.forEach(r => {
        dailyIncMap.set(r.date, (dailyIncMap.get(r.date) || 0) + r.amount)
      })
      const dailyIncomes = Array.from(dailyIncMap.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return { totalExpense, totalIncome, categoryBreakdown, dailyExpenses, dailyIncomes }
    },

    async getAllYears() {
      const records = loadRecords()
      const years = new Set(records.map(r => r.date.substring(0, 4)))
      return Array.from(years).map(Number).sort((a, b) => b - a)
    },

    async exportCSV() {
      try {
        const records = loadRecords()
        records.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)

        const BOM = '﻿'
        const header = '类型,金额,一级分类ID,二级分类,日期,备注,创建时间'
        const rows = [header]

        for (const r of records) {
          const typeName = r.type === 'income' ? '收入' : '支出'
          const escapeCsv = (v: string) => v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
          rows.push([
            typeName, r.amount, escapeCsv(r.categoryId),
            escapeCsv(r.subCategoryName), r.date, escapeCsv(r.note || ''), r.createdAt
          ].join(','))
        }

        const csv = BOM + rows.join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `黑马记账_导出_${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)

        return { success: true, message: '导出成功' }
      } catch (err: any) {
        return { success: false, message: `导出失败: ${err.message}` }
      }
    },

    async importCSV() {
      try {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv'

        const file = await new Promise<File | null>((resolve) => {
          input.onchange = () => resolve(input.files?.[0] || null)
          input.click()
        })

        if (!file) return { success: false, message: '用户取消' }

        const text = await file.text()
        const content = text.replace(/^﻿/, '').trim()
        if (!content) return { success: false, message: '文件内容为空' }

        const lines = content.split('\n').map(line => {
          // 简易 CSV 解析
          const cells: string[] = []
          let cell = ''
          let inQuotes = false
          for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (inQuotes) {
              if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++ }
              else if (ch === '"') inQuotes = false
              else cell += ch
            } else {
              if (ch === '"') inQuotes = true
              else if (ch === ',') { cells.push(cell.trim()); cell = '' }
              else cell += ch
            }
          }
          cells.push(cell.trim())
          return cells
        })

        if (lines.length < 2) return { success: false, message: 'CSV 至少需要表头和一行数据' }

        const header = lines[0]
        const colMap: Record<string, number> = {}
        header.forEach((col, i) => { colMap[col] = i })

        const records = loadRecords()
        let success = 0
        let skipped = 0
        const errors: string[] = []

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i]
          if (row.length < 2) continue
          try {
            const get = (name: string, fb = '') => (colMap[name] !== undefined && row[colMap[name]]) ? row[colMap[name]] : fb
            const type = get('类型') === '收入' ? 'income' : 'expense'
            const amount = parseFloat(get('金额', '0'))
            if (isNaN(amount) || amount <= 0) { skipped++; continue }
            const date = get('日期')
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { skipped++; continue }

            records.push({
              id: nextId++,
              type, amount, date,
              categoryId: get('一级分类ID', 'other'),
              subCategoryName: get('二级分类', '其他'),
              note: get('备注', ''),
              createdAt: new Date().toISOString()
            })
            success++
          } catch {
            skipped++
          }
        }

        saveRecords(records)
        return {
          success: success > 0,
          message: `导入完成：成功 ${success} 条` + (skipped > 0 ? `，跳过 ${skipped} 条` : '')
        }
      } catch (err: any) {
        return { success: false, message: `导入失败: ${err.message}` }
      }
    }
  }
}
