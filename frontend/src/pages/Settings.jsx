import React, { useContext } from 'react'
import { Box, Typography, Switch } from '@mui/material'
import { AppContext } from '../context/AppContext'

export default function Settings() {
  const { themeMode, setThemeMode } = useContext(AppContext)

  return (
    <Box p={3}>
      <Typography variant="h4">Settings</Typography>
      <Box mt={2}>
        <Typography>Theme: {themeMode}</Typography>
        <Switch checked={themeMode === 'dark'} onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')} />
      </Box>
    </Box>
  )
}
