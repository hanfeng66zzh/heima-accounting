// ===== 数据库统一接口 =====
// 桌面 Electron 和手机 Capacitor 都实现这个接口
// React 页面只依赖这个接口，不感知底层平台

import type { ExpenseRecord, CreateExpenseInput } from '@shared/types'

export interface DbAdapter {
  addExpense(record: CreateExpenseInput): Promise<number>
  getExpenses(filters?: {
    startDate?: string
    endDate?: string
    categoryId?: string
    type?: string
  }): Promise<ExpenseRecord[]>
  updateExpense(id: number, record: CreateExpenseInput): Promise<void>
  deleteExpense(id: number): Promise<void>
  getMonthlyStats(year: number, month: number): Promise<{
    totalExpense: number
    totalIncome: number
    categoryBreakdown: { categoryId: string; total: number }[]
    dailyExpenses: { date: string; total: number }[]
    dailyIncomes: { date: string; total: number }[]
  }>
  getAllYears(): Promise<number[]>
  exportCSV(): Promise<{ success: boolean; message: string }>
  importCSV(): Promise<{ success: boolean; message: string }>
}
