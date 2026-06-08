import React from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import { DistributionType, BinomialParams, PoissonParams } from '../types';
import { nCr, binomialPMF, binomialCDF, poissonPMF, poissonCDF } from '../utils/mathUtils';

interface MathFormulaProps {
  distribution: DistributionType;
  binomialParams: BinomialParams;
  poissonParams: PoissonParams;
}

export default function MathFormula({
  distribution,
  binomialParams,
  poissonParams,
}: MathFormulaProps) {
  const formatPercentage = (val: number) => `${(val * 100).toFixed(4)}%`;

  if (distribution === 'binomial') {
    const { n, p, x, queryType } = binomialParams;
    const q = 1 - p;
    const combinatoria = nCr(n, x);
    const px = Math.pow(p, x);
    const qnx = Math.pow(q, n - x);
    const pEqual = binomialPMF(n, p, x);
    
    // Cálculo de la consulta seleccionada
    let pResult = 0;
    let queryExpression = '';
    let explanationStep = '';

    if (queryType === 'equal') {
      pResult = pEqual;
      queryExpression = `P(X = ${x})`;
      explanationStep = `
        P(X = ${x}) = \\binom{${n}}{${x}} \\times (${p})^{${x}} \\times (${q.toFixed(2)})^{${n - x}} 
        = ${combinatoria} \\times ${px.toExponential(4)} \\times ${qnx.toExponential(4)} 
        = ${pEqual.toFixed(6)}
      `;
    } else if (queryType === 'lessEqual') {
      pResult = binomialCDF(n, p, x);
      queryExpression = `P(X \\le ${x})`;
      
      const parts: string[] = [];
      for (let i = 0; i <= Math.min(x, 4); i++) {
        parts.push(`P(X=${i})`);
      }
      const hasMore = x > 4;
      explanationStep = `
        P(X \\le ${x}) = ${parts.join(' + ')}${hasMore ? ' + ...' : ''}
        = ${Array.from({ length: x + 1 }, (_, i) => binomialPMF(n, p, i).toFixed(5)).join(' + ')}
        = ${pResult.toFixed(6)}
      `;
    } else if (queryType === 'greaterEqual') {
      pResult = 1 - (x > 0 ? binomialCDF(n, p, x - 1) : 0);
      queryExpression = `P(X \\ge ${x})`;
      
      if (x === 0) {
        explanationStep = `P(X \\ge 0) = 1.000000`;
      } else {
        const parts: string[] = [];
        for (let i = 0; i < x; i++) {
          parts.push(`P(X=${i})`);
        }
        explanationStep = `
          P(X \\ge ${x}) = 1 - P(X < ${x}) = 1 - [${parts.slice(0, 4).join(' + ')}${x > 4 ? ' + ...' : ''}]
          = 1 - [${Array.from({ length: x }, (_, i) => binomialPMF(n, p, i).toFixed(5)).join(' + ')}]
          = 1 - ${(1 - pResult).toFixed(5)}
          = ${pResult.toFixed(6)}
        `;
      }
    }

    const mean = n * p;
    const variance = n * p * q;
    const stdDev = Math.sqrt(variance);

    return (
      <div className="space-y-6">
        {/* Estadísticas Clave (Métricas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-start shadow-lg">
            <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">Resultado Consultado</span>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{pResult.toFixed(6)}</span>
              <span className="ml-2 text-sm text-emerald-400 font-bold font-mono">({formatPercentage(pResult)})</span>
            </div>
            <div className="mt-4 bg-slate-950/50 p-3 rounded-lg text-[10px] text-slate-400 border border-slate-800/80 leading-relaxed font-sans">
                <strong>¿Para qué sirve?</strong> Responde a la pregunta exacta de tu análisis <strong>{queryExpression}</strong>. Es la probabilidad certera de que se presenten exactamente, más o menos eventos defectuosos dentro del lote ingresado. Un valor alto implica alta ocurrencia esperada, un valor bajo (menor al 5%) suele interpretarse bioestadísticamente como un incidente <em>significativamente atípico</em>.
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-start shadow-lg">
            <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">Media Teórica (μ)</span>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{mean.toFixed(4)}</span>
              <span className="ml-2 text-xs text-slate-400">defectos</span>
            </div>
            <div className="mt-4 bg-slate-950/50 p-3 rounded-lg text-[10px] text-slate-400 border border-slate-800/80 leading-relaxed font-sans">
              <strong>¿Qué significa empíricamente? (μ = n × p):</strong> Si evaluáramos infinitos lotes idénticos (siempre tamaño n, misma probabilidad p), el promedio matemático a largo plazo tenderá irremediablemente a estabilizarse en {mean.toFixed(2)} defectos. Es el «centro de gravedad» de tu experimento.
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-start shadow-lg">
            <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">Varianza Teórica (σ²)</span>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{variance.toFixed(4)}</span>
              <span className="ml-2 text-xs text-slate-400">(σ = {stdDev.toFixed(3)})</span>
            </div>
            <div className="mt-4 bg-slate-950/50 p-3 rounded-lg text-[10px] text-slate-400 border border-slate-800/80 leading-relaxed font-sans">
              <strong>¿Cómo interpretarla? (σ² = n×p×(1-p)):</strong> La varianza es un índice de 'volatilidad' o dispersión. A mayor varianza, más caótico se vuelve intentar predecir cuántos fallos ocurrirán hoy en tu línea. Una Desviación Estándar (σ) de {stdDev.toFixed(2)} indica la tolerancia de fluctuación común.
            </div>
          </div>
        </div>

        {/* Fórmulas y Desarrollo Matemático */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 shadow-md rounded-2xl overflow-hidden">
          <div className="bg-slate-950/20 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-400 font-bold" />
              <h3 className="text-sm font-bold text-white font-display">Desglose y Desarrollo de Matemática Binomial</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded font-mono">Paso a Paso</span>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Expresión Teórica */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Fórmula General Binomial</p>
              <div className="bg-slate-950 text-emerald-400/90 font-mono p-4 rounded-xl text-center shadow-inner overflow-x-auto text-sm md:text-base leading-relaxed py-5 border border-slate-850">
                P(X = k) = <span className="text-slate-200 font-sans">{"("}</span><span className="text-amber-300">n</span> sobre <span className="text-amber-300">k</span><span className="text-slate-200 font-sans">{")"}</span> × <span className="text-indigo-300">p</span><sup>k</sup> × (1 - <span className="text-indigo-300">p</span>)<sup>n - k</sup>
              </div>
            </div>

            {/* Reemplazo de los valores actuales */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sustitución con tus parámetros:</p>
              
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/20 space-y-3">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-slate-400">Total Ensayos (n) = </span>
                    <strong className="text-white font-mono text-sm">{n}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Éxito (p) = </span>
                    <strong className="text-white font-mono text-sm">{p}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Falla (1-p) = </span>
                    <strong className="text-white font-mono text-sm">{q.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Consultado (x) = </span>
                    <strong className="text-white font-mono text-sm">{x}</strong>
                  </div>
                </div>

                <div className="space-y-4 pt-1 font-sans text-sm text-slate-300 leading-relaxed">
                  {queryType === 'equal' && (
                    <>
                      <div>
                        <p className="font-semibold text-xs text-slate-400 uppercase">1. Coeficiente Binomial (Combinaciones posibles):</p>
                        <p className="font-mono text-xs text-slate-300 bg-slate-900/50 border border-slate-800 p-2.5 rounded-lg mt-1">
                          C({n}, {x}) = {n}! / ({x}! × ({n} - {x})!) = <span className="text-white font-bold">{combinatoria}</span> maneras de obtener exactamente {x} defectuosos en {n} tabletas.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-xs text-slate-400 uppercase">2. Expansor Exponencial:</p>
                        <ul className="list-disc pl-5 font-mono text-xs text-slate-300 mt-1 space-y-0.5">
                          <li>p<sup>x</sup> = {p}<sup>{x}</sup> = {px.toFixed(8)}</li>
                          <li>(1-p)<sup>n-x</sup> = {q.toFixed(2)}<sup>{n-x}</sup> = {qnx.toFixed(8)}</li>
                        </ul>
                      </div>
                    </>
                  )}

                  <div>
                    <p className="font-semibold text-xs text-slate-400 uppercase">3. Operación y Probabilidad Resultante:</p>
                    <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg font-mono text-xs mt-1 text-slate-250 overflow-x-auto">
                      <div className="font-semibold text-xs text-emerald-400 mb-1">Cálculo explícito para {queryExpression}:</div>
                      <code className="block whitespace-pre-wrap leading-relaxed">{explanationStep.trim()}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Poisson Distribution
  const { lambda, x, queryType } = poissonParams;
  const pEqual = poissonPMF(lambda, x);
  
  let pResult = 0;
  let queryExpression = '';
  let explanationStep = '';

  if (queryType === 'equal') {
    pResult = pEqual;
    queryExpression = `P(X = ${x})`;
    let factVal = 1;
    for (let i = 1; i <= x; i++) factVal *= i;
    explanationStep = `
      P(X = ${x}) = [e^(-${lambda}) × ${lambda}^${x}] / ${x}!
      = [${Math.exp(-lambda).toExponential(4)} × ${Math.pow(lambda, x).toExponential(4)}] / ${factVal}
      = ${pEqual.toFixed(6)}
    `;
  } else if (queryType === 'lessEqual') {
    pResult = poissonCDF(lambda, x);
    queryExpression = `P(X \\le ${x})`;
    const parts: string[] = [];
    for (let i = 0; i <= Math.min(x, 4); i++) {
      parts.push(`P(X=${i})`);
    }
    const hasMore = x > 4;
    explanationStep = `
      P(X \\le ${x}) = ${parts.join(' + ')}${hasMore ? ' + ...' : ''}
      = ${Array.from({ length: x + 1 }, (_, i) => poissonPMF(lambda, i).toFixed(5)).join(' + ')}
      = ${pResult.toFixed(6)}
    `;
  } else if (queryType === 'greaterEqual') {
    pResult = 1 - (x > 0 ? poissonCDF(lambda, x - 1) : 0);
    queryExpression = `P(X \\ge ${x})`;
    
    if (x === 0) {
      explanationStep = `P(X \\ge 0) = 1.000000`;
    } else {
      const parts: string[] = [];
      for (let i = 0; i < x; i++) {
        parts.push(`P(X=${i})`);
      }
      explanationStep = `
        P(X \\ge ${x}) = 1 - P(X < ${x}) = 1 - [${parts.slice(0, 4).join(' + ')}${x > 4 ? ' + ...' : ''}]
        = 1 - [${Array.from({ length: x }, (_, i) => poissonPMF(lambda, i).toFixed(5)).join(' + ')}]
        = 1 - ${(1 - pResult).toFixed(5)}
        = ${pResult.toFixed(6)}
      `;
    }
  }

  const mean = lambda;
  const variance = lambda;
  const stdDev = Math.sqrt(variance);

  return (
    <div className="space-y-6">
      {/* Estadísticas Clave (Métricas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-start shadow-lg">
          <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">Resultado Consultado</span>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{pResult.toFixed(6)}</span>
            <span className="ml-2 text-sm text-teal-400 font-bold font-mono">({formatPercentage(pResult)})</span>
          </div>
          <div className="mt-4 bg-slate-950/50 p-3 rounded-lg text-[10px] text-slate-400 border border-slate-800/80 leading-relaxed font-sans">
              <strong>¿Para qué sirve?</strong> Es el riesgo biomatemático de que se manifieste <strong>{queryExpression}</strong> en el mundo real. Modela emergencias imprevisibles: si tienes muy baja historia basal (λ pequeño) pero consultas por muchos casos (x grande), verás una probabilidad infima, corroborando que ese evento sería considerado un brote severo.
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-start shadow-lg">
          <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">Media Teórica (μ)</span>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{mean.toFixed(4)}</span>
            <span className="ml-2 text-xs text-slate-400">eventos</span>
          </div>
          <div className="mt-4 bg-slate-950/50 p-3 rounded-lg text-[10px] text-slate-400 border border-slate-800/80 leading-relaxed font-sans">
            <strong>¿Qué significa empíricamente? (μ = λ):</strong> En el modelo Poisson, el promedio esperado (Media) siempre es exactamente igual a tu Lambda original. Actúa como el punto de anclaje de todos los cálculos. Es la tendencia invariable con la que tu farmacovigilancia tiene que planificar la respuesta sanitaria o de inventario.
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-start shadow-lg">
          <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">Varianza Teórica (σ²)</span>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{variance.toFixed(4)}</span>
            <span className="ml-2 text-xs text-slate-400">(σ = {stdDev.toFixed(3)})</span>
          </div>
          <div className="mt-4 bg-slate-950/50 p-3 rounded-lg text-[10px] text-slate-400 border border-slate-800/80 leading-relaxed font-sans">
            <strong>¿Cómo interpretarla? (σ² = λ):</strong> Curiosamente, en Poisson la Varianza es idéntica a la Media (λ). Eso significa que a medida que tu problema clínico crece (más casos promedio λ), la "incertidumbre" matemática de desviación estándar (σ = √λ) también se va al alza progresivamente, indicando entornos de error dinámico más amplios si hay alto flujo base.
          </div>
        </div>
      </div>

      {/* Fórmulas y Desarrollo Matemático */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 shadow-md rounded-2xl overflow-hidden">
        <div className="bg-slate-950/20 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-teal-400 font-bold" />
            <h3 className="text-sm font-bold text-white font-display">Desglose y Desarrollo de Matemática Poisson</h3>
          </div>
          <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold px-2 py-0.5 rounded font-mono">Paso a Paso</span>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Expresión Teórica */}
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Fórmula General de Poisson</p>
            <div className="bg-slate-950 text-teal-400/90 font-mono p-4 rounded-xl text-center shadow-inner overflow-x-auto text-sm md:text-base leading-relaxed py-5 border border-slate-850">
              P(X = k) = [ e<sup>-<span className="text-amber-300">λ</span></sup> × <span className="text-amber-300">λ</span><sup>k</sup> ] / k!
            </div>
          </div>

          {/* Reemplazo de los valores actuales */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sustitución con tus parámetros:</p>
            
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/20 space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs border-b border-slate-800 pb-3">
                <div>
                  <span className="text-slate-400">Promedio de Tasa (λ) = </span>
                  <strong className="text-white font-mono text-sm">{lambda.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Constante Euler (e) = </span>
                  <strong className="text-white font-mono text-sm">2.71828</strong>
                </div>
                <div>
                  <span className="text-slate-400">Consultado (x) = </span>
                  <strong className="text-white font-mono text-sm">{x}</strong>
                </div>
              </div>

              <div className="space-y-4 pt-1 font-sans text-sm text-slate-300 leading-relaxed">
                {queryType === 'equal' && (
                  <>
                    <div>
                      <p className="font-semibold text-xs text-slate-400 uppercase">1. Exponencial de Base Natural (Decaimiento):</p>
                      <p className="font-mono text-xs text-slate-300 bg-slate-900/50 border border-slate-800 p-2.5 rounded-lg mt-1">
                        e<sup>-{lambda}</sup> = {Math.exp(-lambda).toFixed(8)} (Factor de probabilidad de tasa de eventos igual a 0).
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-xs text-slate-400 uppercase">2. Tasa de Crecimiento Combinado:</p>
                      <ul className="list-disc pl-5 font-mono text-xs text-slate-300 mt-1 space-y-0.5">
                        <li>λ<sup>x</sup> = {lambda}<sup>{x}</sup> = {Math.pow(lambda, x).toFixed(6)}</li>
                        <li>x! = {x}! = {Array.from({ length: x }, (_, i) => i + 1).reduce((a, b) => a * b, 1)}</li>
                      </ul>
                    </div>
                  </>
                )}

                <div>
                  <p className="font-semibold text-xs text-slate-400 uppercase">3. Operación y Probabilidad Resultante:</p>
                  <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg font-mono text-xs mt-1 text-slate-250 overflow-x-auto">
                    <div className="font-semibold text-xs text-teal-400 mb-1">Cálculo explícito para {queryExpression}:</div>
                    <code className="block whitespace-pre-wrap leading-relaxed">{explanationStep.trim()}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
