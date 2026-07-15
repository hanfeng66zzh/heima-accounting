// ===== Electron 适配器 =====
// 桌面版：通过 IPC 调用 Electron 主进程的 sql.js
// 这是 window.electronAPI 的薄包装，逻辑一行不变

import type { DbAdapter } from './dbAdapter'

export function createElectronAdapter(): DbAdapter {
  const api = window.electronAPI

  return {
    addExpense(record) {
      return api.addExpense(record)
    },
    getExpenses(filters) {
      return api.getExpenses(filters)
    },
    updateExpense(id, record) {
      return api.updateExpense(id, record)
    },
    deleteExpense(id) {
      return api.deleteExpense(id)
    },
    getMonthlyStats(year, month) {
      return api.getMonthlyStats(year, month)
    },
    getAllYears() {
      return api.getAllYears()
    },
    exportCSV() {
      return api.exportCSV()
    },
    importCSV() {
      return api.importCSV()
    }
  }
}
