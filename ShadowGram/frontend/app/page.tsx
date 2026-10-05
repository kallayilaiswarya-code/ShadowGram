"use client";

import { useMemo, useState } from "react";
import type { GraphCluster, GraphNode } from "../types/contracts";
import { MOCK_GRAPH } from "../data/mockGraph";
import GraphCanvas from "../components/GraphCanvas";
import KineticSpectrogram from "../components/KineticSpectrogram";
import WhyCardModal from "../components/WhyCardModal";

// Deterministic presentation attributes (not in frozen GraphNode schema)
const ACTIVITY_MAP: Record<string, string> = {
  "node-001": "coordinated navigation",
  "node-002": "synchronized timing",
  "node-003": "matching interaction",
  "node-004": "normal browsing",
  "node-005": "organic dwell",
  "node-006": "kinetic outlier",
};

const TIME_MAP: Record<string, string> = {
  "node-001": "14:52:18",
  "node-002": "14:52:16",
  "node-003": "14:52:14",
  "node-004": "14:51:59",
  "node-005": "14:51:42",
  "node-006": "14:50:11",
};

type Signal = {
  label: string;
  value: number;
  code: string;
};

export default function Home() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("session-001");
  const [quarantined, setQuarantined] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"3D" | "2D">("2D");
  const [is3DFallback, setIs3DFallback] = useState<boolean>(false);
  const [isWhyCardOpen, setIsWhyCardOpen] = useState<boolean>(false);

  // Canonical selected node from MOCK_GRAPH
  const selectedNode = useMemo<GraphNode>(
    () =>
      MOCK_GRAPH.nodes.find((node) => node.session_id === selectedSessionId) ??
      MOCK_GRAPH.nodes[0],
    [selectedSessionId]
  );

  // Canonical selected cluster from MOCK_GRAPH
  const selectedCluster = useMemo<GraphCluster>(
    () =>
      MOCK_GRAPH.clusters.find(
        (cluster) => cluster.cluster_id === selectedNode.cluster_id
      ) ?? MOCK_GRAPH.clusters[0],
    [selectedNode]
  );

  // Dynamic signals reacting to selected session risk profile
  const signals = useMemo<Signal[]>(() => {
    const isSuspect = selectedNode.risk_label === "suspicious_syndicate";
    const isAnomaly = selectedNode.risk_label === "anomaly_outlier";
    const kinScore = Math.round(selectedNode.kinetic_jerk_score * 100);

    return [
      { label: "INTERACTION", value: kinScore, code: "KIN" },
      { label: "NAVIGATION", value: isSuspect ? 88 : isAnomaly ? 42 : 24, code: "NAV" },
      { label: "TIMING", value: isSuspect ? 94 : isAnomaly ? 55 : 31, code: "TIME" },
      { label: "CONTENT", value: isSuspect ? 86 : isAnomaly ? 38 : 15, code: "SEM" },
      { label: "ENVIRONMENT", value: isSuspect ? 79 : isAnomaly ? 22 : 19, code: "ENV" },
    ];
  }, [selectedNode]);

  // Dynamic evidence based on canonical cluster reasons
  const evidenceItems = useMemo(() => {
    if (selectedCluster.cluster_id === 1) {
      return [
        {
          number: "01",
          title: "TIMING SYNCHRONIZATION",
          description: "Repeated actions occur within narrow temporal windows (Δt < 0.45s).",
        },
        {
          number: "02",
          title: "NAVIGATION SIMILARITY",
          description: "Sessions follow matching route sequences (/auth -> /kyc -> /loan_submit).",
        },
        {
          number: "03",
          title: "INTERACTION PATTERN",
          description: "Pointer and typing behaviour converges across sessions (jerk score: 0.92-0.95).",
        },
        {
          number: "04",
          title: "CONTENT SIMILARITY",
          description: "Submitted content exhibits strong semantic overlap (cosine similarity: 0.89).",
        },
        {
          number: "05",
          title: "ENVIRONMENT SIGNAL",
          description: "Browser and interaction environment characteristics overlap.",
        },
      ];
    }

    if (selectedCluster.cluster_id === 2) {
      return [
        {
          number: "01",
          title: "ORGANIC TIMING VARIANCE",
          description: "Natural human variance in inter-keystroke flight times (Δt > 3.4s).",
        },
        {
          number: "02",
          title: "EXPLORATORY NAVIGATION",
          description: "Non-linear navigation path with pauses and backwards route adjustments.",
        },
        {
          number: "03",
          title: "BIOMECHANICAL CURVATURE",
          description: "Continuous velocity curves with natural neuromuscular jitter (jerk: 0.18-0.21).",
        },
        {
          number: "04",
          title: "DISTINCT INTENT VECTORS",
          description: "Low semantic cosine similarity across application submissions.",
        },
        {
          number: "05",
          title: "STANDARD USER AGENT",
          description: "Independent hardware canvas and typical desktop client fingerprint.",
        },
      ];
    }

    return [
      {
        number: "01",
        title: "BURST DISPERSION",
        description: "Sporadic burst pattern without cross-session alignment.",
      },
      {
        number: "02",
        title: "ISOLATED ROUTE FLOW",
        description: "Incomplete navigation funnel with drop-off prior to submission.",
      },
      {
        number: "03",
        title: "ELEVATED KINETIC JERK",
        description: "High acceleration spikes detected, potentially assistive device or macro (jerk: 0.67).",
      },
      {
        number: "04",
        title: "DIVERGENT SEMANTICS",
        description: "Intent vector does not correlate with primary syndicate clusters.",
      },
      {
        number: "05",
        title: "UNCORRELATED CLIENT",
        description: "Client environment attributes diverge from syndicate network.",
      },
    ];
  }, [selectedCluster]);

  return (
    <main className="shadowgram-shell">
      {/* TOP HUD */}
      <header className="top-hud">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">SG</div>

          <div>
            <div className="brand-name">SHADOWGRAM</div>
            <div className="brand-subtitle">
              BEHAVIORAL INTELLIGENCE COMMAND
            </div>
          </div>
        </div>

        <div className="mission-title">
          <span>SHADOWGRAM COMMAND CENTER</span>
          <strong>// FRONTEND SIMULATION</strong>
        </div>

        <div className="system-status">
          <span className="status-dot" aria-hidden="true" />
          <span>SYSTEM NOMINAL</span>
        </div>
      </header>

      {/* MAIN COCKPIT */}
      <section className="cockpit-grid">
        {/* LEFT TELEMETRY */}
        <aside className="panel telemetry-panel">
          <div className="panel-heading">
            <span>01</span>
            <div>
              <h2>LIVE TELEMETRY</h2>
              <p>/telemetry</p>
            </div>
            <span className="live-indicator">LIVE</span>
          </div>

          <div className="telemetry-summary">
            <div>
              <strong>100</strong>
              <span>SESSIONS</span>
            </div>

            <div>
              <strong>248</strong>
              <span>RELATIONSHIPS</span>
            </div>
          </div>

          <div className="session-list" role="listbox" aria-label="Incoming behavioral sessions">
            {MOCK_GRAPH.nodes.map((node) => {
              const displayId = node.session_id.toUpperCase();
              const isSelected = selectedSessionId === node.session_id;
              const isSuspect = node.risk_label === "suspicious_syndicate";
              const scorePercent = Math.round(node.kinetic_jerk_score * 100);
              const activity = ACTIVITY_MAP[node.id] || "telemetry stream";
              const time = TIME_MAP[node.id] || "14:50:00";

              return (
                <button
                  key={node.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`session-row ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedSessionId(node.session_id)}
                  aria-label={`Select session ${displayId}, risk: ${isSuspect ? "suspect" : "human"}, score: ${scorePercent}%`}
                >
                  <div className="session-topline">
                    <span
                      className={`session-type ${
                        isSuspect ? "suspect" : "human"
                      }`}
                    >
                      {isSuspect ? "SUSPECT" : "HUMAN"}
                    </span>

                    <span>{time}</span>
                  </div>

                  <strong>{displayId}</strong>

                  <div className="session-bottom">
                    <span>{activity}</span>
                    <b>{scorePercent}%</b>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="signal-section">
            <div className="section-label">SIGNAL CONVERGENCE</div>

            {signals.map((signal) => (
              <div className="signal-row" key={signal.code}>
                <div className="signal-label">
                  <span>{signal.code}</span>
                  <small>{signal.label}</small>
                </div>

                <div className="signal-track" role="progressbar" aria-valuenow={signal.value} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="signal-fill"
                    style={{ width: `${signal.value}%` }}
                  />
                </div>

                <strong>{signal.value}</strong>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER GRAPH */}
        <section className="graph-stage">
          <div className="graph-header">
            <div>
              <span className="eyebrow">02 // NETWORK ANALYSIS</span>
              <h1>SHADOWGRAPH</h1>
            </div>

            <div className="graph-controls" role="group" aria-label="Graph rendering mode">
              <button
                type="button"
                className={activeTab === "3D" ? "active" : ""}
                onClick={() => setActiveTab("3D")}
                aria-pressed={activeTab === "3D"}
                aria-label="Switch to 3D WebGL graph mode"
              >
                3D
              </button>

              <button
                type="button"
                className={activeTab === "2D" ? "active" : ""}
                onClick={() => setActiveTab("2D")}
                aria-pressed={activeTab === "2D"}
                aria-label="Switch to 2D Canvas graph mode"
              >
                2D
              </button>
            </div>
          </div>

          <div className="graph-canvas">
            <div className="graph-grid" aria-hidden="true" />

            <div className="graph-radar radar-one" aria-hidden="true" />
            <div className="graph-radar radar-two" aria-hidden="true" />

            <GraphCanvas
              graph={MOCK_GRAPH}
              selectedSessionId={selectedSessionId}
              selectedClusterId={selectedCluster.cluster_id}
              onSelectSession={(sessionId) => setSelectedSessionId(sessionId)}
              onSelectCluster={(clusterId) => {
                const matchingNode = MOCK_GRAPH.nodes.find(
                  (n) => n.cluster_id === clusterId
                );
                if (matchingNode) {
                  setSelectedSessionId(matchingNode.session_id);
                }
              }}
              quarantined={quarantined}
              mode={activeTab}
              onFallbackChange={setIs3DFallback}
            />

            <div className="graph-center-readout" aria-live="polite">
              <span>COMPOSITE</span>
              <strong>
                {selectedCluster.cluster_id === 1 ? "0.92" : selectedCluster.cluster_id === 2 ? "0.20" : "0.67"}
              </strong>
              <small>
                {selectedCluster.cluster_id === 1
                  ? "HIGH COORDINATION SIGNAL"
                  : selectedCluster.cluster_id === 2
                  ? "ORGANIC BEHAVIORAL PATTERN"
                  : "ANOMALY OUTLIER SIGNAL"}
              </small>
            </div>

            <div className="graph-engine">
              <span>GRAPH ENGINE</span>
              <strong>
                {activeTab === "3D"
                  ? is3DFallback
                    ? "CANVAS 2D // WEBGL FALLBACK"
                    : "WEBGL / 3D"
                  : "CANVAS 2D // HIGH-PERF"}
              </strong>
            </div>

            <div className="graph-legend">
              <span>
                <i className="legend-dot human-dot" aria-hidden="true" />
                ORGANIC
              </span>

              <span>
                <i className="legend-dot suspect-dot" aria-hidden="true" />
                SYNDICATE
              </span>

              <span>
                <i className="legend-line" aria-hidden="true" />
                BEHAVIORAL LINK
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT EVIDENCE */}
        <aside className="panel evidence-panel">
          <div className="panel-heading">
            <span>03</span>

            <div>
              <h2>CLUSTER EVIDENCE</h2>
              <p>WHY ARE THEY LINKED?</p>
            </div>
          </div>

          <div className="cluster-card">
            <div className="cluster-number">
              #{String(selectedCluster.cluster_id).padStart(2, "0")}
            </div>

            <div className="cluster-info">
              <span>ACTIVE CLUSTER</span>
              <strong>
                {quarantined && selectedCluster.cluster_id === 1
                  ? "ISOLATED"
                  : selectedCluster.cluster_id === 1
                  ? "UNDER REVIEW"
                  : "ORGANIC BASELINE"}
              </strong>
            </div>

            <div className="cluster-score">
              <span>
                {selectedCluster.cluster_id === 1
                  ? "0.92"
                  : selectedCluster.cluster_id === 2
                  ? "0.20"
                  : "0.67"}
              </span>
              <small>SIGNAL</small>
            </div>
          </div>

          {/* WHY CARD DOSSIER TRIGGER */}
          <button
            type="button"
            className="why-expand-btn"
            onClick={() => setIsWhyCardOpen(true)}
            aria-label="Expand why card dossier dialog"
          >
            🔍 EXPAND WHY CARD DOSSIER
          </button>

          <div className="evidence-list" role="region" aria-label="Behavioral evidence indicators">
            {evidenceItems.map((item) => (
              <Evidence
                key={item.number}
                number={item.number}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>

          {/* DYNAMIC KINETIC SPECTROGRAM */}
          <KineticSpectrogram intensity={selectedNode.kinetic_jerk_score} />
        </aside>
      </section>

      {/* BOTTOM COMMAND BAR */}
      <footer className="command-bar">
        <div className="command-status">
          <span className="status-dot" aria-hidden="true" />

          <div>
            <span>ACTIVE INVESTIGATION</span>
            <strong>
              {selectedNode.session_id.toUpperCase()} // CLUSTER #{String(selectedCluster.cluster_id).padStart(2, "0")}
            </strong>
          </div>
        </div>

        <div className="safety-mode">
          ANALYST SAFETY MODE
          <strong>NO PERSON-LEVEL IDENTITY CLAIM</strong>
        </div>

        <button
          type="button"
          className={`quarantine-button ${quarantined ? "locked" : ""}`}
          onClick={() => setQuarantined((current) => !current)}
          aria-pressed={quarantined}
          aria-label={
            quarantined
              ? "Cluster 01 isolated. Click to release simulated containment."
              : "Enforce autonomous swarm quarantine simulation."
          }
        >
          <span aria-hidden="true">{quarantined ? "●" : "⚡"}</span>

          {quarantined
            ? `CLUSTER #${String(selectedCluster.cluster_id).padStart(2, "0")} ISOLATED (SIMULATION)`
            : "ENFORCE AUTONOMOUS SWARM QUARANTINE (SIMULATION)"}
        </button>
      </footer>

      {/* WHY CARD MODAL */}
      {isWhyCardOpen && (
        <WhyCardModal
          cluster={selectedCluster}
          onClose={() => setIsWhyCardOpen(false)}
          onQuarantine={() => setQuarantined(true)}
          isQuarantined={quarantined && selectedCluster.cluster_id === 1}
        />
      )}
    </main>
  );
}

function Evidence({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="evidence-item">
      <span className="evidence-number">{number}</span>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}