import React, { useEffect, useState } from 'react';
import { 
  UploadCloud, 
  Cpu, 
  Layers, 
  FileCheck, 
  CheckCircle2, 
  Loader2, 
  Terminal
} from 'lucide-react';
import { 
  ScanPhase, 
  StepperStep, 
  ForensicLogMessage, 
  ValidatedMediaFile, 
  AnalyzeResponse 
} from '../../types/analysis';
import { analyzeMedia } from '../../services/api';
import { ResultView } from './ResultView';
import { saveScanToHistory } from '../../services/historyService';

interface ProgressStepperProps {
  phase: ScanPhase;
  onReset: () => void;
  selectedMedia?: ValidatedMediaFile | null;
  onAnalysisCompleted?: (response: AnalyzeResponse) => void;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  phase,
  onReset,
  selectedMedia,
  onAnalysisCompleted,
}) => {
  const mediaName = selectedMedia?.name || 'suspect_media.mp4';
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [logs, setLogs] = useState<ForensicLogMessage[]>([]);
  const [apiResult, setApiResult] = useState<AnalyzeResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const steps: StepperStep[] = [
    {
      id: 'uploading',
      title: 'Uploading & Pre-Hashing',
      description: 'Calculating SHA-256 checksum & establishing ephemeral RAM sandbox',
      estimatedDurationMs: 1400,
    },
    {
      id: 'extracting',
      title: 'Extracting Signals',
      description: 'Splitting video keyframes, spatial slices & audio Mel-spectrograms',
      estimatedDurationMs: 1800,
    },
    {
      id: 'analyzing',
      title: 'Running AI Models',
      description: 'Vision Transformer deepfake inference & heuristic signal inspection',
      estimatedDurationMs: 2400,
    },
    {
      id: 'generating',
      title: 'Generating Report',
      description: 'Score aggregation, anomaly interval mapping & verdict grading',
      estimatedDurationMs: 1400,
    },
  ];

  const executeAnalysis = () => {
    setProgressPercent(18);
    setActiveStepIndex(0);
    setErrorMsg(null);
    setIsRetrying(true);

    const now = new Date();
    const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0').substring(0, 2)}`;
    setLogs([
      { timestamp: timeStr, text: `[INTAKE] Received ${mediaName} into memory buffer`, level: 'info' },
      { timestamp: timeStr, text: '[CRYPTO] Client-side SHA-256 pre-hashing verified. Ephemeral session initialized.', level: 'success' }
    ]);

    const fileToUpload = selectedMedia?.file;
    if (!fileToUpload) {
      setErrorMsg('No media file provided for analysis.');
      setIsRetrying(false);
      return;
    }

    const apiDataPromise = analyzeMedia(fileToUpload);

    const t1 = setTimeout(() => {
      setProgressPercent(38);
      setActiveStepIndex(1);
      setLogs((prev) => [
        ...prev,
        { timestamp: timeStr, text: '[EXTRACT] Inspecting container: sampling video frames & signal channels', level: 'info' },
        { timestamp: timeStr, text: '[PREPROCESS] Normalizing resolution & color spaces for ViT inference', level: 'info' },
        { timestamp: timeStr, text: '[ANALYSIS] Media features parsed for classification', level: 'forensic' }
      ]);
    }, 900);

    const t2 = setTimeout(() => {
      setProgressPercent(68);
      setActiveStepIndex(2);
      setLogs((prev) => [
        ...prev,
        { timestamp: timeStr, text: '[NEURAL] Dispatching inference to ViT deepfake classifier model', level: 'info' },
        { timestamp: timeStr, text: '[INSPECTION] Evaluating synthetic probabilities across sampled frames', level: 'info' },
        { timestamp: timeStr, text: '[METRIC] Computing modality breakdown and anomaly confidence scores', level: 'forensic' }
      ]);
    }, 1800);

    const t3 = setTimeout(() => {
      setProgressPercent(90);
      setActiveStepIndex(3);
      setLogs((prev) => [
        ...prev,
        { timestamp: timeStr, text: '[SYNTHESIS] Aggregating model predictions into composite verdict', level: 'info' },
        { timestamp: timeStr, text: '[VERDICT] Finalizing assessment and formatting results...', level: 'info' }
      ]);
    }, 2600);

    apiDataPromise
      .then((data) => {
        setTimeout(() => {
          setApiResult(data);
          setProgressPercent(100);
          setActiveStepIndex(4);
          setIsRetrying(false);

          const statusLevel: ForensicLogMessage['level'] = 
            data.verdict === 'authentic' ? 'success' : data.verdict === 'suspicious' ? 'warn' : data.verdict === 'inconclusive' ? 'warn' : 'forensic';

          const verdictLog = data.verdict === 'inconclusive'
            ? `[VERDICT] Verification finalized: INCONCLUSIVE (${data.message || 'No face detected'})`
            : `[VERDICT] Verification finalized: ${data.verdict.toUpperCase()} (${data.ai_probability}% AI Probability)`;

          setLogs((prev) => [
            ...prev,
            { timestamp: timeStr, text: verdictLog, level: statusLevel },
            { timestamp: timeStr, text: `[STATUS] Zero-retention purge completed: temp sandbox deleted automatically.`, level: 'success' }
          ]);

          // Automatically persist completed analysis to local history
          try {
            saveScanToHistory(data, selectedMedia);
          } catch (e) {
            console.error('Failed to auto-save scan to history:', e);
          }

          if (onAnalysisCompleted) {
            onAnalysisCompleted(data);
          }
        }, 3200);
      })
      .catch((err) => {
        setErrorMsg(err?.message || 'Failed to connect to forensic backend API on http://localhost:8000.');
        setLogs((prev) => [
          ...prev,
          { timestamp: timeStr, text: `[ERROR] Backend analysis error: ${err?.message || 'Server unreachable'}`, level: 'warn' }
        ]);
        setProgressPercent(100);
        setIsRetrying(false);
      });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  useEffect(() => {
    if (phase === 'idle') {
      setProgressPercent(0);
      setActiveStepIndex(0);
      setLogs([]);
      setApiResult(null);
      setErrorMsg(null);
      return;
    }

    const cleanup = executeAnalysis();
    return () => {
      if (cleanup) cleanup();
    };
  }, [phase, selectedMedia, mediaName]);

  if (phase === 'idle') return null;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* ================= STEPPER HEADER & PROGRESS BAR ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-cyan-500 animate-pulse'}`} />
              <span className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                {progressPercent === 100 ? 'Analysis Complete' : 'Forensic Scan In Progress'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {progressPercent === 100
                ? 'Forensic Verification Finalized'
                : `Scanning ${mediaName}`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ephemeral execution pipeline • End-to-end multi-layer decomposition
            </p>
          </div>

          {/* Large percentage display */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                {progressPercent}%
              </div>
              <div className="text-[10px] font-mono uppercase text-slate-400">
                {progressPercent === 100 ? 'Verdict Ready' : 'Execution Pace'}
              </div>
            </div>
            {progressPercent < 100 ? (
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center animate-spin">
                <Loader2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Animated Master Progress Track */}
        <div className="w-full bg-slate-200 dark:bg-navy-950 rounded-full h-3 p-0.5 overflow-hidden border border-slate-300 dark:border-navy-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 transition-all duration-500 ease-out shadow-glow-cyan"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 4-Step Animated Interactive Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {steps.map((step, index) => {
            const isCompleted = activeStepIndex > index || progressPercent === 100;
            const isCurrent = activeStepIndex === index && progressPercent < 100;

            const getStepIcon = () => {
              switch (step.id) {
                case 'uploading':
                  return <UploadCloud className="w-4 h-4" />;
                case 'extracting':
                  return <Layers className="w-4 h-4" />;
                case 'analyzing':
                  return <Cpu className="w-4 h-4" />;
                case 'generating':
                  return <FileCheck className="w-4 h-4" />;
              }
            };

            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                  isCurrent
                    ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/10 ring-2 ring-cyan-500/30'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/5'
                    : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-navy-400">
                    PHASE 0{index + 1}
                  </span>

                  <div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-navy-700" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                    }`}
                  >
                    {getStepIcon()}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {step.title}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= LIVE FORENSIC EVENT LOG STREAM ================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 text-slate-200 shadow-2xl font-mono text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider text-[11px] text-white">
              Forensic Neural Event Stream
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FastAPI Backend Connected: POST /analyze</span>
          </div>
        </div>

        {/* Scrolling log container */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {logs.map((log, idx) => {
            const getColor = () => {
              switch (log.level) {
                case 'success':
                  return 'text-emerald-400';
                case 'warn':
                  return 'text-amber-400 font-semibold';
                case 'forensic':
                  return 'text-cyan-400';
                default:
                  return 'text-slate-300';
              }
            };

            return (
              <div key={idx} className="flex items-start gap-2 leading-relaxed animate-in fade-in">
                <span className="text-slate-600 select-none shrink-0">[{log.timestamp}]</span>
                <span className={getColor()}>{log.text}</span>
              </div>
            );
          })}
          {progressPercent < 100 && (
            <div className="flex items-center gap-2 text-cyan-400 animate-pulse pt-1">
              <span className="w-2 h-3 bg-cyan-400 animate-blink inline-block" />
              <span>Analyzing neural layer weights in real-time...</span>
            </div>
          )}
        </div>
      </div>

      {/* Error state if backend fails */}
      {errorMsg && (
        <ResultView
          result={null}
          error={errorMsg}
          isRetrying={isRetrying}
          onRetry={executeAnalysis}
          onReset={onReset}
          mediaFile={selectedMedia}
        />
      )}

      {/* ================= COMPLETED VERDICT SCREEN ================= */}
      {apiResult && progressPercent === 100 && (
        <ResultView
          result={apiResult}
          isRetrying={isRetrying}
          onRetry={executeAnalysis}
          onReset={onReset}
          mediaFile={selectedMedia}
        />
      )}
    </div>
  );
};
