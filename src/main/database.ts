import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic } from 'sql.js'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

let SQL: SqlJsStatic | null = null
let db: SqlJsDatabase | null = null
let dbPath: string = ''

// 初始化 sql.js（加载 WASM 引擎）
async function initSql(): Promise<SqlJsStatic> {
  if (SQL) return SQL

  // sql.js 在 Node.js 环境下需要指定 WASM 文件路径
  const wasmPath = path.join(
    app.getAppPath(),
    'node_modules',
    'sql.js',
    'dist',
    'sql-wasm.wasm'
  )

  SQL = await initSqlJs({
    locateFile: () => wasmPath
  })

  return SQL
}

// 保存数据库到磁盘
function saveToDisk(): void {
  if (!db || !dbPath) return
  try {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  } catch (err) {
    console.error('保存数据库失败:', err)
  }
}

// 获取数据库实例
export async function getDatabase(): Promise<SqlJsDatabase> {
  if (db) return db

  const sql = await initSql()
  const userDataPath = app.getPath('userData')
  dbPath = path.join(userDataPath, 'heima-accounting.db')

  // 尝试从磁盘加载已有数据库
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath)
      db = new sql.Database(fileBuffer)
    } else {
      db = new sql.Database()
    }
  } catch {
    db = new sql.Database()
  }

  // 创建表（新数据库）
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'expense',
      amount REAL NOT NULL,
      categoryId TEXT NOT NULL,
      subCategoryName TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // 数据迁移：为旧数据库添加 type 列（如果不存在）
  const columns = db.exec('PRAGMA table_info(expenses)')
  if (columns.length > 0) {
    const colNames = columns[0].values.map((row: any[]) => row[1])
    if (!colNames.includes('type')) {
      db.run(`ALTER TABLE expenses ADD COLUMN type TEXT NOT NULL DEFAULT 'expense'`)
    }
  }

  // 创建索引
  db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(categoryId)`)

  saveToDisk()

  return db
}

// 辅助函数：将 sql.js exec 结果转为对象数组
function rowsToObjects(columns: string[], values: any[][]): any[] {
  return values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj
  })
}

// ===== 花销记录 CRUD 操作 =====

export async function addExpense(record: {
  type: string
  amount: number
  categoryId: string
  subCategoryName: string
  date: string
  note: string
}): Promise<number> {
  const database = await getDatabase()
  database.run(
    `INSERT INTO expenses (type, amount, categoryId, subCategoryName, date, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [record.type, record.amount, record.categoryId, record.subCategoryName, record.date, record.note]
  )
  // 获取最后插入的 ID
  const result = database.exec('SELECT last_insert_rowid() as id')
  const id = result[0].values[0][0] as number
  saveToDisk()
  return id
}

export async function getExpenses(filters?: {
  startDate?: string
  endDate?: string
  categoryId?: string
  type?: string
}): Promise<any[]> {
  const database = await getDatabase()
  let sql = 'SELECT * FROM expenses WHERE 1=1'
  const params: any[] = []

  if (filters?.startDate) {
    sql += ' AND date >= ?'
    params.push(filters.startDate)
  }
  if (filters?.endDate) {
    sql += ' AND date <= ?'
    params.push(filters.endDate)
  }
  if (filters?.categoryId) {
    sql += ' AND categoryId = ?'
    params.push(filters.categoryId)
  }
  if (filters?.type) {
    sql += ' AND type = ?'
    params.push(filters.type)
  }

  sql += ' ORDER BY date DESC, id DESC'

  const stmt = database.prepare(sql)
  stmt.bind(params)
  const rows: any[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

export async function updateExpense(id: number, record: {
  type: string
  amount: number
  categoryId: string
  subCategoryName: string
  date: string
  note: string
}): Promise<void> {
  const database = await getDatabase()
  database.run(
    `UPDATE expenses
     SET type = ?, amount = ?, categoryId = ?, subCategoryName = ?, date = ?, note = ?
     WHERE id = ?`,
    [record.type, record.amount, record.categoryId, record.subCategoryName, record.date, record.note, id]
  )
  saveToDisk()
}

export async function deleteExpense(id: number): Promise<void> {
  const database = await getDatabase()
  database.run('DELETE FROM expenses WHERE id = ?', [id])
  saveToDisk()
}

export async function getMonthlyStats(year: number, month: number): Promise<{
  totalExpense: number
  totalIncome: number
  categoryBreakdown: { categoryId: string; total: number }[]
  dailyExpenses: { date: string; total: number }[]
  dailyIncomes: { date: string; total: number }[]
}> {
  const database = await getDatabase()
  const monthStr = `${year}-${String(month).padStart(2, '0')}`
  const likePattern = `${monthStr}%`

  // 月度总支出
  const expenseResult = database.exec(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE '${likePattern}' AND type = 'expense'`
  )
  const totalExpense = expenseResult[0].values[0][0] as number

  // 月度总收入
  const incomeResult = database.exec(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE '${likePattern}' AND type = 'income'`
  )
  const totalIncome = incomeResult[0].values[0][0] as number

  // 支出分类汇总
  const catResult = database.exec(
    `SELECT categoryId, SUM(amount) as total
     FROM expenses
     WHERE date LIKE '${likePattern}' AND type = 'expense'
     GROUP BY categoryId
     ORDER BY total DESC`
  )
  const categoryBreakdown = catResult.length > 0
    ? rowsToObjects(catResult[0].columns, catResult[0].values)
    : []

  // 每日支出汇总
  const dailyExpResult = database.exec(
    `SELECT date, SUM(amount) as total
     FROM expenses
     WHERE date LIKE '${likePattern}' AND type = 'expense'
     GROUP BY date
     ORDER BY date ASC`
  )
  const dailyExpenses = dailyExpResult.length > 0
    ? rowsToObjects(dailyExpResult[0].columns, dailyExpResult[0].values)
    : []

  // 每日收入汇总
  const dailyIncResult = database.exec(
    `SELECT date, SUM(amount) as total
     FROM expenses
     WHERE date LIKE '${likePattern}' AND type = 'income'
     GROUP BY date
     ORDER BY date ASC`
  )
  const dailyIncomes = dailyIncResult.length > 0
    ? rowsToObjects(dailyIncResult[0].columns, dailyIncResult[0].values)
    : []

  return { totalExpense, totalIncome, categoryBreakdown, dailyExpenses, dailyIncomes }
}

export async function getAllYears(): Promise<number[]> {
  const database = await getDatabase()
  const result = database.exec(
    `SELECT DISTINCT substr(date, 1, 4) as year
     FROM expenses
     ORDER BY year DESC`
  )
  if (result.length === 0) return []
  return result[0].values.map(row => parseInt(row[0] as string))
}

// ===== CSV 导出 =====
export async function exportToCSV(): Promise<string> {
  const database = await getDatabase()
  const all = database.exec('SELECT * FROM expenses ORDER BY date DESC, id DESC')

  // BOM for Excel UTF-8 compatibility
  const BOM = '﻿'
  const header = '类型,金额,一级分类ID,二级分类,日期,备注,创建时间'
  const rows: string[] = [header]

  if (all.length > 0) {
    const { columns, values } = all[0]
    const records = rowsToObjects(columns, values)
    for (const r of records) {
      const typeName = r.type === 'income' ? '收入' : '支出'
      rows.push([
        typeName,
        r.amount,
        escapeCSV(r.categoryId),
        escapeCSV(r.subCategoryName),
        r.date,
        escapeCSV(r.note || ''),
        r.createdAt
      ].join(','))
    }
  }

  return BOM + rows.join('\n')
}

// ===== CSV 导入 =====
export interface ImportResult {
  success: number
  skipped: number
  errors: string[]
}

export async function importFromCSV(csvContent: string): Promise<ImportResult> {
  const database = await getDatabase()
  const result: ImportResult = { success: 0, skipped: 0, errors: [] }

  // 去掉 BOM
  const content = csvContent.replace(/^﻿/, '').trim()
  if (!content) {
    result.errors.push('文件内容为空')
    return result
  }

  const lines = parseCSVLines(content)
  if (lines.length < 2) {
    result.errors.push('CSV 文件至少需要包含表头和一行数据')
    return result
  }

  // 解析表头
  const header = lines[0]
  const colMap: Record<string, number> = {}
  header.forEach((col, i) => { colMap[col.trim()] = i })

  // 检查必要列
  for (const required of ['金额', '日期']) {
    if (!(required in colMap)) {
      result.errors.push(`缺少必要列: "${required}"`)
      return result
    }
  }

  // 逐行导入
  const insertStmt = database.prepare(
    `INSERT INTO expenses (type, amount, categoryId, subCategoryName, date, note)
     VALUES (?, ?, ?, ?, ?, ?)`
  )

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]
    try {
      const getCol = (name: string, fallback: string = '') =>
        (colMap[name] !== undefined && row[colMap[name]]) ? row[colMap[name]].trim() : fallback

      const typeName = getCol('类型', '支出')
      const type = typeName === '收入' ? 'income' : 'expense'

      const amountStr = getCol('金额', '0')
      const amount = parseFloat(amountStr)
      if (isNaN(amount) || amount <= 0) {
        result.errors.push(`第${i + 1}行: 金额无效 "${amountStr}"`)
        result.skipped++
        continue
      }

      const date = getCol('日期')
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        result.errors.push(`第${i + 1}行: 日期格式不正确 "${date}"，需要 YYYY-MM-DD`)
        result.skipped++
        continue
      }

      const categoryId = getCol('一级分类ID', 'other')
      const subCategoryName = getCol('二级分类', '其他')
      const note = getCol('备注', '')

      insertStmt.run([type, amount, categoryId, subCategoryName, date, note])
      result.success++
    } catch (err: any) {
      result.errors.push(`第${i + 1}行: ${err.message}`)
      result.skipped++
    }
  }

  insertStmt.free()
  if (result.success > 0) {
    saveToDisk()
  }
  return result
}

// ===== CSV 辅助函数 =====
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function parseCSVLines(content: string): string[][] {
  const lines: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    const next = content[i + 1]

    if (inQuotes) {
      if (ch === '"') {
        if (next === '"') {
          field += '"'
          i++ // skip next quote
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        current.push(field)
        field = ''
      } else if (ch === '\n') {
        current.push(field)
        field = ''
        if (current.length > 0) {
          lines.push(current)
          current = []
        }
      } else if (ch === '\r') {
        // skip carriage return
      } else {
        field += ch
      }
    }
  }

  // 处理最后一个字段和行
  if (field || current.length > 0) {
    current.push(field)
  }
  if (current.length > 0) {
    lines.push(current)
  }

  return lines
}
