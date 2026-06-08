import { ChartDataPoint, SimulationResult } from '../types';

/**
 * Aproximación de Lanczos para log-gamma (LN de Función Gamma) para soportar números enormes sin Infinity
 */
function lgamma(z: number): number {
  if (z <= 0) return 0;
  const c = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5
  ];
  let x = z;
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += c[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function lfact(n: number): number {
  if (n <= 1) return 0;
  return lgamma(n + 1);
}

/**
 * Calcula combinatoria: n Cr (n sobre r) - Usando Logaritmos para permitir números de hasta 50,000+
 */
export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  // Fallback rápido para números pequeños
  if (n < 50) {
    let res = 1;
    const limit = Math.min(r, n - r);
    for (let i = 1; i <= limit; i++) {
        res = (res * (n - i + 1)) / i;
    }
    return res;
  }
  return Math.exp(lfact(n) - lfact(r) - lfact(n - r));
}

/**
 * PMF de distribución Binomial: P(X = x) - Segura contra overflows de JavaScript
 */
export function binomialPMF(n: number, p: number, x: number): number {
  if (x < 0 || x > n) return 0;
  if (p === 0) return x === 0 ? 1 : 0;
  if (p === 1) return x === n ? 1 : 0;
  const logPmf = lfact(n) - lfact(x) - lfact(n - x) + x * Math.log(p) + (n - x) * Math.log(1 - p);
  return Math.exp(logPmf);
}

/**
 * CDF de distribución Binomial: P(X <= x)
 */
export function binomialCDF(n: number, p: number, x: number): number {
  let sum = 0;
  const limit = Math.min(x, n);
  for (let i = 0; i <= limit; i++) {
    sum += binomialPMF(n, p, i);
  }
  return sum;
}

/**
 * PMF de distribución Poisson: P(X = x)
 */
export function poissonPMF(lambda: number, x: number): number {
  if (x < 0) return 0;
  if (lambda === 0) return x === 0 ? 1 : 0;
  const logPmf = -lambda + x * Math.log(lambda) - lfact(x);
  return Math.exp(logPmf);
}

/**
 * CDF de distribución Poisson: P(X <= x)
 */
export function poissonCDF(lambda: number, x: number): number {
  let sum = 0;
  for (let i = 0; i <= x; i++) {
    sum += poissonPMF(lambda, i);
  }
  return sum;
}

/**
 * Genera el conjunto de datos para graficar la Binomial
 */
export function generateBinomialSeries(
  n: number,
  p: number,
  targetX: number,
  queryType: 'equal' | 'lessEqual' | 'greaterEqual'
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  // Para n grande, recortamos si es necesario, pero mostramos al menos hasta n completo si n <= 30
  // Si n es muy grande, mostramos un rango relevante alrededor de la media
  const mean = n * p;
  const std = Math.sqrt(n * p * (1 - p));
  let start = 0;
  let end = n;

  if (n > 25) {
    start = Math.max(0, Math.floor(mean - 4 * std));
    end = Math.min(n, Math.ceil(mean + 4 * std));
    // Asegurar que el targetX esté dentro del rango visible
    start = Math.min(start, Math.max(0, targetX - 3));
    end = Math.max(end, Math.min(n, targetX + 3));
  }

  // Prevenir que el bucle se vuelva infinito si n es gigantésco (e.g., 500,000)
  if (end - start > 1000) {
    start = Math.max(0, targetX - 500);
    end = Math.min(n, targetX + 500);
  }

  for (let i = start; i <= end; i++) {
    const prob = binomialPMF(n, p, i);
    let isHighlighted = false;
    if (queryType === 'equal' && i === targetX) {
      isHighlighted = true;
    } else if (queryType === 'lessEqual' && i <= targetX) {
      isHighlighted = true;
    } else if (queryType === 'greaterEqual' && i >= targetX) {
      isHighlighted = true;
    }
    points.push({
      value: i,
      probability: prob,
      isHighlighted,
    });
  }
  return points;
}

/**
 * Genera el conjunto de datos para graficar Poisson
 */
export function generatePoissonSeries(
  lambda: number,
  targetX: number,
  queryType: 'equal' | 'lessEqual' | 'greaterEqual'
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  const mean = lambda;
  const std = Math.sqrt(lambda);
  
  // Rango dinámico alrededor de lambda
  let start = Math.max(0, Math.floor(mean - 4 * std));
  let end = Math.ceil(mean + 4 * std);
  
  // Asegurarse de que cubra al menos de 0 a 10 para lambdas muy chicos
  if (end < 10) end = 10;
  
  // Asegurarse que targetX esté en pantalla
  start = Math.min(start, Math.max(0, targetX - 3));
  end = Math.max(end, targetX + 3);

  // Límite práctico razonable para no sobrecargar el navegador si lambda es gigante
  if (end - start > 1000) {
    start = Math.max(0, targetX - 500);
    end = targetX + 500;
  }

  for (let i = start; i <= end; i++) {
    const prob = poissonPMF(lambda, i);
    let isHighlighted = false;
    if (queryType === 'equal' && i === targetX) {
      isHighlighted = true;
    } else if (queryType === 'lessEqual' && i <= targetX) {
      isHighlighted = true;
    } else if (queryType === 'greaterEqual' && i >= targetX) {
      isHighlighted = true;
    }
    points.push({
      value: i,
      probability: prob,
      isHighlighted,
    });
  }
  return points;
}

/**
 * Simula un ensayo Binomial regresando el número de éxitos
 */
export function sampleBinomial(n: number, p: number): number {
  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < p) {
      successes++;
    }
  }
  return successes;
}

/**
 * Simula un ensayo Poisson usando el método CDF inverso
 */
export function samplePoisson(lambda: number): number {
  const u = Math.random();
  let p = Math.exp(-lambda);
  let s = p;
  let k = 0;
  while (u > s && k < 1000) {
    k++;
    p = (p * lambda) / k;
    s += p;
  }
  return k;
}

/**
 * Corre una simulación completa para Binomial de `trialsCount` réplicas
 */
export function runBinomialSimulation(
  n: number,
  p: number,
  targetX: number,
  queryType: 'equal' | 'lessEqual' | 'greaterEqual',
  trialsCount: number = 2000
): { resultsTable: SimulationResult[]; simQueryProb: number; realQueryProb: number } {
  const counts: Record<number, number> = {};
  
  // Correr simulación
  for (let i = 0; i < trialsCount; i++) {
    const outcomes = sampleBinomial(n, p);
    counts[outcomes] = (counts[outcomes] || 0) + 1;
  }

  // Encontrar rango para mostrar (mostramos todos los resultados obtenidos o relevantes)
  const outcomesObtained = Object.keys(counts).map(Number).sort((a,b) => a - b);
  const minVal = Math.max(0, Math.min(...outcomesObtained, targetX - 2));
  const maxVal = Math.min(n, Math.max(...outcomesObtained, targetX + 2));

  const resultsTable: SimulationResult[] = [];
  let simSuccesses = 0;

  for (let v = minVal; v <= maxVal; v++) {
    const freq = counts[v] || 0;
    const empiricalProb = freq / trialsCount;
    const theoreticalProb = binomialPMF(n, p, v);

    resultsTable.push({
      value: v,
      theoreticalProb,
      empiricalFreq: freq,
      empiricalProb,
    });
  }

  // Probabilidad del query acumulado en la simulación
  let simQueryCount = 0;
  for (const [vStr, freq] of Object.entries(counts)) {
    const v = Number(vStr);
    if (queryType === 'equal' && v === targetX) {
      simQueryCount += freq;
    } else if (queryType === 'lessEqual' && v <= targetX) {
      simQueryCount += freq;
    } else if (queryType === 'greaterEqual' && v >= targetX) {
      simQueryCount += freq;
    }
  }

  const simQueryProb = simQueryCount / trialsCount;
  
  // Real
  let realQueryProb = 0;
  if (queryType === 'equal') {
    realQueryProb = binomialPMF(n, p, targetX);
  } else if (queryType === 'lessEqual') {
    realQueryProb = binomialCDF(n, p, targetX);
  } else {
    realQueryProb = 1 - binomialCDF(n, p, targetX - 1);
  }

  return { resultsTable, simQueryProb, realQueryProb };
}

/**
 * Corre una simulación completa para Poisson de `trialsCount` réplicas
 */
export function runPoissonSimulation(
  lambda: number,
  targetX: number,
  queryType: 'equal' | 'lessEqual' | 'greaterEqual',
  trialsCount: number = 2000
): { resultsTable: SimulationResult[]; simQueryProb: number; realQueryProb: number } {
  const counts: Record<number, number> = {};
  
  // Correr simulación
  for (let i = 0; i < trialsCount; i++) {
    const outcomes = samplePoisson(lambda);
    counts[outcomes] = (counts[outcomes] || 0) + 1;
  }

  // Encontrar rango
  const outcomesObtained = Object.keys(counts).map(Number).sort((a,b) => a - b);
  const minVal = Math.max(0, Math.min(...outcomesObtained, targetX - 2));
  const maxVal = Math.max(...outcomesObtained, targetX + 2);

  const resultsTable: SimulationResult[] = [];

  for (let v = minVal; v <= maxVal; v++) {
    const freq = counts[v] || 0;
    const empiricalProb = freq / trialsCount;
    const theoreticalProb = poissonPMF(lambda, v);

    resultsTable.push({
      value: v,
      theoreticalProb,
      empiricalFreq: freq,
      empiricalProb,
    });
  }

  // Probabilidad del query en simulación
  let simQueryCount = 0;
  for (const [vStr, freq] of Object.entries(counts)) {
    const v = Number(vStr);
    if (queryType === 'equal' && v === targetX) {
      simQueryCount += freq;
    } else if (queryType === 'lessEqual' && v <= targetX) {
      simQueryCount += freq;
    } else if (queryType === 'greaterEqual' && v >= targetX) {
      simQueryCount += freq;
    }
  }

  const simQueryProb = simQueryCount / trialsCount;

  // Real
  let realQueryProb = 0;
  if (queryType === 'equal') {
    realQueryProb = poissonPMF(lambda, targetX);
  } else if (queryType === 'lessEqual') {
    realQueryProb = poissonCDF(lambda, targetX);
  } else {
    realQueryProb = 1 - poissonCDF(lambda, targetX - 1);
  }

  return { resultsTable, simQueryProb, realQueryProb };
}
