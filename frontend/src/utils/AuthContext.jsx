import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom' // Add this import
import { loginUser, registerUser } from './api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate() // Add this line to use navigation

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email, password) => {
    const userData = await loginUser(email, password)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (name, email, password) => {
    const userData = await registerUser(name, email, password)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    navigate('/') // Navigate to home page after logout
  }

  const value = {
    user,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}