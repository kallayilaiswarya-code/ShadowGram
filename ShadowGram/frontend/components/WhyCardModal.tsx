'use client'

import { useEffect, useState } from 'react'
import type { GraphCluster } from '../types/contracts'

interface WhyCardModalProps {
  cluster: GraphCluster | null
  onClose: () => void
  onQuarantine?: () => void
  isQuarantined?: boolean
}

export default function WhyCardModal({
  cluster,
  onClose,
  onQuarantine,
  isQuarantined = false,
}: WhyCardModalProps) {
  const [action, setAction] = useState<
    'isolate' | 'step_up_challenge' | 'release'
  >('isolate')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Accessible Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!cluster) {
    return null
  }

  const handleAction = async () => {
    setIsSubmitting(true)
    setMessage(null)

    // Pure frontend simulation delay (no backend API call)
    await new Promise((resolve) => setTimeout(resolve, 350))

    if (action === 'isolate' && onQuarantine) {
      onQuarantine()
    }

    setMessage(
      `SIMULATION CONFIRMED: Cluster #${String(cluster.cluster_id).padStart(2, '0')} action set to "${action.toUpperCase()}".`
    )
    setIsSubmitting(false)
  }

  return (
    <div
      className="why-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cluster explainability why card"
    >
      <div
        className="why-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="why-modal-header">
          <div>
            <span className="why-modal-eyebrow">
              EXPLAINABLE BEHAVIORAL DOSSIER // FRONTEND SIMULATION
            </span>
            <h2 className="why-modal-title">
              CLUSTER #{String(cluster.cluster_id).padStart(2, '0')} // BEHAVIORAL CORRELATION EVIDENCE
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="why-modal-close"
            aria-label="Close why card dialog"
          >
            ✕
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="why-modal-metrics">
          <div className="why-metric-card">
            <span>CLUSTER SIZE</span>
            <strong>{cluster.size} SESSIONS</strong>
          </div>

          <div className="why-metric-card">
            <span>MODULARITY (Q)</span>
            <strong>{cluster.modularity_q.toFixed(3)}</strong>
          </div>

          <div className="why-metric-card">
            <span>STATUS</span>
            <strong style={{ color: isQuarantined ? '#ef4444' : '#10b981' }}>
              {isQuarantined ? 'ISOLATED' : cluster.status.toUpperCase()}
            </strong>
          </div>
        </div>

        {/* FACTUAL REASONS (FROM CANONICAL CONTRACT) */}
        <div className="why-modal-section">
          <span className="why-section-label">FACTUAL EXPLAINABILITY REASONS</span>

          {cluster.factual_reasons.length === 0 ? (
            <p className="why-empty-copy">
              No factual reasons supplied for this cluster.
            </p>
          ) : (
            <ul className="why-reasons-list">
              {cluster.factual_reasons.map((reason, index) => (
                <li key={index} className="why-reason-item">
                  <span className="why-reason-num">0{index + 1}</span>
                  <span className="why-reason-text">{reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CONTAINMENT ACTION CONTROLS */}
        <div className="why-modal-section">
          <span className="why-section-label">SIMULATED CONTAINMENT RESPONSE</span>

          <div className="why-action-row">
            <select
              value={action}
              onChange={(e) =>
                setAction(
                  e.target.value as 'isolate' | 'step_up_challenge' | 'release'
                )
              }
              className="why-select"
              aria-label="Select simulated containment action"
            >
              <option value="isolate">ISOLATE (AUTONOMOUS SWARM QUARANTINE)</option>
              <option value="step_up_challenge">STEP-UP BIOMETRIC CHALLENGE</option>
              <option value="release">RELEASE (ORGANIC CONFIRMATION)</option>
            </select>

            <button
              type="button"
              onClick={handleAction}
              disabled={isSubmitting}
              className="why-submit-btn"
              aria-label="Execute simulated containment action"
            >
              {isSubmitting ? 'PROCESSING...' : 'EXECUTE ACTION'}
            </button>
          </div>

          {message && <div className="why-status-msg">{message}</div>}
        </div>

        {/* ANALYST SAFETY NOTICE */}
        <div className="why-safety-notice">
          ANALYST SAFETY MODE: Behavioral relationship evidence only. No person-level identity claim.
        </div>
      </div>
    </div>
  )
}