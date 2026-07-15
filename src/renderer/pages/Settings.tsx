import React, { useState } from 'react'
import { Button, Modal, Input, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useStore } from '../store/useStore'
import { getDbAdapter } from '../adapters'
import type { Category } from '@shared/types'

const Settings: React.FC = () => {
  const {
    categories, setCategories,
    incomeCategories, setIncomeCategories
  } = useStore()

  // 管理哪个分类组：expense 或 income
  const [catGroup, setCatGroup] = useState<'expense' | 'income'>('expense')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newSubName, setNewSubName] = useState('')

  // 新增分类
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📌')
  const [newSubCategories, setNewSubCategories] = useState<string[]>([])

  const currentCategories = catGroup === 'expense' ? categories : incomeCategories

  const openAddModal = () => {
    setEditingCategory(null)
    setNewCategoryName('')
    setNewCategoryIcon('📌')
    setNewSubCategories([])
    setModalOpen(true)
  }

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setNewCategoryName(cat.name)
    setNewCategoryIcon(cat.icon)
    setNewSubCategories(cat.subCategories.map(s => s.name))
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!newCategoryName.trim()) {
      message.warning('请输入分类名称')
      return
    }
    if (newSubCategories.length === 0) {
      message.warning('请至少添加一个二级分类')
      return
    }

    const targetCategories = catGroup === 'expense' ? categories : incomeCategories
    const setFunc = catGroup === 'expense' ? setCategories : setIncomeCategories

    if (editingCategory) {
      setFunc(targetCategories.map(c =>
        c.id === editingCategory.id
          ? { ...c, name: newCategoryName, icon: newCategoryIcon, subCategories: newSubCategories.map(name => ({ name })) }
          : c
      ))
      message.success('分类已更新')
    } else {
      const newCat: Category = {
        id: `custom_${Date.now()}`,
        name: newCategoryName,
        icon: newCategoryIcon,
        subCategories: newSubCategories.map(name => ({ name }))
      }
      setFunc([...targetCategories, newCat])
      message.success('分类已添加')
    }

    setModalOpen(false)
  }

  const handleDelete = (catId: string) => {
    const presetExpenseIds = ['food', 'transport', 'shopping', 'housing', 'entertainment',
      'medical', 'education', 'communication', 'clothing', 'social', 'finance', 'other']
    const presetIncomeIds = ['salary', 'investment', 'sideline', 'redpacket', 'refund', 'other_income']

    const isPreset = catGroup === 'expense' ? presetExpenseIds.includes(catId) : presetIncomeIds.includes(catId)

    if (isPreset) {
      message.warning('预设分类不可删除')
      return
    }

    const targetCategories = catGroup === 'expense' ? categories : incomeCategories
    const setFunc = catGroup === 'expense' ? setCategories : setIncomeCategories
    setFunc(targetCategories.filter(c => c.id !== catId))
    message.success('已删除')
  }

  const addSubCategory = () => {
    if (!newSubName.trim()) return
    if (newSubCategories.includes(newSubName.trim())) {
      message.warning('该分类已存在')
      return
    }
    setNewSubCategories([...newSubCategories, newSubName.trim()])
    setNewSubName('')
  }

  const removeSubCategory = (name: string) => {
    setNewSubCategories(newSubCategories.filter(n => n !== name))
  }

  const iconOptions = [
    '🍜', '🚗', '🛒', '🏠', '🎮', '🏥', '📚', '📱', '👔', '🎁', '💰', '📦',
    '💻', '🎵', '🐱', '🐶', '✈️', '🎓', '💄', '🍺', '☕', '🎂', '💊', '🚬',
    '📌', '🔧', '🎨', '⚽', '🎤', '🌍', '📷', '💡', '❤️', '⭐', '🔥', '💧',
    '💼', '📈', '💻', '🧧', '💳', '📥'
  ]

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 600 }}>设置</h2>

      {/* 支出/收入分类切换 */}
      <div style={{
        display: 'flex',
        background: '#f0f0f0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16
      }}>
        <button
          onClick={() => setCatGroup('expense')}
          style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: catGroup === 'expense' ? 600 : 400,
            cursor: 'pointer',
            background: catGroup === 'expense' ? '#fff' : 'transparent',
            color: catGroup === 'expense' ? '#ff4d4f' : '#999',
            boxShadow: catGroup === 'expense' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          💸 支出分类
        </button>
        <button
          onClick={() => setCatGroup('income')}
          style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: catGroup === 'income' ? 600 : 400,
            cursor: 'pointer',
            background: catGroup === 'income' ? '#fff' : 'transparent',
            color: catGroup === 'income' ? '#52c41a' : '#999',
            boxShadow: catGroup === 'income' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          💰 收入分类
        </button>
      </div>

      {/* 分类管理 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            {catGroup === 'expense' ? '支出' : '收入'}分类管理
          </span>
          <Button type="primary" icon={<PlusOutlined />} size="small" onClick={openAddModal}>
            新增分类
          </Button>
        </div>

        {currentCategories.map(cat => (
          <div key={cat.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #f5f5f5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {cat.subCategories.map(s => s.name).join(' · ')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="text" size="small" icon={<EditOutlined />}
                onClick={() => openEditModal(cat)} />
              <Popconfirm
                title="确定删除此分类？"
                onConfirm={() => handleDelete(cat.id)}
                okText="删除" cancelText="取消"
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>

      {/* 分类编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <div>
            <div style={{ marginBottom: 6, fontSize: 13, color: '#666' }}>图标</div>
            <Select
              value={newCategoryIcon}
              onChange={setNewCategoryIcon}
              style={{ width: '100%' }}
              options={iconOptions.map(icon => ({ value: icon, label: icon }))}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 13, color: '#666' }}>分类名称</div>
            <Input
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="如：宠物"
              maxLength={10}
            />
          </div>

          <div>
            <div style={{ marginBottom: 6, fontSize: 13, color: '#666' }}>二级分类</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                placeholder="输入二级分类名称"
                maxLength={10}
                onPressEnter={addSubCategory}
              />
              <Button onClick={addSubCategory} icon={<PlusOutlined />}>添加</Button>
            </div>
            <div className="subcategory-tags">
              {newSubCategories.map(name => (
                <span key={name} className="subcategory-tag active" style={{ cursor: 'default' }}>
                  {name}
                  <DeleteOutlined
                    style={{ marginLeft: 6, fontSize: 10, cursor: 'pointer' }}
                    onClick={() => removeSubCategory(name)}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 数据导入导出 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>数据管理</div>

        <Button
          block
          icon={<span>📥</span>}
          size="large"
          style={{ marginBottom: 10, height: 44 }}
          onClick={async () => {
            const result = await getDbAdapter().importCSV()
            if (result.success) {
              message.success(result.message)
            } else {
              message.info(result.message)
            }
          }}
        >
          从 CSV 导入账单
        </Button>

        <Button
          block
          icon={<span>📤</span>}
          size="large"
          style={{ height: 44 }}
          onClick={async () => {
            const result = await getDbAdapter().exportCSV()
            if (result.success) {
              message.success(result.message)
            } else {
              message.info(result.message)
            }
          }}
        >
          导出账单为 CSV
        </Button>

        <div style={{ fontSize: 12, color: '#bbb', marginTop: 10, textAlign: 'center' }}>
          CSV 格式可用 Excel / WPS 打开编辑
        </div>
      </div>

      {/* 版本信息 */}
      <div style={{ textAlign: 'center', padding: 30, color: '#bbb', fontSize: 12 }}>
        黑马记账 v1.0.0
      </div>
    </div>
  )
}

export default Settings
