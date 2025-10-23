import React, { useState } from 'react'
import { Box, TextField, Button, Typography, Link, Alert } from '@mui/material'
import { authApi } from '../api/api'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login({ email, password })
      const { token, user } = res.data
      login(user, token)
      navigate('/prediction')
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.error || err.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box p={4} maxWidth={420}>
      <Typography variant="h4">Login</Typography>
      <Box component="form" mt={2} onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth required margin="normal" />
        <TextField label="Password" value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" type="password" />
        <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</Button>
      </Box>
      <Box mt={2}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/signup">
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
