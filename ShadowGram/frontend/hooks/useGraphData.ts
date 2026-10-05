'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ENDPOINTS, GraphResponse } from '../types/contracts'
import { MOCK_GRAPH } from '../data/mockGraph'

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000'

const USE_MOCK_GRAPH = true

export function useGraphData() {
  const [graph, setGraph] = useState<GraphResponse>(
    USE_MOCK_GRAPH
      ? MOCK_GRAPH
      : {
          nodes: [],
          links: [],
          clusters: [],
        }
  )

  const [loading, setLoading] = useState(!USE_MOCK_GRAPH)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)

  const fetchGraph = useCallback(async () => {
    if (USE_MOCK_GRAPH) {
      setGraph(MOCK_GRAPH)
      setLoading(false)
      setError(null)
      return
    }

    try {
      const response = await fetch(
        `${API_BASE}${ENDPOINTS.GRAPH}`,
        { cache: 'no-store' }
      )

      if (!response.ok) {
        throw new Error(`Graph API returned ${response.status}`)
      }

      const data: GraphResponse = await response.json()
      setGraph(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGraph()

    if (USE_MOCK_GRAPH) {
      return
    }

    const interval = window.setInterval(fetchGraph, 3000)

    return () => {
      window.clearInterval(interval)
    }
  }, [fetchGraph])

  useEffect(() => {
    if (USE_MOCK_GRAPH) {
      return
    }

    try {
      const ws = new WebSocket(`${WS_BASE}/ws/telemetry`)
      wsRef.current = ws

      ws.onmessage = () => {
        fetchGraph()
      }

      ws.onerror = () => {
        ws.close()
      }

      return () => {
        ws.close()
        wsRef.current = null
      }
    } catch {
      // WebSocket is optional; polling continues to provide graph updates.
    }
  }, [fetchGraph])

  return {
    graph,
    loading,
    error,
    refresh: fetchGraph,
  }
}