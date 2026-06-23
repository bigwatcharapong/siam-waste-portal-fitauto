'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Table, Input, Select, Typography, Tag, Spin, Alert, Row, Col, Tooltip,
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import AppLayout from '@/components/AppLayout'
import AuthGuard from '@/components/AuthGuard'
import api from '@/lib/api'

const { Text } = Typography
const { Option } = Select

interface HistoryItem {
  id: string
  doc_id: string
  status: string
  status_thai: string
  date_request: string
  datetime_create: string
  remark: string
  contact_name: string
  contact_tel: string
  date_plan_receive: string
  date_actual_receive: string
  car_no_receive: string
  driver_name_receive: string
  total_weight_receive: number
}

interface ApiResponse {
  status: string
  data: HistoryItem[]
  total: number
  total_page: number
  current_page: number
}

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  Requested: { color: '#fb8c00', bg: '#fff8f0' },
  Scheduled: { color: '#1e88e5', bg: '#f0f6ff' },
  Completed: { color: '#43a047', bg: '#f1f8f1' },
  Cancelled: { color: '#9e9e9e', bg: '#f5f5f5' },
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const s = STATUS_BADGE[status] ?? { color: '#9e9e9e', bg: '#f5f5f5' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {label}
    </span>
  )
}

export default function HistoryPage() {
  const [data,     setData]    = useState<HistoryItem[]>([])
  const [total,    setTotal]   = useState(0)
  const [page,     setPage]    = useState(1)
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState('')
  const [keyword,  setKeyword] = useState('')
  const [status,   setStatus]  = useState('')
  const [inputVal, setInputVal] = useState('')

  const PAGE_SIZE = 10

  const load = useCallback(async (p = 1, kw = keyword, st = status) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page:     String(p),
        pageSize: String(PAGE_SIZE),
      })
      if (kw) params.append('keyword', kw)
      if (st) params.append('status',  st)

      const res = await api.get<ApiResponse>(`/api/request/history?${params}`)
      setData(res.data.data ?? [])
      setTotal(res.data.total ?? 0)
      setPage(p)
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }, [keyword, status])

  useEffect(() => { load(1, '', '') }, [])

  function onSearch() {
    setKeyword(inputVal)
    setStatus(status)
    load(1, inputVal, status)
  }

  function onStatusChange(val: string) {
    setStatus(val)
    load(1, inputVal, val)
  }

  function onReset() {
    setInputVal('')
    setKeyword('')
    setStatus('')
    load(1, '', '')
  }

  const columns: ColumnsType<HistoryItem> = [
    {
      title: 'เลขที่เอกสาร',
      dataIndex: 'doc_id',
      key: 'doc_id',
      width: 150,
      render: v => <Text style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (_, row) => <StatusBadge status={row.status} label={row.status_thai} />,
    },
    {
      title: 'วันที่แจ้ง',
      dataIndex: 'date_request',
      key: 'date_request',
      width: 110,
      render: v => <Text style={{ color: '#555', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'ผู้ติดต่อ',
      key: 'contact',
      width: 160,
      render: (_, row) => (
        <div>
          <div style={{ fontSize: 13, color: '#333' }}>{row.contact_name || '—'}</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>{row.contact_tel || ''}</div>
        </div>
      ),
    },
    {
      title: 'นัดหมายรับ',
      dataIndex: 'date_plan_receive',
      key: 'date_plan_receive',
      width: 110,
      render: v => <Text style={{ color: '#555', fontSize: 13 }}>{v || '—'}</Text>,
    },
    {
      title: 'วันที่รับจริง',
      dataIndex: 'date_actual_receive',
      key: 'date_actual_receive',
      width: 110,
      render: v => <Text style={{ color: '#555', fontSize: 13 }}>{v || '—'}</Text>,
    },
    {
      title: 'รถ / คนขับ',
      key: 'car',
      width: 140,
      render: (_, row) => (
        <div>
          <div style={{ fontSize: 13, color: '#333' }}>{row.car_no_receive || '—'}</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>{row.driver_name_receive || ''}</div>
        </div>
      ),
    },
    {
      title: 'น้ำหนัก (กก.)',
      dataIndex: 'total_weight_receive',
      key: 'total_weight_receive',
      width: 110,
      align: 'right',
      render: v => (
        <Text style={{ fontSize: 13, color: v > 0 ? '#43a047' : '#ccc', fontWeight: v > 0 ? 600 : 400 }}>
          {v > 0 ? v.toLocaleString() : '—'}
        </Text>
      ),
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: v => <Text style={{ color: '#888', fontSize: 13 }}>{v || '—'}</Text>,
    },
  ]

  return (
    <AuthGuard>
      <AppLayout>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 10 }} />}

        {/* Filter bar */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <Input
            placeholder="ค้นหาเลขที่เอกสาร..."
            prefix={<SearchOutlined style={{ color: '#ccc' }} />}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onPressEnter={onSearch}
            style={{ width: 220 }}
            allowClear
            onClear={() => { setInputVal(''); load(1, '', status) }}
          />
          <Select
            placeholder="ทุกสถานะ"
            value={status || undefined}
            onChange={onStatusChange}
            allowClear
            onClear={() => onStatusChange('')}
            style={{ width: 150 }}
          >
            <Option value="Requested">รอจัดคิวรถ</Option>
            <Option value="Scheduled">รอเข้ารับ</Option>
            <Option value="Completed">เสร็จสิ้น</Option>
            <Option value="Cancelled">ยกเลิก</Option>
          </Select>
          <Tooltip title="ค้นหา">
            <span
              onClick={onSearch}
              style={{
                padding: '7px 16px', borderRadius: 8,
                background: '#43a047', color: '#fff',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <SearchOutlined /> ค้นหา
            </span>
          </Tooltip>
          <Tooltip title="รีเซ็ต">
            <span
              onClick={onReset}
              style={{
                padding: '7px 12px', borderRadius: 8,
                border: '1px solid #e0e0e0', color: '#888',
                cursor: 'pointer', fontSize: 13,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <ReloadOutlined />
            </span>
          </Tooltip>
          <Text style={{ marginLeft: 'auto', fontSize: 12, color: '#bbb' }}>
            ทั้งหมด {total.toLocaleString()} รายการ
          </Text>
        </div>

        {/* Table */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              size="middle"
              scroll={{ x: 900 }}
              locale={{ emptyText: 'ไม่พบรายการ' }}
              pagination={{
                current:   page,
                pageSize:  PAGE_SIZE,
                total:     total,
                showSizeChanger: false,
                onChange: p => load(p),
                style: { padding: '12px 20px' },
              }}
            />
          </Spin>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
