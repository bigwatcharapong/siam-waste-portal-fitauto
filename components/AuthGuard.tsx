'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spin } from 'antd'
import { useAuth } from '@/context/AuthContext'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (token === null && user === null) {
      const t = setTimeout(() => {
        if (!localStorage.getItem('token')) {
          router.replace('/login')
        }
      }, 100)
      return () => clearTimeout(t)
    }
  }, [token, user, router])

  return (
    <>
      {/* render children เสมอ เพื่อไม่ให้ useForm disconnect */}
      <div style={{ display: user ? 'contents' : 'none' }}>
        {children}
      </div>
      {!user && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Spin size="large" />
        </div>
      )}
    </>
  )
}
