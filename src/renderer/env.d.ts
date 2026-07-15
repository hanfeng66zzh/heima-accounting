/// <reference types="vite/client" />

interface ElectronAPI {
  addExpense: (record: {
    type: string
    amount: number
    categoryId: string
    subCategoryName: string
    date: string
    note: string
  }) => Promise<number>
  getExpenses: (filters?: {
    startDate?: string
    endDate?: string
    categoryId?: string
    type?: string
  }) => Promise<import('@shared/types').ExpenseRecord[]>
  updateExpense: (id: number, record: {
    type: string
    amount: number
    categoryId: string
    subCategoryName: string
    date: string
    note: string
  }) => Promise<void>
  deleteExpense: (id: number) => Promise<void>
  getMonthlyStats: (year: number, month: number) => Promise<{
    totalExpense: number
    totalIncome: number
    categoryBreakdown: { categoryId: string; total: number }[]
    dailyExpenses: { date: string; total: number }[]
    dailyIncomes: { date: string; total: number }[]
  }>
  getAllYears: () => Promise<number[]>
  exportCSV: () => Promise<{ success: boolean; message: string }>
  importCSV: () => Promise<{ success: boolean; message: string }>
}

interface Window {
  electronAPI: ElectronAPI
}
