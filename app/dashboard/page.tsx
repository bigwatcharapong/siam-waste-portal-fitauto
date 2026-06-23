'use client'

import { useEffect, useState } from 'react'
import { Card, Col, Row, Table, Tag, Typography, Spin, Alert } from 'antd'
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import AppLayout from '@/components/AppLayout'
import AuthGuard from '@/components/AuthGuard'
import api from '@/lib/api'

const { Text } = Typography

interface Summary {
  total: number
  requested: number
  scheduled: number
  completed: number
  cancelled: number
}

interface LatestItem {
  id: string
  doc_id: string
  status: string
  status_thai: string
  date_request: string
  datetime_create: string
  remark: string
}

const CARDS_CONFIG = [
  { key: 'total',     label: 'ทั้งหมด',    icon: FileTextOutlined,    accent: '#43a047', light: '#f1f8f1', dark: '#2e7d32' },
  { key: 'requested', label: 'รอจัดคิวรถ', icon: ClockCircleOutlined, accent: '#fb8c00', light: '#fff8f0', dark: '#e65100' },
  { key: 'scheduled', label: 'รอเข้ารับ',  icon: CalendarOutlined,    accent: '#1e88e5', light: '#f0f6ff', dark: '#1565c0' },
  { key: 'completed', label: 'เสร็จสิ้น',  icon: CheckCircleOutlined, accent: '#43a047', light: '#f1f8f1', dark: '#2e7d32' },
] as const

const STATUS_BADGE: Record<string, { color: string; bg: string; text: string }> = {
  Requested: { color: '#fb8c00', bg: '#fff8f0', text: 'รอจัดคิวรถ' },
  Scheduled: { color: '#1e88e5', bg: '#f0f6ff', text: 'รอเข้ารับ'  },
  Completed: { color: '#43a047', bg: '#f1f8f1', text: 'เสร็จสิ้น'  },
  Cancelled: { color: '#9e9e9e', bg: '#f5f5f5', text: 'ยกเลิก'     },
}

function StatusTag({ status, statusThai }: { status: string; statusThai: string }) {
  const s = STATUS_BADGE[status]
  if (!s) return <Tag>{statusThai}</Tag>
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {statusThai}
    </span>
  )
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [latest,  setLatest]  = useState<LatestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [s, l] = await Promise.all([
          api.get('/api/request/summary'),
          api.get('/api/request/latest'),
        ])
        setSummary(s.data)
        setLatest(l.data.data ?? [])
      } catch {
        setError('ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = [
    {
      title: 'เลขที่เอกสาร',
      dataIndex: 'doc_id',
      key: 'doc_id',
      render: (v: string) => (
        <Text style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{v}</Text>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, row: LatestItem) => (
        <StatusTag status={row.status} statusThai={row.status_thai} />
      ),
    },
    {
      title: 'วันที่แจ้ง',
      dataIndex: 'date_request',
      key: 'date_request',
      render: (v: string) => <Text style={{ color: '#555', fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'remark',
      key: 'remark',
      render: (v: string) => (
        <Text style={{ color: '#888', fontSize: 13 }}>{v || '—'}</Text>
      ),
      ellipsis: true,
    },
  ]

  return (
    <AuthGuard>
      <AppLayout>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20, borderRadius: 10 }} />}

        <Spin spinning={loading}>
          {/* Stat Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
            {CARDS_CONFIG.map(cfg => {
              const value = summary ? summary[cfg.key] : 0
              const Icon  = cfg.icon
              return (
                <Col xs={12} sm={12} md={6} key={cfg.key}>
                  <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '20px 20px 18px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    borderTop: `3px solid ${cfg.light}`,
                    borderLeft: `3px solid ${cfg.accent}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* bg circle decoration */}
                    <div style={{
                      position: 'absolute', right: -14, top: -14,
                      width: 70, height: 70, borderRadius: '50%',
                      background: cfg.light, opacity: 0.8,
                    }} />

                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: cfg.light,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                    }}>
                      <Icon style={{ fontSize: 18, color: cfg.accent }} />
                    </div>

                    <div style={{ fontSize: 28, fontWeight: 800, color: cfg.dark, lineHeight: 1 }}>
                      {loading ? '—' : value}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 5, fontWeight: 500 }}>
                      {cfg.label}
                    </div>
                  </div>
                </Col>
              )
            })}
          </Row>

          {/* Latest Table */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Text style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>รายการล่าสุด</Text>
              <Text style={{ fontSize: 12, color: '#bbb' }}>5 รายการล่าสุด</Text>
            </div>
            <Table
              columns={columns}
              dataSource={latest}
              rowKey="id"
              pagination={false}
              size="middle"
              locale={{ emptyText: 'ยังไม่มีรายการ' }}
              scroll={{ x: 500 }}
              style={{ borderRadius: 0 }}
              rowClassName={() => 'dashboard-row'}
            />
          </div>
        </Spin>
      </AppLayout>
    </AuthGuard>
  )
}
