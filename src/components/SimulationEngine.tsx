import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw, BarChart } from 'lucide-react';
import { DistributionType, BinomialParams, PoissonParams, SimulationResult } from '../types';
import { runBinomialSimulation, runPoissonSimulation } from '../utils/mathUtils';

interface SimulationEngineProps {
  distribution: DistributionType;
  binomialParams: BinomialParams;
  poissonParams: PoissonParams;
}

export default function SimulationEngine({
  distribution,
  binomialParams,
  poissonParams,
}: SimulationEngineProps) {
  const [trials, setTrials] = useState(2000);
  const [simResults, setSimResults] = useState<{
    resultsTable: SimulationResult[];
    simQueryProb: number;
    realQueryProb: number;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    // Simular un retardo cortito para mejorar el feedback visual de cómputo
    setTimeout(() => {
      let results;
      if (distribution === 'binomial') {
        const { n, p, x, queryType } = binomialParams;
        results = runBinomialSimulation(n, p, x, queryType, trials);
      } else {
        const { lambda, x, queryType } = poissonParams;
        results = runPoissonSimulation(lambda, x, queryType, trials);
      }
      setSimResults(results);
      setIsSimulating(false);
    }, 400);
  };

  const currentX = distribution === 'binomial' ? binomialParams.x : poissonParams.x;
  const currentQueryType = distribution === 'binomial' ? binomialParams.queryType : poissonParams.queryType;

  // Formato tipo de consulta operador
  const getQueryStr = () => {
    const op = currentQueryType === 'equal' ? '=' : currentQueryType === 'lessEqual' ? '≤' : '≥';
    return `P(X ${op} ${currentX})`;
  };

  // Encontrar diferencia o error relativo
  const errorAbsoluto = simResults ? Math.abs(simResults.realQueryProb - simResults.simQueryProb) : 0;

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-2xl overflow-hidden mt-6 z-10 relative">
      <div className="bg-slate-950/20 px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-display">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/10" />
            <span>Simulador de Ensayos Empíricos (Simulación Monte Carlo)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Contraste de frecuencias relativas empíricas frente a la teoría bioestadística formal
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-slate-400">Muestras:</span>
            <select
              id="select-trials-count"
              value={trials}
              onChange={(e) => setTrials(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
            >
              <option value="500">500 ensayos</option>
              <option value="1000">1000 ensayos</option>
              <option value="2000">2000 ensayos</option>
              <option value="5000">5000 ensayos</option>
              <option value="10000">10000 ensayos</option>
            </select>
          </div>

          <button
            id="btn-run-sim"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Correr Simulación</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {!simResults ? (
          <div className="text-center py-10 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800/80">
            <div className="max-w-md mx-auto space-y-2">
              <BarChart className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">Comprobación Práctica Empírica</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Corra una simulación computacional de {trials} lotes/períodos de muestreo independientes para confirmar de manera numérica ordinaria la convergencia de la ley de los grandes números.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen Comparativo de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/20 border border-slate-800 p-4 rounded-xl shadow-inner">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Teoría Probabilística</span>
                <span className="text-xl font-bold font-mono text-white">
                  {(simResults.realQueryProb * 100).toFixed(4)}%
                </span>
                <p className="text-[9px] text-slate-400 mt-1 font-mono">{getQueryStr()} exacto</p>
              </div>

              <div className="bg-slate-950/20 border border-slate-800 p-4 rounded-xl shadow-inner">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Frecuencia Empírica</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {(simResults.simQueryProb * 100).toFixed(4)}%
                </span>
                <p className="text-[9px] text-slate-400 mt-1 font-mono">{trials} simulaciones corridas</p>
              </div>

              <div className="bg-slate-950/20 border border-slate-800 p-4 rounded-xl shadow-inner">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Discrepancia Absoluta</span>
                <span className="text-xl font-bold font-mono text-rose-400">
                  {errorAbsoluto.toFixed(6)}
                </span>
                <p className="text-[9px] text-slate-400 mt-1 font-mono">Diferencia |Teórica - Sim|</p>
              </div>
            </div>

            {/* Tabla Completa de Comparación */}
            <div>
              <p className="text-xs font-bold text-white mb-2 uppercase tracking-wider font-display">Tabla Comparativa Teórica vs Empírica</p>
              
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/30 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-800 font-mono">
                      <th className="py-2.5 px-4 col-id">Valor de Variable (X)</th>
                      <th className="py-2.5 px-4">Prob. Teórica P(X = x)</th>
                      <th className="py-2.5 px-4">Casos Obtenidos</th>
                      <th className="py-2.5 px-4">Frac. Empírica</th>
                      <th className="py-2.5 px-4 text-right">Desvío de Convergencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {simResults.resultsTable.map((row, idx) => {
                      // Determinar si este renglón es parte de la consulta o no
                      let isQueryMatch = false;
                      if (currentQueryType === 'equal' && row.value === currentX) {
                        isQueryMatch = true;
                      } else if (currentQueryType === 'lessEqual' && row.value <= currentX) {
                        isQueryMatch = true;
                      } else if (currentQueryType === 'greaterEqual' && row.value >= currentX) {
                        isQueryMatch = true;
                      }

                      const rowDiff = row.theoreticalProb - row.empiricalProb;

                      return (
                        <tr
                          key={idx}
                          className={`transition ${
                            row.value === currentX
                              ? 'bg-rose-500/15 font-bold text-rose-300 border-y border-rose-500/20'
                              : isQueryMatch
                              ? 'bg-white/5 text-slate-200'
                              : 'hover:bg-white/5 text-slate-400'
                          }`}
                        >
                          <td className="py-2.5 px-4">
                            {row.value} {row.value === currentX && <span className="text-[9px] text-rose-455 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-sans ml-1 text-right">Consultado</span>}
                          </td>
                          <td className="py-2.5 px-4">{(row.theoreticalProb * 100).toFixed(4)}%</td>
                          <td className="py-2.5 px-4">{row.empiricalFreq}</td>
                          <td className="py-2.5 px-4">{(row.empiricalProb * 100).toFixed(4)}%</td>
                          <td className={`py-2.5 px-4 text-right font-medium ${rowDiff >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                            {rowDiff >= 0 ? '+' : ''}{(rowDiff * 100).toFixed(4)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Texto educativo sobre la simulación */}
            <p className="text-[10px] text-slate-350 bg-slate-950/45 border border-slate-800 rounded-xl leading-relaxed p-4">
              * La <strong>Desviación de Convergencia</strong> muestra qué tan cerca de la probabilidad ideal se encuentra el resultado real simulado en el laboratorio. Según el <strong>Teorema del Límite Central</strong> y la <strong>Ley de los Grandes Números</strong>, a medida que aumentas el total de réplicas en la selección superior (ej. de 500 a 10,000 muestras), el promedio empírico convergerá casi idénticamente hacia los valores matemáticos de la teoría de probabilidad binomial o de Poisson.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
