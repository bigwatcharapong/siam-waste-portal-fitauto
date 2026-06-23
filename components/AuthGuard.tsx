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
      <div style={{ visibility: user ? 'visible' : 'hidden', height: user ? 'auto' : 0, overflow: 'hidden' }}>
        {children}
      </div>
      {!user && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      )}
    </>
  )
}
