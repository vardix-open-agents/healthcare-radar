// Scoring weights
export const SCORING_WEIGHTS = {
  strategic_fit: 0.25,
  build_feasibility: 0.20,
  technical_overlap: 0.20,
  regulatory_simplicity: 0.15,
  market_leverage: 0.10,
  replicability: 0.10,
};

export function calculateBuildAttractiveness(scores: {
  strategic_fit_score: number;
  build_feasibility_score: number;
  technical_overlap_score: number;
  regulatory_burden_score: number; // Note: lower is better, will invert
  market_leverage_score: number;
  replicability_score: number;
  time_to_value_score: number;
}): number {
  const regulatorySimplicity = 6 - scores.regulatory_burden_score; // Invert (1->5, 5->1)
  
  return (
    scores.strategic_fit_score * SCORING_WEIGHTS.strategic_fit +
    scores.build_feasibility_score * SCORING_WEIGHTS.build_feasibility +
    scores.technical_overlap_score * SCORING_WEIGHTS.technical_overlap +
    regulatorySimplicity * SCORING_WEIGHTS.regulatory_simplicity +
    scores.market_leverage_score * SCORING_WEIGHTS.market_leverage +
    scores.replicability_score * SCORING_WEIGHTS.replicability
  );
}

export function calculateReplicationDifficulty(scores: {
  technical_overlap_score: number;
  regulatory_burden_score: number;
  competitive_moat_strength?: number; // 1-5, higher = harder to replicate
}): number {
  // Lower technical overlap = harder
  // Higher regulatory burden = harder
  // Higher moat = harder
  const techDifficulty = 6 - (scores.technical_overlap_score || 3);
  const regDifficulty = scores.regulatory_burden_score || 3;
  const moatDifficulty = scores.competitive_moat_strength || 3;
  
  return (techDifficulty + regDifficulty + moatDifficulty) / 3;
}

export function determineRecommendedAction(
  buildAttractiveness: number,
  replicationDifficulty: number,
  confidence: number
): 'build' | 'monitor' | 'ignore' | 'benchmark' {
  // High attractiveness + low difficulty + decent confidence = BUILD
  if (buildAttractiveness >= 3.5 && replicationDifficulty <= 2.5 && confidence >= 3) {
    return 'build';
  }
  // Medium attractiveness = MONITOR
  if (buildAttractiveness >= 2.5 && confidence >= 2) {
    return 'monitor';
  }
  // Low confidence or low attractiveness = IGNORE
  if (confidence < 2 || buildAttractiveness < 2) {
    return 'ignore';
  }
  // Default = BENCHMARK (learn from but don't build)
  return 'benchmark';
}

export function estimateReplicationComplexity(scores: {
  build_feasibility_score: number;
  technical_overlap_score: number;
}): string {
  const avgScore = (scores.build_feasibility_score + scores.technical_overlap_score) / 2;
  
  if (avgScore >= 4) return 'hours'; // Very easy
  if (avgScore >= 3) return 'weeks'; // Moderate
  if (avgScore >= 2) return 'months'; // Significant effort
  return 'quarters'; // Major undertaking
}

export function estimateTimeToMvp(scores: {
  build_feasibility_score: number;
  technical_overlap_score: number;
  time_to_value_score: number;
}): string {
  const avgScore = (scores.build_feasibility_score + scores.technical_overlap_score + scores.time_to_value_score) / 3;
  
  if (avgScore >= 4) return '1-2 weeks';
  if (avgScore >= 3) return '1-2 months';
  if (avgScore >= 2) return '3-6 months';
  return '6-12 months';
}
