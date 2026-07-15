import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 花销记录
  addExpense: (record: {
    type: string
    amount: number
    categoryId: string
    subCategoryName: string
    date: string
    note: string
  }) => ipcRenderer.invoke('expense:add', record),

  getExpenses: (filters?: {
    startDate?: string
    endDate?: string
    categoryId?: string
    type?: string
  }) => ipcRenderer.invoke('expense:list', filters),

  updateExpense: (id: number, record: {
    type: string
    amount: number
    categoryId: string
    subCategoryName: string
    date: string
    note: string
  }) => ipcRenderer.invoke('expense:update', id, record),

  deleteExpense: (id: number) => ipcRenderer.invoke('expense:delete', id),

  // 统计
  getMonthlyStats: (year: number, month: number): Promise<{
    totalExpense: number
    totalIncome: number
    categoryBreakdown: { categoryId: string; total: number }[]
    dailyExpenses: { date: string; total: number }[]
    dailyIncomes: { date: string; total: number }[]
  }> => ipcRenderer.invoke('stats:monthly', year, month),

  getAllYears: () => ipcRenderer.invoke('stats:years'),

  // CSV 导入导出
  exportCSV: () => ipcRenderer.invoke('csv:export'),
  importCSV: () => ipcRenderer.invoke('csv:import')
})
