"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api from '../services/api'

interface User {
  id: string
  name: string
  email: string
  role: 'patient' | 'shop'
  shopName?: string
  shopAddress?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'patient' | 'shop'
  shopName?: string
  shopAddress?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizeUser(user: any): User {
  return {
    ...user,
    id: user.id || user._id,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(normalizeUser(JSON.parse(storedUser)))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })

      // Store in state and localStorage
      const normalizedUser = normalizeUser(data.user)
      setToken(data.token)
      setUser(normalizedUser)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))

      // Redirect based on role
      if (normalizedUser.role === 'patient') {
        router.push('/patient')
      } else if (normalizedUser.role === 'shop') {
        router.push('/shopkeeper')
      }

      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.response?.data?.message || error.response?.data?.error || 'Network error. Please try again.' }
    }
  }

  const register = async (registerData: RegisterData) => {
    try {
      const { data } = await api.post('/auth/register', registerData)

      // Auto-login after registration
      return await login(registerData.email, registerData.password)
    } catch (error: any) {
      console.error('Register error:', error)
      return { success: false, error: error.response?.data?.message || 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to get auth headers for API calls
export function useAuthHeaders() {
  const { token } = useAuth()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}
