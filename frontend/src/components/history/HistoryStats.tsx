import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ScanHistoryItem } from '../../types/history';
import { Card } from '../common/Card';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertOctagon, 
  Activity, 
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';

interface HistoryStatsProps {
  items: ScanHistoryItem[];
}

export const HistoryStats: React.FC<HistoryStatsProps> = ({ items }) => {
  // Aggregate Metrics
  const totalScans = items.length;
  const fakeScans = items.filter((i) => i.verdict === 'fake').length;
  const suspiciousScans = items.filter((i) => i.verdict === 'suspicious').length;
  const authenticScans = items.filter((i) => i.verdict === 'authentic').length;

  const fakeRate = totalScans > 0 ? Math.round((fakeScans / totalScans) * 100) : 0;
  const averageConfidence =
    totalScans > 0
      ? Math.round(items.reduce((acc, i) => acc + (i.confidence || 0), 0) / totalScans)
      : 0;

  // Trend Data: chronological timeline grouped by date or index
  const trendData = useMemo(() => {
    if (items.length === 0) return [];

    // Sort chronologically (oldest first for time-series trend)
    const chronological = [...items].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return chronological.map((item, idx) => {
      const d = new Date(item.timestamp);
      const label = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      return {
        name: label,
        shortLabel: `#${idx + 1}`,
        mediaName: item.mediaName,
        aiProbability: item.aiProbability,
        verdict: item.verdict,
        confidence: item.confidence,
      };
    });
  }, [items]);

  // Modality Breakdown Distribution
  const modalityData = useMemo(() => {
    const videoCount = items.filter((i) => i.mediaType === 'video').length;
    const audioCount = items.filter((i) => i.mediaType === 'audio').length;
    const imageCount = items.filter((i) => i.mediaType === 'image').length;

    return [
      { name: 'Video', count: videoCount, fill: '#3b82f6' },
      { name: 'Audio', count: audioCount, fill: '#f59e0b' },
      { name: 'Image', count: imageCount, fill: '#06b6d4' },
    ];
  }, [items]);

  // Verdict Pie Chart Data
  const verdictPieData = useMemo(() => {
    return [
      { name: 'Authentic', value: authenticScans, color: '#10b981' },
      { name: 'Suspicious', value: suspiciousScans, color: '#f59e0b' },
      { name: 'Manipulated', value: fakeScans, color: '#ef4444' },
    ].filter((slice) => slice.value > 0);
  }, [authenticScans, suspiciousScans, fakeScans]);

  return (
    <div className="space-y-6">
      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Scans */}
        <Card variant="default" className="p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Scans
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {totalScans}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              verified files
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Ephemeral RAM audit sessions logged
          </p>
        </Card>

        {/* Card 2: Fake Rate */}
        <Card variant="danger" className="p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Fake Detection Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {fakeRate}%
            </span>
            <span className="text-xs text-rose-500/80 font-mono">
              ({fakeScans} flagged)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Probability score ≥ 70% threshold
          </p>
        </Card>

        {/* Card 3: Authentic Count */}
        <Card variant="authentic" className="p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Authentic Media
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {authenticScans}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-mono">
              ({totalScans > 0 ? Math.round((authenticScans / totalScans) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Coherent natural image & audio patterns
          </p>
        </Card>

        {/* Card 4: Model Confidence */}
        <Card variant="default" className="p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mean Model Confidence
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {averageConfidence}%
            </span>
            <span className="text-xs text-blue-500 font-mono">
              certainty
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Multi-modal ensemble certainty average
          </p>
        </Card>
      </div>

      {/* Visual Charts Grid: Timeline Trend + Modality & Verdict Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Area Chart: Synthetic Probability Trend */}
        <Card variant="default" className="lg:col-span-8 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Synthetic Probability Trend Over Time
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI probability trajectory across chronological media inspections
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Authentic (≤25%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Suspicious
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Fake (≥70%)
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#334155', opacity: 0.3 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#334155', opacity: 0.3 }}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const colorClass =
                          data.aiProbability <= 25
                            ? 'text-emerald-500'
                            : data.aiProbability <= 69
                            ? 'text-amber-500'
                            : 'text-rose-500';

                        return (
                          <div className="bg-slate-900/95 text-slate-100 p-3 rounded-xl border border-slate-700 shadow-xl text-xs font-mono space-y-1">
                            <p className="font-bold text-white max-w-xs truncate">{data.mediaName}</p>
                            <p className="text-slate-400 text-[10px]">{data.name}</p>
                            <div className="pt-1 flex items-center justify-between gap-4">
                              <span>AI Probability:</span>
                              <strong className={`${colorClass} text-sm`}>{data.aiProbability}%</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-slate-300">
                              <span>Verdict:</span>
                              <span className="uppercase font-bold">{data.verdict}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="aiProbability"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ fill: '#06b6d4', r: 4, strokeWidth: 2, stroke: '#0e172e' }}
                    activeDot={{ r: 6, fill: '#38bdf8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                No scan history logged yet. Complete scans to render probability trends.
              </div>
            )}
          </div>
        </Card>

        {/* Right 4 Cols: Verdict Distribution & Modality Volume */}
        <Card variant="default" className="lg:col-span-4 p-6 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Verdict Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proportion of authentic vs. manipulated inputs
            </p>
          </div>

          {/* Donut Chart */}
          <div className="h-40 w-full relative flex items-center justify-center">
            {totalScans > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verdictPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {verdictPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-700">
                            <span>{data.name}: </span>
                            <strong>{data.value} ({Math.round(((data.value as number) / totalScans) * 100)}%)</strong>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-mono text-slate-400">No data</div>
            )}
          </div>

          {/* Modality Bar Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-500" /> Modalities
              </span>
              <span>Volume</span>
            </div>

            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modalityData} layout="vertical" margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {modalityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
