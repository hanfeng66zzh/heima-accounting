// ===== 适配器自动选择 =====
// 根据运行环境自动选择 Electron 或 Web 适配器

import type { DbAdapter } from './dbAdapter'
import { createElectronAdapter } from './electronAdapter'
import { createWebAdapter } from './webAdapter'

let _adapter: DbAdapter | null = null

export function getDbAdapter(): DbAdapter {
  if (_adapter) return _adapter

  try {
    // 如果 window.electronAPI 存在 → Electron 桌面环境
    if (typeof window !== 'undefined' && window.electronAPI) {
      _adapter = createElectronAdapter()
    } else {
      // 否则使用 Web 适配器（浏览器 / Capacitor 手机环境）
      _adapter = createWebAdapter()
    }
  } catch (err) {
    console.error('[DbAdapter] 创建适配器失败，降级为 Web 适配器:', err)
    _adapter = createWebAdapter()
  }

  return _adapter
}

export type { DbAdapter } from './dbAdapter'
