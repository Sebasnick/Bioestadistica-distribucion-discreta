import React, { useState } from 'react';
import {
  Beaker,
  Compass,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  FlaskConical,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { DistributionType, BinomialParams, PoissonParams } from './types';
import Sidebar from './components/Sidebar';
import DistributionChart from './components/DistributionChart';
import MathFormula from './components/MathFormula';
import AudioInterpretation from './components/AudioInterpretation';
import SimulationEngine from './components/SimulationEngine';
import { generateBinomialSeries, generatePoissonSeries } from './utils/mathUtils';

export default function App() {
  const [distribution, setDistribution] = useState<DistributionType>('binomial');
  
  // Parámetros Binomiales por defecto
  const [binomialParams, setBinomialParams] = useState<BinomialParams>({
    n: 20,
    p: 0.05,
    x: 1,
    queryType: 'equal',
    caseTitle: 'Aspirina (Pérdida de Peso por Lote)',
    caseDesc: 'Control de calidad en lote de 20 tabletas de AAS. Probabilidad de defectuosas p = 5%.'
  });

  // Parámetros Poisson por defecto
  const [poissonParams, setPoissonParams] = useState<PoissonParams>({
    lambda: 1.8,
    x: 2,
    queryType: 'equal',
    caseTitle: 'Efectos Adversos (Jarabe de Tos)',
    caseDesc: 'Farmacovigilancia: promedio de 1.8 casos de urticaria por cada 10,000 tratamientos.'
  });

  // Expander de teoría educacional (similar a st.expander)
  const [theoryExpanded, setTheoryExpanded] = useState(true);

  // Generar datos para gráficos correspondientes
  const chartData = distribution === 'binomial'
    ? generateBinomialSeries(binomialParams.n, binomialParams.p, binomialParams.x, binomialParams.queryType)
    : generatePoissonSeries(poissonParams.lambda, poissonParams.x, poissonParams.queryType);

  const currentX = distribution === 'binomial' ? binomialParams.x : poissonParams.x;
  
  const activeTitle = distribution === 'binomial' ? binomialParams.caseTitle : poissonParams.caseTitle;
  const activeDesc = distribution === 'binomial' ? binomialParams.caseDesc : poissonParams.caseDesc;

  return (
    <div id="app-container" className="min-h-screen flex flex-col lg:flex-row bg-[#0f172a] text-slate-200 font-sans antialiased relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[165px] pointer-events-none z-0"></div>

      {/* Sidebar - Menú lateral educativo */}
      <Sidebar
        distribution={distribution}
        setDistribution={setDistribution}
        binomialParams={binomialParams}
        setBinomialParams={setBinomialParams}
        poissonParams={poissonParams}
        setPoissonParams={setPoissonParams}
      />

      {/* Main Panel */}
      <main className="flex-1 flex flex-col p-4 md:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
        {/* Header de la Aplicación */}
        <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 text-slate-100 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-15 pointer-events-none">
            <FlaskConical className="w-64 h-64 text-emerald-500" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                🔬 Farmacometría & Biometría
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
                {distribution === 'binomial'
                  ? 'Muestreo de Aceptación y Control de Calidad (Binomial)'
                  : 'Farmacovigilancia y Tasas de Incidencia (Poisson)'}
              </h2>
              
              {/* Highlight active study case context */}
              {activeTitle && (
                <div className="bg-slate-950/40 backdrop-blur border border-slate-800/80 rounded-2xl p-4 mt-2 max-w-4xl shadow-inner">
                  <div className="flex items-center space-x-2 text-indigo-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    <span>Caso Clínico / Laboratorio Activo:</span>
                    <span className="text-white font-sans font-bold">{activeTitle}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeDesc}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Expander Teórico de Introducción (st.expander) */}
        <section className="bg-slate-900/30 backdrop-blur-lg border border-slate-700/40 rounded-2xl shadow-md overflow-hidden z-10 relative">
          <button
            id="btn-toggle-theory"
            onClick={() => setTheoryExpanded(!theoryExpanded)}
            className="w-full px-6 py-4 bg-white/5 border-b border-white/5 font-bold text-xs text-slate-300 uppercase tracking-wider flex justify-between items-center hover:bg-white/10 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-rose-400" />
              <span>Fundamentos Básicos: ¿Qué es la Distribución {distribution === 'binomial' ? 'Binomial' : 'de Poisson'}?</span>
            </div>
            {theoryExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {theoryExpanded && (
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-sm text-slate-300 bg-slate-950/20">
              {distribution === 'binomial' ? (
                <>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                      <span>Supuestos Clave de la Binomial</span>
                    </h4>
                    <p className="text-slate-300 text-xs">
                      ¿Por qué usamos este modelo? La distribución Binomial modela el número de sucesos en una secuencia de <span className="font-mono text-emerald-300">n</span> ensayos independientes (ensayos de Bernoulli). En el mundo del control farmacéutico o biometría, requiere el cumplimiento estricto de tres premisas. Si una sola falla, el modelo no sirve:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-xs text-slate-300/85">
                      <li><strong>Condición Dicotómica (Blanco o Negro):</strong> Cada elemento evaluado solo puede tener dos estados posibles exactos. (Ej: <em>La tableta pesa lo correcto [Conforme] o no pesa lo correcto [Defectuosa]</em>). No hay puntos medios o "un poco defectuosa". La matemática necesita absolutos para sumar.</li>
                      <li><strong>Probabilidad Estática (p = constante):</strong> La tasa de error <span className="font-mono text-emerald-300">p</span> (e.g., 5%) debe mantenerse intacta para todas las unidades seleccionadas. Si la máquina se calienta a la mitad del lote y empieza a cometer un 20% de error en vez del 5%, la matemática binomial colapsa, volviéndose inválida la predicción.</li>
                      <li><strong>Independencia Estocástica (No contagio):</strong> Lo que le pase a la píldora #1 no puede alterar de ninguna forma física o causal el destino de la píldora #2. Se evalúan como universos matemáticos separados.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 border-l border-slate-800/80 pl-6">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>¿Para qué sirve en la Práctica?</span>
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Es el núcleo dorado de las normas de <strong>Muestreo de Aceptación (ISO 2859-1 / ANSI Z1.4)</strong>. ¿Para qué? Para ahorrar millones de dólares. Te permite dictaminar con casi 100% de rigor probabilístico si puedes comprar y aprobar un lote gigantesco de cien mil reactivos (con su respectiva inversión económica) con tan solo analizar una pequeñísima muestra extraída de la caja, garantizando matemáticamente el riesgo de equivocarte al mínimo.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                      <span>Supuestos Clave de Poisson</span>
                    </h4>
                    <p className="text-slate-300 text-xs">
                       ¿Por qué usamos este modelo? La distribución de Poisson es la "física cuántica" de la bioestadística: modela la aparición de eventos raros en un continuo infinito espacial o temporal. Su arquitectura requiere tres axiomas matemáticos puros:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-xs text-slate-300/85">
                      <li><strong>Condición de No Simultaneidad:</strong> Dos eventos no pueden ocurrir exactamente al mismo instante microscópico. La probabilidad de que haya casos simultáneos debe ser estadísticamente cero en el límite del tiempo.</li>
                      <li><strong>Homogeneidad de Tasa (λ Constante):</strong> La propensión a que suceda el evento debe ser igual a las 2:00 AM que a las 5:00 PM. Tu tasa histórica promedio <span className="font-mono text-teal-300 font-bold">lambda (λ)</span> no puede tener fluctuaciones ni temporadas altas/bajas que la matemática ignore.</li>
                      <li><strong>Independencia de Memoria:</strong> El hecho de que ocurra una reacción adversa ahora mismo, no hace más probable ni menos probable que ocurra otra en el siguiente segundo. El universo Poisson "no tiene memoria".</li>
                    </ul>
                  </div>

                  <div className="space-y-3 border-l border-slate-800/80 pl-6">
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <HeartPulse className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>¿Para qué sirve en Farmacovigilancia y Biología?</span>
                    </h4>
                    <p className="text-slate-300 text-xs">
                      Es tu detector de anomalías. Si en toda una población solo esperas históricamente 3 choques anafilácticos a la semana (λ = 3), y de repente suceden 10, Poisson calcula matemáticamente la brutal improbabilidad de esto, permitiendo a la autoridad sanitaria encender la alarma epidémica inmediata ante un lote potencialmente letal en lugar de asumirlo como un simple sesgo.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Sección de los Widgets Interactivos (Dos columnas principales) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda: Gráfico de Barra interactivo */}
          <div className="h-full">
            <DistributionChart
              data={chartData}
              highlightX={currentX}
              title={
                distribution === 'binomial'
                  ? `Curva de Distribución Binomial (n = ${binomialParams.n}, p = ${(binomialParams.p * 100).toFixed(0)}%)`
                  : `Curva de Distribución Poisson (λ = ${poissonParams.lambda.toFixed(1)})`
              }
            />
          </div>

          {/* Columna Derecha: Resolución Matemática Paso a Paso */}
          <div>
            <MathFormula
              distribution={distribution}
              binomialParams={binomialParams}
              poissonParams={poissonParams}
            />
          </div>
        </section>

        {/* Sección Obligatoria de Interpretación y Synthesizer por IA */}
        <section>
          <AudioInterpretation
            distribution={distribution}
            binomialParams={binomialParams}
            poissonParams={poissonParams}
          />
        </section>

        {/* Sección de Simulación Empírica (Monte Carlo) */}
        <section>
          <SimulationEngine
            distribution={distribution}
            binomialParams={binomialParams}
            poissonParams={poissonParams}
          />
        </section>
      </main>
    </div>
  );
}
