import * as React from 'react'
import { Store } from 'tauri-plugin-store-api'

export interface AuthContext {
  isAuthenticated: boolean
  setUser: (username: string | null) => void
  user: string | null,
  store: Store
}

const AuthContext = React.createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<string | null>(null)
  const isAuthenticated = !!user
  const store = new Store("config.json")
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setUser, store }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
