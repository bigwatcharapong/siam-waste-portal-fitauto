'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface UserClaims {
  branch_id:     string
  email:         string
  customer_name: string
  prefix:        string
  service_name:  string
  branch_name:   string
  address:       string
  sub_district:  string
  district:      string
  province:      string
  zip_code:      string
  latitude:      string
  longitude:     string
  contact_name:  string
  contact_tel:   string
  exp:           number
}

interface AuthContextValue {
  user:   UserClaims | null
  token:  string | null
  login:  (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null, token: null, login: () => {}, logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user,  setUser]  = useState<UserClaims | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) trySetToken(stored)
  }, [])

  function trySetToken(t: string) {
    try {
      const decoded = jwtDecode<UserClaims>(t)
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        return
      }
      setToken(t)
      setUser(decoded)
    } catch {
      localStorage.removeItem('token')
    }
  }

  function login(t: string) {
    localStorage.setItem('token', t)
    trySetToken(t)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
