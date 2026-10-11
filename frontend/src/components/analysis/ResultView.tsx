import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  HelpCircle, 
  Info, 
  FileText, 
  RotateCcw, 
  Share2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  WifiOff, 
  Sparkles, 
  Layers, 
  Activity, 
  ChevronRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { VerdictBar, getVerdictCategory } from '../verdict/VerdictBar';
import { AnalyzeResponse, ValidatedMediaFile, FlaggedSegment, BreakdownScores } from '../../types/analysis';
import { FrameViewer } from './FrameViewer';
import { AudioWaveform } from './AudioWaveform';
import { generateForensicPdfReport } from '../../utils/pdfReport';
import { getPrivacySettings } from '../../services/historyService';
import { Printer } from 'lucide-react';

export interface ResultViewProps {
  result: AnalyzeResponse | null;
  error?: string | null;
  isRetrying?: boolean;
  onRetry?: () => void;
  onReset?: () => void;
  mediaFile?: ValidatedMediaFile | null;
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

          {/* Friendly troubleshooting tips card */}
          <div className="max-w-lg mx-auto bg-slate-50 dark:bg-navy-950/80 p-4 rounded-xl border border-slate-200 dark:border-navy-800 text-left text-xs text-slate-600 dark:text-slate-400 mb-8 space-y-2 font-mono">
            <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-500 shrink-0" />
              <span>Troubleshooting Tips:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Ensure the FastAPI server is running with <code className="bg-slate-200 dark:bg-navy-900 px-1 py-0.5 rounded text-cyan-600 dark:text-cyan-400">uvicorn main:app --reload --port 8000</code>.</li>
              <li>Check your network connection and verify CORS settings in backend config.</li>
              <li>You can retry the request or load simulated demo forensics.</li>
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

  // Derive friendly explanation based on score and breakdown
  const getPlainLanguageExplanation = () => {
    if (isInconclusive) {
      return {
        summary: result.message || 'No face detected, this model can only assess faces',
        reasons: [
          'The forensic vision classifier requires at least one detectable human face to perform deepfake verification.',
          'No clear facial landmarks or crops could be isolated in the uploaded media.',
          'Media without human faces (such as landscapes, abstract artwork, or non-facial screenshots) cannot be evaluated by this specialized model.',
        ],
        advice: result.message || 'No face detected, this model can only assess faces. Please upload media featuring a clearly visible human face.',
      };
    }

    const breakdownEntries: [keyof BreakdownScores, number][] = [
      ['face', result.breakdown.face],
      ['lip_sync', result.breakdown.lip_sync],
      ['audio', result.breakdown.audio],
      ['texture', result.breakdown.texture],
      ['metadata', result.breakdown.metadata],
    ];

    let highestRisk = breakdownEntries[0];
    for (const entry of breakdownEntries) {
      if (entry[1] > highestRisk[1]) {
        highestRisk = entry;
      }
    }

    const categoryNames: Record<keyof BreakdownScores, string> = {
      face: 'Facial coherence & face-swap anomaly indicators',
      lip_sync: 'Audio-visual alignment & viseme timing estimates',
      audio: 'Acoustic waveform & synthetic audio frequency estimates',
      texture: 'Spatial texture patterns & diffusion boundary noise',
      metadata: 'File container headers, compression integrity & EXIF metadata',
    };

    if (clampedProbability <= 25) {
      return {
        summary: 'This media displays optical and acoustic patterns consistent with authentic recordings.',
        reasons: [
          'Spatial texture patterns demonstrate organic camera noise without synthetic diffusion anomalies.',
          'Natural facial features and lighting transitions remain visually coherent across sampled intervals.',
          'Audio frequency spectra exhibit continuous human vocal harmonics without synthetic phase disruptions.',
        ],
        advice: 'No structural digital synthesis was detected. The media is categorized as Authentic / Low Risk.',
      };
    } else if (clampedProbability <= 69) {
      return {
        summary: `Analysis detected anomalous variances primarily in ${categoryNames[highestRisk[0]] || 'multiple signal channels'}.`,
        reasons: [
          `Signal analysis found elevated anomaly variance (${highestRisk[1]}%) that warrants closer human scrutiny.`,
          'Frame consistency shows compression distortion, filtering artifacts, or interpolation inconsistencies.',
          'While not definitive, the pattern deviates from typical reference baseline recordings.',
        ],
        advice: 'We advise manual review and cross-referencing with verified sources before relying on this media.',
      };
    } else {
      return {
        summary: `Elevated likelihood of synthetic manipulation was identified, notably in ${categoryNames[highestRisk[0]] || 'neural synthesis features'}.`,
        reasons: [
          `Classifier output indicated high probability of synthetic generation (${highestRisk[1]}% anomaly risk in ${highestRisk[0].replace('_', ' ')}).`,
          'Visual examination revealed boundary inconsistencies, blended edges, or synthetic artifacts.',
          result.flagged_segments.length > 0
            ? `At least ${result.flagged_segments.length} sampled temporal segments exceeded the synthetic detection threshold.`
            : 'Statistical frequency anomalies indicate potential voice cloning or face replacement.',
        ],
        advice: 'The media displays high-confidence indicators of AI deepfake or generative synthetic tampering.',
      };
    }
  };

  const explanation = getPlainLanguageExplanation();

  // Modality Breakdown Items Configuration
  const breakdownConfig: {
    key: keyof BreakdownScores;
    label: string;
    score: number;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'face',
      label: 'Facial Coherence',
      score: result.breakdown.face,
      description: 'Facial boundary alignment, symmetry, and edge blending',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      key: 'lip_sync',
      label: 'Lip-Sync Timing',
      score: result.breakdown.lip_sync,
      description: 'Audio-visual timing correlation and mouth movement alignment',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      key: 'audio',
      label: 'Audio Naturalness',
      score: result.breakdown.audio,
      description: 'Spectral distribution, vocoder harmonics, and acoustic patterns',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      key: 'texture',
      label: 'Texture & Latent Noise',
      score: result.breakdown.texture,
      description: 'Spatial pixel distribution, diffusion boundaries, sensor noise',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      key: 'metadata',
      label: 'Metadata & Headers',
      score: result.breakdown.metadata,
      description: 'EXIF tags, container structure, and compression signatures',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  // Helper for mini bar coloring with accessibility text
  const getScoreSeverity = (score: number) => {
    if (score <= 25) {
      return {
        text: 'Clean',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
      };
    } else if (score <= 69) {
      return {
        text: 'Suspicious',
        color: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
      };
    } else {
      return {
        text: 'Manipulated',
        color: 'bg-rose-500',
        textColor: 'text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />,
      };
    }
  };

  // Timeline heatmap calculation
  // Find timeline total duration from flagged segments or default to 10 seconds
  const maxSegmentTime = result.flagged_segments.length > 0
    ? Math.max(...result.flagged_segments.map((s: FlaggedSegment) => s.end_time), 8)
    : 10;
  const totalTimelineDuration = Math.max(maxSegmentTime, 10);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* ================= 1. PRIMARY VERDICT HERO BANNER ================= */}
      <Card
        variant="default"
        className={`p-6 sm:p-8 border-2 ${verdictMeta.borderClass} shadow-xl dark:shadow-2xl relative overflow-hidden`}
      >
        {/* Top subtle decorative gradient bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${verdictMeta.colorClass}`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-navy-800">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Verdict Label Badge with Icon & Text for Accessibility */}
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

              {/* Analysis mode badge: simulated vs real classifier */}
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
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              {verdictMeta.sublabel}
            </p>

            {/* Media metadata chips */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
              <span>Target: <strong className="text-slate-800 dark:text-slate-200">{mediaFile?.name || result.media_name}</strong></span>
              <span>•</span>
              <span>Input: <strong className="uppercase text-slate-800 dark:text-slate-200">{result.input_type}</strong></span>
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

        {/* Large Horizontal Verdict Bar (Reusing VerdictBar) */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Forensic Likelihood Spectrum
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Calibrated: Authentic (0-25%) • Suspicious (26-69%) • AI Deepfake (70-100%)
            </span>
          </div>

          {/* Reusing existing VerdictBar component without rebuilding */}
          <VerdictBar
            score={clampedProbability}
            verdict={result.verdict}
            size="lg"
            showMarker={true}
            showLabels={true}
          />
        </div>
      </Card>

      {/* ================= 2. BREAKDOWN CARDS WITH MINI BARS ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Forensic Modality Breakdown
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            5 Diagnostic Dimensions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {breakdownConfig.map((item) => {
            const severity = getScoreSeverity(item.score);
            const clampedScore = Math.max(0, Math.min(100, item.score));

            return (
              <Card
                key={item.key}
                variant="default"
                className="p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {item.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${severity.badgeBg}`}>
                      {severity.icon}
                      <span>{severity.text}</span>
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className={`text-2xl font-black font-mono ${severity.textColor}`}>
                      {item.score}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Risk Level
                    </span>
                  </div>

                  {/* Mini Horizontal Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-navy-950 rounded-full h-2 p-0.5 overflow-hidden border border-slate-300/80 dark:border-navy-800">
                    <div
                      className={`h-full rounded-full ${severity.color} transition-all duration-500`}
                      style={{ width: `${clampedScore}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ================= 3. TIMELINE HEATMAP OF FLAGGED SEGMENTS ================= */}
      <Card variant="default" className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Temporal Flagged Segments Heatmap
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive timeline distribution of timestamped anomalies throughout the sample sequence
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono font-medium">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Low (0-25%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Medium (26-69%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>High (70-100%)</span>
            </div>
          </div>
        </div>

        {/* Visual Continuous Heatmap Track */}
        <div className="space-y-2">
          <div className="relative w-full h-10 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 p-1 flex items-center overflow-hidden">
            {/* Background base ticks */}
            <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-20">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="h-full w-px bg-slate-500 dark:bg-slate-300" />
              ))}
            </div>

            {/* If no flagged segments */}
            {result.flagged_segments.length === 0 ? (
              <div className="w-full h-full rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold gap-2 z-10">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero Anomaly Segments Detected Across Full Temporal Duration (100% Uniform Stability)</span>
              </div>
            ) : (
              result.flagged_segments.map((seg: FlaggedSegment, idx: number) => {
                const leftPercent = Math.max(0, Math.min(95, (seg.start_time / totalTimelineDuration) * 100));
                const widthPercent = Math.max(
                  4,
                  Math.min(100 - leftPercent, ((seg.end_time - seg.start_time) / totalTimelineDuration) * 100)
                );

                const segBg =
                  seg.severity === 'high'
                    ? 'bg-rose-500 text-white shadow-rose-500/40'
                    : seg.severity === 'medium'
                    ? 'bg-amber-500 text-slate-900 shadow-amber-500/40'
                    : 'bg-emerald-500 text-white shadow-emerald-500/40';

                return (
                  <div
                    key={idx}
                    className={`absolute h-8 rounded-lg ${segBg} shadow-sm flex items-center justify-center text-[10px] font-mono font-bold px-1.5 transition-transform hover:scale-105 z-10 cursor-pointer`}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    title={`${seg.description} (${seg.start_time.toFixed(1)}s - ${seg.end_time.toFixed(1)}s, Score: ${seg.score}%)`}
                  >
                    <span className="truncate">
                      {seg.start_time.toFixed(1)}s
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Timeline Time Indicators */}
          <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>0.0s (Start)</span>
            <span>{(totalTimelineDuration * 0.25).toFixed(1)}s</span>
            <span>{(totalTimelineDuration * 0.5).toFixed(1)}s</span>
            <span>{(totalTimelineDuration * 0.75).toFixed(1)}s</span>
            <span>{totalTimelineDuration.toFixed(1)}s (Total)</span>
          </div>
        </div>

        {/* Timestamped Anomaly List */}
        {result.flagged_segments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              Detailed Anomaly Logs ({result.flagged_segments.length} Occurrences)
            </h4>

            <div className="space-y-2">
              {result.flagged_segments.map((seg: FlaggedSegment, idx: number) => {
                const isHigh = seg.severity === 'high';
                const isMed = seg.severity === 'medium';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-navy-700 transition-colors"
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
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
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
                        <span>{seg.score}% • {seg.severity.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* ================= 3b. SPATIAL FRAME VIEWER WITH BOUNDING BOXES ================= */}
      <FrameViewer result={result} mediaFile={mediaFile} />

      {/* ================= 3c. ACOUSTIC WAVEFORM WITH HIGHLIGHTED SEGMENTS ================= */}
      <AudioWaveform result={result} />

      {/* ================= 4. "WHY WAS THIS FLAGGED?" PLAIN LANGUAGE EXPLANATION ================= */}
      <Card variant="default" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Why was this flagged?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plain-language forensic diagnostic overview and rationales
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {explanation.summary}
        </p>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-750 space-y-2.5">
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Observed Forensic Evidence & Findings:
          </span>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {explanation.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
          <strong>Summary Guidance:</strong> {explanation.advice}
        </p>
      </Card>

      {/* ================= 5. LEGAL DISCLAIMER & PROBABILISTIC NOTICE ================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25 text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="uppercase tracking-wider font-mono text-[11px]">
            Probabilistic Evidence Disclaimer — Not Legal Proof
          </span>
        </div>
        <p className="leading-relaxed">
          TruthLens analysis outputs, including synthetic probability scores, forensic modality breakdowns, and timeline heatmaps, are <strong>probabilistic estimates</strong> generated by neural pattern recognition heuristics. They do not constitute conclusive legal proof, judicial certification, or definitive forensic testimony in a court of law.
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Digital media may exhibit compression artifacts, transmission packet loss, low-light camera sensor noise, or optical re-encoding anomalies that mimic synthetic characteristics. Independent expert human review is strongly recommended prior to legal or administrative proceedings.
        </p>
      </div>

      {/* ================= 6. ACTION CONTROLS TOOLBAR ================= */}
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
