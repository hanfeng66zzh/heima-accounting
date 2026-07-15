import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getMonthlyStats,
  getAllYears,
  exportToCSV,
  importFromCSV
} from './database'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 720,
    minWidth: 360,
    minHeight: 600,
    title: '黑马记账',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    // 窗口外观
    titleBarStyle: 'hiddenInset', // Mac 上使用内嵌标题栏
    ...(process.platform === 'win32' ? {
      // Windows 风格
      autoHideMenuBar: true
    } : {})
  })

  // 开发环境加载 dev server，生产环境加载打包文件
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ===== 注册 IPC 通信处理 =====

function registerIpcHandlers(): void {
  // 新增花销
  ipcMain.handle('expense:add', (_event, record) => {
    return addExpense(record)
  })

  // 查询花销列表
  ipcMain.handle('expense:list', (_event, filters) => {
    return getExpenses(filters)
  })

  // 更新花销
  ipcMain.handle('expense:update', (_event, id, record) => {
    return updateExpense(id, record)
  })

  // 删除花销
  ipcMain.handle('expense:delete', (_event, id) => {
    return deleteExpense(id)
  })

  // 月度统计
  ipcMain.handle('stats:monthly', (_event, year, month) => {
    return getMonthlyStats(year, month)
  })

  // 获取所有有记录的年份
  ipcMain.handle('stats:years', () => {
    return getAllYears()
  })

  // ===== CSV 导入导出 =====

  // 导出 CSV
  ipcMain.handle('csv:export', async () => {
    if (!mainWindow) return { success: false, message: '窗口未就绪' }
    try {
      const csvContent = await exportToCSV()
      const result = await dialog.showSaveDialog(mainWindow, {
        title: '导出账单数据',
        defaultPath: `黑马记账_导出_${new Date().toISOString().slice(0, 10)}.csv`,
        filters: [
          { name: 'CSV 文件', extensions: ['csv'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })
      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, csvContent, 'utf-8')
        return { success: true, message: `成功导出到 ${result.filePath}` }
      }
      return { success: false, message: '用户取消' }
    } catch (err: any) {
      return { success: false, message: `导出失败: ${err.message}` }
    }
  })

  // 导入 CSV
  ipcMain.handle('csv:import', async () => {
    if (!mainWindow) return { success: false, message: '窗口未就绪' }
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: '导入账单数据',
        filters: [
          { name: 'CSV 文件', extensions: ['csv'] },
          { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
      })
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: '用户取消' }
      }
      const csvContent = fs.readFileSync(result.filePaths[0], 'utf-8')
      const importResult = await importFromCSV(csvContent)
      return {
        success: importResult.success > 0,
        message: `导入完成：成功 ${importResult.success} 条` +
          (importResult.skipped > 0 ? `，跳过 ${importResult.skipped} 条` : '') +
          (importResult.errors.length > 0 ? `\n错误详情:\n${importResult.errors.slice(0, 10).join('\n')}` +
            (importResult.errors.length > 10 ? `\n...还有 ${importResult.errors.length - 10} 条错误` : '') : '')
      }
    } catch (err: any) {
      return { success: false, message: `导入失败: ${err.message}` }
    }
  })
}

// ===== 应用生命周期 =====

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
