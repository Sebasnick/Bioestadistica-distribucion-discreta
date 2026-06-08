import React, { useState } from 'react';
import { ChartNoAxesColumn, HelpCircle } from 'lucide-react';
import { ChartDataPoint } from '../types';

interface DistributionChartProps {
  data: ChartDataPoint[];
  highlightX: number;
  title: string;
}

export default function DistributionChart({ data, highlightX, title }: DistributionChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Dimensiones básicas del SVG
  const width = 600;
  const height = 280;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  // Encontrar el máximo de probabilidad para escalar
  const maxProb = Math.max(...data.map((d) => d.probability), 0.01);
  // Escalar Y para dejar un margen por arriba
  const yMaxScale = maxProb * 1.15;

  // Funciones de mapeo de coordenadas
  const getX = (index: number) => {
    const chartWidth = width - paddingLeft - paddingRight;
    const barWidthWithGap = chartWidth / data.length;
    return paddingLeft + index * barWidthWithGap + barWidthWithGap / 2;
  };

  const getY = (prob: number) => {
    const chartHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - (prob / yMaxScale) * chartHeight;
  };

  const chartWidth = width - paddingLeft - paddingRight;
  const barWidth = Math.max(2, (chartWidth / data.length) * 0.75);

  // Líneas de guía horizontales de probabilidad
  const gridLinesCount = 5;
  const gridLines = Array.from({ length: gridLinesCount }, (_, i) => {
    const prob = (yMaxScale / (gridLinesCount - 1)) * i;
    return {
      prob,
      y: getY(prob),
    };
  });

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-2xl overflow-hidden flex flex-col h-full z-10 relative">
      <div className="bg-slate-950/20 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChartNoAxesColumn className="w-4 h-4 text-rose-400 font-bold animate-pulse" />
          <h3 className="text-sm font-bold text-white font-display">{title}</h3>
        </div>
        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-blue-500/25 border border-blue-500/30 rounded"></span>
            <span className="text-slate-400">Normal</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-rose-500 rounded"></span>
            <span className="text-rose-400 font-semibold">Consultado</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between min-h-[300px]">
        {/* Contenedor del Gráfico SVG */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none min-w-[450px]"
          >
            {/* Líneas de cuadrícula e indicadores del eje Y */}
            {gridLines.map((line, idx) => (
              <g key={idx} className="opacity-80">
                <line
                  x1={paddingLeft}
                  y1={line.y}
                  x2={width - paddingRight}
                  y2={line.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? "none" : "4 4"}
                />
                <text
                  x={paddingLeft - 8}
                  y={line.y + 4}
                  textAnchor="end"
                  className="font-mono text-[9px] fill-slate-500 font-medium"
                >
                  {(line.prob * 100).toFixed(1)}%
                </text>
              </g>
            ))}

            {/* Eje X Línea Base */}
            <line
              x1={paddingLeft}
              y1={height - paddingBottom}
              x2={width - paddingRight}
              y2={height - paddingBottom}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
            />

            {/* Barras de datos */}
            {data.map((point, idx) => {
              const xPos = getX(idx);
              const yPos = getY(point.probability);
              const barHeight = Math.max(1, height - paddingBottom - yPos);
              const isHighlight = point.isHighlighted;

              return (
                <g key={idx}>
                  {/* Barra interactiva invisible para Hover más fácil */}
                  <rect
                    x={xPos - (chartWidth / data.length) / 2}
                    y={paddingTop}
                    width={chartWidth / data.length}
                    height={height - paddingTop - paddingBottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* La barra visual real */}
                  <rect
                    x={xPos - barWidth / 2}
                    y={yPos}
                    width={barWidth}
                    height={barHeight}
                    rx="2"
                    className={`transition-all duration-300 pointer-events-none ${
                      isHighlight
                        ? 'fill-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.45)]'
                        : 'fill-blue-500/25 hover:fill-blue-500/40 stroke-none'
                    }`}
                  />

                  {/* Valor en Eje X */}
                  {/* Para gráficos densos, mostramos etiquetas alternas si hay más de 20 barras */}
                  {(data.length <= 25 || idx % Math.ceil(data.length / 15) === 0 || point.value === highlightX) && (
                    <text
                      x={xPos}
                      y={height - paddingBottom + 16}
                      textAnchor="middle"
                      className={`font-mono text-[10px] font-bold ${
                        point.value === highlightX ? 'fill-rose-400 font-extrabold' : 'fill-slate-400'
                      }`}
                    >
                      {point.value}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip flotante superpuesto en Canvas */}
          {hoveredPoint && (
            <div className="absolute top-2 right-2 bg-slate-950/90 text-white rounded-lg px-3 py-1.5 shadow-lg border border-slate-700/50 text-[11px] font-mono leading-relaxed pointer-events-none backdrop-blur-md">
              <span className="text-slate-400 font-sans">Valor X = </span>
              <strong className="text-amber-400 font-bold">{hoveredPoint.value}</strong>
              <br />
              <span className="text-slate-400 font-sans">Probabilidad = </span>
              <strong className="text-rose-400 font-bold">{(hoveredPoint.probability * 100).toFixed(4)}%</strong>
            </div>
          )}
        </div>

        {/* Leyenda aclaratoria */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed mt-2 flex items-start space-x-2">
          <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Este gráfico de distribución discreta de probabilidad representa todos los posibles resultados del recuento.
            La barra y el rango marcados en <strong>rojo brillante</strong> corresponden al valor consultado. Desplace el cursor sobre las barras para ver probabilidades individuales.
          </span>
        </div>
      </div>
    </div>
  );
}
