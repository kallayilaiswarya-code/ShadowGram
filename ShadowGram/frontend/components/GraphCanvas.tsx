'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { GraphResponse } from '../types/contracts'

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => null,
})

export interface GraphCanvasProps {
  graph: GraphResponse
  selectedSessionId: string | null
  selectedClusterId: number | null
  onSelectSession: (sessionId: string) => void
  onSelectCluster?: (clusterId: number) => void
  quarantined?: boolean
  mode?: '2D' | '3D'
  onFallbackChange?: (isFallback: boolean) => void
}

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  baseX: number
  baseY: number
}

const COLOR_HUMAN = '#10b981'
const COLOR_SUSPECT = '#ef4444'
const COLOR_SUSPECT_BRIGHT = '#ff003c'
const COLOR_ANOMALY = '#f59e0b'
const COLOR_CYAN = '#15bcdf'
const COLOR_LASER = 'rgba(255, 0, 85, 0.85)'
const COLOR_QUARANTINED = 'rgba(100, 116, 139, 0.35)'

/**
 * Safe WebGL capability check using a temporary offscreen canvas context.
 * Catches all context creation errors cleanly.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (!gl) {
      return false
    }
    const loseContext = (gl as any).getExtension?.('WEBGL_lose_context')
    if (loseContext) {
      loseContext.loseContext()
    }
    return true
  } catch {
    return false
  }
}

/**
 * Standard React Error Boundary for isolated 3D rendering failures.
 */
interface WebGLErrorBoundaryProps {
  fallback: React.ReactNode
  onError: (error: Error) => void
  children: React.ReactNode
}

interface WebGLErrorBoundaryState {
  hasError: boolean
}

class WebGLErrorBoundary extends React.Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default function GraphCanvas({
  graph,
  selectedSessionId,
  selectedClusterId,
  onSelectSession,
  onSelectCluster,
  quarantined = false,
  mode = '2D',
  onFallbackChange,
}: GraphCanvasProps) {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null)
  const [webGLError, setWebGLError] = useState<string | null>(null)

  // Verify WebGL capability on client mount
  useEffect(() => {
    const supported = isWebGLAvailable()
    setWebGLSupported(supported)
  }, [])

  const isFallbackActive = mode === '3D' && (webGLSupported === false || webGLError !== null)

  useEffect(() => {
    if (onFallbackChange) {
      onFallbackChange(isFallbackActive)
    }
  }, [isFallbackActive, onFallbackChange])

  // Handle runtime 3D crash
  const handle3DError = useCallback((error: Error) => {
    console.warn('[ShadowGram] WebGL 3D error encountered. Gracefully falling back to 2D Canvas.', error.message)
    setWebGLError(error.message)
  }, [])

  return (
    <div className="graph-canvas-shell" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {isFallbackActive && (
        <div className="graph-fallback-banner">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          3D UNAVAILABLE // 2D FALLBACK ACTIVE
        </div>
      )}

      {mode === '3D' && webGLSupported && !webGLError ? (
        <WebGLErrorBoundary
          onError={handle3DError}
          fallback={
            <Canvas2DRenderer
              graph={graph}
              selectedSessionId={selectedSessionId}
              selectedClusterId={selectedClusterId}
              onSelectSession={onSelectSession}
              onSelectCluster={onSelectCluster}
              quarantined={quarantined}
            />
          }
        >
          <ThreeGraphRenderer
            graph={graph}
            selectedSessionId={selectedSessionId}
            onSelectSession={onSelectSession}
            onSelectCluster={onSelectCluster}
            quarantined={quarantined}
          />
        </WebGLErrorBoundary>
      ) : (
        <Canvas2DRenderer
          graph={graph}
          selectedSessionId={selectedSessionId}
          selectedClusterId={selectedClusterId}
          onSelectSession={onSelectSession}
          onSelectCluster={onSelectCluster}
          quarantined={quarantined}
        />
      )}
    </div>
  )
}

/**
 * Reliable High-Performance 2D Canvas Graph Renderer.
 * Zero WebGL dependency. Guaranteed never to throw context creation errors.
 */
function Canvas2DRenderer({
  graph,
  selectedSessionId,
  selectedClusterId,
  onSelectSession,
  onSelectCluster,
  quarantined,
}: {
  graph: GraphResponse
  selectedSessionId: string | null
  selectedClusterId: number | null
  onSelectSession: (sessionId: string) => void
  onSelectCluster?: (clusterId: number) => void
  quarantined: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const pointsRef = useRef<Record<string, Point>>({})
  const pulseRef = useRef<number>(0)

  const nodeIds = useMemo(() => graph.nodes.map((n) => n.id), [graph.nodes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

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

    // Cluster-centric layout initialization
    const initializePoints = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const cx = rect.width / 2
      const cy = rect.height / 2

      // Predefined cluster anchors for tactical readability
      const clusterAnchors: Record<number, { x: number; y: number }> = {
        1: { x: cx, y: cy - 25 }, // Syndicate center-top
        2: { x: cx - rect.width * 0.28, y: cy + rect.height * 0.26 }, // Organic bottom-left
        3: { x: cx + rect.width * 0.28, y: cy + rect.height * 0.22 }, // Anomaly bottom-right
      }

      graph.nodes.forEach((node, index) => {
        if (pointsRef.current[node.id]) return

        const anchor = clusterAnchors[node.cluster_id] || { x: cx, y: cy }
        let offsetX = 0
        let offsetY = 0

        if (node.cluster_id === 1) {
          // Tight triangle for Syndicate Swarm
          if (node.id === 'node-001') {
            offsetX = -55
            offsetY = -35
          } else if (node.id === 'node-002') {
            offsetX = 55
            offsetY = -35
          } else {
            offsetX = 0
            offsetY = 50
          }
        } else if (node.cluster_id === 2) {
          offsetX = node.id === 'node-004' ? -35 : 35
          offsetY = node.id === 'node-004' ? -10 : 20
        } else {
          offsetX = 0
          offsetY = 0
        }

        const targetX = anchor.x + offsetX
        const targetY = anchor.y + offsetY

        pointsRef.current[node.id] = {
          x: targetX,
          y: targetY,
          vx: 0,
          vy: 0,
          baseX: targetX,
          baseY: targetY,
        }
      })
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      initializePoints()
      pulseRef.current += 0.028

      // Transparent clear so CSS radar and tactical grid remain visible
      context.clearRect(0, 0, rect.width, rect.height)

      // Micro-orbital drift around anchor positions
      const nodes = graph.nodes
      for (let i = 0; i < nodes.length; i++) {
        const pt = pointsRef.current[nodes[i].id]
        if (!pt) continue

        const driftX = Math.sin(pulseRef.current * 0.8 + i * 1.5) * 0.22
        const driftY = Math.cos(pulseRef.current * 0.8 + i * 1.5) * 0.22

        pt.x = pt.baseX + driftX
        pt.y = pt.baseY + driftY
      }

      // 1. Draw Links / Laser Edges
      context.save()
      graph.links.forEach((link) => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id

        const s = pointsRef.current[sourceId]
        const t = pointsRef.current[targetId]
        if (!s || !t) return

        const sNode = graph.nodes.find((n) => n.id === sourceId)
        const tNode = graph.nodes.find((n) => n.id === targetId)

        const isSyndicateEdge =
          sNode?.risk_label === 'suspicious_syndicate' && tNode?.risk_label === 'suspicious_syndicate'

        context.beginPath()
        context.moveTo(s.x, s.y)
        context.lineTo(t.x, t.y)

        if (isSyndicateEdge) {
          if (quarantined) {
            // Locked / Dimmed Wireframe Link
            context.strokeStyle = COLOR_QUARANTINED
            context.lineWidth = 1.2
            context.setLineDash([4, 4])
            context.stroke()
            context.setLineDash([])
          } else {
            // High-Energy Glowing Laser Link
            context.shadowBlur = 10
            context.shadowColor = COLOR_LASER
            context.strokeStyle = COLOR_LASER
            context.lineWidth = 2.2
            context.stroke()

            // Directional Photon Pulse
            const phase = (Math.sin(pulseRef.current * 2.8 + link.weight * 6) + 1) / 2
            const px = s.x + (t.x - s.x) * phase
            const py = s.y + (t.y - s.y) * phase

            context.beginPath()
            context.arc(px, py, 2.5, 0, Math.PI * 2)
            context.fillStyle = '#ffffff'
            context.shadowBlur = 14
            context.shadowColor = '#ffffff'
            context.fill()
          }
        } else {
          // Organic Normal Link
          context.shadowBlur = 0
          context.strokeStyle = 'rgba(16, 185, 129, 0.28)'
          context.lineWidth = 1
          context.stroke()
        }
      })
      context.restore()

      // 2. Draw Nodes
      graph.nodes.forEach((node) => {
        const pt = pointsRef.current[node.id]
        if (!pt) return

        const isSuspect = node.risk_label === 'suspicious_syndicate'
        const isAnomaly = node.risk_label === 'anomaly_outlier'
        const isSelected = selectedSessionId === node.session_id || selectedClusterId === node.cluster_id
        const isNodeQuarantined = quarantined && isSuspect

        const baseRadius = isSuspect ? 7.5 : 5
        const pulse = !isNodeQuarantined && isSuspect ? Math.sin(pulseRef.current * 2.5) * 1.2 : 0
        const radius = baseRadius + pulse

        // Selection Crosshair & Target Ring
        if (selectedSessionId === node.session_id) {
          context.save()
          context.beginPath()
          context.arc(pt.x, pt.y, radius + 10, 0, Math.PI * 2)
          context.strokeStyle = COLOR_CYAN
          context.lineWidth = 1.5
          context.shadowBlur = 10
          context.shadowColor = COLOR_CYAN
          context.stroke()

          // Tactical notch markers
          const notchSize = 4
          const rNotch = radius + 10
          context.beginPath()
          context.moveTo(pt.x - rNotch - notchSize, pt.y)
          context.lineTo(pt.x - rNotch, pt.y)
          context.moveTo(pt.x + rNotch, pt.y)
          context.lineTo(pt.x + rNotch + notchSize, pt.y)
          context.moveTo(pt.x, pt.y - rNotch - notchSize)
          context.lineTo(pt.x, pt.y - rNotch)
          context.moveTo(pt.x, pt.y + rNotch)
          context.lineTo(pt.x, pt.y + rNotch + notchSize)
          context.stroke()
          context.restore()
        }

        // Emissive Node Body
        context.save()
        if (isNodeQuarantined) {
          context.fillStyle = '#26313a'
          context.strokeStyle = '#64748b'
          context.lineWidth = 1.2
          context.beginPath()
          context.arc(pt.x, pt.y, 6, 0, Math.PI * 2)
          context.fill()
          context.stroke()
        } else if (isSuspect) {
          context.shadowBlur = 20
          context.shadowColor = COLOR_SUSPECT_BRIGHT
          context.fillStyle = COLOR_SUSPECT_BRIGHT
          context.beginPath()
          context.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
          context.fill()

          // Inner high-energy core
          context.beginPath()
          context.arc(pt.x, pt.y, radius * 0.45, 0, Math.PI * 2)
          context.fillStyle = '#ffffff'
          context.fill()
        } else if (isAnomaly) {
          context.shadowBlur = 12
          context.shadowColor = COLOR_ANOMALY
          context.fillStyle = COLOR_ANOMALY
          context.beginPath()
          context.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
          context.fill()
        } else {
          context.shadowBlur = 12
          context.shadowColor = COLOR_HUMAN
          context.fillStyle = COLOR_HUMAN
          context.beginPath()
          context.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
          context.fill()
        }
        context.restore()

        // Monospace Node Label
        context.save()
        context.font = '7px "Quantico", monospace'
        context.textAlign = 'center'
        context.fillStyle = isSelected ? COLOR_CYAN : isSuspect ? '#fda4af' : '#94a3b8'
        context.fillText(node.session_id.toUpperCase(), pt.x, pt.y + radius + 12)
        context.restore()
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      resizeObserver.disconnect()
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [graph, selectedSessionId, selectedClusterId, quarantined])

  // Synchronize point map with active graph nodes
  useEffect(() => {
    const valid = new Set(nodeIds)
    Object.keys(pointsRef.current).forEach((id) => {
      if (!valid.has(id)) {
        delete pointsRef.current[id]
      }
    })
  }, [nodeIds])

  // Click & selection interaction
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    let closestNode = null
    let minDistance = Number.POSITIVE_INFINITY

    graph.nodes.forEach((node) => {
      const pt = pointsRef.current[node.id]
      if (!pt) return

      const dx = pt.x - x
      const dy = pt.y - y
      const d = Math.sqrt(dx * dx + dy * dy)

      if (d < minDistance && d <= 24) {
        minDistance = d
        closestNode = node
      }
    })

    if (closestNode) {
      onSelectSession(closestNode.session_id)
      if (onSelectCluster) {
        onSelectCluster(closestNode.cluster_id)
      }
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const isNearNode = graph.nodes.some((node) => {
      const pt = pointsRef.current[node.id]
      if (!pt) return false
      const dx = pt.x - x
      const dy = pt.y - y
      return Math.sqrt(dx * dx + dy * dy) <= 20
    })

    canvas.style.cursor = isNearNode ? 'pointer' : 'default'
  }

  return (
    <canvas
      ref={canvasRef}
      className="graph-canvas-element"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}
      aria-label="ShadowGraph behavioral relationship canvas"
    />
  )
}

/**
 * Opt-in 3D WebGL Graph Renderer.
 * Wrapped by WebGLErrorBoundary and capability checks.
 */
function ThreeGraphRenderer({
  graph,
  selectedSessionId,
  onSelectSession,
  onSelectCluster,
  quarantined,
}: {
  graph: GraphResponse
  selectedSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onSelectCluster?: (clusterId: number) => void
  quarantined: boolean
}) {
  const forceGraphData = useMemo(() => {
    return {
      nodes: graph.nodes.map((node) => ({
        id: node.id,
        session_id: node.session_id,
        cluster_id: node.cluster_id,
        risk_label: node.risk_label,
        name: node.session_id.toUpperCase(),
        val: node.risk_label === 'suspicious_syndicate' ? 7 : 4,
      })),
      links: graph.links.map((link) => ({
        source: typeof link.source === 'string' ? link.source : (link.source as any).id,
        target: typeof link.target === 'string' ? link.target : (link.target as any).id,
        weight: link.weight,
        isQuarantined:
          quarantined &&
          (link.source.toString().includes('1') || link.target.toString().includes('1')),
      })),
    }
  }, [graph, quarantined])

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
      <ForceGraph3D
        graphData={forceGraphData}
        backgroundColor="#030712"
        nodeColor={(node: any) =>
          node.risk_label === 'suspicious_syndicate'
            ? quarantined
              ? '#475569'
              : '#ef4444'
            : '#10b981'
        }
        nodeVal={(node: any) => (node.risk_label === 'suspicious_syndicate' ? 6.5 : 4)}
        linkColor={(link: any) =>
          link.isQuarantined ? 'rgba(100, 116, 139, 0.35)' : 'rgba(255, 0, 85, 0.85)'
        }
        linkWidth={(link: any) => (link.weight > 0.8 ? 2.2 : 1)}
        linkDirectionalParticles={(link: any) => (link.isQuarantined ? 0 : 3)}
        linkDirectionalParticleSpeed={0.012}
        onNodeClick={(node: any) => {
          if (node?.session_id) {
            onSelectSession(node.session_id)
          }
          if (node?.cluster_id && onSelectCluster) {
            onSelectCluster(node.cluster_id)
          }
        }}
      />
    </div>
  )
}