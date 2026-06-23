'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Layout, Button, Avatar, Typography, Dropdown, Space, Drawer } from 'antd'
import {
  DashboardOutlined,
  FormOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/context/AuthContext'

const { Header, Content } = Layout
const { Text } = Typography

const NAV_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard'   },
  { key: '/request',   icon: <FormOutlined />,      label: 'แจ้งเข้ารับ' },
  { key: '/history',   icon: <HistoryOutlined />,   label: 'ประวัติ'      },
]

const SIDEBAR_WIDTH   = 240
const COLLAPSED_WIDTH = 68

const COLOR_PRIMARY   = '#43a047'
const COLOR_PRIMARY_BG = '#f1f8f1'
const COLOR_ACTIVE_BG = '#e8f5e9'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()
  const [collapsed,  setCollapsed]  = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile,   setIsMobile]   = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function navigate(key: string) {
    router.push(key)
    setDrawerOpen(false)
  }

  const userDropdown = {
    items: [{
      key:     'logout',
      icon:    <LogoutOutlined />,
      label:   'ออกจากระบบ',
      danger:  true,
      onClick: () => { logout(); router.push('/login') },
    }],
  }

  const cleanPath    = pathname.replace(/\/$/, '')
  const currentLabel = NAV_ITEMS.find(n => n.key === cleanPath)?.label ?? 'Portal'

  /* ── Sidebar inner ── */
  const sidebarInner = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Brand */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '0 18px' : '0 20px',
        borderBottom: '1px solid #eeeeee',
        flexShrink: 0,
        transition: 'padding 0.2s',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: COLOR_PRIMARY_BG,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
        }}>
          <Image src="/logo.png" alt="logo" width={26} height={26} style={{ objectFit: 'contain' }} />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: 14, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
              Siam Waste
            </div>
            <div style={{ color: '#aaa', fontSize: 11, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
              Customer Portal
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const clean  = pathname.replace(/\/$/, '')
          const active = clean === item.key
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.key)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '11px 0' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                marginBottom: 2,
                cursor: 'pointer',
                background: active ? COLOR_ACTIVE_BG : 'transparent',
                color:      active ? COLOR_PRIMARY    : '#555',
                fontWeight: active ? 600              : 400,
                fontSize: 14,
                transition: 'all 0.15s',
                borderLeft: active ? `3px solid ${COLOR_PRIMARY}` : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = '#f5f5f5'
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: 17, flexShrink: 0, color: active ? COLOR_PRIMARY : '#888' }}>
                {item.icon}
              </span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          )
        })}
      </div>

      {/* Collapse toggle */}
      {!isMobile && (
        <div style={{ padding: '10px 10px', borderTop: '1px solid #eeeeee' }}>
          <div
            onClick={() => setCollapsed(c => !c)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10, padding: collapsed ? '10px 0' : '10px 14px',
              borderRadius: 10, cursor: 'pointer', color: '#aaa', fontSize: 13,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <span style={{ fontSize: 16 }}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            {!collapsed && <span>ย่อแถบเมนู</span>}
          </div>
        </div>
      )}
    </div>
  )

  const sidebarStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRight: '1px solid #eeeeee',
    position: 'fixed',
    left: 0, top: 0, bottom: 0,
    zIndex: 100,
    width: collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
    transition: 'width 0.2s',
    overflow: 'hidden',
    boxShadow: '1px 0 6px rgba(0,0,0,0.04)',
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f4f6f8' }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <div style={sidebarStyle}>
          {sidebarInner}
        </div>
      )}

      {/* Mobile drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={SIDEBAR_WIDTH}
        styles={{
          body:   { padding: 0, background: '#ffffff' },
          header: { display: 'none' },
        }}
      >
        {sidebarInner}
      </Drawer>

      {/* Main */}
      <Layout style={{
        marginLeft: isMobile ? 0 : (collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH),
        transition: 'margin-left 0.2s',
        background: '#f4f6f8',
      }}>

        {/* Header */}
        <Header style={{
          height: 64,
          background: '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #eeeeee',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <Space size={12}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setDrawerOpen(true)}
                style={{ color: '#555' }}
              />
            )}
            <Text style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', letterSpacing: 0.2 }}>
              {currentLabel}
            </Text>
          </Space>

          <Dropdown menu={userDropdown} trigger={['click']}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', padding: '6px 10px', borderRadius: 10,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Avatar
                size={34}
                icon={<UserOutlined />}
                style={{ background: COLOR_PRIMARY, flexShrink: 0 }}
              />
              {!isMobile && (
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                    {user?.branch_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>
                    {user?.customer_name}
                  </div>
                </div>
              )}
              <DownOutlined style={{ fontSize: 10, color: '#ccc' }} />
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content style={{ padding: '28px 24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
