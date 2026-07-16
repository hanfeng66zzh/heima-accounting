# 📱 黑马记账

<p align="center">
  <img src="https://img.shields.io/badge/Windows-支持-0078D6?logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/Android-支持-34A853?logo=android&logoColor=white" alt="Android">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

<p align="center">
  <b>💰 记录每一笔花销，让消费有迹可循</b>
</p>

---

## ✨ 项目简介

黑马记账是一款**个人记账应用**，同时支持桌面（Windows / macOS）和手机（Android）。

- 记录日常收支，支持 **12 大支出分类 + 6 大收入分类**，每个一级分类下有多个二级分类
- 月度统计图表（饼图 + 柱状图），直观了解钱花在哪
- 数据全部保存在**本地**，无需注册账号，无需联网，保护隐私
- **一套代码**同时跑桌面和手机，界面和操作体验一致

---

## 📋 功能特性

| 功能 | 桌面版 | 手机版 | 说明 |
|------|:---:|:---:|------|
| 记一笔（支出 / 收入） | ✅ | ✅ | 选择分类 → 填金额 → 选日期 → 保存 |
| 收支二级分类 | ✅ | ✅ | 12 类支出 + 6 类收入，共 50+ 二级分类 |
| 账单列表 | ✅ | ✅ | 按日期分组显示，支持分类和月份筛选 |
| 编辑 / 删除记录 | ✅ | ✅ | 点击编辑回到记账页回填数据 |
| 月度统计 | ✅ | ✅ | 总收支、结余、分类饼图、每日收支对比柱状图 |
| 数据导出 CSV | ✅ | ✅ | 导出账单为 CSV 文件 |
| 数据导入 CSV | ✅ | ✅ | 从 CSV 文件导入账单 |

---

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 🖥 桌面框架 | **Electron** + electron-vite | 把网页打包成 Windows / Mac 桌面应用 |
| 📱 手机框架 | **Capacitor** | 把网页打包成 Android App（iOS 待适配） |
| ⚛️ 前端框架 | **React 18** + **TypeScript** | 界面全部用 React 组件编写 |
| 🎨 UI 组件库 | **Ant Design 5** | 蚂蚁金服出品的企业级 UI 组件库 |
| 📊 图表 | **ECharts 5** | 百度出品的可视化图表库 |
| 🗄 数据库 | **sql.js** | SQLite 的纯 JavaScript 版本，无需安装 |
| 📦 状态管理 | **Zustand** | 轻量级 React 状态管理 |
| 🔧 构建工具 | **Vite 5** | 新一代前端构建工具，开发体验极快 |

### 架构亮点：适配器模式

```
React 页面  →  dbAdapter（统一接口）
                  ├── ElectronAdapter  →  IPC 通信  →  Main 进程 sql.js  →  磁盘文件
                  └── WebAdapter       →  localStorage（手机 / 浏览器环境）
```

- 页面代码**只依赖接口**，不感知底层是桌面还是手机
- 桌面版数据存磁盘文件，手机版数据存浏览器 localStorage
- 切换环境时**自动选择**对应适配器，无需手动配置

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18
- **npm** ≥ 8
- （仅手机版）**Android Studio** + JDK 17+

### 桌面版开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（自动打开桌面窗口）
npm run dev
```

### 桌面版打包

```bash
# 打包为可安装的 exe / dmg
npm run dist
```

> 💡 打包输出在 `dist/` 目录下

### 手机版开发（Android）

```bash
# 1. 安装依赖（如果还没装）
npm install

# 2. 构建手机版网页
npm run mobile:build

# 3. 同步到 Android 项目
npm run mobile:sync

# 4. 打开 Android Studio 运行到手机
npm run mobile:open:android
```

### 手机版命令行打包 APK

```bash
# 1. 构建网页 + 同步
npm run mobile:build
npm run mobile:sync

# 2. 用 Gradle 编译 APK
cd android
export JAVA_HOME="/e/Android Studio/jbr"   # macOS/Linux
./gradlew assembleDebug
```

> 💡 APK 输出位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### 可用命令一览

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动桌面开发模式 |
| `npm run build` | 构建桌面版 |
| `npm run dist` | 打包桌面安装包 |
| `npm run mobile:build` | 构建手机版网页 |
| `npm run mobile:sync` | 同步网页到 Android 项目 |
| `npm run mobile:open:android` | 用 Android Studio 打开项目 |

---

## 📂 项目结构

```
黑马记账app/
├── src/
│   ├── main/                    # Electron 主进程（桌面独有）
│   │   ├── index.ts             #   主进程入口
│   │   └── database.ts          #   SQLite 数据库管理
│   ├── preload/                 # 预加载脚本（桌面独有）
│   │   └── index.ts             #   IPC 通信桥接
│   ├── renderer/                # React 渲染进程（桌面 + 手机共用）
│   │   ├── App.tsx              #   根组件 + 底部导航路由
│   │   ├── main.tsx             #   React 入口
│   │   ├── pages/               #   页面组件
│   │   │   ├── AddRecord.tsx    #     记账页（首页）
│   │   │   ├── RecordList.tsx   #     账单列表页
│   │   │   ├── Statistics.tsx   #     统计页
│   │   │   └── Settings.tsx     #     设置页
│   │   ├── adapters/            #   平台适配器
│   │   │   ├── dbAdapter.ts     #     统一数据库接口
│   │   │   ├── electronAdapter.ts #   桌面适配器
│   │   │   ├── webAdapter.ts    #     手机适配器
│   │   │   └── index.ts         #     自动选择适配器
│   │   ├── components/          #   通用组件
│   │   │   └── ErrorBoundary.tsx#     错误边界（安全气囊）
│   │   ├── store/               #   状态管理
│   │   └── styles/              #   样式文件
│   └── shared/                  # 共享类型定义
│       └── types.ts             #   数据类型 + 预设分类
├── android/                     # Android 项目（Capacitor 生成）
├── capacitor.config.ts          # Capacitor 手机配置
├── vite.mobile.config.ts        # 手机版 Vite 构建配置
├── electron.vite.config.ts      # 桌面版 Vite 构建配置
├── electron-builder.yml         # 桌面打包配置
└── package.json
```

---

## 🏷 分类体系

### 支出分类（12 大类）

| 分类 | 图标 | 二级分类 |
|------|:---:|------|
| 餐饮 | 🍜 | 早餐、午餐、晚餐、零食、饮品、聚餐、外卖 |
| 交通 | 🚗 | 公交地铁、打车、加油、停车费、火车票、机票、共享单车 |
| 购物 | 🛒 | 日用品、数码产品、家居用品、宠物用品、办公用品 |
| 住房 | 🏠 | 房租、房贷、物业费、水电燃气、维修、家居装修 |
| 娱乐 | 🎮 | 游戏、电影、音乐会员、旅游、运动健身、KTV、书籍 |
| 医疗 | 🏥 | 门诊、药品、体检、住院、牙科 |
| 教育 | 📚 | 培训课程、考试报名、书籍资料、文具 |
| 通讯 | 📱 | 话费、网费、快递 |
| 服饰 | 👔 | 衣服、鞋包、配饰、美妆护肤 |
| 人情 | 🎁 | 送礼、红包、聚会聚餐、孝敬父母 |
| 金融 | 💰 | 理财亏损、手续费、保险、借贷利息 |
| 其他 | 📦 | 不归属以上分类的支出 |

### 收入分类（6 大类）

| 分类 | 图标 | 二级分类 |
|------|:---:|------|
| 工资 | 💼 | 基本工资、绩效奖金、年终奖、加班补贴 |
| 投资收益 | 📈 | 基金收益、股票收益、理财利息、分红、房租收入 |
| 副业 | 💻 | 兼职、自由职业、咨询费、稿费 |
| 红包 | 🧧 | 微信红包、节日红包、生日红包、礼金 |
| 退款报销 | 💳 | 购物退款、差旅报销、话费报销、医保报销 |
| 其他收入 | 📥 | 其他收入 |

---

## 🗺 功能路线图

- [x] **P0** — 记账（金额、分类、日期、备注）
- [x] **P0** — 收支二级分类（12 + 6 大类，50+ 二级分类）
- [x] **P0** — 账单列表（按日期倒序、分类筛选、月份筛选）
- [x] **P0** — 本地数据持久化
- [x] **P1** — 编辑 / 删除记录
- [x] **P1** — 月度统计（总收支、分类饼图、每日对比柱状图）
- [x] **P1** — 手机版（Android APK）
- [x] **P2** — 数据导出 CSV
- [x] **P2** — 数据导入 CSV
- [ ] **P2** — 分类管理（自定义增删分类）
- [ ] **P2** — 月度预算设置与超支提醒
- [ ] **P3** — iOS 手机版适配

---

## 📄 许可证

MIT License

---

<p align="center">
  <sub>Made with ❤️ by 涵枫</sub>
</p>
