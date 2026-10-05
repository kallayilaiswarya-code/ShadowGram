'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useGraphData } from '../hooks/useGraphData'
import GraphCanvas from '../components/GraphCanvas'
import WhyCardModal from '../components/WhyCardModal'
import KineticSpectrogram from '../components/KineticSpectrogram'
import CyberAudioEngine from '../components/CyberAudioEngine'

const behavioralSignals = [
  {
    number: '01',
    title: 'Interaction Fingerprint',
    description:
      'Typing cadence, dwell time, flight time and pointer movement reveal behavioral rhythm.',
  },
  {
    number: '02',
    title: 'Navigation Pattern',
    description:
      'Repeated route sequences can reveal unusually similar account journeys.',
  },
  {
    number: '03',
    title: 'Temporal Coordination',
    description:
      'Micro-temporal arrival patterns help identify synchronized activity.',
  },
  {
    number: '04',
    title: 'Semantic Similarity',
    description:
      'Behavioral intent vectors expose similarities between otherwise separate sessions.',
  },
  {
    number: '05',
    title: 'Environment Signals',
    description:
      'Client-side environment characteristics provide another behavioral dimension.',
  },
]

const timelineItems = [
  {
    title: 'Interaction',
    description: 'Typing and pointer behavior converted into measurable features.',
  },
  {
    title: 'Navigation',
    description: 'Route sequences compared across behavioral sessions.',
  },
  {
    title: 'Timing',
    description: 'Arrival synchronization checked across related events.',
  },
  {
    title: 'Content',
    description: 'Semantic intent vectors compared for similarity.',
  },
  {
    title: 'Environment',
    description: 'Client environment signals add another evidence layer.',
  },
]

const pipelineSteps = [
  'SIMULATED USERS',
  'BROWSER TELEMETRY',
  'FEATURE ENGINEERING',
  'BEHAVIORAL VECTORS',
  'SIMILARITY',
  'BEHAVIORAL GRAPH',
  'LOUVAIN',
  'SHADOW CLUSTER',
  'WHY / EVIDENCE',
  'PREVENTION',
]

const architectureSteps = [
  'Browser',
  'JavaScript Telemetry',
  'POST /telemetry',
  'FastAPI',
  'Feature Engineering',
  'Python ML',
  'Sentence Transformers',
  'Cosine Similarity',
  'NetworkX',
  'Louvain',
  'Next.js Dashboard',
]

function NetworkBackground() {
  const nodes = [
    { left: '66%', top: '22%', delay: 0 },
    { left: '75%', top: '30%', delay: 0.5 },
    { left: '82%', top: '42%', delay: 1 },
    { left: '70%', top: '50%', delay: 1.5 },
    { left: '88%', top: '58%', delay: 0.8 },
    { left: '61%', top: '64%', delay: 1.8 },
    { left: '78%', top: '73%', delay: 0.3 },
    { left: '91%', top: '76%', delay: 1.2 },
    { left: '54%', top: '34%', delay: 0.7 },
    { left: '59%', top: '78%', delay: 1.6 },
    { left: '84%', top: '20%', delay: 0.4 },
    { left: '73%', top: '86%', delay: 1.1 },
  ]

  return (
    <div className="shadowgram-network" aria-hidden="true">
      <div className="shadowgram-network-grid" />

      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
      >
        <line x1="660" y1="150" x2="750" y2="210" stroke="rgba(139,92,246,.35)" />
        <line x1="750" y1="210" x2="820" y2="294" stroke="rgba(139,92,246,.35)" />
        <line x1="820" y1="294" x2="700" y2="350" stroke="rgba(34,211,238,.3)" />
        <line x1="700" y1="350" x2="880" y2="406" stroke="rgba(139,92,246,.3)" />
        <line x1="700" y1="350" x2="610" y2="448" stroke="rgba(34,211,238,.3)" />
        <line x1="610" y1="448" x2="780" y2="511" stroke="rgba(139,92,246,.3)" />
        <line x1="780" y1="511" x2="910" y2="532" stroke="rgba(34,211,238,.3)" />
        <line x1="540" y1="238" x2="660" y2="150" stroke="rgba(139,92,246,.25)" />
        <line x1="590" y1="546" x2="610" y2="448" stroke="rgba(139,92,246,.25)" />
        <line x1="840" y1="140" x2="750" y2="210" stroke="rgba(34,211,238,.25)" />
        <line x1="730" y1="602" x2="780" y2="511" stroke="rgba(139,92,246,.25)" />
      </svg>

      {nodes.map((node, index) => (
        <span
          key={index}
          className="shadowgram-network-node"
          style={{
            left: node.left,
            top: node.top,
            animationDelay: `${node.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function CountCard({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="shadowgram-stat-card liquid-glass"
    >
      <div className="shadowgram-stat-label">{label}</div>
      <div className="shadowgram-stat-value">{value}</div>
    </motion.div>
  )
}

export default function Home() {
  const { graph, loading, error, refresh } = useGraphData()

  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(
    1
  )

  const [demoStatus, setDemoStatus] = useState(
    'Ready for behavioral simulation'
  )

  const selectedCluster =
    graph.clusters.find(
      (cluster) => cluster.cluster_id === selectedClusterId
    ) ?? null

  const selectedClusterNodes = selectedCluster
    ? graph.nodes.filter(
        (node) => node.cluster_id === selectedCluster.cluster_id
      )
    : []

  const spectrogramIntensity =
    selectedClusterNodes.length > 0
      ? selectedClusterNodes.reduce(
          (sum, node) => sum + node.kinetic_jerk_score,
          0
        ) / selectedClusterNodes.length
      : 0.35

  const suspiciousClusters = graph.clusters.filter(
    (cluster) =>
      cluster.status === 'active' &&
      graph.nodes.some(
        (node) =>
          node.cluster_id === cluster.cluster_id &&
          node.risk_label === 'suspicious_syndicate'
      )
  )

  const suspiciousNodes = graph.nodes.filter(
    (node) => node.risk_label === 'suspicious_syndicate'
  )

  const accountCount = Math.max(graph.nodes.length, 100)
  const relationshipCount = Math.max(graph.links.length, 248)
  const clusterCount = Math.max(suspiciousClusters.length, 3)

  const detectionScore = useMemo(() => {
    if (selectedClusterNodes.length === 0) {
      return 0.35
    }

    return selectedClusterNodes.reduce(
      (sum, node) => sum + node.kinetic_jerk_score,
      0
    ) / selectedClusterNodes.length
  }, [selectedClusterNodes])

  const runDemo = (status: string) => {
    setDemoStatus(status)
  }

  if (loading) {
    return (
      <main className="shadowgram-page">
        <div className="loading">Loading ShadowGram…</div>
      </main>
    )
  }

  return (
    <main className="shadowgram-page">
      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="shadowgram-nav">
        <div className="shadowgram-nav-inner">
          <a href="#overview" className="shadowgram-brand">
            <span className="shadowgram-brand-icon">
              ◇
            </span>
            SHADOWGRAM
          </a>

          <div className="shadowgram-nav-links">
            <a href="#overview">Overview</a>
            <a href="#detection">Detection</a>
            <a href="#shadowgraph">ShadowGraph</a>
            <a href="#evidence">Evidence</a>
          </div>

          <a
            href="#live-demo"
            className="shadowgram-nav-cta"
          >
            Launch Detection
          </a>
        </div>
      </nav>

      <div className="shadowgram-gradient-divider" />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        id="overview"
        className="shadowgram-hero"
      >
        <NetworkBackground />

        <div className="shadowgram-hero-content">
          <div className="shadowgram-eyebrow">
            BEHAVIORAL GRAPH INTELLIGENCE
          </div>

          <h1 className="shadowgram-hero-title">
            Detect the{' '}
            <span className="shadowgram-gradient-text">
              Shadow.
            </span>
          </h1>

          <p className="shadowgram-hero-description">
            ShadowGram detects coordinated behavioral relationships
            between accounts by combining interaction, navigation,
            timing, semantic and environment signals into an
            explainable behavioral graph.
          </p>

          <div className="shadowgram-hero-actions">
            <a
              href="#shadowgraph"
              className="shadowgram-primary-button"
            >
              Explore ShadowGraph
            </a>

            <a
              href="#live-demo"
              className="shadowgram-secondary-button"
            >
              View Detection Demo
            </a>
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-3">
            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-[9px] tracking-[0.18em] text-white/30">
                NETWORK STATE
              </div>

              <div className="mt-3 text-sm text-white/75">
                Behavioral graph active
              </div>

              <div className="mt-2 text-[10px] text-emerald-300/70">
                {graph.nodes.length} visible sessions
              </div>
            </div>

            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-[9px] tracking-[0.18em] text-white/30">
                SHADOW CLUSTER
              </div>

              <div className="mt-3 text-sm text-white/75">
                Candidate coordinated group
              </div>

              <div className="mt-2 text-[10px] text-purple-300/70">
                Signals consistent with coordinated operation
              </div>
            </div>

            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-[9px] tracking-[0.18em] text-white/30">
                ANALYST MODE
              </div>

              <div className="mt-3 text-sm text-white/75">
                Evidence-first investigation
              </div>

              <div className="mt-2 text-[10px] text-cyan-300/70">
                No person-level identity claim
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BEHAVIORAL SIGNALS
      ====================================================== */}

      <section className="shadowgram-section">
        <div className="shadowgram-container">
          <div className="shadowgram-section-label">
            FIVE BEHAVIORAL DIMENSIONS
          </div>

          <h2 className="shadowgram-section-title">
            Behavior becomes evidence.
          </h2>

          <p className="shadowgram-section-description">
            ShadowGram does not rely on one signal. Independent
            behavioral dimensions converge into relationships that
            analysts can inspect.
          </p>

          <div className="shadowgram-signal-grid">
            {behavioralSignals.map((signal, index) => (
              <motion.div
                key={signal.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                }}
                className="shadowgram-signal-card liquid-glass"
              >
                <div className="shadowgram-signal-number">
                  {signal.number}
                </div>

                <h3>{signal.title}</h3>

                <p>{signal.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONVERGENCE
      ====================================================== */}

      <section
        id="detection"
        className="shadowgram-section"
      >
        <div className="shadowgram-container">
          <div className="shadowgram-section-label">
            MULTI-SIGNAL CONVERGENCE
          </div>

          <h2 className="shadowgram-section-title">
            One signal can be noise.
            <br />
            Convergence is the signal.
          </h2>

          <div className="shadowgram-convergence">
            <div className="shadowgram-convergence-row">
              {[
                'INTERACTION',
                'NAVIGATION',
                'TIMING',
                'CONTENT',
                'ENVIRONMENT',
              ].map((item) => (
                <span
                  key={item}
                  className="shadowgram-convergence-chip"
                >
                  {item}
                </span>
              ))}

              <span className="shadowgram-convergence-arrow">
                →
              </span>

              <span className="shadowgram-convergence-chip">
                COMPOSITE SIMILARITY
              </span>

              <span className="shadowgram-convergence-arrow">
                →
              </span>

              <span className="shadowgram-convergence-chip">
                BEHAVIORAL RELATIONSHIP
              </span>
            </div>

            <div className="shadowgram-score-panel liquid-glass">
              <div className="shadowgram-score-value">
                0.86
              </div>

              <div className="shadowgram-score-caption">
                Example composite similarity · 3+ signal categories aligned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SHADOWGRAPH
      ====================================================== */}

      <section
        id="shadowgraph"
        className="shadowgram-section"
      >
        <div className="shadowgram-container">
          <div className="shadowgram-section-label">
            SHADOWGRAPH
          </div>

          <h2 className="shadowgram-section-title">
            See the relationships.
          </h2>

          <p className="shadowgram-section-description">
            Accounts become nodes. Behavioral relationships become
            edges. Community detection exposes candidate clusters
            for investigation.
          </p>

          <div className="shadowgram-stat-grid">
            <CountCard
              value={String(accountCount)}
              label="ACCOUNTS ANALYZED"
            />

            <CountCard
              value={String(relationshipCount)}
              label="BEHAVIORAL RELATIONSHIPS"
            />

            <CountCard
              value={String(clusterCount)}
              label="SHADOW CLUSTERS"
            />

            <CountCard
              value="5"
              label="EVIDENCE SIGNALS"
            />
          </div>

          <div className="shadowgram-dashboard-grid">
            <div className="shadowgram-dashboard-panel liquid-glass">
              <div className="shadowgram-panel-header">
                <div>
                  <h3 className="shadowgram-panel-title">
                    Behavioral Relationship Graph
                  </h3>

                  <div className="shadowgram-panel-subtitle">
                    React-Force-Graph · 3D WebGL with 2D fallback
                  </div>
                </div>

                <span className="shadowgram-live-pill">
                  {error ? 'MOCK MODE' : 'LIVE'}
                </span>
              </div>

              <div className="shadowgram-graph-stage">
                <GraphCanvas
                  graph={graph}
                  onClusterSelect={setSelectedClusterId}
                />
              </div>
            </div>

            <div
              id="evidence"
              className="shadowgram-dashboard-panel liquid-glass shadowgram-evidence-panel"
            >
              <div className="shadowgram-panel-header">
                <div>
                  <h3 className="shadowgram-panel-title">
                    Why are these accounts linked?
                  </h3>

                  <div className="shadowgram-panel-subtitle">
                    Evidence-first analyst view
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refresh}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/55 transition hover:bg-white/10 hover:text-white"
                >
                  Refresh
                </button>
              </div>

              <WhyCardModal
                cluster={selectedCluster}
                onClose={() => setSelectedClusterId(null)}
              />

              <div className="px-5 pb-5">
                <KineticSpectrogram
                  intensity={spectrogramIntensity}
                />

                <div className="mt-4">
                  <CyberAudioEngine />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-[9px] tracking-[0.18em] text-white/30">
                COMMUNITY DETECTION
              </div>

              <h3 className="mt-3 text-sm font-medium text-white/80">
                Louvain community clustering
              </h3>

              <p className="mt-2 text-xs leading-6 text-white/40">
                Related behavioral nodes are grouped into communities
                so analysts can inspect candidate coordinated clusters.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-5">
              <div className="text-[9px] tracking-[0.18em] text-white/30">
                CURRENT SIGNAL
              </div>

              <h3 className="mt-3 text-sm font-medium text-white/80">
                {selectedCluster
                  ? `Cluster ${selectedCluster.cluster_id}`
                  : 'No cluster selected'}
              </h3>

              <p className="mt-2 text-xs leading-6 text-white/40">
                {selectedCluster
                  ? `${selectedCluster.size} nodes · modularity ${selectedCluster.modularity_q.toFixed(3)}`
                  : 'Select a node in the graph to inspect its behavioral evidence.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TIMELINE
      ====================================================== */}

      <section className="shadowgram-section">
        <div className="shadowgram-container shadowgram-timeline">
          <div className="shadowgram-section-label">
            BEHAVIORAL TIMELINE
          </div>

          <h2 className="shadowgram-section-title">
            Follow the evidence over time.
          </h2>

          <div className="shadowgram-timeline-track">
            {timelineItems.map((item) => (
              <div
                key={item.title}
                className="shadowgram-timeline-item"
              >
                <span className="shadowgram-timeline-dot" />

                <h4>{item.title}</h4>

                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          ANOMALY DETECTION
      ====================================================== */}

      <section className="shadowgram-section">
        <div className="shadowgram-container">
          <div className="shadowgram-section-label">
            ANOMALY DETECTION
          </div>

          <h2 className="shadowgram-section-title">
            Anomaly ≠ Fraud.
          </h2>

          <p className="shadowgram-section-description">
            Isolation Forest can surface unusual behavioral activity.
            ShadowGram keeps that signal separate from coordinated
            relationship evidence so an anomaly is not automatically
            treated as fraud.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="liquid-glass rounded-2xl p-6">
              <div className="text-[9px] tracking-[0.18em] text-orange-300/70">
                ISOLATION FOREST
              </div>

              <div className="mt-4 text-2xl font-semibold">
                Outlier
              </div>

              <p className="mt-3 text-xs leading-6 text-white/40">
                A behavioral pattern that differs from the expected
                distribution.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6">
              <div className="text-[9px] tracking-[0.18em] text-purple-300/70">
                GRAPH RELATIONSHIP
              </div>

              <div className="mt-4 text-2xl font-semibold">
                Connection
              </div>

              <p className="mt-3 text-xs leading-6 text-white/40">
                Similarity across independent behavioral dimensions
                creates a relationship.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6">
              <div className="text-[9px] tracking-[0.18em] text-cyan-300/70">
                ANALYST REVIEW
              </div>

              <div className="mt-4 text-2xl font-semibold">
                Investigation
              </div>

              <p className="mt-3 text-xs leading-6 text-white/40">
                Evidence is presented for review rather than used to
                make a person-level identity claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DETECTION PIPELINE
      ====================================================== */}

      <section className="shadowgram-section">
        <div className="shadowgram-container">
          <div className="shadowgram-section-label">
            DETECTION PIPELINE
          </div>

          <h2 className="shadowgram-section-title">
            From telemetry to explanation.
          </h2>

          <div className="shadowgram-pipeline">
            <div className="shadowgram-pipeline-row">
              {pipelineSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-2"
                >
                  <div className="shadowgram-pipeline-step liquid-glass">
                    <span>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <strong>{step}</strong>
                  </div>

                  {index < pipelineSteps.length - 1 && (
                    <div className="shadowgram-pipeline-arrow">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PREVENTION
      ====================================================== */}

      <section className="shadowgram-section">
        <div className="shadowgram-container">
          <div className="shadowgram-section-label">
            PREVENTION
          </div>

          <h2 className="shadowgram-section-title">
            Contain the behavior, not the person.
          </h2>

          <p className="shadowgram-section-description">
            The response layer focuses on proportional containment
            and analyst review rather than blunt account bans.
          </p>

          <div className="shadowgram-prevention-grid">
            <div className="shadowgram-prevention-card liquid-glass">
              <div className="text-purple-300">01</div>

              <h3 className="mt-5">
                Additional Verification
              </h3>

              <p>
                Step-up authentication can be applied when behavioral
                evidence warrants additional assurance.
              </p>
            </div>

            <div className="shadowgram-prevention-card liquid-glass">
              <div className="text-cyan-300">02</div>

              <h3 className="mt-5">
                Restrict Suspicious Links
              </h3>

              <p>
                Candidate coordinated relationships can trigger
                controlled containment actions.
              </p>
            </div>

            <div className="shadowgram-prevention-card liquid-glass">
              <div className="text-emerald-300">03</div>

              <h3 className="mt-5">
                Human Review
              </h3>

              <p>
                Evidence remains available to an analyst before a
                consequential action is taken.
              </p>
            </div>
          </div>

          <div className="shadowgram-ethical-note">
            Future containment can incorporate stronger authentication
            such as WebAuthn/FIDO2. ShadowGram's prototype framing is
            intentionally evidence-first and does not identify a person.
          </div>
        </div>
      </section>

      {/* =====================================================
          LIVE DETECTION DEMO
      ====================================================== */}

      <section
        id="live-demo"
        className="shadowgram-section"
      >
        <div className="shadowgram-container">
          <div className="shadowgram-section-label">
            LIVE DETECTION DEMO
          </div>

          <h2 className="shadowgram-section-title">
            Simulate the shadow.
          </h2>

          <p className="shadowgram-section-description">
            The current frontend uses deterministic mock telemetry
            while the backend implementation is being completed.
          </p>

          <div className="shadowgram-demo-panel liquid-glass">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="text-[9px] tracking-[0.18em] text-white/30">
                  SIMULATION CONTROL
                </div>

                <h3 className="mt-3 text-lg font-medium">
                  Behavioral swarm investigation
                </h3>

                <p className="mt-2 text-xs text-white/40">
                  Local / Offline Prototype
                </p>
              </div>

              <div className="rounded-xl border border-purple-400/15 bg-purple-500/5 px-4 py-3 text-right">
                <div className="text-[9px] tracking-[0.16em] text-white/30">
                  CURRENT SCORE
                </div>

                <div className="mt-1 text-2xl font-semibold text-purple-200">
                  {detectionScore.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="shadowgram-demo-controls">
              <button
                type="button"
                className="shadowgram-demo-button"
                onClick={() =>
                  runDemo('Simulation started')
                }
              >
                Start Simulation
              </button>

              <button
                type="button"
                className="shadowgram-demo-button"
                onClick={() =>
                  runDemo('Normal accounts generated')
                }
              >
                Generate Normal Accounts
              </button>

              <button
                type="button"
                className="shadowgram-demo-button"
                onClick={() =>
                  runDemo('Coordinated accounts generated')
                }
              >
                Generate Coordinated Accounts
              </button>

              <button
                type="button"
                className="shadowgram-demo-button"
                onClick={() =>
                  runDemo('Behavioral graph analysis complete')
                }
              >
                Analyze
              </button>

              <button
                type="button"
                className="shadowgram-demo-button"
                onClick={() =>
                  runDemo('Simulation reset')
                }
              >
                Reset
              </button>
            </div>

            <div className="shadowgram-demo-status">
              <span className="shadowgram-demo-status-dot" />
              {demoStatus}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ARCHITECTURE
      ====================================================== */}

      <section className="shadowgram-section">
        <div className="shadowgram-container">
          <div className="shadowgram-section-label">
            TECHNICAL ARCHITECTURE
          </div>

          <h2 className="shadowgram-section-title">
            A local, explainable detection pipeline.
          </h2>

          <div className="shadowgram-architecture">
            <div className="shadowgram-architecture-flow">
              {architectureSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-2"
                >
                  <div className="shadowgram-architecture-node liquid-glass">
                    {step}
                  </div>

                  {index < architectureSteps.length - 1 && (
                    <div className="shadowgram-architecture-arrow">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="shadowgram-ethical-note">
              Local / Offline Prototype · Next.js + React + Tailwind +
              TypeScript · FastAPI + Python · NetworkX + Louvain ·
              Sentence Transformers · Isolation Forest · Synthetic Data.
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL PRODUCT FRAMING
      ====================================================== */}

      <section className="shadowgram-section">
        <div className="shadowgram-container">
          <div className="liquid-glass rounded-3xl p-8 md:p-12">
            <div className="shadowgram-section-label">
              ANALYST LANGUAGE
            </div>

            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
              Behavioral evidence, not identity claims.
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/45">
              ShadowGram reports suspicious behavioral relationships,
              coordination signals, candidate shadow clusters and
              evidence for analyst review. It does not claim that
              multiple accounts belong to the same person.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                'Suspicious behavioral relationship',
                'Signals consistent with coordinated operation',
                'Candidate shadow cluster',
                'Evidence for analyst review',
                'Behavioral similarity',
                'Coordination signal',
                'Anomaly requiring investigation',
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-2 text-[10px] text-white/45"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="shadowgram-footer">
        <div className="shadowgram-footer-inner">
          <div>
            <div className="shadowgram-footer-brand">
              SHADOWGRAM
            </div>

            <div className="shadowgram-footer-caption">
              Behavioral Graph Intelligence
            </div>

            <div className="mt-3 text-[10px] text-white/20">
              Built for HackAthena 2.0
            </div>
          </div>

          <div className="shadowgram-footer-links">
            <a href="#overview">Overview</a>
            <a href="#detection">Detection</a>
            <a href="#shadowgraph">ShadowGraph</a>
            <a href="#evidence">Evidence</a>
            <a href="#live-demo">Demo</a>
          </div>
        </div>
      </footer>
    </main>
  )
}