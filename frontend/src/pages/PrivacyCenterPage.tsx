import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { PrivacySettingsCard } from '../components/privacy/PrivacySettingsCard';
import { ExifScannerCard } from '../components/privacy/ExifScannerCard';
import { DataHandlingExplainer } from '../components/privacy/DataHandlingExplainer';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Fingerprint
} from 'lucide-react';

interface PrivacyCenterPageProps {
  onNavigateHome: () => void;
  onNavigateToScanner: () => void;
  onNavigateToHistory: () => void;
  onNavigateToLearn?: () => void;
  onNavigateToHelp?: () => void;
}

export const PrivacyCenterPage: React.FC<PrivacyCenterPageProps> = ({
  onNavigateHome,
  onNavigateToScanner,
  onNavigateToHistory,
  onNavigateToLearn,
  onNavigateToHelp,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar 
        onScanClick={onNavigateToScanner} 
        onHomeClick={onNavigateHome}
        onHistoryClick={onNavigateToHistory}
        onPrivacyClick={() => {}}
        onLearnClick={onNavigateToLearn}
        onHelpClick={onNavigateToHelp}
        currentPage="privacy"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-navy-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1 hover:text-emerald-500 transition-colors cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <ShieldCheck className="w-4 h-4" />
              <span>Trust & Data Protection Core</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Privacy Center & Metadata Defense
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Audit image EXIF leaks, configure history retention schedules, mask faces on exported reports, and inspect our zero-retention runtime guarantees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToHistory}
            >
              View Scan History
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToScanner}
              leftIcon={<Fingerprint className="w-4 h-4" />}
            >
              Launch Scanner
            </Button>
          </div>
        </div>

        {/* 1. Retention Settings & Face-Blur Option */}
        <section id="retention-settings">
          <PrivacySettingsCard />
        </section>

        {/* 2. Metadata / EXIF Scanner Card */}
        <section id="exif-scanner">
          <ExifScannerCard />
        </section>

        {/* 3. Comprehensive Data Handling Architecture Explainer */}
        <section id="data-handling">
          <DataHandlingExplainer />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
