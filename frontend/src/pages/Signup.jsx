import React, { useState } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import { authApi } from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await authApi.signup({ email, password })
      navigate('/login')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box p={4} maxWidth={420}>
      <Typography variant="h4">Sign Up</Typography>
      <Box component="form" mt={2} onSubmit={handleSubmit}>
        <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth required margin="normal" />
        <TextField label="Password" value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" type="password" />
        <Button type="submit" variant="contained">Register</Button>
      </Box>
    </Box>
  )
}
