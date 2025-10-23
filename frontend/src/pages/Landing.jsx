import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <Box p={4}>
      <Typography variant="h3">Sign Language Interpreter</Typography>
      <Typography variant="body1" mt={2}>Real-time ASL recognition powered by your backend.</Typography>
      <Box mt={4}>
        <Button component={Link} to="/prediction" variant="contained">Start</Button>
      </Box>
    </Box>
  )
}
