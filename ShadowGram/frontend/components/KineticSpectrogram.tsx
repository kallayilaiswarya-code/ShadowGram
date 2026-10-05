'use client'

import { useEffect, useRef } from 'react'

export interface KineticSpectrogramProps {
  intensity?: number
  className?: string
}

export default function KineticSpectrogram({
  intensity = 0.35,
  className = '',
}: KineticSpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const phaseRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const safeIntensity = Math.max(0.05, Math.min(1, intensity))

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) {
        animFrameRef.current = requestAnimationFrame(draw)
        return
      }

      phaseRef.current += 0.035 + safeIntensity * 0.035

      context.clearRect(0, 0, rect.width, rect.height)

      // Background
      context.fillStyle = 'rgba(3, 10, 17, 0.95)'
      context.fillRect(0, 0, rect.width, rect.height)

      // Subtle horizontal analysis grid
      context.strokeStyle = 'rgba(21, 188, 223, 0.09)'
      context.lineWidth = 1
      for (let y = 8; y < rect.height; y += 14) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(rect.width, y)
        context.stroke()
      }

      // Draw frequency spectrum bars
      const barWidth = 3
      const gap = 2
      const step = barWidth + gap
      const numBars = Math.floor(rect.width / step)

      for (let i = 0; i < numBars; i++) {
        const x = i * step
        const norm = i / Math.max(numBars, 1)

        // Triple harmonic simulation: trajectory jerk + keystroke flight + dwell time
        const w1 = Math.sin(norm * 14.0 + phaseRef.current) * 0.45
        const w2 = Math.sin(norm * 7.0 - phaseRef.current * 0.7) * 0.3
        const w3 =
          Math.sin(norm * 28.0 + phaseRef.current * (1.3 + safeIntensity * 1.6)) *
          0.25 *
          safeIntensity

        const combined = Math.max(0, Math.min(1, (w1 + w2 + w3 + 1) / 2))
        const dynamicH =
          combined * (rect.height - 10) * (0.35 + safeIntensity * 0.65)
        const barHeight = Math.max(3, dynamicH)
        const y = rect.height - barHeight - 2

        // Dynamic tactical coloring based on intensity tier
        if (safeIntensity > 0.75) {
          // High jerk / robotic automation: Crimson red
          context.fillStyle = `rgba(239, 68, 68, ${0.45 + combined * 0.5})`
        } else if (safeIntensity > 0.4) {
          // Intermediate / outlier: Amber
          context.fillStyle = `rgba(245, 158, 11, ${0.4 + combined * 0.5})`
        } else {
          // Organic human baseline: Tactical cyan
          context.fillStyle = `rgba(21, 188, 223, ${0.35 + combined * 0.55})`
        }

        context.fillRect(x, y, barWidth, barHeight)
      }

      // Baseline line
      context.strokeStyle =
        safeIntensity > 0.75
          ? 'rgba(239, 68, 68, 0.4)'
          : 'rgba(21, 188, 223, 0.35)'
      context.beginPath()
      context.moveTo(0, rect.height - 1)
      context.lineTo(rect.width, rect.height - 1)
      context.stroke()

      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      resizeObserver.disconnect()
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [intensity])

  return (
    <div className={`spectrogram ${className}`}>
      <div className="spectrogram-header">
        <span>KINETIC SPECTROGRAM // MOTION SIGNATURE</span>
        <strong
          style={{
            color:
              intensity > 0.75
                ? 'var(--red)'
                : intensity > 0.4
                ? '#f59e0b'
                : 'var(--cyan)',
          }}
        >
          {Math.round(intensity * 100)}%
        </strong>
      </div>

      <div
        className="spectrogram-canvas-shell"
        style={{
          position: 'relative',
          width: '100%',
          height: '56px',
          marginTop: '8px',
          borderBottom: '1px solid rgba(21, 188, 223, 0.2)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
          aria-label="Kinetic behavioral motion spectrogram"
        />
      </div>

      <div className="spectrogram-labels">
        <span>POINTER (JERK)</span>
        <span>TYPING (Δt)</span>
        <span>DWELL</span>
        <span>FLIGHT</span>
      </div>
    </div>
  )
}