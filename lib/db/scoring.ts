export const SCORING_WEIGHTS = {
  strategic_fit: 0.25,
  build_feasibility: 0.20,
  technical_overlap: 0.20,
  regulatory_simplicity: 0.15,
  market_leverage: 0.10,
  replicability: 0.10,
};

export function scoreDimension(value: number | null, defaultValue: 3): number {
  if (value === null || value === undefined) return defaultValue;
  if (value < 1) return 1;
  if (value > 5) return 5;
  return Math.round(value);
}

export function calculateBuildAttractiveness(scores: {
  strategic_fit_score: number | null;
  build_feasibility_score: number | null;
  technical_overlap_score: number | null;
  regulatory_burden_score: number | null;
  market_leverage_score: number | null;
  replicability_score: number | null;
  time_to_value_score?: number | null;
}): number {
  const weights = SCORING_WEIGHTS;
  
  const normalizedScores = {
    strategic_fit: scoreDimension(scores.strategic_fit_score),
    build_feasibility: scoreDimension(scores.build_feasibility_score),
    technical_overlap: scoreDimension(scores.technical_overlap_score),
    regulatory_simplicity: scoreDimension(scores.regulatory_burden_score), // note: should be inverted
    market_leverage: scoreDimension(scores.market_leverage_score),
    replicability: scoreDimension(scores.replicability_score),
  };
  
  return Math.round((
    normalizedScores.strategic_fit * weights.strategic_fit +
    normalizedScores.build_feasibility * weights.build_feasibility +
    normalizedScores.technical_overlap * weights.technical_overlap +
    normalizedScores.regulatory_simplicity * weights.regulatory_simplicity +
    normalizedScores.market_leverage * weights.market_leverage +
    normalizedScores.replicability * weights.replicability
  ) * 10) / 10;
}

export function calculateReplicationDifficulty(scores: {
  build_feasibility_score: number | null;
  technical_overlap_score: number | null;
}): number {
  const avgScore = (scoreDimension(scores.build_feasibility_score) + scoreDimension(scores.technical_overlap_score)) / 2;
  return Math.round((6 - avgScore) * 10) / 10;
}

export function determineRecommendedAction(
  buildAttractiveness: number,
  replicationDifficulty: number,
  confidence: number
): 'build' | 'monitor' | 'ignore' | 'benchmark' {
  if (buildAttractiveness >= 3.5 && replicationDifficulty <= 2.5 && confidence >= 3) {
    return 'build';
  }
  if (buildAttractiveness >= 2.5 && confidence >= 2) {
    return 'monitor';
  }
  if (confidence < 2 || buildAttractiveness < 2) {
    return 'ignore';
  }
  return 'benchmark';
}

export function estimateReplicationComplexity(scores: {
  build_feasibility_score: number;
  technical_overlap_score: number;
}): string {
  const avgScore = (scores.build_feasibility_score + scores.technical_overlap_score) / 2;
  
  if (avgScore >= 4) return 'hours';
  if (avgScore >= 3) return 'weeks';
  if (avgScore >= 2) return 'months';
  return 'quarters';
}

export function estimateTimeToMvp(scores: {
  build_feasibility_score: number;
  technical_overlap_score: number;
  time_to_value_score?: number | null;
}): string {
  const t = scores.time_to_value_score || 3;
  const avgScore = (scores.build_feasibility_score + scores.technical_overlap_score + t) / 3;
  
  if (avgScore >= 4) return '1-2 weeks';
  if (avgScore >= 3) return '1-2 months';
  if (avgScore >= 2) return '3-6 months';
  return '6-12 months';
}
