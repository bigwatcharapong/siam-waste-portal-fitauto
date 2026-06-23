'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Form, Input, Alert, Card, Typography } from 'antd'
import { MailOutlined, ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import api from '@/lib/api'

const { Title, Text } = Typography

function ForgotPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get('email') ?? ''

  const [turnstileToken, setTurnstileToken] = useState('')
  const [loading,        setLoading]        = useState(false)
  const [alertMsg,       setAlertMsg]       = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null)
  const [done,           setDone]           = useState(false)

  async function onFinish(values: { email: string }) {
    if (!turnstileToken) {
      setAlertMsg({ type: 'error', text: 'กรุณายืนยัน Turnstile ก่อน' })
      return
    }
    setLoading(true)
    setAlertMsg(null)
    try {
      const res  = await api.post('/api/auth/forgot-password', {
        email: values.email.trim().toLowerCase(),
        turnstileToken,
      })
      const data = res.data
      if (data.status === 'success' || data.status === 'need_setup') {
        setDone(true)
      } else {
        setAlertMsg({ type: 'error', text: data.message })
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setAlertMsg({ type: 'error', text: msg ?? 'เกิดข้อผิดพลาด' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/logo.png"
            alt="Siam Waste Management"
            width={96}
            height={96}
            style={{ marginBottom: 12, objectFit: 'contain' }}
          />
          <Title level={3} style={{ margin: 0, color: '#1a1a1a', fontWeight: 600 }}>
            Siam Waste
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>บริการรับแกลลอนน้ำมันใช้แล้ว</Text>
        </div>

        <Card
          variant="borderless"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)', borderRadius: 16 }}
          styles={{ body: { padding: '32px 32px 24px' } }}
        >
          {done ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#f1f8f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircleFilled style={{ fontSize: 36, color: '#43a047' }} />
              </div>
              <Title level={5} style={{ margin: '0 0 8px' }}>ส่งอีเมลแล้ว!</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
                ระบบส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของท่านแล้ว
                กรุณาตรวจสอบอีเมล (ลิงก์มีอายุ 24 ชั่วโมง)
              </Text>
              <Button type="primary" block size="large" onClick={() => router.push('/login')}
                style={{ height: 44, fontWeight: 500 }}>
                กลับหน้าเข้าสู่ระบบ
              </Button>
            </div>
          ) : (
            <>
              <Title level={5} style={{ marginBottom: 4, fontWeight: 500 }}>ลืมรหัสผ่าน?</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
                กรอกอีเมลที่ลงทะเบียนไว้ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้
              </Text>

              {alertMsg && (
                <Alert type={alertMsg.type} message={alertMsg.text} showIcon
                  style={{ marginBottom: 20, borderRadius: 8 }} />
              )}

              <Form layout="vertical" onFinish={onFinish} size="large"
                initialValues={{ email: defaultEmail }}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'กรุณากรอกอีเมล' },
                    { type: 'email',  message: 'รูปแบบอีเมลไม่ถูกต้อง' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#bbb' }} />}
                    placeholder="email@example.com"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item label={<Text style={{ fontSize: 13, color: '#666' }}>ยืนยันตัวตน</Text>}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Turnstile
                      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onVerify={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken('')}
                      theme="light"
                    />
                  </div>
                </Form.Item>

                <Form.Item style={{ marginBottom: 8 }}>
                  <Button type="primary" htmlType="submit" loading={loading} block
                    style={{ height: 44, fontWeight: 500, fontSize: 15 }}>
                    ส่งลิงก์รีเซ็ตรหัสผ่าน
                  </Button>
                </Form.Item>

                <Button type="text" icon={<ArrowLeftOutlined />} block
                  onClick={() => router.push('/login')}
                  style={{ color: '#888' }}>
                  กลับหน้าเข้าสู่ระบบ
                </Button>
              </Form>
            </>
          )}
        </Card>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 24, fontSize: 12 }}>
          © {new Date().getFullYear()} Siam Waste. All rights reserved.
        </Text>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  )
}
