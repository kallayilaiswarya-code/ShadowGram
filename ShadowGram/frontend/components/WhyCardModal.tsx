'use client'

import { useState } from 'react'
import { GraphCluster } from '../types/contracts'

interface WhyCardModalProps {
  cluster: GraphCluster | null
  onClose: () => void
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const USE_MOCK_GRAPH =
  process.env.NEXT_PUBLIC_USE_MOCK_GRAPH === 'true'

export default function WhyCardModal({
  cluster,
  onClose,
}: WhyCardModalProps) {
  const [action, setAction] = useState<
    'isolate' | 'step_up_challenge' | 'release'
  >('isolate')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!cluster) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-medium">
          Why is this cluster suspicious?
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/50">
          Select a suspicious cluster in the graph to inspect the available
          evidence.
        </p>
      </div>
    )
  }

  const handleQuarantine = async () => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      /*
       * DEVELOPMENT / MOCK MODE
       *
       * The backend is intentionally offline while we test
       * the frontend. In mock mode we simulate a successful
       * quarantine response instead of making a network request.
       */
      if (USE_MOCK_GRAPH) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        )

        setMessage(
          `Mock quarantine action "${action}" submitted for cluster ${cluster.cluster_id}.`
        )

        return
      }

      /*
       * REAL BACKEND MODE
       *
       * When mock mode is disabled, use the real
       * /api/quarantine endpoint.
       */
      const response = await fetch(
        `${API_BASE}/api/quarantine`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cluster_id: cluster.cluster_id,
            action,
            reason:
              'Coordinated multi-agent swarm detected via Louvain community clustering',
            operator_id: 'OFFICER-04',
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Quarantine API returned ${response.status}`
        )
      }

      setMessage(
        `Action "${action}" submitted for cluster ${cluster.cluster_id}.`
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to submit quarantine action.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs tracking-wider text-purple-300">
            WHY CARD
          </span>

          <h2 className="mt-1 text-lg font-medium">
            Cluster {cluster.cluster_id}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-white/50 hover:bg-white/10 hover:text-white"
          aria-label="Close evidence card"
        >
          ×
        </button>
      </div>

      {/* CLUSTER METRICS */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/20 p-3">
          <span className="text-xs text-white/40">
            SIZE
          </span>

          <div className="mt-1 text-xl">
            {cluster.size}
          </div>
        </div>

        <div className="rounded-xl bg-black/20 p-3">
          <span className="text-xs text-white/40">
            MODULARITY
          </span>

          <div className="mt-1 text-xl">
            {cluster.modularity_q.toFixed(3)}
          </div>
        </div>
      </div>

      {/* FACTUAL REASONS */}
      <div className="mt-5">
        <h3 className="text-sm font-medium">
          Factual reasons
        </h3>

        {cluster.factual_reasons.length === 0 ? (
          <p className="mt-2 text-sm text-white/40">
            No factual reasons were supplied by the graph API.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {cluster.factual_reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/70"
              >
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RESPONSE ACTION */}
      <div className="mt-5 border-t border-white/10 pt-5">
        <h3 className="text-sm font-medium">
          Response action
        </h3>

        <p className="mt-1 text-xs leading-5 text-white/40">
          Choose the operator action to send to the quarantine API.
        </p>

        <select
          value={action}
          onChange={(event) =>
            setAction(
              event.target.value as
                | 'isolate'
                | 'step_up_challenge'
                | 'release'
            )
          }
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="isolate">
            Isolate
          </option>

          <option value="step_up_challenge">
            Step-up challenge
          </option>

          <option value="release">
            Release
          </option>
        </select>

        <button
          type="button"
          onClick={handleQuarantine}
          disabled={isSubmitting}
          className="mt-3 w-full rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-200 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting
            ? 'Submitting…'
            : 'Submit Response Action'}
        </button>

        {/* RESULT MESSAGE */}
        {message && (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/60">
            {message}
          </div>
        )}
      </div>

      {/* SAFETY / SCOPE NOTE */}
      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/40">
        This card presents behavioral evidence supplied by the graph
        analysis. It does not identify a person.
      </div>
    </div>
  )
}