'use client'

import { useCallback, useRef, useState } from 'react'

interface CyberAudioEngineProps {
  enabled?: boolean
}

export default function CyberAudioEngine({
  enabled = false,
}: CyberAudioEngineProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const [isEnabled, setIsEnabled] = useState(enabled)

  const playPulse = useCallback(() => {
    if (!isEnabled) {
      return
    }

    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext
        }
      ).webkitAudioContext

    if (!AudioContextClass) {
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass()
    }

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(220, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      440,
      context.currentTime + 0.08
    )

    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(
      0.08,
      context.currentTime + 0.01
    )
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.15
    )

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start()
    oscillator.stop(context.currentTime + 0.16)
  }, [isEnabled])

  const toggleAudio = () => {
    setIsEnabled((current) => !current)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs tracking-[0.2em] text-purple-300">
            CYBER AUDIO
          </span>

          <p className="mt-1 text-xs text-white/40">
            Optional investigation audio feedback
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAudio}
          className={`rounded-lg px-3 py-2 text-xs transition ${
            isEnabled
              ? 'bg-purple-500/20 text-purple-200'
              : 'bg-white/5 text-white/50'
          }`}
        >
          {isEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <button
        type="button"
        onClick={playPulse}
        disabled={!isEnabled}
        className="mt-4 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Test Pulse
      </button>
    </div>
  )
}