import React from 'react';
import { AnalysisTab } from '../../types/analysis';
import { UploadCloud, Link2, Radio, Layers } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AnalysisTabsProps {
  activeTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
  disabled?: boolean;
  batchCount?: number;
}

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  activeTab,
  onTabChange,
  disabled = false,
  batchCount = 0,
}) => {
  const tabs: {
    id: AnalysisTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      id: 'upload',
      label: 'Upload Media',
      sublabel: 'Video, Audio, Image',
      icon: <UploadCloud className="w-4 h-4" />,
    },
    {
      id: 'link',
      label: 'Paste Link',
      sublabel: 'Web URL / Streaming',
      icon: <Link2 className="w-4 h-4" />,
    },
    {
      id: 'record',
      label: 'Record Live',
      sublabel: 'Webcam & Microphone',
      icon: <Radio className="w-4 h-4" />,
    },
    {
      id: 'batch',
      label: 'Batch Upload',
      sublabel: 'Multi-File Inspection',
      icon: <Layers className="w-4 h-4" />,
      badge: batchCount > 0 ? batchCount : undefined,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-navy-950/80 rounded-2xl border border-slate-200/80 dark:border-navy-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={disabled}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
                isActive
                  ? 'bg-white dark:bg-navy-850 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-navy-700/90'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-navy-900/60',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Icon Container */}
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200',
                  isActive
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-200/70 dark:bg-navy-800 text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 group-hover:bg-cyan-500/10'
                )}
              >
                {tab.icon}
              </div>

              {/* Labels */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                  {tab.sublabel}
                </span>
              </div>

              {/* Active Pill Indicator */}
              {isActive && (
                <div className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-cyan-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
