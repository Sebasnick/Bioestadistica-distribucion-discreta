import React from 'react';
import { Beaker, ShieldCheck, Activity, Award, Edit3 } from 'lucide-react';
import { DistributionType, BinomialParams, PoissonParams } from '../types';

interface SidebarProps {
  distribution: DistributionType;
  setDistribution: (dist: DistributionType) => void;
  binomialParams: BinomialParams;
  setBinomialParams: React.Dispatch<React.SetStateAction<BinomialParams>>;
  poissonParams: PoissonParams;
  setPoissonParams: React.Dispatch<React.SetStateAction<PoissonParams>>;
}

export default function Sidebar({
  distribution,
  setDistribution,
  binomialParams,
  setBinomialParams,
  poissonParams,
  setPoissonParams,
}: SidebarProps) {
  // Presets de Química Farmacéutica
  const binomialPresets = [
    {
      name: 'Aspirina (Pérdida de Peso por Lote)',
      n: 20,
      p: 0.05,
      x: 1,
      queryType: 'equal' as const,
      desc: 'Control de calidad en lote de 20 tabletas de AAS. Probabilidad de defectuosas p = 5%.'
    },
    {
      name: 'Esterilidad Pruebas Inyectables',
      n: 50,
      p: 0.02,
      x: 0,
      queryType: 'equal' as const,
      desc: 'Muestreo de 50 ampollas; se busca probar si se tiene cero ampollas contaminadas.'
    },
    {
      name: 'Cápsulas Recubrimiento Entérico',
      n: 15,
      p: 0.12,
      x: 2,
      queryType: 'greaterEqual' as const,
      desc: '15 cápsulas testeadas por disolución ácida. p = 12% de falla en recubrimiento.'
    }
  ];

  const poissonPresets = [
    {
      name: 'Efectos Adversos (Jarabe de Tos)',
      lambda: 1.8,
      x: 2,
      queryType: 'equal' as const,
      desc: 'Farmacovigilancia: promedio de 1.8 casos de urticaria por cada 10,000 tratamientos.'
    },
    {
      name: 'Microbiología (UFC en Solución)',
      lambda: 0.7,
      x: 0,
      queryType: 'equal' as const,
      desc: 'Recuento bacteriano promedio de 0.7 Unidades Formadoras de Colonias por ml.'
    },
    {
      name: 'Fallas Mecánicas en Llenadora',
      lambda: 4.5,
      x: 6,
      queryType: 'greaterEqual' as const,
      desc: 'Promedio de 4.5 micro-detenciones por turno laboral en la envasadora estéril.'
    }
  ];

  // Identificador de Preset seleccionado
  const [selectedBinomialId, setSelectedBinomialId] = React.useState<number | 'custom'>(0);
  const [selectedPoissonId, setSelectedPoissonId] = React.useState<number | 'custom'>(0);

  // Estados locales para los textos del Caso Propio / Personalizado
  const [customBinomial, setCustomBinomial] = React.useState({
    name: 'Mi Práctica del Laboratorio QP-40',
    desc: 'Escenario educativo personalizado evaluando el margen de productos fuera de especificación (FDE) en mi propio lote de testeo.'
  });

  const [customPoisson, setCustomPoisson] = React.useState({
    name: 'Mi Farmacovigilancia Hospitalaria',
    desc: 'Escenario educativo personalizado para monitorear efectos adversos secundarios por lote de vacunación en un pabellón clínico específico.'
  });

  const handleBinomialPreset = (preset: typeof binomialPresets[0], idx: number | 'custom') => {
    setSelectedBinomialId(idx);
    setBinomialParams({
      n: preset.n,
      p: preset.p,
      x: preset.x,
      queryType: preset.queryType,
      caseTitle: preset.name,
      caseDesc: preset.desc
    });
  };

  const handlePoissonPreset = (preset: typeof poissonPresets[0], idx: number | 'custom') => {
    setSelectedPoissonId(idx);
    setPoissonParams({
      lambda: preset.lambda,
      x: preset.x,
      queryType: preset.queryType,
      caseTitle: preset.name,
      caseDesc: preset.desc
    });
  };

  const handleCustomBinomialTrigger = () => {
    setSelectedBinomialId('custom');
    setBinomialParams((prev) => ({
      ...prev,
      caseTitle: customBinomial.name,
      caseDesc: customBinomial.desc
    }));
  };

  const handleCustomPoissonTrigger = () => {
    setSelectedPoissonId('custom');
    setPoissonParams((prev) => ({
      ...prev,
      caseTitle: customPoisson.name,
      caseDesc: customPoisson.desc
    }));
  };

  // Sincronizar cambios en inputs de texto de los casos de estudio personalizados
  React.useEffect(() => {
    if (selectedBinomialId === 'custom') {
      setBinomialParams(prev => ({
        ...prev,
        caseTitle: customBinomial.name,
        caseDesc: customBinomial.desc
      }));
    }
  }, [customBinomial, selectedBinomialId, setBinomialParams]);

  React.useEffect(() => {
    if (selectedPoissonId === 'custom') {
      setPoissonParams(prev => ({
        ...prev,
        caseTitle: customPoisson.name,
        caseDesc: customPoisson.desc
      }));
    }
  }, [customPoisson, selectedPoissonId, setPoissonParams]);

  return (
    <aside className="w-full lg:w-80 bg-slate-900/40 backdrop-blur-xl text-slate-100 flex flex-col border-r border-slate-700/50 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-950/20 backdrop-blur-sm flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
          <Beaker className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight font-display">BioPharma Labs</h1>
          <p className="text-xs text-slate-400 font-mono">Docencia e Interacción</p>
        </div>
      </div>

      {/* Navigation Options - Sidebar Menu */}
      <div className="p-4 space-y-1.5 border-b border-slate-800/65">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Módulo Educativo</label>
        
        <button
          id="nav-binomial-btn"
          onClick={() => setDistribution('binomial')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition text-left ${
            distribution === 'binomial'
              ? 'bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border border-transparent'
          }`}
        >
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm">Control de Calidad</span>
            <span className="text-[10px] opacity-75 font-mono">D. Binomial</span>
          </div>
        </button>

        <button
          id="nav-poisson-btn"
          onClick={() => setDistribution('poisson')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition text-left ${
            distribution === 'poisson'
              ? 'bg-teal-500/15 text-teal-400 font-medium border border-teal-500/20'
              : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border border-transparent'
          }`}
        >
          <Activity className="w-5 h-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm">Reacciones Adversas</span>
            <span className="text-[10px] opacity-75 font-mono">D. Poisson</span>
          </div>
        </button>
      </div>

      {/* Main Parameters Inputs with local scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {/* Cases presest & custom choice */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 px-1 text-slate-300">
            <Award className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Casos de Estudio</span>
          </div>

          <div className="space-y-2">
            {distribution === 'binomial' ? (
              <>
                {binomialPresets.map((preset, idx) => (
                  <button
                    id={`preset-binom-${idx}`}
                    key={idx}
                    onClick={() => handleBinomialPreset(preset, idx)}
                    className={`w-full text-left p-2.5 rounded-xl border transition ${
                      selectedBinomialId === idx
                        ? 'bg-emerald-500/10 border-emerald-500/35 shadow-md shadow-emerald-500/5'
                        : 'bg-slate-800/30 hover:bg-slate-800/50 border-slate-700/20 hover:border-slate-700/50'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${selectedBinomialId === idx ? 'text-emerald-400' : 'text-slate-200'} truncate`}>{preset.name}</p>
                    <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5">{preset.desc}</p>
                  </button>
                ))}
                
                {/* Custom Case Trigger */}
                <button
                  id="preset-binom-custom"
                  onClick={handleCustomBinomialTrigger}
                  className={`w-full text-left p-2.5 rounded-xl border transition ${
                    selectedBinomialId === 'custom'
                      ? 'bg-indigo-500/10 border-indigo-500/35 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-800/30 hover:bg-slate-800/50 border-slate-700/20 hover:border-slate-700/55'
                  }`}
                >
                  <p className={`text-xs font-semibold ${selectedBinomialId === 'custom' ? 'text-indigo-400' : 'text-slate-300'} truncate`}>🧪 Tu Propio Caso Personalizado</p>
                  <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5">{customBinomial.name}</p>
                </button>

                {/* Custom case editors if highlighted */}
                {selectedBinomialId === 'custom' && (
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center space-x-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configurar Caso Propio</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Título de tu Caso</label>
                      <input
                        id="custom-bin-title"
                        type="text"
                        value={customBinomial.name}
                        onChange={(e) => setCustomBinomial(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-850 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Contexto del Muestreo</label>
                      <textarea
                        id="custom-bin-desc"
                        rows={2}
                        value={customBinomial.desc}
                        onChange={(e) => setCustomBinomial(prev => ({ ...prev, desc: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-850 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500/30 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {poissonPresets.map((preset, idx) => (
                  <button
                    id={`preset-poiss-${idx}`}
                    key={idx}
                    onClick={() => handlePoissonPreset(preset, idx)}
                    className={`w-full text-left p-2.5 rounded-xl border transition ${
                      selectedPoissonId === idx
                        ? 'bg-teal-500/10 border-teal-500/35 shadow-md shadow-teal-500/5'
                        : 'bg-slate-800/30 hover:bg-slate-800/50 border-slate-700/20 hover:border-slate-700/50'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${selectedPoissonId === idx ? 'text-teal-400' : 'text-slate-200'} truncate`}>{preset.name}</p>
                    <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5">{preset.desc}</p>
                  </button>
                ))}

                {/* Custom Case Trigger */}
                <button
                  id="preset-poiss-custom"
                  onClick={handleCustomPoissonTrigger}
                  className={`w-full text-left p-2.5 rounded-xl border transition ${
                    selectedPoissonId === 'custom'
                      ? 'bg-indigo-500/10 border-indigo-500/35 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-800/30 hover:bg-slate-800/50 border-slate-700/20 hover:border-slate-700/55'
                  }`}
                >
                  <p className={`text-xs font-semibold ${selectedPoissonId === 'custom' ? 'text-indigo-400' : 'text-slate-300'} truncate`}>📝 Tu Propio Caso Personalizado</p>
                  <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-0.5">{customPoisson.name}</p>
                </button>

                {/* Custom case editors if highlighted */}
                {selectedPoissonId === 'custom' && (
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center space-x-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configurar Caso Propio</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Título de tu Caso</label>
                      <input
                        id="custom-poi-title"
                        type="text"
                        value={customPoisson.name}
                        onChange={(e) => setCustomPoisson(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-850 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-teal-500/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold mb-1 block">Contexto Epidemiológico</label>
                      <textarea
                        id="custom-poi-desc"
                        rows={2}
                        value={customPoisson.desc}
                        onChange={(e) => setCustomPoisson(prev => ({ ...prev, desc: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-850 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-teal-500/30 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dynamic Controls with synchronized inputs and explanations */}
        <div className="border-t border-slate-800/80 pt-4 space-y-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Parámetros del Systema</span>
            <span className="text-[9px] text-emerald-400 font-mono bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded">Teclado & Deslizador</span>
          </div>

          {distribution === 'binomial' ? (
            <div className="space-y-4">
              {/* N Input */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/15 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-semibold">Tamaño de Lote (<span className="font-mono text-emerald-400 font-bold">n</span>)</span>
                  <input
                    id="bin-num-n"
                    type="number"
                    min="1"
                    value={binomialParams.n}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setBinomialParams((prev) => ({
                        ...prev,
                        n: val,
                      }));
                    }}
                    className="w-16 bg-slate-950 text-emerald-400 text-xs font-mono font-bold text-center border border-emerald-500/20 rounded py-1 px-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  />
                </div>
                <input
                  id="bin-input-n"
                  type="range"
                  min="1"
                  max="100"
                  value={binomialParams.n}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBinomialParams((prev) => ({
                      ...prev,
                      n: val,
                      x: Math.min(prev.x, val),
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="bg-slate-900/40 p-2 rounded-lg text-[10px] text-slate-400 border border-slate-800/50 leading-relaxed font-sans">
                  <strong>Uso del Parámetro (n):</strong> Representa el <strong>tamaño total de la muestra</strong> a analizar. En un ensayo de calidad, es la cantidad de frascos, píldoras o componentes extraídos de un lote real para someterse a inspección. Si n = 50000, significa que se evaluará estadísticamente el comportamiento de cincuenta mil unidades bajo una condición binomial estricta de éxito o fracaso, permitiendo extrapolar la tasa de defectos al universo completo de producción de la fábrica.
                </div>
              </div>

              {/* P Input */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/15 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-semibold">Tasa de Fallo (<span className="font-mono text-emerald-400 font-bold">p</span>)</span>
                  <input
                    id="bin-num-p"
                    type="number"
                    min="0"
                    step="0.01"
                    value={binomialParams.p}
                    onChange={(e) => {
                      const val = Math.max(0.00, parseFloat(e.target.value) || 0);
                      setBinomialParams((prev) => ({
                        ...prev,
                        p: val,
                      }));
                    }}
                    className="w-16 bg-slate-950 text-emerald-400 text-xs font-mono font-bold text-center border border-emerald-500/20 rounded py-1 px-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  />
                </div>
                <input
                  id="bin-input-p"
                  type="range"
                  min="0.01"
                  max="1.00"
                  step="0.01"
                  value={binomialParams.p}
                  onChange={(e) => {
                    setBinomialParams((prev) => ({
                      ...prev,
                      p: Number(e.target.value),
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="bg-slate-900/40 p-2 rounded-lg text-[10px] text-slate-400 border border-slate-800/50 leading-relaxed font-sans">
                  <strong>Uso del Parámetro (p):</strong> Expresa la <strong>probabilidad teórica de ocurrencia de la variable de estudio</strong> en cada unidad aislada. Técnicamente, es la tasa esperada de defectos o éxitos de una muestra (por ejemplo: 0.05 equivale a un 5% de riesgo base unitario). Este valor fundamenta matemáticamente el motor estocástico: si cada inyectable tiene un % de falla, la curva nos mostrará cómo esta probabilidad individual escala a nivel de todo el conjunto de forma acumulativa y asimétrica.
                </div>
              </div>

              {/* X Input */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/15 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-semibold">Consultado (<span className="font-mono text-emerald-400 font-bold">x</span>)</span>
                  <input
                    id="bin-num-x"
                    type="number"
                    min="0"
                    value={binomialParams.x}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setBinomialParams((prev) => ({
                        ...prev,
                        x: val,
                      }));
                    }}
                    className="w-16 bg-slate-950 text-emerald-400 text-xs font-mono font-bold text-center border border-emerald-500/20 rounded py-1 px-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  />
                </div>
                <input
                  id="bin-input-x"
                  type="range"
                  min="0"
                  max={binomialParams.n}
                  value={binomialParams.x}
                  onChange={(e) => {
                    setBinomialParams((prev) => ({
                      ...prev,
                      x: Number(e.target.value),
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="bg-slate-900/40 p-2 rounded-lg text-[10px] text-slate-400 border border-slate-800/50 leading-relaxed font-sans">
                  <strong>Uso del Parámetro (x):</strong> Representa el <strong>evento específico (cantidad de incidentes)</strong> que el analista desea someter a prueba o consultar dentro de la muestra elegida. Si introducimos x=150, la calculadora bioestadística procesará las matemáticas exactas para responder preguntas clínicas críticas, tales como: "¿Cuál es la probabilidad estricta o combinatoria de que en este lote analizado, existan exactamente, menos de, o más de 150 piezas defectuosas simultáneamente?".
                </div>
              </div>

              {/* Consulta/Query Type selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium pl-1">Operador Bioestadístico</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    id="bin-query-equal"
                    onClick={() => setBinomialParams(prev => ({ ...prev, queryType: 'equal' }))}
                    className={`py-1.5 rounded text-xs text-center font-mono transition-all ${
                      binomialParams.queryType === 'equal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 font-semibold'
                    }`}
                  >
                    P(X = x)
                  </button>
                  <button
                    id="bin-query-less"
                    onClick={() => setBinomialParams(prev => ({ ...prev, queryType: 'lessEqual' }))}
                    className={`py-1.5 rounded text-xs text-center font-mono transition-all ${
                      binomialParams.queryType === 'lessEqual'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    P(X ≤ x)
                  </button>
                  <button
                    id="bin-query-greater"
                    onClick={() => setBinomialParams(prev => ({ ...prev, queryType: 'greaterEqual' }))}
                    className={`py-1.5 rounded text-xs text-center font-mono transition-all ${
                      binomialParams.queryType === 'greaterEqual'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    P(X ≥ x)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lambda Input */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/15 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-semibold">Tasa Promedio (<span className="font-mono text-teal-400 font-bold">λ</span>)</span>
                  <input
                    id="poi-num-lambda"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={poissonParams.lambda}
                    onChange={(e) => {
                      const val = Math.max(0.1, parseFloat(e.target.value) || 0.1);
                      setPoissonParams((prev) => ({
                        ...prev,
                        lambda: val,
                      }));
                    }}
                    className="w-16 bg-slate-950 text-teal-400 text-xs font-mono font-bold text-center border border-teal-500/20 rounded py-1 px-1 focus:outline-none focus:ring-1 focus:ring-teal-500/40"
                  />
                </div>
                <input
                  id="poi-input-lambda"
                  type="range"
                  min="0.1"
                  max="20.0"
                  step="0.1"
                  value={poissonParams.lambda}
                  onChange={(e) => {
                    setPoissonParams((prev) => ({
                      ...prev,
                      lambda: Number(e.target.value),
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="bg-slate-900/40 p-2 rounded-lg text-[10px] text-slate-400 border border-slate-800/50 leading-relaxed font-sans">
                  <strong>Uso del Parámetro (λ):</strong> Expresa la <strong>tasa de incidencia promedio (Lambda histórico)</strong> registrada. Es la medida macro fundamental que agrupa la ocurrencia de un evento raro en un espacio volumétrico o de tiempo contínuo determinado (ej: infecciones por año, recuento de microorganismos por litro). Esta métrica sirve de eje asintótico central para que el modelo predictivo de Poisson distribuya el riesgo probabilístico alrededor de una gran población casi infinita.
                </div>
              </div>

              {/* X Input */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/15 border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-300 font-semibold">Consultado (<span className="font-mono text-teal-400 font-bold">x</span>)</span>
                  <input
                    id="poi-num-x"
                    type="number"
                    min="0"
                    value={poissonParams.x}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setPoissonParams((prev) => ({
                        ...prev,
                        x: val,
                      }));
                    }}
                    className="w-16 bg-slate-950 text-teal-400 text-xs font-mono font-bold text-center border border-teal-500/20 rounded py-1 px-1 focus:outline-none focus:ring-1 focus:ring-teal-500/40"
                  />
                </div>
                <input
                  id="poi-input-x"
                  type="range"
                  min="0"
                  max="40"
                  value={poissonParams.x}
                  onChange={(e) => {
                    setPoissonParams((prev) => ({
                      ...prev,
                      x: Number(e.target.value),
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="bg-slate-900/40 p-2 rounded-lg text-[10px] text-slate-400 border border-slate-800/50 leading-relaxed font-sans">
                  <strong>Uso del Parámetro (x):</strong> Refleja el <strong>número puntual de concurrencias colaterales a verificar evaluativamente</strong> contra el flujo base general histórico (λ). Permite modelar escenarios de emergencia imprevisibles para entender rápidamente: "¿Qué tan probable matemáticamente es que aparezcan súbitamente 'x' casos severos hoy, sabiendo que el historial basal estándar (λ) normalmente es mucho inferior o superior a lo observado?".
                </div>
              </div>

              {/* Query Type for Poisson */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium pl-1">Operador Bioestadístico</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono">
                  <button
                    id="poi-query-equal"
                    onClick={() => setPoissonParams(prev => ({ ...prev, queryType: 'equal' }))}
                    className={`py-1.5 rounded text-xs text-center transition-all ${
                      poissonParams.queryType === 'equal'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 font-semibold'
                    }`}
                  >
                    P(X = x)
                  </button>
                  <button
                    id="poi-query-less"
                    onClick={() => setPoissonParams(prev => ({ ...prev, queryType: 'lessEqual' }))}
                    className={`py-1.5 rounded text-xs text-center transition-all ${
                      poissonParams.queryType === 'lessEqual'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    P(X ≤ x)
                  </button>
                  <button
                    id="poi-query-greater"
                    onClick={() => setPoissonParams(prev => ({ ...prev, queryType: 'greaterEqual' }))}
                    className={`py-1.5 rounded text-xs text-center transition-all ${
                      poissonParams.queryType === 'greaterEqual'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 font-semibold'
                    }`}
                  >
                    P(X ≥ x)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-700/50 bg-slate-950/20 text-center text-[10px] text-slate-400 font-mono">
        Módulo de Docencia © 2026<br/>
        Estándar GAMP 5 & BioPharma
      </div>
    </aside>
  );
}
