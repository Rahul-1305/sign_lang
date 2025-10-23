import React from 'react'
import { Box } from '@mui/material'

export default React.memo(function CameraFeed({ videoRef, canvasRef, overlayStyle }) {
  return (
    <Box position="relative" width="100%" height="100%">
      <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} muted playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* overlay box */}
      <div aria-hidden style={{ position: 'absolute', left: '10%', top: '10%', width: '80%', height: '80%', border: '2px dashed rgba(255,255,255,0.6)', pointerEvents: 'none', ...overlayStyle }} />
    </Box>
  )
})
