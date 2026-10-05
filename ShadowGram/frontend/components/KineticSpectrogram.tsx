'use client'

import { useEffect, useRef } from 'react'

interface KineticSpectrogramProps {
  intensity?: number
}

export default function KineticSpectrogram({
  intensity = 0.35,
}: KineticSpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const width = 128
    const height = 128

    canvas.width = width
    canvas.height = height

    const safeIntensity = Math.max(
      0,
      Math.min(1, intensity)
    )

    let animationFrame = 0
    let phase = 0

    const draw = () => {
      phase += 0.035 + safeIntensity * 0.025

      context.clearRect(0, 0, width, height)

      /*
       * Background
       */
      context.fillStyle = '#05020d'
      context.fillRect(0, 0, width, height)

      /*
       * Spectrogram bars
       *
       * The signal amplitude is influenced by the selected
       * cluster's kinetic jerk score.
       */
      for (let x = 0; x < width; x += 2) {
        const primaryWave =
          Math.sin(x * 0.16 + phase) * 0.5

        const secondaryWave =
          Math.sin(x * 0.05 - phase * 0.7) * 0.3

        const kineticWave =
          Math.sin(
            x * 0.31 +
              phase * (1.4 + safeIntensity)
          ) *
          0.2 *
          safeIntensity

        const wave =
          primaryWave +
          secondaryWave +
          kineticWave

        const normalized = Math.max(
          0,
          Math.min(1, (wave + 1) / 2)
        )

        const baseHeight = 8

        const dynamicHeight =
          normalized *
          48 *
          (0.45 + safeIntensity * 0.55)

        const barHeight =
          baseHeight + dynamicHeight

        const y = height - barHeight

        const opacity =
          0.15 +
          normalized *
            (0.35 + safeIntensity * 0.3)

        context.fillStyle = `rgba(124, 140, 255, ${opacity})`

        context.fillRect(
          x,
          y,
          1,
          barHeight
        )
      }

      /*
       * Signal baseline
       */
      context.strokeStyle =
        'rgba(255,255,255,0.12)'

      context.lineWidth = 1

      context.beginPath()
      context.moveTo(0, height - 8)
      context.lineTo(width, height - 8)
      context.stroke()

      /*
       * Horizontal analysis grid
       */
      context.strokeStyle =
        'rgba(255,255,255,0.07)'

      for (let y = 0; y < height; y += 16) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.stroke()
      }

      /*
       * Intensity indicator
       */
      const indicatorHeight =
        safeIntensity * height

      context.fillStyle =
        'rgba(255,255,255,0.08)'

      context.fillRect(
        width - 3,
        height - indicatorHeight,
        2,
        indicatorHeight
      )

      animationFrame =
        window.requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [intensity])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs tracking-[0.2em] text-purple-300">
            KINETIC SPECTROGRAM
          </span>

          <span className="text-[10px] text-white/30">
            {Math.round(intensity * 100)}%
          </span>
        </div>

        <p className="mt-1 text-xs text-white/40">
          Live behavioral motion signal
        </p>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="h-32 w-32 rounded-lg border border-white/10"
          aria-label="Kinetic behavioral spectrogram"
        />
      </div>
    </div>
  )
}