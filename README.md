# 黑马记账 (heima-accounting)

一个轻量的个人记账应用 — 以桌面（Electron）为主，同时提供移动端（Capacitor）构建路径。适合本地保存账目、查看账单与统计。

## 简介
黑马记账是一个跨平台的个人记账应用，桌面端基于 Electron + React 实现，数据保存在本地（使用 sql.js）。应用包含记账、账单列表、统计与设置等页面，支持通过 Capacitor 打包为移动应用壳。

### 技术栈
- **语言：** TypeScript、JavaScript
- **运行环境 / 框架：** Electron（桌面） + React（渲染层） + Vite（构建）；Capacitor（移动端）
- **主要依赖：** Ant Design（UI）、sql.js（SQLite 在浏览器中）、ECharts（图表）、Zustand（状态管理）、React Router

## 目录结构（重要项）
```
package.json                # 脚本与依赖（包括 dev/build/dist/mobile）
electron.vite.config.ts     # electron + vite 配置
electron-builder.yml       # 打包配置
vite.mobile.config.ts      # 移动端构建配置
capacitor.config.ts        # Capacitor 配置（移动）
android/                   # Capacitor 的 Android 原生项目
src/
  main/                    # Electron 主进程（应用生命周期、数据库）
    index.ts
    database.ts            # 基于 sql.js 的 DB 逻辑与迁移代码
  preload/                 # Preload 脚本，安全地将 API 暴露给渲染进程
    index.ts
  renderer/                # React 前端
    App.tsx
    pages/                 # AddRecord、RecordList、Statistics、Settings 等页面
    store/                 # zustand 状态（useStore）
    components/            # 共享组件（例如 ErrorBoundary）
  shared/                  # 共享类型定义（src/shared/types.ts）
build-portable.sh          # 打包为便携版的脚本
```

运行时说明：
- Electron 主进程（src/main）启动应用、初始化本地 sql.js 数据库（src/main/database.ts），并通过 IPC 或 contextBridge 暴露接口给渲染层。
- preload（src/preload/index.ts）导出最小化且安全的访问主进程能力给 renderer。
- 渲染层（src/renderer）为 React SPA，使用 Ant Design 做界面，Zustand 管理状态，ECharts 绘制统计图。

## 快速开始（从克隆到运行）
前置项：Node.js（建议 18+）、npm。移动端构建需 Android Studio / Xcode 等原生构建环境。

安装依赖：
```bash
npm ci
# 或
npm install
```

开发环境（热重载）：
```bash
npm run dev
```

构建与打包（桌面）：
```bash
# 编译 renderer & main
npm run build

# 将构建产物打包到目录（测试用）
npm run pack

# 生成安装包（依赖 electron-builder 的本地签名/配置）
npm run dist
```

本地预览生产构建：
```bash
npm run preview
```

移动端（Capacitor）流程：
```bash
# 构建移动端 web 资源
npm run mobile:build

# 同步到 Capacitor 原生项目
npm run mobile:sync

# 添加平台（一次性）
npm run mobile:add:android
npm run mobile:add:ios

# 打开原生 IDE
npm run mobile:open:android
npm run mobile:open:ios
```

注意：打包安装器需要在 electron-builder.yml 中配置签名与目标平台相关设置。

## 贡献
- 提交 Issue 报告 Bug 或提需求。
- 提交 PR 时针对默认分支，保持变更小而专注，并在 PR 描述中说明变更点。
- 若修改数据库结构或迁移，请更新 `src/main/database.ts` 中的迁移逻辑。

## 常见问题 / 代码指南
- 持久化：所有业务数据保存在本地 sqlite（sql.js），数据库初始化与迁移在 `src/main/database.ts`。
- 渲染层与主进程通信：在 `src/preload/index.ts` 中定义了 context bridge，渲染层通过该桥接调用主进程功能。
- 页面入口：`src/renderer/App.tsx` 管理四个主页面（记账、账单、统计、设置）。

---

如果你需要我之后把真实截图加入仓库或进一步调整文案，我可以随时帮你操作。