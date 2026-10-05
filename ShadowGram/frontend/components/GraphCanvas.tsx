'use client'

import dynamic from 'next/dynamic'
import {
  Component,
  ErrorInfo,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as THREE from 'three'
import { GraphResponse, GraphNode } from '../types/contracts'

const ForceGraph3D = dynamic(
  () => import('react-force-graph-3d'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
        Loading 3D graph…
      </div>
    ),
  }
)

const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
        Loading 2D graph…
      </div>
    ),
  }
)

interface GraphCanvasProps {
  graph: GraphResponse
  onClusterSelect: (clusterId: number | null) => void
}

interface GraphVisualizationProps {
  graph: GraphResponse
  mode: '3d' | '2d'
  onClusterSelect: (clusterId: number | null) => void
  width: number
  height: number
}

interface GraphErrorBoundaryProps {
  children: ReactNode
}

interface GraphErrorBoundaryState {
  hasError: boolean
  message: string | null
}

function getNodeColor(node: GraphNode): string {
  switch (node.risk_label) {
    case 'suspicious_syndicate':
      return '#ff4d8d'

    case 'anomaly_outlier':
      return '#ffb347'

    case 'normal_organic':
    default:
      return '#6ea8ff'
  }
}

function createNodeObject(node: GraphNode): THREE.Object3D {
  const radius =
    node.risk_label === 'suspicious_syndicate'
      ? 5
      : node.risk_label === 'anomaly_outlier'
        ? 4
        : 3.5

  const geometry = new THREE.SphereGeometry(radius, 16, 16)

  const material = new THREE.MeshStandardMaterial({
    color: getNodeColor(node),
    emissive: getNodeColor(node),
    emissiveIntensity:
      node.risk_label === 'suspicious_syndicate' ? 0.8 : 0.35,
    roughness: 0.35,
    metalness: 0.2,
  })

  return new THREE.Mesh(geometry, material)
}

class GraphErrorBoundary extends Component<
  GraphErrorBoundaryProps,
  GraphErrorBoundaryState
> {
  state: GraphErrorBoundaryState = {
    hasError: false,
    message: null,
  }

  static getDerivedStateFromError(
    error: Error
  ): GraphErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'ShadowGram graph visualization error:',
      error,
      errorInfo
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-6">
          <div className="max-w-md rounded-2xl border border-red-400/20 bg-red-500/5 p-5 text-center">
            <div className="text-sm font-medium text-red-200">
              Graph visualization unavailable
            </div>

            <p className="mt-2 text-xs leading-5 text-white/50">
              The graph data is available, but the WebGL visualization
              encountered an error.
            </p>

            {this.state.message && (
              <p className="mt-3 break-words text-[11px] text-white/30">
                {this.state.message}
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function EmptyGraphState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-black/20 px-6 py-5 text-center">
        <div className="text-sm text-white/70">
          No graph telemetry available
        </div>

        <p className="mt-2 text-xs leading-5 text-white/40">
          Waiting for behavioral sessions and graph relationships.
        </p>
      </div>
    </div>
  )
}

function GraphVisualization({
  graph,
  mode,
  onClusterSelect,
  width,
  height,
}: GraphVisualizationProps) {
  const graphData = useMemo(
    () => ({
      nodes: graph.nodes,
      links: graph.links,
    }),
    [graph.nodes, graph.links]
  )

  if (mode === '2d') {
    return (
      <ForceGraph2D
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor="#08021a"
        nodeLabel={(node: GraphNode) =>
          `Cluster ${node.cluster_id} · ${node.risk_label}`
        }
        nodeColor={(node: GraphNode) => getNodeColor(node)}
        nodeRelSize={6}
        linkColor={() => 'rgba(150, 130, 255, 0.45)'}
        linkWidth={(link: { weight: number }) =>
          Math.max(0.5, link.weight * 2.5)
        }
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.004}
        cooldownTicks={100}
        d3VelocityDecay={0.3}
        enableNodeDrag
        onNodeClick={(node: GraphNode) => {
          onClusterSelect(node.cluster_id)
        }}
        onBackgroundClick={() => {
          onClusterSelect(null)
        }}
      />
    )
  }

  return (
    <ForceGraph3D
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor="#08021a"
      nodeLabel={(node: GraphNode) =>
        `Cluster ${node.cluster_id} · ${node.risk_label}`
      }
      nodeColor={(node: GraphNode) => getNodeColor(node)}
      nodeThreeObject={(node: GraphNode) =>
        createNodeObject(node)
      }
      nodeThreeObjectExtend={false}
      linkColor={() => 'rgba(150, 130, 255, 0.55)'}
      linkWidth={(link: { weight: number }) =>
        Math.max(0.4, link.weight * 2)
      }
      linkOpacity={0.75}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={1.5}
      linkDirectionalParticleSpeed={0.004}
      showNavInfo
      enableNodeDrag
      cooldownTicks={120}
      d3VelocityDecay={0.28}
      onNodeClick={(node: GraphNode) => {
        onClusterSelect(node.cluster_id)
      }}
      onBackgroundClick={() => {
        onClusterSelect(null)
      }}
    />
  )
}

export default function GraphCanvas({
  graph,
  onClusterSelect,
}: GraphCanvasProps) {
  const [mode, setMode] = useState<'3d' | '2d'>('3d')

  const [size, setSize] = useState({
    width: 800,
    height: 590,
  })

  useEffect(() => {
    const updateSize = () => {
      const element = document.getElementById(
        'shadowgram-graph-container'
      )

      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()

      const width = Math.max(320, Math.floor(rect.width))
      const height = Math.max(420, Math.floor(rect.height))

      setSize({
        width,
        height,
      })
    }

    updateSize()

    const element = document.getElementById(
      'shadowgram-graph-container'
    )

    if (!element) {
      return
    }

    const observer = new ResizeObserver(() => {
      updateSize()
    })

    observer.observe(element)

    window.addEventListener('resize', updateSize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-4 top-4 z-20 flex overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur">
        <button
          type="button"
          onClick={() => setMode('3d')}
          className={`px-3 py-2 text-xs transition ${
            mode === '3d'
              ? 'bg-purple-500/20 text-purple-200'
              : 'text-white/50 hover:bg-white/5 hover:text-white'
          }`}
        >
          3D
        </button>

        <button
          type="button"
          onClick={() => setMode('2d')}
          className={`px-3 py-2 text-xs transition ${
            mode === '2d'
              ? 'bg-purple-500/20 text-purple-200'
              : 'text-white/50 hover:bg-white/5 hover:text-white'
          }`}
        >
          2D
        </button>
      </div>

      <div
        id="shadowgram-graph-container"
        className="h-full w-full overflow-hidden"
      >
        {graph.nodes.length === 0 ? (
          <EmptyGraphState />
        ) : (
          <GraphErrorBoundary>
            <GraphVisualization
              graph={graph}
              mode={mode}
              onClusterSelect={onClusterSelect}
              width={size.width}
              height={size.height}
            />
          </GraphErrorBoundary>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[10px] text-white/35 backdrop-blur">
        Left-click: rotate · Mouse-wheel/middle-click: zoom · Right-click: pan
      </div>
    </div>
  )
}