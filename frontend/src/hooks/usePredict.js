import { useRef, useCallback, useState } from 'react'
import { predictApi } from '../api/api'

export default function usePredict() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    videoRef.current.srcObject = stream
    await videoRef.current.play()
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
  }, [])

  const captureAndPredict = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return null
    setLoading(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg')
    try {
      const { data } = await predictApi.predict({ image: dataUrl })
      setResult(data)
      setLoading(false)
      return data
    } catch (err) {
      setLoading(false)
      throw err
    }
  }, [])

  return { videoRef, canvasRef, startCamera, stopCamera, captureAndPredict, loading, result }
}
