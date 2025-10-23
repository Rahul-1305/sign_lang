import React, { useCallback } from 'react'
import { Box, Button, Typography } from '@mui/material'
import CameraFeed from '../components/CameraFeed'
import ResultCard from '../components/ResultCard'
import usePredict from '../hooks/usePredict'

export default function Prediction() {
  const { videoRef, canvasRef, startCamera, stopCamera, captureAndPredict, loading, result } = usePredict()

  const handleStart = useCallback(async () => {
    await startCamera()
  }, [startCamera])

  const handlePredict = useCallback(async () => {
    try {
      await captureAndPredict()
    } catch (err) {
      console.error(err)
    }
  }, [captureAndPredict])

  return (
    <Box p={3} display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={2}>
      <Box>
        <Typography variant="h5">Live Camera</Typography>
        <CameraFeed videoRef={videoRef} canvasRef={canvasRef} />
        <Box mt={2}>
          <Button onClick={handleStart} variant="contained">Start Camera</Button>
          <Button onClick={handlePredict} variant="outlined" sx={{ ml: 2 }}>Predict</Button>
        </Box>
      </Box>
      <Box>
        <Typography variant="h5">Prediction</Typography>
        {loading ? <Typography>Loading...</Typography> : result ? <ResultCard label={result.label} confidence={result.confidence} /> : <Typography>No result yet</Typography>}
      </Box>
    </Box>
  )
}
