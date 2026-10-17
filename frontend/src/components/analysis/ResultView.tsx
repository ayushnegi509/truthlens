import React, { useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  AlertCircle, 
  Info, 
  WifiOff, 
  Sparkles, 
  RotateCcw, 
  Share2, 
  Download, 
  Printer, 
  Clock, 
  Image as ImageIcon,
  Film,
  Volume2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { VerdictBar, getVerdictCategory } from '../verdict/VerdictBar';
import { AnalyzeResponse, ValidatedMediaFile, FlaggedSegment } from '../../types/analysis';
import { generateForensicPdfReport } from '../../utils/pdfReport';
import { getPrivacySettings } from '../../services/historyService';

export interface ResultViewProps {
  result: AnalyzeResponse | null;
  error?: string | null;
  isRetrying?: boolean;
  onRetry?: () => void;
  onReset?: () => void;
  mediaFile?: ValidatedMediaFile | null;
}

function formatNumberList(nums: number[]): string {
  if (nums.length === 0) return '';
  if (nums.length === 1) return `${nums[0]}`;
  if (nums.length === 2) return `${nums[0]} and ${nums[1]}`;
  return `${nums.slice(0, -1).join(', ')} and ${nums[nums.length - 1]}`;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  error,
  isRetrying = false,
  onRetry,
  onReset,
  mediaFile,
}) => {
  // 1. Error State (e.g. backend unreachable)
  if (error || !result) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        <Card variant="default" className="p-8 sm:p-12 border-2 border-rose-500/30 dark:border-rose-500/30 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />
          
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-5 ring-8 ring-rose-500/5">
            <WifiOff className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Connection / Diagnostic Alert</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            Unable to Reach Forensic Backend
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
            {error || 'Our forensic verification service could not be reached. The local FastAPI server on port 8000 might be offline or undergoing initialization.'}
          </p>

          <div className="max-w-lg mx-auto bg-slate-50 dark:bg-navy-950/80 p-4 rounded-xl border border-slate-200 dark:border-navy-800 text-left text-xs text-slate-600 dark:text-slate-400 mb-8 space-y-2 font-mono">
            <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>Troubleshooting Tips:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Ensure the FastAPI server is running with <code className="bg-slate-200 dark:bg-navy-900 px-1 py-0.5 rounded text-cyan-600 dark:text-cyan-400">uvicorn main:app --reload --port 8000</code>.</li>
              <li>Check your network connection and verify CORS settings in backend config.</li>
              <li>You can retry the request once the server is accessible.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRetry && (
              <Button
                variant="primary"
                size="lg"
                onClick={onRetry}
                disabled={isRetrying}
                leftIcon={<RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />}
                className="w-full sm:w-auto shadow-glow-cyan"
              >
                {isRetrying ? 'Reconnecting...' : 'Retry Forensic Scan'}
              </Button>
            )}

            {onReset && (
              <Button
                variant="outline"
                size="lg"
                onClick={onReset}
                className="w-full sm:w-auto"
              >
                Return to Media Intake
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // 2. Successful Result Presentation
  const clampedProbability = Math.max(0, Math.min(100, result.ai_probability));
  const verdictMeta = getVerdictCategory(clampedProbability, result.verdict);
  const isInconclusive = result.verdict === 'inconclusive' || verdictMeta.status === 'inconclusive';

  // Determine media type: video, audio, or image
  const resolvedMediaType = useMemo<'video' | 'audio' | 'image'>(() => {
    if (mediaFile?.type) return mediaFile.type;
    if (result.chunk_scores && result.chunk_scores.length > 0) return 'audio';
    if (result.frame_scores && result.frame_scores.length > 0) return 'video';
    const ext = (result.media_name || '').split('.').pop()?.toLowerCase();
    if (ext && ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)) return 'video';
    if (ext && ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'opus'].includes(ext)) return 'audio';
    if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) return 'image';
    if (result.model_name?.toLowerCase().includes('wav2vec') || result.model_name?.toLowerCase().includes('audio')) return 'audio';
    return 'image';
  }, [mediaFile, result]);

  // One-sentence plain explanation without invented technical jargon
  const plainExplanation = useMemo<string>(() => {
    if (isInconclusive) {
      return result.message || 'No human face was detected; this model can only assess faces.';
    }

    if (resolvedMediaType === 'video') {
      const scores = result.frame_scores || [];
      const highFrames: number[] = [];
      scores.forEach((s, i) => {
        if (s >= 70) highFrames.push(i + 1);
      });

      if (clampedProbability <= 25) {
        return 'All analyzed video frames scored low for synthetic manipulation.';
      } else if (clampedProbability <= 69) {
        if (highFrames.length > 0) {
          return `Frame${highFrames.length > 1 ? 's' : ''} ${formatNumberList(highFrames)} scored high, but overall video scores remain inconclusive.`;
        }
        return 'Several video frames showed moderate scores, resulting in an inconclusive verdict.';
      } else {
        if (highFrames.length > 0) {
          return `Frame${highFrames.length > 1 ? 's' : ''} ${formatNumberList(highFrames)} scored high.`;
        }
        return 'Analyzed video frames showed high overall probability of synthetic manipulation.';
      }
    }

    if (resolvedMediaType === 'audio') {
      const chunks = result.chunk_scores || [];
      const highChunks = chunks.filter((c) => c.score >= 70);

      if (clampedProbability <= 25) {
        return 'All analyzed audio segments scored low for synthetic voice cloning.';
      } else if (clampedProbability <= 69) {
        if (highChunks.length > 0) {
          const ranges = highChunks.map((c) => `${c.start_time.toFixed(1)}s–${c.end_time.toFixed(1)}s`).join(', ');
          return `Audio chunks at ${ranges} scored high, but overall audio remains inconclusive.`;
        }
        return 'Audio segments showed moderate anomaly scores, resulting in an inconclusive verdict.';
      } else {
        if (highChunks.length > 0) {
          const ranges = highChunks.map((c) => `${c.start_time.toFixed(1)}s–${c.end_time.toFixed(1)}s`).join(', ');
          return `Audio chunks at ${ranges} scored high.`;
        }
        return 'Analyzed audio chunks showed high overall probability of synthetic voice cloning.';
      }
    }

    // Image
    if (clampedProbability <= 25) {
      return 'The detected face in this image scored low for synthetic manipulation.';
    } else if (clampedProbability <= 69) {
      return 'The detected face in this image showed moderate scores, resulting in an inconclusive verdict.';
    } else {
      return 'The detected face in this image scored high for synthetic manipulation.';
    }
  }, [isInconclusive, result, resolvedMediaType, clampedProbability]);

  // Video chart data: 16 frames on x-axis and score on y-axis
  const videoChartData = useMemo(() => {
    const scores = result.frame_scores || [];
    return scores.map((score, idx) => ({
      frame: `Frame ${idx + 1}`,
      shortLabel: `F${idx + 1}`,
      score: Math.round(score * 10) / 10,
    }));
  }, [result.frame_scores]);

  // Audio chart data: per-chunk scores over time
  const audioChartData = useMemo(() => {
    const chunks = result.chunk_scores || [];
    return chunks.map((chunk, idx) => ({
      timeRange: `${chunk.start_time.toFixed(0)}s–${chunk.end_time.toFixed(0)}s`,
      chunkLabel: `Chunk ${idx + 1}`,
      score: Math.round(chunk.score * 10) / 10,
      startTime: chunk.start_time,
      endTime: chunk.end_time,
    }));
  }, [result.chunk_scores]);

  const getBarColor = (score: number) => {
    if (score <= 25) return '#10b981'; // emerald
    if (score <= 69) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* ================= 1. PRIMARY VERDICT HERO BANNER ================= */}
      <Card
        variant="default"
        className={`p-6 sm:p-8 border-2 ${verdictMeta.borderClass} shadow-xl dark:shadow-2xl relative overflow-hidden`}
      >
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${verdictMeta.colorClass}`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-navy-800">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Verdict Label Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold border ${verdictMeta.bgClass} ${verdictMeta.textClass} ${verdictMeta.borderClass}`}
              >
                {verdictMeta.icon}
                <span>{verdictMeta.label}</span>
              </div>

              {/* Confidence Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-navy-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-750">
                <span className="text-slate-400">Confidence:</span>
                <strong className="text-cyan-600 dark:text-cyan-400">{result.confidence}%</strong>
              </div>

              {/* Real vs Simulated Badge */}
              {(result.simulated ?? result.demo_mode) ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Demo mode: results are simulated</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/25">
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  <span>Analyzed by {result.model_name || 'ViT deepfake classifier'} (limited accuracy)</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {verdictMeta.label}
            </h1>
            
            {/* One-Sentence Plain Explanation */}
            <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 max-w-2xl leading-relaxed">
              {plainExplanation}
            </p>

            {/* Media metadata chips */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
              <span>Target: <strong className="text-slate-800 dark:text-slate-200">{mediaFile?.name || result.media_name}</strong></span>
              <span>•</span>
              <span>Type: <strong className="uppercase text-slate-800 dark:text-slate-200">{resolvedMediaType}</strong></span>
              <span>•</span>
              <span className="truncate max-w-xs" title={result.sha256}>
                SHA-256: {result.sha256.substring(0, 16)}...
              </span>
            </div>
          </div>

          {/* Large Probability Pill */}
          <div
            className={`p-5 rounded-2xl ${verdictMeta.bgClass} border ${verdictMeta.borderClass} flex items-center gap-5 shrink-0`}
          >
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${verdictMeta.textClass}`}>
                  {isInconclusive ? '—' : `${clampedProbability}%`}
                </span>
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                {isInconclusive ? 'Not Assessed' : 'AI Probability'}
              </div>
            </div>

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                verdictMeta.status === 'authentic'
                  ? 'bg-emerald-500 shadow-emerald-500/30'
                  : verdictMeta.status === 'amber'
                  ? 'bg-amber-500 shadow-amber-500/30'
                  : verdictMeta.status === 'inconclusive'
                  ? 'bg-slate-500 shadow-slate-500/30'
                  : 'bg-rose-500 shadow-rose-500/30'
              } text-white`}
            >
              {verdictMeta.icon}
            </div>
          </div>
        </div>

        {/* Large Horizontal Verdict Bar */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Verdict Scale
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Authentic (0-25%) • Suspicious (26-69%) • AI Deepfake (70-100%)
            </span>
          </div>

          <VerdictBar
            score={clampedProbability}
            verdict={result.verdict}
            size="lg"
            showMarker={true}
            showLabels={true}
          />
        </div>
      </Card>

      {/* ================= 2. INPUT-TYPE SPECIFIC SECTION ================= */}

      {/* ── IMAGE: Uploaded image and verdict only ──────────────────────── */}
      {resolvedMediaType === 'image' && (
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Uploaded Image
            </h3>
          </div>

          {mediaFile?.previewUrl ? (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
              <img
                src={mediaFile.previewUrl}
                alt={mediaFile.name || result.media_name}
                className="max-h-[480px] w-auto max-w-full rounded-lg object-contain shadow-md"
              />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-3">
                {mediaFile.name || result.media_name}
              </span>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-sm text-slate-500 font-mono">
              Target image: {result.media_name}
            </div>
          )}
        </Card>
      )}

      {/* ── VIDEO: Simple frame scores chart & flagged timestamps ───────── */}
      {resolvedMediaType === 'video' && (
        <div className="space-y-6">
          <Card variant="default" className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Frame Analysis Scores
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scores for the 16 sampled video frames across the sequence
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono font-medium">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>0–25%</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span>26–69%</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span>70–100%</span>
                </div>
              </div>
            </div>

            {videoChartData.length > 0 ? (
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={videoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      stroke="#475569"
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 70, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      stroke="#475569"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-slate-900 text-white rounded-lg border border-slate-700 shadow-xl text-xs font-mono">
                              <div className="font-bold text-cyan-400">{data.frame}</div>
                              <div className="mt-1">Deepfake Score: <strong className="text-white">{data.score}%</strong></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {videoChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-mono text-slate-500 dark:text-slate-400">
                No frame scores recorded for this video.
              </div>
            )}
          </Card>

          {/* Flagged timestamps list */}
          <Card variant="default" className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Flagged Timestamps
              </h3>
            </div>

            {result.flagged_segments.length > 0 ? (
              <div className="space-y-2">
                {result.flagged_segments.map((seg: FlaggedSegment, idx: number) => {
                  const isHigh = seg.severity === 'high' || seg.score >= 70;
                  const isMed = !isHigh && (seg.severity === 'medium' || seg.score >= 26);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-navy-950 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{seg.start_time.toFixed(1)}s – {seg.end_time.toFixed(1)}s</span>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          {seg.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span
                          className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            isHigh
                              ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                              : isMed
                              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                          }`}
                        >
                          {isHigh ? (
                            <AlertOctagon className="w-3 h-3 text-rose-500" />
                          ) : isMed ? (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          )}
                          <span>Score: {seg.score}%</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No frames exceeded the 70% detection threshold.</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── AUDIO: Simple chunk scores bar chart & flagged time ranges ──── */}
      {resolvedMediaType === 'audio' && (
        <div className="space-y-6">
          <Card variant="default" className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Audio Chunk Scores Over Time
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Per-chunk deepfake probability scores across 5-second intervals
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono font-medium">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>0–25%</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span>26–69%</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span>70–100%</span>
                </div>
              </div>
            </div>

            {audioChartData.length > 0 ? (
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={audioChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis
                      dataKey="timeRange"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      stroke="#475569"
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 70, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      stroke="#475569"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 bg-slate-900 text-white rounded-lg border border-slate-700 shadow-xl text-xs font-mono">
                              <div className="font-bold text-cyan-400">{data.chunkLabel} ({data.timeRange})</div>
                              <div className="mt-1">Deepfake Score: <strong className="text-white">{data.score}%</strong></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {audioChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-mono text-slate-500 dark:text-slate-400">
                No chunk scores recorded for this audio file.
              </div>
            )}
          </Card>

          {/* Flagged time ranges list */}
          <Card variant="default" className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Flagged Time Ranges
              </h3>
            </div>

            {result.flagged_segments.length > 0 ? (
              <div className="space-y-2">
                {result.flagged_segments.map((seg: FlaggedSegment, idx: number) => {
                  const isHigh = seg.severity === 'high' || seg.score >= 70;
                  const isMed = !isHigh && (seg.severity === 'medium' || seg.score >= 26);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-navy-950 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{seg.start_time.toFixed(1)}s – {seg.end_time.toFixed(1)}s</span>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          {seg.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span
                          className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            isHigh
                              ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                              : isMed
                              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                          }`}
                        >
                          {isHigh ? (
                            <AlertOctagon className="w-3 h-3 text-rose-500" />
                          ) : isMed ? (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          )}
                          <span>Score: {seg.score}%</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No audio chunks exceeded the 70% detection threshold.</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ================= 3. LEGAL DISCLAIMER & PROBABILISTIC NOTICE ================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25 text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="uppercase tracking-wider font-mono text-[11px]">
            Probabilistic Evidence Disclaimer — Not Legal Proof
          </span>
        </div>
        <p className="leading-relaxed">
          TruthLens analysis outputs and synthetic probabilities are <strong>probabilistic estimates</strong> generated by neural pattern recognition heuristics. They do not constitute conclusive legal proof, judicial certification, or definitive forensic testimony in a court of law.
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Digital media may exhibit compression artifacts, transmission packet loss, low-light camera sensor noise, or optical re-encoding anomalies that mimic synthetic characteristics. Independent expert human review is strongly recommended prior to legal or administrative proceedings.
        </p>
      </div>

      {/* ================= 4. ACTION CONTROLS TOOLBAR ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-6">
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Scan Another Media
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              const priv = getPrivacySettings();
              generateForensicPdfReport(result, { faceBlur: priv.faceBlurOnExport });
            }}
            leftIcon={<Printer className="w-4 h-4 text-cyan-500" />}
            className="w-full sm:w-auto"
          >
            Download PDF Report
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `truthlens-forensic-report-${result.media_name}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            leftIcon={<Download className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  `TruthLens Forensic Result for ${result.media_name}: ${result.verdict.toUpperCase()} (${result.ai_probability}% AI Probability, ${result.confidence}% Confidence). SHA-256: ${result.sha256}`
                );
                alert('Forensic summary copied to clipboard!');
              }
            }}
            leftIcon={<Share2 className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-glow-cyan"
          >
            Share Verdict
          </Button>

          {result.ai_probability > 50 && (
            <Button
              variant="danger"
              size="lg"
              onClick={() => {
                window.location.hash = '#help';
              }}
              leftIcon={<AlertTriangle className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Report Misuse (1930)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
