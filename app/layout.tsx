import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Siam Waste Portal',
  icons: { icon: '/logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                fontFamily: "'Kanit', sans-serif",
                colorPrimary: '#43a047',
                colorLink: '#43a047',
                borderRadius: 8,
              },
              components: {
                Button: { borderRadius: 8 },
                Input:  { borderRadius: 8 },
                Card:   { borderRadius: 16 },
              },
            }}
          >
            <AuthProvider>
              {children}
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
