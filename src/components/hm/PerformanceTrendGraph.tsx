import React from 'react';
import { PerformanceRecord } from '../../types.ts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, Trophy, Award } from 'lucide-react';

interface PerformanceTrendGraphProps {
  records: PerformanceRecord[];
  currentScore?: number;
}

export const PerformanceTrendGraph: React.FC<PerformanceTrendGraphProps> = ({ records }) => {
  // Sort records chronologically by period order
  const sortedRecords = [...records].sort((a, b) => a.periodOrder - b.periodOrder);

  if (sortedRecords.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
        No performance records available to plot graph.
      </div>
    );
  }

  const chartPoints = sortedRecords.map((r, idx) => {
    const prev = idx > 0 ? sortedRecords[idx - 1] : null;
    const diff = prev ? Number((r.finalScore - prev.finalScore).toFixed(1)) : 0;
    return {
      period: r.evaluationPeriod,
      label: r.evaluationPeriod.replace(' (2025-26)', ''),
      score: r.finalScore,
      baseScore: r.baseScore,
      bonus: r.approvedBonusCredits,
      rank: r.overallRank,
      districtRank: r.districtRank,
      mandalRank: r.mandalRank,
      diff,
      improvementPct:
        r.improvementPercentage ??
        (prev ? Number((((r.finalScore - prev.finalScore) / prev.finalScore) * 100).toFixed(1)) : 0),
    };
  });

  const allScores = chartPoints.map((p) => p.score);
  const minScore = Math.max(0, Math.floor(Math.min(...allScores) - 6));
  const maxScore = Math.min(100, Math.ceil(Math.max(...allScores) + 6));

  const firstPoint = chartPoints[0];
  const lastPoint = chartPoints[chartPoints.length - 1];
  const netGrowth = Number((lastPoint.score - firstPoint.score).toFixed(1));
  const isPositiveGrowth = netGrowth >= 0;

  // Chart coordinates calculation (SVG)
  const width = 640;
  const height = 200;
  const paddingX = 48;
  const paddingY = 28;

  const points = chartPoints.map((d, index) => {
    const x =
      chartPoints.length === 1
        ? width / 2
        : paddingX + (index / (chartPoints.length - 1)) * (width - 2 * paddingX);
    const y =
      height -
      paddingY -
      ((d.score - minScore) / Math.max(1, maxScore - minScore)) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : '';

  // Generate 4-5 nice tick marks
  const step = Math.max(5, Math.ceil((maxScore - minScore) / 4));
  const ticks: number[] = [];
  for (let s = minScore; s <= maxScore; s += step) {
    ticks.push(s);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">
              Evaluation Performance Progression
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                isPositiveGrowth ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isPositiveGrowth ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {isPositiveGrowth ? `+${netGrowth} Pts Improvement` : `${netGrowth} Pts Decline`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Progression of Headmaster Final Performance Score across official evaluation terms
          </p>
        </div>

        <div className="text-xs text-slate-500 flex items-center space-x-2 self-start sm:self-auto bg-slate-50 px-3 py-1 rounded border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{chartPoints.length} Evaluation Periods</span>
        </div>
      </div>

      {/* SVG Chart Visualization */}
      <div className="relative w-full bg-slate-50/70 border border-slate-200 rounded-lg p-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="realScoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {ticks.map((level) => {
            const y =
              height -
              paddingY -
              ((level - minScore) / Math.max(1, maxScore - minScore)) * (height - 2 * paddingY);
            return (
              <g key={level}>
                <line
                  x1={paddingX - 10}
                  y1={y}
                  x2={width - paddingX + 10}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 15}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Filled Area */}
          {areaD && <path d={areaD} fill="url(#realScoreGradient)" />}

          {/* Line stroke */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points & Labels */}
          {points.map((p, idx) => (
            <g key={idx}>
              {/* Vertical guideline */}
              <line
                x1={p.x}
                y1={p.y}
                x2={p.x}
                y2={height - paddingY}
                stroke="#059669"
                strokeOpacity="0.2"
                strokeWidth="1"
              />

              {/* Data circle */}
              <circle
                cx={p.x}
                y={p.y}
                r="6"
                fill="#059669"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />

              {/* Score label above point */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="text-[11px] font-black fill-slate-900"
              >
                {p.score}
              </text>

              {/* Difference badge if not first */}
              {idx > 0 && (
                <text
                  x={p.x}
                  y={p.y - 23}
                  textAnchor="middle"
                  className={`text-[9px] font-bold ${
                    p.diff >= 0 ? 'fill-emerald-600' : 'fill-red-600'
                  }`}
                >
                  {p.diff >= 0 ? `+${p.diff}` : `${p.diff}`}
                </text>
              )}

              {/* Period label on X axis */}
              <text
                x={p.x}
                y={height - paddingY + 16}
                textAnchor="middle"
                className="text-[11px] font-bold fill-slate-700"
              >
                {p.label}
              </text>

              {/* Rank indicator badge below */}
              <text
                x={p.x}
                y={height - paddingY + 28}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-400"
              >
                State Rank #{p.rank}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Progression Milestones row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Baseline Score</span>
          <div className="text-lg font-bold text-slate-800 mt-0.5">{firstPoint.score} pts</div>
          <div className="text-[11px] text-slate-500">
            {firstPoint.period} (Rank #{firstPoint.rank})
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Score</span>
          <div className="text-lg font-bold text-emerald-700 mt-0.5">{lastPoint.score} pts</div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {lastPoint.period} (Rank #{lastPoint.rank})
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Net Growth</span>
          <div className={`text-lg font-bold mt-0.5 ${isPositiveGrowth ? 'text-emerald-700' : 'text-red-600'}`}>
            {isPositiveGrowth ? `+${netGrowth}` : `${netGrowth}`} pts
          </div>
          <div className="text-[11px] text-slate-500">
            {isPositiveGrowth ? 'Consistent improvement' : 'Requires intervention'}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">State Rank Trajectory</span>
          <div className="text-lg font-bold text-[#1E3A8A] mt-0.5">
            #{firstPoint.rank} &rarr; #{lastPoint.rank}
          </div>
          <div className="text-[11px] text-[#1E3A8A] font-medium">
            {firstPoint.rank - lastPoint.rank > 0
              ? `+${firstPoint.rank - lastPoint.rank} positions climbed`
              : firstPoint.rank === lastPoint.rank
              ? 'Maintained top position'
              : `${lastPoint.rank - firstPoint.rank} positions drop`}
          </div>
        </div>
      </div>
    </div>
  );
};
