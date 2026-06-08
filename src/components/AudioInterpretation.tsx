import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, AudioLines, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { DistributionType, BinomialParams, PoissonParams } from '../types';
import { binomialPMF, binomialCDF, poissonPMF, poissonCDF } from '../utils/mathUtils';

interface AudioInterpretationProps {
  distribution: DistributionType;
  binomialParams: BinomialParams;
  poissonParams: PoissonParams;
}

export default function AudioInterpretation({
  distribution,
  binomialParams,
  poissonParams,
}: AudioInterpretationProps) {
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1.0); // Velocidad de voz
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        // Filtrar voces en español si están disponibles para mejor pronunciación
        const spanishVoices = availableVoices.filter((v) => v.lang.toLowerCase().includes('es'));
        setVoices(spanishVoices.length > 0 ? spanishVoices : availableVoices);
        
        if (spanishVoices.length > 0) {
          setSelectedVoice(spanishVoices[0].name);
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      // Limpiar voz al desmontar
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Generar interpretación clínica y epidemiológica detallada de manera dinámica
  const generateInterpretationText = (): { title: string; content: string; severity: 'success' | 'warning' | 'danger' } => {
    if (distribution === 'binomial') {
      const { n, p, x, queryType } = binomialParams;
      const expectedDefects = n * p;
      let pResult = 0;
      if (queryType === 'equal') pResult = binomialPMF(n, p, x);
      else if (queryType === 'lessEqual') pResult = binomialCDF(n, p, x);
      else pResult = 1 - (x > 0 ? binomialCDF(n, p, x - 1) : 0);

      const percentage = (pResult * 100).toFixed(4);
      let severity: 'success' | 'warning' | 'danger' = 'success';
      let title = 'Control Sanitario Conforme';
      let content = '';

      if (x > expectedDefects + 1) {
        severity = 'danger';
        title = 'Alerta de Desviación Crítica en Control de Calidad';
      } else if (x > expectedDefects) {
        severity = 'warning';
        title = 'Aviso de Variación Moderada de Producción';
      }

      content += `En el marco del aseguramiento de la calidad farmacéutica, bajo la norma internacional GAMP 5 y las directrices de buenas prácticas de manufactura (BPM), analizamos un lote experimental de ${n} unidades con una tasa histórica documentada de defectos p = ${(p * 100).toFixed(1)}%. `;
      
      if (queryType === 'equal') {
        content += `La probabilidad puntual de encontrar exactamente ${x} unidades fuera de especificación (FDE) es de ${percentage}%.`;
      } else if (queryType === 'lessEqual') {
        content += `La probabilidad acumulada de hallar un máximo de ${x} unidades fuera de especificación en el muestreo de aceptación es de ${percentage}%.`;
      } else {
        content += `La probabilidad crítica de detectar un mínimo de ${x} unidades fuera de especificación es del ${percentage}%.`;
      }

      content += ` Teóricamente, el promedio esperado de defectos para este lote es de ${expectedDefects.toFixed(2)} unidades. `;

      if (severity === 'danger') {
        content += `La ocurrencia reportada de ${x} unidades fuera de especificación representa un evento estadísticamente anómalo y muy poco probable bajo condiciones de control operativo estable. Desde un punto de vista epidemiológico y de seguridad del paciente, este resultado sugiere fuertemente una pérdida de la homogeneidad de la mezcla o un desajuste mecánico en la línea de dosificación o empaque. Se recomienda activar el protocolo CAPA de acciones correctivas y preventivas, suspender transitoriamente la liberación del lote y realizar un muestreo destructivo expandido para descartar la presencia de lotes subestándar en el mercado nacional.`;
      } else if (severity === 'warning') {
        content += `El hallazgo de ${x} defectos está ligeramente por encima de la media teórica esperada de ${expectedDefects.toFixed(2)}. Si bien no denota un quiebre crítico del proceso, indica una alerta de variabilidad en el desempeño de la maquinaria farmacéutica. Se aconseja un monitoreo microbiológico y físico-químico continuo de las próximas sub-fracciones del lote para asegurar que no se rebasen los límites de aceptación y rechazo establecidos por la farmacopea oficial.`;
      } else {
        content += `Este desenlace de ${x} unidades defectuosas se ubica plenamente dentro de los rangos de variabilidad natural y aleatoria del proceso productivo. Indica que la robustez de la línea de manufactura cumple con el límite de calidad aceptable establecido para esta formulación. Desde el prisma de farmacovigilancia y salud pública, no existe evidencia estadística para presumir un incremento del riesgo sanitario de toxicidad o ineficacia terapéutica en el mercado para este lote.`;
      }

      return { title, content, severity };
    } else {
      // Poisson Distribution
      const { lambda, x, queryType } = poissonParams;
      let pResult = 0;
      if (queryType === 'equal') pResult = poissonPMF(lambda, x);
      else if (queryType === 'lessEqual') pResult = poissonCDF(lambda, x);
      else pResult = 1 - (x > 0 ? poissonCDF(lambda, x - 1) : 0);

      const percentage = (pResult * 100).toFixed(4);
      let severity: 'success' | 'warning' | 'danger' = 'success';
      let title = 'Fase de Farmacovigilancia Estable';
      let content = '';

      if (x > lambda + 2) {
        severity = 'danger';
        title = 'Alerta de Vigilancia Epidemiológica / Outbreak Detectado';
      } else if (x > lambda) {
        severity = 'warning';
        title = 'Desviación de Eventos Adversos bajo Vigilancia';
      }

      content += `Desde la perspectiva de la farmacovigilancia clínica, el monitoreo sistemático de efectos adversos reportados a las agencias nacionales de salud es modelado mediante un proceso estocástico homogeneo de Poisson con una tasa esperada lambda de ${lambda.toFixed(1)} casos registrados por intervalo de tiempo estándar. `;

      if (queryType === 'equal') {
        content += `La probabilidad matemática de constatar puntualmente ${x} eventos adversos es de ${percentage}%.`;
      } else if (queryType === 'lessEqual') {
        content += `La probabilidad acumulada de observar un límite de hasta ${x} casos adversos confirmados es de ${percentage}%.`;
      } else {
        content += `La probabilidad de experimentar un umbral crítico de ${x} o más eventos colatrales adversos es de ${percentage}%.`;
      }

      if (severity === 'danger') {
        content += ` El repunte estadístico a un conteo de ${x} casos representa una señal epidemiológica de alerta máxima. Este incremento es extremadamente raro de observar bajo fluctuaciones aleatorias ordinarias. Biológicamente, requiere una investigación inmediata para evaluar asociaciones causales: sospecha de contaminación microbiológica cruzada en el excipiente, desvío de impurezas carcinogénicas o degradación acelerada del principio activo en farmacias de despacho. Es mandatorio notificar al Centro Nacional de Farmacovigilancia para evaluar el retiro inmediato del mercado y proteger la salud pública.`;
      } else if (severity === 'warning') {
        content += ` El registro de ${x} casos supera marginalmente el promedio histórico de ${lambda.toFixed(1)}. Epidemiológicamente se clasifica como una alerta amarilla de baja prioridad. Sugiere la necesidad de vigilar de cerca la tendencia temporal de los reportes en las próximas tres semanas, descartando que se deba a un fenómeno estacional de dispensación o a un sesgo de notificación intensiva por parte del personal de salud hospitalario.`;
      } else {
        content += ` La observación de ${x} eventos adversos se sitúa en perfecta consonancia con las expectativas epidemiológicas basales de este medicamento de uso masivo. Refleja que el perfil de beneficio y seguridad del fármaco se mantiene estable y predecible. No se deducen riesgos emergentes que justifiquen enmiendas a las fichas técnicas oficiales o alertas sanitarias comunitarias directas.`;
      }

      return { title, content, severity };
    }
  };

  const interpretation = generateInterpretationText();

  // Función para manejar la reproducción de Audio
  const handleToggleSpeak = () => {
    if (!synthRef.current) {
      alert('La síntesis de voz no es soportada o no está disponible en este navegador.');
      return;
    }

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      // Detener cualquier audio previo
      synthRef.current.cancel();

      const textToSpeak = `${interpretation.title}. ${interpretation.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Seleccionar la voz configurada
      const allVoices = window.speechSynthesis.getVoices();
      const matchedVoice = allVoices.find((v) => v.name === selectedVoice);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      
      utterance.rate = rate; // Velocidad de lectura
      
      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (e) => {
        console.error('Error de voz:', e);
        setIsPlaying(false);
      };

      utteranceRef.current = utterance;
      setIsPlaying(true);
      synthRef.current.speak(utterance);
    }
  };

  // Actualizar la voz al vuelo si se está reproduciendo
  useEffect(() => {
    if (isPlaying && synthRef.current && utteranceRef.current) {
      synthRef.current.cancel();
      const textToSpeak = `${interpretation.title}. ${interpretation.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const allVoices = window.speechSynthesis.getVoices();
      const matchedVoice = allVoices.find((v) => v.name === selectedVoice);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.rate = rate;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    }
  }, [selectedVoice, rate]);

  // Colores de alerta para bloque de texto
  const containerColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-slate-200',
    warning: 'bg-amber-500/10 border-amber-500/20 text-slate-200',
    danger: 'bg-rose-500/10 border-rose-500/20 text-slate-200',
  };

  const textHeaderColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-rose-400',
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-slate-950/20 px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-display">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Interpretación de Resultados y Explicación Hablada</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Conclusiones profundas en base a normativas BPM / Farmacovigilancia</p>
        </div>

        <button
          id="btn-interpret"
          onClick={() => setShowInterpretation(!showInterpretation)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
            showInterpretation
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20'
          }`}
        >
          <AudioLines className="w-4 h-4 animate-pulse" />
          <span>{showInterpretation ? 'Ocultar Interpretación' : 'Interpretar Respuesta'}</span>
        </button>
      </div>

      {showInterpretation && (
        <div className="p-6 space-y-6">
          {/* Bloque de Conclusión de Salud Pública */}
          <div className={`border rounded-2xl p-5 ${containerColors[interpretation.severity]} transition-all duration-300`}>
            <div className="flex items-start space-x-3">
              {interpretation.severity === 'success' && (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {interpretation.severity === 'warning' && (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              {interpretation.severity === 'danger' && (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}

              <div>
                <h4 className={`text-sm font-bold capitalize ${textHeaderColors[interpretation.severity]}`}>
                  {interpretation.title}
                </h4>
                <p className="text-xs leading-relaxed mt-2 text-slate-200 font-sans tracking-wide">
                  {interpretation.content}
                </p>
              </div>
            </div>
          </div>

          {/* Reproductor de Audio por IA */}
          <div className="bg-slate-950/40 backdrop-blur-sm text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/85 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400">
                  <Volume2 className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audio-Sintetizador por IA integrado</h4>
                  <p className="text-[10px] text-slate-450">Escuche la interpretación epidemiológica clínica por voz artificial</p>
                </div>
              </div>

              {/* Botón Principal Reproducción */}
              <button
                id="btn-voice-play"
                onClick={handleToggleSpeak}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-450'
                    : 'bg-rose-500 text-white hover:bg-rose-400 shadow-md shadow-rose-500/10'
                }`}
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Detener Voz</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Escuchar Voz</span>
                  </>
                )}
              </button>
            </div>

            {/* Parámetros de Personalización de la Voz */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Selección de voces cargadas en el sistema */}
              {voices.length > 0 && (
                <div className="space-y-1">
                  <label className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Perfil de Voz Encontrado</label>
                  <select
                    id="select-voice"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-500/35 focus:outline-none font-medium"
                  >
                    {voices.map((voice, idx) => (
                      <option key={idx} value={voice.name}>
                        {voice.name} ({voice.lang.split('-')[1] || voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ajuste de velocidad (Rate) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <span>Velocidad de Lectura</span>
                  <span className="font-mono text-rose-450 font-bold">{rate.toFixed(1)}x</span>
                </div>
                <input
                  id="voice-rate-slider"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-950/65 p-2.5 rounded-lg border border-slate-850 font-mono text-center">
              * Nota: Utiliza el sintetizador nativo de tu navegador para máxima compatibilidad offline.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
