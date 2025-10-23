import React from 'react'
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material'

export default React.memo(function ResultCard({ label, confidence }) {
  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography variant="h5">{label}</Typography>
        <Box mt={2}>
          <LinearProgress variant="determinate" value={(confidence || 0) * 100} />
          <Typography variant="body2">Confidence: {(confidence || 0).toFixed(2)}</Typography>
        </Box>
      </CardContent>
    </Card>
  )
})
