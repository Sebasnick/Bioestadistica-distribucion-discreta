export type DistributionType = 'binomial' | 'poisson';

export interface BinomialParams {
  n: number; // Número de ensayos
  p: number; // Probabilidad de éxito
  x: number; // Variable de interés
  queryType: 'equal' | 'lessEqual' | 'greaterEqual'; // P(X = x), P(X <= x), P(X >= x)
  caseTitle?: string;
  caseDesc?: string;
}

export interface PoissonParams {
  lambda: number; // Lambda (promedio de eventos)
  x: number; // Variable de interés
  queryType: 'equal' | 'lessEqual' | 'greaterEqual'; // P(X = x), P(X <= x), P(X >= x)
  caseTitle?: string;
  caseDesc?: string;
}

export interface ChartDataPoint {
  value: number;
  probability: number;
  isHighlighted: boolean;
}

export interface SimulationResult {
  value: number;
  theoreticalProb: number;
  empiricalFreq: number;
  empiricalProb: number;
}
