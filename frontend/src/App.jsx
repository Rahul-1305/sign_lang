import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import AppRouter from './router/AppRouter'

export default function App() {
  return (
    <Suspense fallback={<Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>}>
      <AppRouter />
    </Suspense>
  )
}
