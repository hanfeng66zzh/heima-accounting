// ===== 分类数据结构 =====
export interface SubCategory {
  name: string
}

export interface Category {
  id: string
  name: string
  icon: string
  subCategories: SubCategory[]
}

// ===== 交易类型 =====
export type TransactionType = 'expense' | 'income'

// ===== 花销记录 =====
export interface ExpenseRecord {
  id: number
  type: TransactionType // 支出还是收入
  amount: number // 金额（元），保留两位小数
  categoryId: string // 一级分类 ID
  subCategoryName: string // 二级分类名称
  date: string // 日期 YYYY-MM-DD
  note: string // 备注
  createdAt: string // 创建时间 ISO string
}

// 新建记录的输入类型（不含 id 和 createdAt）
export interface CreateExpenseInput {
  type: TransactionType
  amount: number
  categoryId: string
  subCategoryName: string
  date: string
  note: string
}

// ===== 统计相关 =====
export interface MonthlyStats {
  totalExpense: number
  categoryBreakdown: CategoryBreakdown[]
  dailyExpenses: DailyExpense[]
}

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  total: number
  percentage: number
}

export interface DailyExpense {
  date: string
  total: number
}

// ===== 预设分类数据 =====
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: '餐饮',
    icon: '🍜',
    subCategories: [
      { name: '早餐' },
      { name: '午餐' },
      { name: '晚餐' },
      { name: '零食' },
      { name: '饮品' },
      { name: '聚餐' },
      { name: '外卖' }
    ]
  },
  {
    id: 'transport',
    name: '交通',
    icon: '🚗',
    subCategories: [
      { name: '公交地铁' },
      { name: '打车' },
      { name: '加油' },
      { name: '停车费' },
      { name: '火车票' },
      { name: '机票' },
      { name: '共享单车' }
    ]
  },
  {
    id: 'shopping',
    name: '购物',
    icon: '🛒',
    subCategories: [
      { name: '日用品' },
      { name: '数码产品' },
      { name: '家居用品' },
      { name: '宠物用品' },
      { name: '办公用品' }
    ]
  },
  {
    id: 'housing',
    name: '住房',
    icon: '🏠',
    subCategories: [
      { name: '房租' },
      { name: '房贷' },
      { name: '物业费' },
      { name: '水电燃气' },
      { name: '维修' },
      { name: '家居装修' }
    ]
  },
  {
    id: 'entertainment',
    name: '娱乐',
    icon: '🎮',
    subCategories: [
      { name: '游戏' },
      { name: '电影' },
      { name: '音乐会员' },
      { name: '旅游' },
      { name: '运动健身' },
      { name: 'KTV' },
      { name: '书籍' }
    ]
  },
  {
    id: 'medical',
    name: '医疗',
    icon: '🏥',
    subCategories: [
      { name: '门诊' },
      { name: '药品' },
      { name: '体检' },
      { name: '住院' },
      { name: '牙科' }
    ]
  },
  {
    id: 'education',
    name: '教育',
    icon: '📚',
    subCategories: [
      { name: '培训课程' },
      { name: '考试报名' },
      { name: '书籍资料' },
      { name: '文具' }
    ]
  },
  {
    id: 'communication',
    name: '通讯',
    icon: '📱',
    subCategories: [
      { name: '话费' },
      { name: '网费' },
      { name: '快递' }
    ]
  },
  {
    id: 'clothing',
    name: '服饰',
    icon: '👔',
    subCategories: [
      { name: '衣服' },
      { name: '鞋包' },
      { name: '配饰' },
      { name: '美妆护肤' }
    ]
  },
  {
    id: 'social',
    name: '人情',
    icon: '🎁',
    subCategories: [
      { name: '送礼' },
      { name: '红包' },
      { name: '聚会聚餐' },
      { name: '孝敬父母' }
    ]
  },
  {
    id: 'finance',
    name: '金融',
    icon: '💰',
    subCategories: [
      { name: '理财亏损' },
      { name: '手续费' },
      { name: '保险' },
      { name: '借贷利息' }
    ]
  },
  {
    id: 'other',
    name: '其他支出',
    icon: '📦',
    subCategories: [
      { name: '其他支出' }
    ]
  }
]

// ===== 收入分类 =====
export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: '工资',
    icon: '💼',
    subCategories: [
      { name: '基本工资' },
      { name: '绩效奖金' },
      { name: '年终奖' },
      { name: '加班补贴' }
    ]
  },
  {
    id: 'investment',
    name: '投资收益',
    icon: '📈',
    subCategories: [
      { name: '基金收益' },
      { name: '股票收益' },
      { name: '理财利息' },
      { name: '分红' },
      { name: '房租收入' }
    ]
  },
  {
    id: 'sideline',
    name: '副业',
    icon: '💻',
    subCategories: [
      { name: '兼职' },
      { name: '自由职业' },
      { name: '咨询费' },
      { name: '稿费' }
    ]
  },
  {
    id: 'redpacket',
    name: '红包',
    icon: '🧧',
    subCategories: [
      { name: '微信红包' },
      { name: '节日红包' },
      { name: '生日红包' },
      { name: '礼金' }
    ]
  },
  {
    id: 'refund',
    name: '退款报销',
    icon: '💳',
    subCategories: [
      { name: '购物退款' },
      { name: '差旅报销' },
      { name: '话费报销' },
      { name: '医保报销' }
    ]
  },
  {
    id: 'other_income',
    name: '其他收入',
    icon: '📥',
    subCategories: [
      { name: '其他收入' }
    ]
  }
]
