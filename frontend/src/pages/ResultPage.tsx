import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ResultView } from '../components/analysis/ResultView';
import { AnalyzeResponse, ValidatedMediaFile } from '../types/analysis';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export interface ResultPageProps {
  result: AnalyzeResponse | null;
  error?: string | null;
  isRetrying?: boolean;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  onNavigateToScanner?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToLearn?: () => void;
  onNavigateToHelp?: () => void;
  mediaFile?: ValidatedMediaFile | null;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  result,
  error,
  isRetrying = false,
  onRetry,
  onNavigateHome,
  onNavigateToScanner,
  onNavigateToHistory,
  onNavigateToPrivacy,
  onNavigateToLearn,
  onNavigateToHelp,
  mediaFile,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar 
        onScanClick={onNavigateToScanner} 
        onHomeClick={onNavigateHome} 
        onHistoryClick={onNavigateToHistory}
        onPrivacyClick={onNavigateToPrivacy}
        onLearnClick={onNavigateToLearn}
        onHelpClick={onNavigateToHelp}
        currentPage="result"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-navy-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              {onNavigateToScanner && (
                <button
                  onClick={onNavigateToScanner}
                  className="flex items-center gap-1 hover:text-cyan-500 transition-colors cursor-pointer mr-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Intake Scanner</span>
                </button>
              )}
              <ShieldCheck className="w-4 h-4" />
              <span>Dedicated Forensic Verdict Dashboard</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Forensic Verification Assessment
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Cryptographic, spectral, and neural synthesis indicators evaluated against reference forensic benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>Full Audit Report</span>
            </div>
          </div>
        </div>

        {/* Dedicated Result View */}
        <ResultView
          result={result}
          error={error}
          isRetrying={isRetrying}
          onRetry={onRetry}
          onReset={onNavigateToScanner}
          mediaFile={mediaFile}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
