/**
 * 耗材管理页面
 * @author Erikwang
 * @date 2025-08-20
 */

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Progress,
} from '../../components/ui/index.tsx'
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  AlertCircle,
  Eye,
} from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import FormBuilder from '../../components/FormBuilder'
import { toast } from 'sonner'

// 耗材数据接口
interface Supply {
  id: string
  name: string
  category: string
  specification: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  supplier: string
  storageLocation: string
  expiryDate: string
  batchNumber: string
  status: 'normal' | 'low_stock' | 'expired' | 'out_of_stock'
  description: string
  createdAt: string
  updatedAt: string
}

// 使用记录接口
interface UsageRecord {
  id: string
  supplyId: string
  supplyName: string
  quantity: number
  unit: string
  usedBy: string
  department: string
  purpose: string
  usageDate: string
  batchNumber: string
  notes: string
  createdAt: string
}

// 入库记录接口
interface StockInRecord {
  id: string
  supplyId: string
  supplyName: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  supplier: string
  batchNumber: string
  expiryDate: string
  receivedBy: string
  receivedDate: string
  notes: string
  createdAt: string
}

// 耗材状态配置
const supplyStatusConfig = {
  normal: { label: '正常', color: 'success' },
  low_stock: { label: '库存不足', color: 'warning' },
  expired: { label: '已过期', color: 'error' },
  out_of_stock: { label: '缺货', color: 'error' },
}

// 模拟耗材数据
const mockSupplyData: Supply[] = [
  {
    id: 'SUP001',
    name: 'PCR试剂盒',
    category: '试剂',
    specification: '100次/盒',
    unit: '盒',
    currentStock: 15,
    minStock: 10,
    maxStock: 50,
    unitPrice: 280.0,
    supplier: '生物科技有限公司',
    storageLocation: '试剂冷藏柜A',
    expiryDate: '2025-06-30',
    batchNumber: 'PCR20241201',
    status: 'normal',
    description: 'DNA扩增试剂盒',
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-12-01 14:30:00',
  },
  {
    id: 'SUP002',
    name: '离心管',
    category: '耗材',
    specification: '1.5ml',
    unit: '个',
    currentStock: 8,
    minStock: 20,
    maxStock: 200,
    unitPrice: 0.5,
    supplier: '实验器材公司',
    storageLocation: '耗材柜B',
    expiryDate: '2026-12-31',
    batchNumber: 'CT20241115',
    status: 'low_stock',
    description: '聚丙烯离心管',
    createdAt: '2024-02-20 09:15:00',
    updatedAt: '2024-11-15 16:45:00',
  },
  {
    id: 'SUP003',
    name: '移液器吸头',
    category: '耗材',
    specification: '200μl',
    unit: '盒',
    currentStock: 0,
    minStock: 5,
    maxStock: 30,
    unitPrice: 45.0,
    supplier: '精密仪器公司',
    storageLocation: '耗材柜C',
    expiryDate: '2027-03-31',
    batchNumber: 'TIP20241010',
    status: 'out_of_stock',
    description: '无菌吸头',
    createdAt: '2024-03-10 11:20:00',
    updatedAt: '2024-10-10 13:15:00',
  },
]

// 模拟使用记录数据
const mockUsageData: UsageRecord[] = [
  {
    id: 'UR001',
    supplyId: 'SUP001',
    supplyName: 'PCR试剂盒',
    quantity: 2,
    unit: '盒',
    usedBy: '张三',
    department: '分子实验室',
    purpose: '基因检测实验',
    usageDate: '2024-12-01',
    batchNumber: 'PCR20241201',
    notes: '用于样本PCR扩增',
    createdAt: '2024-12-01 14:30:00',
  },
  {
    id: 'UR002',
    supplyId: 'SUP002',
    supplyName: '离心管',
    quantity: 50,
    unit: '个',
    usedBy: '李四',
    department: '样本处理室',
    purpose: '样本分装',
    usageDate: '2024-11-28',
    batchNumber: 'CT20241115',
    notes: '样本预处理使用',
    createdAt: '2024-11-28 10:15:00',
  },
]

// 模拟入库记录数据
const mockStockInData: StockInRecord[] = [
  {
    id: 'SI001',
    supplyId: 'SUP001',
    supplyName: 'PCR试剂盒',
    quantity: 20,
    unit: '盒',
    unitPrice: 280.0,
    totalPrice: 5600.0,
    supplier: '生物科技有限公司',
    batchNumber: 'PCR20241201',
    expiryDate: '2025-06-30',
    receivedBy: '王五',
    receivedDate: '2024-12-01',
    notes: '月度采购',
    createdAt: '2024-12-01 09:00:00',
  },
  {
    id: 'SI002',
    supplyId: 'SUP002',
    supplyName: '离心管',
    quantity: 100,
    unit: '个',
    unitPrice: 0.5,
    totalPrice: 50.0,
    supplier: '实验器材公司',
    batchNumber: 'CT20241115',
    expiryDate: '2026-12-31',
    receivedBy: '赵六',
    receivedDate: '2024-11-15',
    notes: '补充库存',
    createdAt: '2024-11-15 11:30:00',
  },
]

const SuppliesManagement: React.FC = () => {
  const [supplyData, setSupplyData] = useState<Supply[]>(mockSupplyData)
  const [usageData, setUsageData] = useState<UsageRecord[]>(mockUsageData)
  const [stockInData, setStockInData] =
    useState<StockInRecord[]>(mockStockInData)
  const [loading, setLoading] = useState(false)
  const [supplyModalVisible, setSupplyModalVisible] = useState(false)
  const [usageModalVisible, setUsageModalVisible] = useState(false)
  const [stockInModalVisible, setStockInModalVisible] = useState(false)
  const [currentSupply, setCurrentSupply] = useState<Supply | null>(null)
  const [currentUsage, setCurrentUsage] = useState<UsageRecord | null>(null)
  const [currentStockIn, setCurrentStockIn] = useState<StockInRecord | null>(
    null
  )
  const [formData, setFormData] = useState<Partial<Supply>>({})
  const [usageFormData, setUsageFormData] = useState<any>({})
  const [stockInFormData, setStockInFormData] = useState<any>({})
  const [activeTab, setActiveTab] = useState('supplies')

  // 表单字段配置
  const supplyFormFields = [
    { name: 'name', label: '耗材名称', type: 'input', required: true },
    { name: 'category', label: '类别', type: 'input', required: true },
    { name: 'specification', label: '规格', type: 'input', required: true },
    { name: 'unit', label: '单位', type: 'input', required: true },
    { name: 'currentStock', label: '当前库存', type: 'number', required: true },
    { name: 'minStock', label: '最小库存', type: 'number', required: true },
    { name: 'maxStock', label: '最大库存', type: 'number', required: true },
    { name: 'unitPrice', label: '单价', type: 'number', required: true },
    { name: 'supplier', label: '供应商', type: 'input', required: true },
    { name: 'storageLocation', label: '存储位置', type: 'input', required: true },
    { name: 'expiryDate', label: '有效期', type: 'date', required: true },
    { name: 'batchNumber', label: '批次号', type: 'input', required: true },
    { name: 'description', label: '描述', type: 'textarea' },
  ]

  const usageFormFields = [
    { name: 'supplyName', label: '耗材名称', type: 'input', disabled: true },
    { name: 'quantity', label: '使用数量', type: 'number', required: true },
    { name: 'unit', label: '单位', type: 'input', disabled: true },
    { name: 'usedBy', label: '使用人', type: 'input', required: true },
    { name: 'department', label: '部门', type: 'input', required: true },
    { name: 'purpose', label: '用途', type: 'input', required: true },
    { name: 'usageDate', label: '使用日期', type: 'date', required: true },
    { name: 'batchNumber', label: '批次号', type: 'input', required: true },
    { name: 'notes', label: '备注', type: 'textarea' },
  ]

  const stockInFormFields = [
    { name: 'supplyName', label: '耗材名称', type: 'input', disabled: true },
    { name: 'quantity', label: '入库数量', type: 'number', required: true },
    { name: 'unit', label: '单位', type: 'input', disabled: true },
    { name: 'unitPrice', label: '单价', type: 'number', required: true },
    { name: 'supplier', label: '供应商', type: 'input', required: true },
    { name: 'batchNumber', label: '批次号', type: 'input', required: true },
    { name: 'expiryDate', label: '有效期', type: 'date', required: true },
    { name: 'receivedBy', label: '接收人', type: 'input', required: true },
    { name: 'receivedDate', label: '接收日期', type: 'date', required: true },
    { name: 'notes', label: '备注', type: 'textarea' },
  ]

  // 创建表单实例
  const [form] = useState({
    setFieldsValue: (values: any) => setFormData(values),
    validateFields: () => Promise.resolve(formData),
    resetFields: () => setFormData({})
  })
  
  const [usageForm] = useState({
    setFieldsValue: (values: any) => setUsageFormData(values),
    validateFields: () => Promise.resolve(usageFormData),
    resetFields: () => setUsageFormData({})
  })
  
  const [stockInForm] = useState({
    setFieldsValue: (values: any) => setStockInFormData(values),
    validateFields: () => Promise.resolve(stockInFormData),
    resetFields: () => setStockInFormData({})
  })

  // 表格列配置将在后面定义



  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusInfo = supplyStatusConfig[
      status as keyof typeof supplyStatusConfig
    ] || { label: status, color: 'default' }
    return <Badge status={statusInfo.color as any} text={statusInfo.label} />
  }

  // 检查库存状态
  const checkStockStatus = (supply: Supply): Supply['status'] => {
    if (supply.currentStock === 0) return 'out_of_stock'
    if (supply.currentStock <= supply.minStock) return 'low_stock'
    if (new Date(supply.expiryDate) < new Date()) return 'expired'
    return 'normal'
  }

  // 加载耗材数据
  const loadSupplyData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      const updatedData = mockSupplyData.map(supply => ({
        ...supply,
        status: checkStockStatus(supply),
      }))
      setSupplyData(updatedData)
    } catch (error) {
      toast.error('加载耗材数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载使用记录数据
  const loadUsageData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUsageData(mockUsageData)
    } catch (error) {
      toast.error('加载使用记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载入库记录数据
  const loadStockInData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStockInData(mockStockInData)
    } catch (error) {
      toast.error('加载入库记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理耗材操作
  const handleSupplyView = (record: Supply) => {
    setCurrentSupply(record)
    form.setFieldsValue(record)
    setSupplyModalVisible(true)
  }

  const handleSupplyEdit = (record: Supply) => {
    setCurrentSupply(record)
    form.setFieldsValue(record)
    setSupplyModalVisible(true)
  }

  const handleSupplyDelete = (record: Supply) => {
    if (window.confirm(`确定要删除耗材 "${record.name}" 吗？`)) {
      setSupplyData(prev => prev.filter(item => item.id !== record.id))
      toast.success('耗材删除成功')
    }
  }

  const handleSupplyStockIn = (record: Supply) => {
    setCurrentSupply(record)
    stockInForm.setFieldsValue({
      supplyId: record.id,
      supplyName: record.name,
      unit: record.unit,
      unitPrice: record.unitPrice,
      supplier: record.supplier,
    })
    setStockInModalVisible(true)
  }

  const handleSupplyUse = (record: Supply) => {
    setCurrentSupply(record)
    usageForm.setFieldsValue({
      supplyId: record.id,
      supplyName: record.name,
      unit: record.unit,
    })
    setUsageModalVisible(true)
  }

  // 处理使用记录操作
  const handleUsageView = (record: UsageRecord) => {
    setCurrentUsage(record)
    usageForm.setFieldsValue(record)
    setUsageModalVisible(true)
  }

  // 处理入库记录操作
  const handleStockInView = (record: StockInRecord) => {
    setCurrentStockIn(record)
    stockInForm.setFieldsValue(record)
    setStockInModalVisible(true)
  }

  // 保存耗材
  const handleSupplySave = async () => {
    try {
      const values = await form.validateFields()
      const newStatus = checkStockStatus({ ...values } as Supply)
      if (currentSupply) {
        // 编辑耗材
        setSupplyData(prev =>
          prev.map(item =>
            item.id === currentSupply.id
              ? {
                  ...item,
                  ...values,
                  status: newStatus,
                  updatedAt: new Date().toLocaleString(),
                }
              : item
          )
        )
        toast.success('耗材更新成功')
      } else {
        // 新增耗材
        const newSupply: Supply = {
          ...values,
          id: `SUP${String(supplyData.length + 1).padStart(3, '0')}`,
          status: newStatus,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        }
        setSupplyData(prev => [...prev, newSupply])
        toast.success('耗材添加成功')
      }
      setSupplyModalVisible(false)
      setCurrentSupply(null)
      form.resetFields()
    } catch (error) {
      console.error('保存耗材失败:', error)
    }
  }

  // 保存使用记录
  const handleUsageSave = async () => {
    try {
      const values = await usageForm.validateFields()
      if (currentUsage) {
        // 编辑使用记录
        setUsageData(prev =>
          prev.map(item =>
            item.id === currentUsage.id ? { ...item, ...values } : item
          )
        )
        toast.success('使用记录更新成功')
      } else {
        // 新增使用记录
        const newRecord: UsageRecord = {
          ...values,
          id: `UR${String(usageData.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toLocaleString(),
        }
        setUsageData(prev => [...prev, newRecord])

        // 更新库存
        if (currentSupply) {
          setSupplyData(prev =>
            prev.map(item => {
              if (item.id === currentSupply.id) {
                const newStock = item.currentStock - values.quantity
                return {
                  ...item,
                  currentStock: Math.max(0, newStock),
                  status: checkStockStatus({
                    ...item,
                    currentStock: Math.max(0, newStock),
                  }),
                  updatedAt: new Date().toLocaleString(),
                }
              }
              return item
            })
          )
        }

        toast.success('使用记录添加成功')
      }
      setUsageModalVisible(false)
      setCurrentUsage(null)
      usageForm.resetFields()
    } catch (error) {
      console.error('保存使用记录失败:', error)
    }
  }

  // 保存入库记录
  const handleStockInSave = async () => {
    try {
      const values = await stockInForm.validateFields()
      if (currentStockIn) {
        // 编辑入库记录
        setStockInData(prev =>
          prev.map(item =>
            item.id === currentStockIn.id ? { ...item, ...values } : item
          )
        )
        toast.success('入库记录更新成功')
      } else {
        // 新增入库记录
        const newRecord: StockInRecord = {
          ...values,
          id: `SI${String(stockInData.length + 1).padStart(3, '0')}`,
          totalPrice: values.quantity * values.unitPrice,
          createdAt: new Date().toLocaleString(),
        }
        setStockInData(prev => [...prev, newRecord])

        // 更新库存
        if (currentSupply) {
          setSupplyData(prev =>
            prev.map(item => {
              if (item.id === currentSupply.id) {
                const newStock = item.currentStock + values.quantity
                return {
                  ...item,
                  currentStock: newStock,
                  status: checkStockStatus({ ...item, currentStock: newStock }),
                  updatedAt: new Date().toLocaleString(),
                }
              }
              return item
            })
          )
        }

        toast.success('入库记录添加成功')
      }
      setStockInModalVisible(false)
      setCurrentStockIn(null)
      stockInForm.resetFields()
    } catch (error) {
      console.error('保存入库记录失败:', error)
    }
  }

  // 耗材表格列配置
  const supplyColumns = [
    {
      title: '耗材编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '耗材名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      render: (stock: number, record: Supply) => (
        <span
          className={stock <= record.minStock ? 'text-red-600 font-bold' : ''}
        >
          {stock} {record.unit}
        </span>
      ),
    },
    {
      title: '最小库存',
      dataIndex: 'minStock',
      key: 'minStock',
      width: 100,
      render: (stock: number, record: Supply) => `${stock} ${record.unit}`,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record: Supply) => (
        <div className='flex gap-2 flex-wrap'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleSupplyView(record)}
          >
            <Eye className='w-4 h-4 mr-1' />
            查看
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleSupplyEdit(record)}
          >
            <Edit className='w-4 h-4 mr-1' />
            编辑
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleSupplyStockIn(record)}
          >
            <ShoppingCart className='w-4 h-4 mr-1' />
            入库
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleSupplyUse(record)}
            disabled={record.currentStock === 0}
          >
            <AlertCircle className='w-4 h-4 mr-1' />
            使用
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleSupplyDelete(record)}
          >
            <Trash2 className='w-4 h-4 mr-1' />
            删除
          </Button>
        </div>
      ),
    },
  ]

  // 使用记录表格列配置
  const usageColumns = [
    {
      title: '记录编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '耗材名称',
      dataIndex: 'supplyName',
      key: 'supplyName',
      width: 150,
    },
    {
      title: '使用数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record: UsageRecord) =>
        `${quantity} ${record.unit}`,
    },
    {
      title: '使用人',
      dataIndex: 'usedBy',
      key: 'usedBy',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 150,
    },
    {
      title: '使用日期',
      dataIndex: 'usageDate',
      key: 'usageDate',
      width: 120,
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record: UsageRecord) => (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => handleUsageView(record)}
        >
          <Eye className='w-4 h-4 mr-1' />
          查看
        </Button>
      ),
    },
  ]

  // 入库记录表格列配置
  const stockInColumns = [
    {
      title: '记录编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '耗材名称',
      dataIndex: 'supplyName',
      key: 'supplyName',
      width: 150,
    },
    {
      title: '入库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record: StockInRecord) =>
        `${quantity} ${record.unit}`,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
    },
    {
      title: '接收人',
      dataIndex: 'receivedBy',
      key: 'receivedBy',
      width: 100,
    },
    {
      title: '接收日期',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record: StockInRecord) => (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => handleStockInView(record)}
        >
          <Eye className='w-4 h-4 mr-1' />
          查看
        </Button>
      ),
    },
  ]

  // 表格操作配置
  const supplyTableActions = {
    showAdd: true,
    addText: '新增耗材',
    onAdd: () => {
      setCurrentSupply(null)
      setFormData({})
      setSupplyModalVisible(true)
    },
  }

  const usageTableActions = {
    showAdd: true,
    addText: '新增使用记录',
    onAdd: () => {
      setCurrentUsage(null)
      usageForm.resetFields()
      setUsageModalVisible(true)
    },
  }

  const stockInTableActions = {
    showAdd: true,
    addText: '新增入库记录',
    onAdd: () => {
      setCurrentStockIn(null)
      stockInForm.resetFields()
      setStockInModalVisible(true)
    },
  }

  // 表单配置已在前面定义

  useEffect(() => {
    if (activeTab === 'supplies') {
      loadSupplyData()
    } else if (activeTab === 'usage') {
      loadUsageData()
    } else if (activeTab === 'stockin') {
      loadStockInData()
    }
  }, [activeTab])

  // 统计数据
  const supplyStats = {
    total: supplyData.length,
    normal: supplyData.filter(item => item.status === 'normal').length,
    lowStock: supplyData.filter(item => item.status === 'low_stock').length,
    outOfStock: supplyData.filter(item => item.status === 'out_of_stock')
      .length,
    expired: supplyData.filter(item => item.status === 'expired').length,
  }

  // 库存预警
  const lowStockItems = supplyData.filter(
    item => item.status === 'low_stock' || item.status === 'out_of_stock'
  )
  const expiredItems = supplyData.filter(item => item.status === 'expired')

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>耗材管理</h1>
        <p className='text-gray-600 mt-1'>管理实验室耗材库存和使用记录</p>
      </div>

      {/* 库存预警 */}
      {(lowStockItems.length > 0 || expiredItems.length > 0) && (
        <div className='space-y-2'>
          {lowStockItems.length > 0 && (
            <Card className='border-yellow-200 bg-yellow-50'>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <AlertTriangle className='h-5 w-5 text-yellow-600' />
                  <div>
                    <h4 className='font-medium text-yellow-800'>库存预警</h4>
                    <p className='text-sm text-yellow-700'>
                      有 {lowStockItems.length} 种耗材库存不足或缺货，请及时补充
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {expiredItems.length > 0 && (
            <Card className='border-red-200 bg-red-50'>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <AlertCircle className='h-5 w-5 text-red-600' />
                  <div>
                    <h4 className='font-medium text-red-800'>过期预警</h4>
                    <p className='text-sm text-red-700'>
                      有 {expiredItems.length} 种耗材已过期，请及时处理
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='supplies'>耗材库存</TabsTrigger>
          <TabsTrigger value='usage'>使用记录</TabsTrigger>
          <TabsTrigger value='stockin'>入库记录</TabsTrigger>
        </TabsList>
        <TabsContent value='supplies'>
          {/* 耗材统计卡片 */}
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-6'>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {supplyStats.total}
                </div>
                <div className='text-gray-500 text-sm'>耗材总数</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {supplyStats.normal}
                </div>
                <div className='text-gray-500 text-sm'>正常库存</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {supplyStats.lowStock}
                </div>
                <div className='text-gray-500 text-sm'>库存不足</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {supplyStats.outOfStock}
                </div>
                <div className='text-gray-500 text-sm'>缺货</div>
              </div>
            </Card>
            <Card>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {supplyStats.expired}
                </div>
                <div className='text-gray-500 text-sm'>已过期</div>
              </div>
            </Card>
          </div>

          {/* 耗材列表 */}
          <DataTable
            columns={supplyColumns}
            dataSource={supplyData}
            loading={loading}
            actions={supplyTableActions}
            rowKey='id'
          />
        </TabsContent>

        <TabsContent value='usage'>
          {/* 使用记录列表 */}
          <DataTable
            columns={usageColumns}
            dataSource={usageData}
            loading={loading}
            actions={usageTableActions}
            rowKey='id'
          />
        </TabsContent>

        <TabsContent value='stockin'>
          {/* 入库记录列表 */}
          <DataTable
            columns={stockInColumns}
            dataSource={stockInData}
            loading={loading}
            actions={stockInTableActions}
            rowKey='id'
          />
        </TabsContent>
      </Tabs>

      {/* 耗材模态框 */}
      <Modal
        title={currentSupply ? '编辑耗材' : '新增耗材'}
        open={supplyModalVisible}
        onCancel={() => {
          setSupplyModalVisible(false)
          setCurrentSupply(null)
          form.resetFields()
        }}
        onOk={handleSupplySave}
        width={800}
        destroyOnClose
      >
        <FormBuilder
          form={form}
          fields={supplyFormFields}
          layout='vertical'
          colSpan={12}
        />
      </Modal>

      {/* 使用记录模态框 */}
      <Modal
        title={currentUsage ? '查看使用记录' : '新增使用记录'}
        open={usageModalVisible}
        onCancel={() => {
          setUsageModalVisible(false)
          setCurrentUsage(null)
          usageForm.resetFields()
        }}
        onOk={currentUsage ? undefined : handleUsageSave}
        footer={
          currentUsage
            ? [
                <Button
                  key='close'
                  onClick={() => {
                    setUsageModalVisible(false)
                    setCurrentUsage(null)
                    usageForm.resetFields()
                  }}
                >
                  关闭
                </Button>,
              ]
            : undefined
        }
        width={800}
        destroyOnClose
      >
        <FormBuilder
          form={usageForm}
          fields={usageFormFields}
          layout='vertical'
          colSpan={12}
          disabled={!!currentUsage}
        />
      </Modal>

      {/* 入库记录模态框 */}
      <Modal
        title={currentStockIn ? '查看入库记录' : '新增入库记录'}
        open={stockInModalVisible}
        onCancel={() => {
          setStockInModalVisible(false)
          setCurrentStockIn(null)
          stockInForm.resetFields()
        }}
        onOk={currentStockIn ? undefined : handleStockInSave}
        footer={
          currentStockIn
            ? [
                <Button
                  key='close'
                  onClick={() => {
                    setStockInModalVisible(false)
                    setCurrentStockIn(null)
                    stockInForm.resetFields()
                  }}
                >
                  关闭
                </Button>,
              ]
            : undefined
        }
        width={800}
        destroyOnClose
      >
        <FormBuilder
          form={stockInForm}
          fields={stockInFormFields}
          layout='vertical'
          colSpan={12}
          disabled={!!currentStockIn}
        />
      </Modal>
    </div>
  )
}

export default SuppliesManagement
