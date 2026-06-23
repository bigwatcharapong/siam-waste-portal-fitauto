'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Form, Input, Alert, Card, Typography } from 'antd'
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import Image from 'next/image'
import Turnstile from 'react-turnstile'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const { Title, Text } = Typography

export default function LoginPage() {
  const router    = useRouter()
  const { login } = useAuth()

  const [step,           setStep]           = useState<'email' | 'password'>('email')
  const [email,          setEmail]          = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [loading,        setLoading]        = useState(false)
  const [alertMsg,       setAlertMsg]       = useState<{ type: 'success' | 'error' | 'warning' | 'info'; text: string } | null>(null)

  async function handleEmailSubmit(values: { email: string }) {
    if (!turnstileToken) {
      setAlertMsg({ type: 'error', text: 'กรุณายืนยัน Turnstile ก่อน' })
      return
    }
    setLoading(true)
    setAlertMsg(null)
    try {
      const res  = await api.post('/api/auth/login', { email: values.email.trim().toLowerCase(), turnstileToken })
      const data = res.data
      if (data.status === 'need_setup') {
        setAlertMsg({ type: 'success', text: data.message })
      } else if (data.status === 'need_password') {
        setEmail(values.email.trim().toLowerCase())
        setStep('password')
      } else {
        setAlertMsg({ type: 'error', text: data.message })
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message ?? 'เกิดข้อผิดพลาด' })
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(values: { password: string }) {
    setLoading(true)
    setAlertMsg(null)
    try {
      const res  = await api.post('/api/auth/login', { email, password: values.password, turnstileToken })
      const data = res.data
      if (data.status === 'success') {
        login(data.token)
        router.push('/request')
      } else {
        setAlertMsg({ type: 'error', text: data.message })
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message ?? 'เกิดข้อผิดพลาด' })
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

        {/* Logo / Brand */}
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
          style={{
            boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
            borderRadius: 16,
          }}
          styles={{ body: { padding: '32px 32px 24px' } }}
        >
          {step === 'email' && (
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
              border: '1px solid #c8e6c9',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>🚗</span>
              <div>
                <Text strong style={{ fontSize: 13, color: '#2e7d32', display: 'block' }}>
                  สำหรับลูกค้า FIT Auto
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ระบบแจ้งรับแกลลอนน้ำมันใช้แล้ว
                </Text>
              </div>
            </div>
          )}

          <Title level={5} style={{ marginBottom: 4, fontWeight: 500 }}>
            {step === 'email' ? 'เข้าสู่ระบบ' : 'ใส่รหัสผ่าน'}
          </Title>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
            {step === 'email'
              ? 'กรอกอีเมลที่ลงทะเบียนไว้กับเรา'
              : email}
          </Text>

          {alertMsg && (
            <Alert type={alertMsg.type} message={alertMsg.text} showIcon style={{ marginBottom: 20, borderRadius: 8 }} />
          )}

          {step === 'email' ? (
            <Form layout="vertical" onFinish={handleEmailSubmit} size="large">
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

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary" htmlType="submit" loading={loading} block
                  style={{ height: 44, fontWeight: 500, fontSize: 15 }}
                >
                  ถัดไป
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Form layout="vertical" onFinish={handlePasswordSubmit} size="large">
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bbb' }} />}
                  placeholder="รหัสผ่าน"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 8 }}>
                <Button
                  type="primary" htmlType="submit" loading={loading} block
                  style={{ height: 44, fontWeight: 500, fontSize: 15 }}
                >
                  เข้าสู่ระบบ
                </Button>
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  type="text" icon={<ArrowLeftOutlined />}
                  onClick={() => { setStep('email'); setAlertMsg(null) }}
                  style={{ color: '#888', paddingLeft: 0 }}
                >
                  ย้อนกลับ
                </Button>
                <Button
                  type="link"
                  onClick={() => router.push(`/forgot-password?email=${encodeURIComponent(email)}`)}
                  style={{ paddingRight: 0 }}
                >
                  ลืมรหัสผ่าน?
                </Button>
              </div>
            </Form>
          )}
        </Card>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 24, fontSize: 12 }}>
          © {new Date().getFullYear()} Siam Waste. All rights reserved.
        </Text>
      </div>
    </div>
  )
}
