import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { HistoryStats } from '../components/history/HistoryStats';
import { HistoryTable } from '../components/history/HistoryTable';
import { ScanHistoryItem } from '../types/history';
import { AnalyzeResponse } from '../types/analysis';
import { 
  getScanHistory, 
  deleteScanItem, 
  clearAllScanHistory 
} from '../services/historyService';
import { 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  Fingerprint, 
  Lock,
  RefreshCw
} from 'lucide-react';

interface HistoryPageProps {
  onNavigateHome: () => void;
  onNavigateToScanner: () => void;
  onNavigateToResult?: (result: AnalyzeResponse) => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToLearn?: () => void;
  onNavigateToHelp?: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onNavigateHome,
  onNavigateToScanner,
  onNavigateToResult,
  onNavigateToPrivacy,
  onNavigateToLearn,
  onNavigateToHelp,
}) => {
  const [historyItems, setHistoryItems] = useState<ScanHistoryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHistory = () => {
    setIsRefreshing(true);
    const items = getScanHistory();
    setHistoryItems(items);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeleteItem = (id: string) => {
    const updated = deleteScanItem(id);
    setHistoryItems(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all historical scan records from local storage?')) {
      clearAllScanHistory();
      setHistoryItems([]);
    }
  };

  const handleViewItem = (item: ScanHistoryItem) => {
    if (item.rawResponse && onNavigateToResult) {
      onNavigateToResult(item.rawResponse);
    } else {
      // Reconstruct minimal response to view in ResultView
      const reconstructed: AnalyzeResponse = {
        ai_probability: item.aiProbability,
        verdict: item.verdict,
        confidence: item.confidence,
        breakdown: item.breakdown,
        flagged_segments: [],
        input_type: item.inputType,
        media_name: item.mediaName,
        sha256: item.sha256,
        demo_mode: item.demoMode,
      };
      if (onNavigateToResult) {
        onNavigateToResult(reconstructed);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar 
        onScanClick={onNavigateToScanner} 
        onHomeClick={onNavigateHome}
        onHistoryClick={() => {}}
        onPrivacyClick={onNavigateToPrivacy}
        onLearnClick={onNavigateToLearn}
        onHelpClick={onNavigateToHelp}
        currentPage="history"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-navy-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1 hover:text-cyan-500 transition-colors cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <Clock className="w-4 h-4" />
              <span>Audit Records & Telemetry</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Scan History & Forensics
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Inspect historical neural deepfake scans, synthetic probability trends, and forensic breakdown records stored in your browser session.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadHistory}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>

            {onNavigateToPrivacy && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onNavigateToPrivacy}
                leftIcon={<Lock className="w-3.5 h-3.5 text-emerald-500" />}
              >
                Privacy Center
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToScanner}
              leftIcon={<Fingerprint className="w-4 h-4" />}
            >
              New Scan
            </Button>
          </div>
        </div>

        {/* 1. Recharts Stats Dashboard */}
        <HistoryStats items={historyItems} />

        {/* 2. Interactive Search & Filter History Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Inspection Registry ({historyItems.length})
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Local Storage Encrypted Persistence</span>
            </div>
          </div>

          <HistoryTable
            items={historyItems}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
            onViewItem={handleViewItem}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
