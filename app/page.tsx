'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Spin } from 'antd'

export default function HomePage() {
  const { user }  = useAuth()
  const router    = useRouter()

  useEffect(() => {
    if (user) router.replace('/dashboard')
    else      router.replace('/login')
  }, [user, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </div>
  )
}
