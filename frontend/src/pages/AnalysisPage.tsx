import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { DropzoneUpload } from '../components/analysis/DropzoneUpload';
import { MediaPreviewCard } from '../components/analysis/MediaPreviewCard';
import { ProgressStepper } from '../components/analysis/ProgressStepper';
import { validateMediaFile } from '../utils/fileValidation';
import { 
  ValidatedMediaFile, 
  ScanDepth, 
  ScanPhase 
} from '../types/analysis';
import { 
  ShieldCheck, 
  Sparkles, 
  Fingerprint, 
  Zap, 
  Layers, 
  Lock, 
  ArrowLeft, 
  Sliders
} from 'lucide-react';

import { AnalyzeResponse } from '../types/analysis';

interface AnalysisPageProps {
  onNavigateHome?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToLearn?: () => void;
  onNavigateToHelp?: () => void;
  initialFile?: File | null;
  onAnalysisCompleted?: (response: AnalyzeResponse) => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  onNavigateHome,
  onNavigateToHistory,
  onNavigateToPrivacy,
  onNavigateToLearn,
  onNavigateToHelp,
  initialFile,
  onAnalysisCompleted,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<ValidatedMediaFile | null>(null);
  const [scanDepth, setScanDepth] = useState<ScanDepth>('deep');
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');

  useEffect(() => {
    if (initialFile) {
      validateMediaFile(initialFile, 'file').then((val) => {
        setSelectedMedia(val);
      });
    }
  }, [initialFile]);

  // Forensic modules toggle options
  const [modules, setModules] = useState({
    spatial: true,
    temporal: true,
    spectral: true,
    provenance: true,
  });

  const isScanning = scanPhase !== 'idle';

  const handleStartAnalysis = () => {
    if (!selectedMedia) {
      return;
    }
    setScanPhase('uploading');
  };

  const handleResetAnalysis = () => {
    setScanPhase('idle');
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
  };

  const isReadyToAnalyze = selectedMedia !== null && selectedMedia.status === 'valid';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar 
        onScanClick={() => {}} 
        onHomeClick={onNavigateHome}
        onHistoryClick={onNavigateToHistory}
        onPrivacyClick={onNavigateToPrivacy}
        onLearnClick={onNavigateToLearn}
        onHelpClick={onNavigateToHelp}
        currentPage="analysis"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb & Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-navy-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="flex items-center gap-1 hover:text-cyan-500 transition-colors cursor-pointer mr-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
              )}
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Modal Forensics Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Deepfake Media Analysis
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Inspect video, audio, and image files for generative artifacts, neural voice synthesis, and boundary warping.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Neural Pipeline Online</span>
            </div>
          </div>
        </div>

        {/* ================= STEPPER VIEW (WHEN RUNNING SCAN) ================= */}
        {isScanning ? (
          <ProgressStepper
            phase={scanPhase}
            onReset={handleResetAnalysis}
            selectedMedia={selectedMedia}
            onAnalysisCompleted={(res) => {
              if (onAnalysisCompleted) {
                onAnalysisCompleted(res);
              }
            }}
          />
        ) : (
          /* ================= INTAKE & CONFIGURATION VIEW ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Dropzone / Media Preview */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-4">
                {!selectedMedia ? (
                  <DropzoneUpload
                    onFileSelected={(media) => setSelectedMedia(media)}
                    disabled={isScanning}
                  />
                ) : (
                  <MediaPreviewCard
                    media={selectedMedia}
                    onRemove={handleRemoveMedia}
                    disabled={isScanning}
                  />
                )}
              </div>
            </div>

            {/* Right 4 Cols: Scan Depth, Module Toggles & Run CTA */}
            <div className="lg:col-span-4 space-y-6">
              {/* Scan Configuration Card */}
              <Card variant="default" className="p-6 space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Scan Configuration</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Forensic Depth
                  </h3>
                </div>

                {/* Fast vs Deep Toggle */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setScanDepth('fast')}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      scanDepth === 'fast'
                        ? 'border-cyan-500 bg-cyan-500/10 text-slate-900 dark:text-white ring-1 ring-cyan-500/40'
                        : 'border-slate-200 dark:border-navy-750 bg-slate-50 dark:bg-navy-850 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Standard Fast Screen</span>
                      <Zap className="w-4 h-4 text-cyan-500" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Sub-second check (&lt;1.5s). Edge artifact filtering for high-throughput moderation.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScanDepth('deep')}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      scanDepth === 'deep'
                        ? 'border-cyan-500 bg-cyan-500/10 text-slate-900 dark:text-white ring-1 ring-cyan-500/40'
                        : 'border-slate-200 dark:border-navy-750 bg-slate-50 dark:bg-navy-850 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        Deep Multi-Layer Audit
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      </span>
                      <Layers className="w-4 h-4 text-cyan-500" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Multi-frame inspection. Frame-by-frame ViT inference, audio spectral cues & anomaly heatmaps.
                    </p>
                  </button>
                </div>

                {/* Modality Module Checkboxes */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-navy-800">
                  <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                    Target Forensic Modules
                  </span>

                  <div className="space-y-2 text-xs">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-cyan-500 transition-colors">
                        Spatial GAN/Diffusion Artifacts
                      </span>
                      <input
                        type="checkbox"
                        checked={modules.spatial}
                        onChange={(e) => setModules({ ...modules, spatial: e.target.checked })}
                        className="rounded border-slate-300 dark:border-navy-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-cyan-500 transition-colors">
                        Multi-Frame Temporal Sampling
                      </span>
                      <input
                        type="checkbox"
                        checked={modules.temporal}
                        onChange={(e) => setModules({ ...modules, temporal: e.target.checked })}
                        className="rounded border-slate-300 dark:border-navy-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-cyan-500 transition-colors">
                        Acoustic Frequency Analysis (Simulated)
                      </span>
                      <input
                        type="checkbox"
                        checked={modules.spectral}
                        onChange={(e) => setModules({ ...modules, spectral: e.target.checked })}
                        className="rounded border-slate-300 dark:border-navy-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-cyan-500 transition-colors">
                        EXIF & Metadata Header Inspection
                      </span>
                      <input
                        type="checkbox"
                        checked={modules.provenance}
                        onChange={(e) => setModules({ ...modules, provenance: e.target.checked })}
                        className="rounded border-slate-300 dark:border-navy-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Analyze Trigger Button */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!isReadyToAnalyze || isScanning}
                    onClick={handleStartAnalysis}
                    leftIcon={<Fingerprint className="w-5 h-5" />}
                    className="w-full justify-center shadow-glow-cyan text-sm sm:text-base font-bold py-3.5"
                  >
                    Run Forensic Scan
                  </Button>

                  {!isReadyToAnalyze && (
                    <p className="text-[11px] text-center text-slate-400 mt-2 font-mono">
                      Upload media above to enable analysis
                    </p>
                  )}
                </div>
              </Card>

              {/* Zero-Retention Privacy Pillar */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Strict Zero-Retention Guarantee</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  All media is processed ephemerally in RAM sandboxes and purged immediately upon report generation. No persistent storage or training logs.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
