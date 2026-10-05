export type RiskLabel =
  | 'suspicious_syndicate'
  | 'normal_organic'
  | 'anomaly_outlier'

export type ClusterStatus =
  | 'active'
  | 'quarantined'

export interface GraphNode {
  id: string
  session_id: string
  cluster_id: number
  risk_label: RiskLabel
  kinetic_jerk_score: number
  semantic_intent_vector: number[]
}

export interface GraphLink {
  source: string
  target: string
  weight: number
  converged_layers: number
  delta_t_seconds: number
}

export interface GraphCluster {
  cluster_id: number
  size: number
  modularity_q: number
  status: ClusterStatus
  factual_reasons: string[]
}

export interface GraphResponse {
  nodes: GraphNode[]
  links: GraphLink[]
  clusters: GraphCluster[]
}

export interface QuarantineRequest {
  cluster_id: number
  action: 'isolate' | 'step_up_challenge' | 'release'
  reason: string
  operator_id: string
}

export const ENDPOINTS = {
  GRAPH: '/api/graph',
  QUARANTINE: '/api/quarantine',
} as const