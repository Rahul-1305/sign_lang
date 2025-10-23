import React, { lazy, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Landing = lazy(() => import('../pages/Landing'))
const Login = lazy(() => import('../pages/Login'))
const Signup = lazy(() => import('../pages/Signup'))
const Prediction = lazy(() => import('../pages/Prediction'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Settings = lazy(() => import('../pages/Settings'))

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext)
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/prediction" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  )
}
