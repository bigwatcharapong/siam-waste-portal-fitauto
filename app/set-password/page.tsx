'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Form, Input, Alert, Card, Typography, Progress } from 'antd'
import { LockOutlined, CheckCircleFilled } from '@ant-design/icons'
import Image from 'next/image'
import api from '@/lib/api'

const { Title, Text } = Typography

function passwordStrength(password: string): { percent: number; color: string; label: string } {
  if (!password) return { percent: 0, color: '#f5222d', label: '' }
  let score = 0
  if (password.length >= 8)          score++
  if (/[A-Z]/.test(password))        score++
  if (/[a-z]/.test(password))        score++
  if (/[0-9]/.test(password))        score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const map = [
    { percent: 20,  color: '#f5222d', label: 'อ่อนมาก' },
    { percent: 40,  color: '#fa8c16', label: 'อ่อน' },
    { percent: 60,  color: '#fadb14', label: 'ปานกลาง' },
    { percent: 80,  color: '#52c41a', label: 'แข็งแรง' },
    { percent: 100, color: '#237804', label: 'แข็งแรงมาก' },
  ]
  return map[score - 1] ?? { percent: 0, color: '#f5222d', label: '' }
}

function SetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  const [loading,   setLoading]   = useState(false)
  const [alertMsg,  setAlertMsg]  = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [done,      setDone]      = useState(false)
  const [pwValue,   setPwValue]   = useState('')

  if (!token) {
    return <Alert type="error" message="ลิงก์ไม่ถูกต้อง" showIcon style={{ borderRadius: 8 }} />
  }

  const strength = passwordStrength(pwValue)

  async function handleSubmit(values: { password: string; confirmPassword: string }) {
    setLoading(true)
    setAlertMsg(null)
    try {
      const res  = await api.post('/api/auth/set-password', { token, ...values })
      const data = res.data
      if (data.status === 'success') {
        setDone(true)
        setTimeout(() => router.push('/login'), 2500)
      } else {
        setAlertMsg({ type: 'error', text: data.message })
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message ?? 'เกิดข้อผิดพลาด' })
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <CheckCircleFilled style={{ fontSize: 56, color: '#52c41a', marginBottom: 16 }} />
        <Title level={5} style={{ marginBottom: 8 }}>ตั้งรหัสผ่านสำเร็จ</Title>
        <Text type="secondary">กำลังพาไปหน้าเข้าสู่ระบบ...</Text>
      </div>
    )
  }

  return (
    <>
      {alertMsg && (
        <Alert type={alertMsg.type} message={alertMsg.text} showIcon style={{ marginBottom: 20, borderRadius: 8 }} />
      )}

      <Form layout="vertical" onFinish={handleSubmit} size="large">
        <Form.Item
          label="รหัสผ่านใหม่"
          name="password"
          rules={[
            { required: true, message: 'กรุณากรอกรหัสผ่าน' },
            { min: 8, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const ok = /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value)
                return ok ? Promise.resolve() : Promise.reject('ต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข')
              },
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bbb' }} />}
            autoComplete="new-password"
            onChange={(e) => setPwValue(e.target.value)}
          />
        </Form.Item>

        {pwValue && (
          <div style={{ marginTop: -16, marginBottom: 16 }}>
            <Progress
              percent={strength.percent}
              strokeColor={strength.color}
              showInfo={false}
              size="small"
              style={{ marginBottom: 4 }}
            />
            <Text style={{ fontSize: 12, color: strength.color }}>{strength.label}</Text>
          </div>
        )}

        <Form.Item
          label="ยืนยันรหัสผ่าน"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'กรุณายืนยันรหัสผ่าน' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve()
                return Promise.reject('รหัสผ่านไม่ตรงกัน')
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bbb' }} />}
            autoComplete="new-password"
          />
        </Form.Item>

        <Text type="secondary" style={{ display: 'block', marginBottom: 20, fontSize: 12 }}>
          ต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข
        </Text>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary" htmlType="submit" loading={loading} block
            style={{ height: 44, fontWeight: 500, fontSize: 15 }}
          >
            ตั้งรหัสผ่าน
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default function SetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
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
          <Text type="secondary" style={{ fontSize: 14 }}>ตั้งรหัสผ่านครั้งแรก</Text>
        </div>

        <Card
          variant="borderless"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)', borderRadius: 16 }}
          styles={{ body: { padding: '32px 32px 24px' } }}
        >
          <Title level={5} style={{ marginBottom: 4, fontWeight: 500 }}>กำหนดรหัสผ่าน</Title>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
            สร้างรหัสผ่านเพื่อเข้าใช้งานระบบ
          </Text>
          <Suspense fallback={null}>
            <SetPasswordForm />
          </Suspense>
        </Card>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 24, fontSize: 12 }}>
          © {new Date().getFullYear()} Siam Waste. All rights reserved.
        </Text>
      </div>
    </div>
  )
}
