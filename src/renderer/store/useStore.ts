import { create } from 'zustand'
import type { ExpenseRecord, Category, TransactionType } from '@shared/types'
import { DEFAULT_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@shared/types'

interface AppState {
  // 花销记录列表
  records: ExpenseRecord[]
  setRecords: (records: ExpenseRecord[]) => void

  // 支出分类数据
  categories: Category[]
  setCategories: (categories: Category[]) => void

  // 收入分类数据
  incomeCategories: Category[]
  setIncomeCategories: (categories: Category[]) => void

  // 当前交易类型（支出/收入）
  transactionType: TransactionType
  setTransactionType: (type: TransactionType) => void

  // 当前选中的一级分类 ID
  selectedCategoryId: string | null
  setSelectedCategoryId: (id: string | null) => void

  // 当前选中的二级分类名称
  selectedSubCategory: string | null
  setSelectedSubCategory: (name: string | null) => void

  // 正在编辑的记录（用于编辑模式）
  editingRecord: ExpenseRecord | null
  setEditingRecord: (record: ExpenseRecord | null) => void

  // 刷新触发器
  refreshKey: number
  triggerRefresh: () => void

  // 列表筛选
  filterCategoryId: string | null
  setFilterCategoryId: (id: string | null) => void
  filterMonth: string | null // YYYY-MM 格式
  setFilterMonth: (month: string | null) => void
}

export const useStore = create<AppState>((set) => ({
  records: [],
  setRecords: (records) => set({ records }),

  categories: DEFAULT_CATEGORIES,
  setCategories: (categories) => set({ categories }),

  incomeCategories: DEFAULT_INCOME_CATEGORIES,
  setIncomeCategories: (categories) => set({ incomeCategories: categories }),

  transactionType: 'expense',
  setTransactionType: (type) => set({ transactionType: type, selectedCategoryId: null, selectedSubCategory: null }),

  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id, selectedSubCategory: null }),

  selectedSubCategory: null,
  setSelectedSubCategory: (name) => set({ selectedSubCategory: name }),

  editingRecord: null,
  setEditingRecord: (record) => set({ editingRecord: record }),

  refreshKey: 0,
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),

  filterCategoryId: null,
  setFilterCategoryId: (id) => set({ filterCategoryId: id }),
  filterMonth: null,
  setFilterMonth: (month) => set({ filterMonth: month })
}))
