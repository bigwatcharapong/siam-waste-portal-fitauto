'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Form, Input, Button, Typography, Alert, Modal, Divider, Row, Col, Spin,
} from 'antd'
import { CheckCircleFilled, SendOutlined } from '@ant-design/icons'
import AppLayout from '@/components/AppLayout'
import AuthGuard from '@/components/AuthGuard'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface CheckResult {
  status: 'ok' | 'warning'
  message?: string
}

function ReadonlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 5, fontWeight: 500 }}>{label}</div>
      <div style={{
        background: '#fafafa',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 14,
        color: '#444',
        minHeight: 38,
      }}>
        {value || '—'}
      </div>
    </div>
  )
}

export default function RequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form] = Form.useForm()

  const [checking,   setChecking]   = useState(true)
  const [checkWarn,  setCheckWarn]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [docId,      setDocId]      = useState('')
  const [error,      setError]      = useState('')

  useEffect(() => {
    async function check() {
      try {
        const res = await api.post('/api/request/check', {})
        const data: CheckResult = res.data
        if (data.status === 'warning') setCheckWarn(data.message ?? '')
      } catch {
        // ไม่ block
      } finally {
        setChecking(false)
      }
    }
    check()
  }, [])

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        contact_name: user.contact_name,
        contact_tel:  user.contact_tel,
      })
    }
  }, [user, form])

  async function onFinish(values: { contact_name: string; contact_tel: string; remark?: string }) {
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/api/request/save', values)
      if (res.data.status === 'success') {
        setDocId(res.data.message)
        setSuccess(true)
      } else {
        setError(res.data.message ?? 'เกิดข้อผิดพลาด')
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  const fullAddress = [user?.address, user?.sub_district, user?.district, user?.province, user?.zip_code]
    .filter(Boolean).join(' ')

  return (
    <AuthGuard>
      <AppLayout>

        {checking ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <Spin size="large" />
          </div>
        ) : (
        <>
        {checkWarn && (
          <Alert
            message="มีรายการที่ยังดำเนินการอยู่"
            description={checkWarn}
            type="warning"
            showIcon
            style={{ marginBottom: 20, borderRadius: 12 }}
          />
        )}

        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          maxWidth: 720,
          margin: '0 auto',
        }}>
          {/* Card header */}
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid #f0f0f0',
            background: 'linear-gradient(135deg, #f9fffe 0%, #f0faf0 100%)',
          }}>
            <Title level={5} style={{ margin: 0, color: '#43a047' }}>
              แจ้งเข้ารับแกลลอนน้ำมันใช้แล้ว
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              กรอกข้อมูลด้านล่างเพื่อส่งคำขอ
            </Text>
          </div>

          <div style={{ padding: '28px 28px 24px' }}>
            {error && (
              <Alert message={error} type="error" showIcon
                style={{ marginBottom: 20, borderRadius: 8 }} />
            )}

            {/* ข้อมูลสาขา */}
            <div style={{ marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#43a047', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ข้อมูลสาขา
              </Text>
            </div>
            <Divider style={{ margin: '8px 0 16px' }} />

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <ReadonlyField label="ชื่อลูกค้า"   value={user?.customer_name} />
              </Col>
              <Col xs={24} sm={12}>
                <ReadonlyField label="บริการ"       value={user?.service_name} />
              </Col>
            </Row>
            <ReadonlyField label="สาขา"    value={user?.branch_name} />
            <ReadonlyField label="ที่อยู่"  value={fullAddress} />

            {/* ข้อมูลผู้ติดต่อ */}
            <div style={{ marginBottom: 4, marginTop: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#43a047', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ข้อมูลผู้ติดต่อ
              </Text>
            </div>
            <Divider style={{ margin: '8px 0 16px' }} />

            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="contact_name"
                    label={<span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>ชื่อผู้ติดต่อ</span>}
                    rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ติดต่อ' }]}
                    style={{ marginBottom: 16 }}
                  >
                    <Input placeholder="ชื่อ-นามสกุล" maxLength={100} size="middle" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="contact_tel"
                    label={<span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>เบอร์โทรศัพท์</span>}
                    rules={[
                      { required: true, message: 'กรุณากรอกเบอร์โทรศัพท์' },
                      { pattern: /^[0-9\-+() ]{9,20}$/, message: 'รูปแบบไม่ถูกต้อง' },
                    ]}
                    style={{ marginBottom: 16 }}
                  >
                    <Input placeholder="0xx-xxx-xxxx" maxLength={20} size="middle" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="remark"
                label={<span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>หมายเหตุ (ไม่บังคับ)</span>}
                style={{ marginBottom: 24 }}
              >
                <TextArea
                  placeholder="เช่น จำนวนแกลลอนโดยประมาณ, เวลาที่สะดวก ฯลฯ"
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  maxLength={255}
                  showCount
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SendOutlined />}
                size="large"
                block
                disabled={!!checkWarn}
                style={{ height: 46, fontWeight: 600, fontSize: 15 }}
              >
                ส่งคำขอเข้ารับ
              </Button>

              {checkWarn && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center', marginTop: 10 }}>
                  ไม่สามารถแจ้งซ้ำได้ขณะมีรายการค้างอยู่
                </Text>
              )}
            </Form>
          </div>
        </div>
        </>
        )}

        {/* Success Modal */}
        <Modal
          open={success}
          footer={null}
          closable={false}
          centered
          width={360}
          styles={{ content: { borderRadius: 18, padding: '44px 32px', textAlign: 'center' } }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#f1f8f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircleFilled style={{ fontSize: 42, color: '#43a047' }} />
          </div>

          <Title level={4} style={{ margin: '0 0 6px' }}>แจ้งสำเร็จ!</Title>
          <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 20 }}>
            เจ้าหน้าที่จะติดต่อกลับเพื่อนัดหมายวันเข้ารับโดยเร็ว
          </Paragraph>

          <div style={{
            background: '#f0faf0', border: '1px solid #dcedc8',
            borderRadius: 12, padding: '10px 20px',
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>เลขที่เอกสาร</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#43a047', fontFamily: 'monospace' }}>
              {docId}
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={() => router.push('/dashboard')}
            style={{ height: 44, fontWeight: 600 }}
          >
            กลับหน้าหลัก
          </Button>
        </Modal>

      </AppLayout>
    </AuthGuard>
  )
}
