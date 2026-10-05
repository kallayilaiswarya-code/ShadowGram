import { GraphResponse } from '../types/contracts'

const makeVector = (seed: number): number[] =>
  Array.from({ length: 384 }, (_, index) =>
    Math.sin(seed * 0.17 + index * 0.013)
  )

export const MOCK_GRAPH: GraphResponse = {
  nodes: [
    {
      id: 'node-001',
      session_id: 'session-001',
      cluster_id: 1,
      risk_label: 'suspicious_syndicate',
      kinetic_jerk_score: 0.92,
      semantic_intent_vector: makeVector(1),
    },
    {
      id: 'node-002',
      session_id: 'session-002',
      cluster_id: 1,
      risk_label: 'suspicious_syndicate',
      kinetic_jerk_score: 0.88,
      semantic_intent_vector: makeVector(2),
    },
    {
      id: 'node-003',
      session_id: 'session-003',
      cluster_id: 1,
      risk_label: 'suspicious_syndicate',
      kinetic_jerk_score: 0.95,
      semantic_intent_vector: makeVector(3),
    },
    {
      id: 'node-004',
      session_id: 'session-004',
      cluster_id: 2,
      risk_label: 'normal_organic',
      kinetic_jerk_score: 0.18,
      semantic_intent_vector: makeVector(4),
    },
    {
      id: 'node-005',
      session_id: 'session-005',
      cluster_id: 2,
      risk_label: 'normal_organic',
      kinetic_jerk_score: 0.21,
      semantic_intent_vector: makeVector(5),
    },
    {
      id: 'node-006',
      session_id: 'session-006',
      cluster_id: 3,
      risk_label: 'anomaly_outlier',
      kinetic_jerk_score: 0.67,
      semantic_intent_vector: makeVector(6),
    },
  ],

  links: [
    {
      source: 'node-001',
      target: 'node-002',
      weight: 0.94,
      converged_layers: 4,
      delta_t_seconds: 0.42,
    },
    {
      source: 'node-002',
      target: 'node-003',
      weight: 0.88,
      converged_layers: 4,
      delta_t_seconds: 0.71,
    },
    {
      source: 'node-001',
      target: 'node-003',
      weight: 0.91,
      converged_layers: 4,
      delta_t_seconds: 0.33,
    },
    {
      source: 'node-004',
      target: 'node-005',
      weight: 0.51,
      converged_layers: 2,
      delta_t_seconds: 3.4,
    },
  ],

  clusters: [
    {
      cluster_id: 1,
      size: 3,
      modularity_q: 0.71,
      status: 'active',
      factual_reasons: [
        'Navigation overlap detected across sessions',
        'Micro-temporal arrival synchronization observed',
        'Semantic intent vectors show high similarity',
        'Elevated kinetic jerk scores across linked nodes',
      ],
    },
    {
      cluster_id: 2,
      size: 2,
      modularity_q: 0.24,
      status: 'active',
      factual_reasons: [
        'Low-risk organic behavioral pattern',
      ],
    },
    {
      cluster_id: 3,
      size: 1,
      modularity_q: 0.05,
      status: 'active',
      factual_reasons: [
        'Kinetic behavior differs from surrounding sessions',
      ],
    },
  ],
}