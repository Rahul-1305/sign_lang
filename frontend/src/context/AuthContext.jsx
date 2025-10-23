import React, { createContext, useState, useEffect } from 'react'
import { getTokenFromStorage, setTokenToStorage } from '../utils/storage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const t = getTokenFromStorage()
    if (t) setToken(t)
    // TODO: fetch user profile using token
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    setToken(token)
    setTokenToStorage(token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
