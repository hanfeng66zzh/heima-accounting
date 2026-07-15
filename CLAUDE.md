# 黑马记账 (HeiMa Accounting)

## 项目概述
个人记账桌面应用，支持 Windows 和 Mac，记录人民币花销并支持二级分类。

## 用户背景
- 用户无编程技术背景，是产品需求方
- **核心原则**：所有技术决策必须由我列出方案 + 解释优劣，由用户来拍板，不可自行决定
- 解释技术方案时使用通俗语言和类比，避免专业黑话
- 任何涉及"选哪个"的问题，必须先列方案给用户选择

## 技术栈
- 桌面框架：**Electron**（Chromium 浏览器壳 + Node.js）
- 前端框架：**React + TypeScript**
- UI 组件库：**Ant Design**（antd）
- 图标库：**@ant-design/icons**
- 数据库：**sql.js**（纯 JavaScript 版 SQLite，无需编译）
- 图表库：**ECharts**（通过 echarts-for-react）
- 构建工具：**Vite + electron-vite**
- 打包工具：**electron-builder**
- 手机框架：**Capacitor**（复用 React UI，打包为 iOS/Android App）
- 架构模式：**适配器模式**（`dbAdapter` 抽象数据库访问，桌面用 Electron IPC，手机用 Web 存储）

## 环境注意事项
- 启动应用前必须解除 `ELECTRON_RUN_AS_NODE` 环境变量（设为 1 会导致 Electron 无法正常启动）
- 已通过 npm scripts 自动处理（通过 bash -c 'unset ...' 前缀）
- 使用国内镜像源下载 Electron 二进制：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/`

## 项目结构
```
黑马记账app/
├── CLAUDE.md                  # 项目说明（本文件）
├── package.json
├── electron.vite.config.ts    # electron-vite 配置
├── electron-builder.yml       # 打包配置
├── src/
│   ├── main/                  # Electron 主进程
│   │   ├── index.ts           # 主进程入口
│   │   └── database.ts        # SQLite 数据库管理
│   ├── preload/               # 预加载脚本
│   │   └── index.ts           # IPC 桥接
│   ├── renderer/              # React 渲染进程
│   │   ├── index.html         # HTML 入口
│   │   ├── main.tsx           # React 入口
│   │   ├── App.tsx            # 根组件 + 路由
│   │   ├── pages/             # 页面组件
│   │   │   ├── AddRecord.tsx  # 记账页（首页）
│   │   │   ├── RecordList.tsx # 账单列表页
│   │   │   ├── Statistics.tsx # 统计页
│   │   │   └── Settings.tsx   # 设置页
│   │   ├── adapters/          # 平台适配器（桌面/手机）
│   │   │   ├── index.ts       # 自动选择适配器
│   │   │   ├── dbAdapter.ts   # 统一数据库接口
│   │   │   ├── electronAdapter.ts  # Electron IPC 适配器
│   │   │   └── webAdapter.ts  # Web/Capacitor 适配器
│   │   ├── components/        # 通用组件
│   │   ├── store/             # 状态管理
│   │   │   └── useStore.ts    # Zustand store
│   │   └── styles/            # 样式文件
│   │       └── global.css
│   └── shared/                # 共享类型
│       └── types.ts           # 数据类型定义
├── capacitor.config.ts        # Capacitor 手机 App 配置
├── vite.mobile.config.ts      # 手机版 Vite 构建配置
└── resources/                 # 应用图标等资源
```

## 开发约定
1. 每次涉及技术决策时，列出 2-4 个方案，每个方案说明"是什么、优点、缺点、推荐理由"
2. 使用类比帮助用户理解技术概念（如：Electron = "给网页套浏览器外壳"）
3. 功能实现前先确认需求是否理解正确
4. 所有 UI 文案使用中文
5. 金额统一使用人民币（¥），保留两位小数
6. 遵循 Ant Design 设计规范，保持界面整洁
7. 先实现 P0 核心功能，再逐步完善 P1/P2

## 功能范围
### P0（MVP — 最先实现）
- ✅ 新增一笔花销（金额、分类、日期、备注）
- ✅ 花销列表展示（按日期倒序、筛选）
- ✅ 二级分类体系（12 大分类 + 50+ 二级分类）
- ✅ 本地数据持久化（SQLite）

### P1（重要功能）
- 编辑/删除已有记录
- 月度统计（总支出、分类饼图、趋势图）
- 分类管理（自定义增删分类）

### P2（锦上添花）
- 数据导出（CSV/Excel）
- 月度预算设置与超支提醒

## 分类体系
| 一级分类 | 二级分类 |
|----------|----------|
| 餐饮 | 早餐、午餐、晚餐、零食、饮品、聚餐、外卖 |
| 交通 | 公交地铁、打车、加油、停车费、火车票、机票、共享单车 |
| 购物 | 日用品、数码产品、家居用品、宠物用品、办公用品 |
| 住房 | 房租、房贷、物业费、水电燃气、维修、家居装修 |
| 娱乐 | 游戏、电影、音乐会员、旅游、运动健身、KTV、书籍 |
| 医疗 | 门诊、药品、体检、住院、牙科 |
| 教育 | 培训课程、考试报名、书籍资料、文具 |
| 通讯 | 话费、网费、快递 |
| 服饰 | 衣服、鞋包、配饰、美妆护肤 |
| 人情 | 送礼、红包、聚会聚餐、孝敬父母 |
| 金融 | 理财亏损、手续费、保险、借贷利息 |
| 其他 | 不归属以上分类的支出 |
