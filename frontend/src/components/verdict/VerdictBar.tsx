import React from 'react';
import { cn } from '../../utils/cn';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export type VerdictStatus = 'authentic' | 'amber' | 'deepfake' | 'inconclusive';

export interface VerdictBarProps {
  score: number; // 0 to 100 representing synthetic / deepfake probability
  verdict?: 'authentic' | 'suspicious' | 'fake' | 'inconclusive';
  showMarker?: boolean;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export const getVerdictCategory = (
  score: number,
  explicitVerdict?: 'authentic' | 'suspicious' | 'fake' | 'inconclusive'
): {
  status: VerdictStatus;
  label: string;
  sublabel: string;
  colorClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  icon: React.ReactNode;
} => {
  if (explicitVerdict === 'inconclusive') {
    return {
      status: 'inconclusive',
      label: 'Inconclusive / Neutral',
      sublabel: 'No face detected, this model can only assess faces',
      colorClass: 'bg-slate-400 dark:bg-slate-500',
      textClass: 'text-slate-600 dark:text-slate-300',
      bgClass: 'bg-slate-500/10',
      borderClass: 'border-slate-400/30',
      icon: <AlertTriangle className="w-5 h-5 text-slate-400" />,
    };
  }

  if (score <= 25) {
    return {
      status: 'authentic',
      label: 'Authentic / Low Risk',
      sublabel: 'Natural sensor noise & temporal stability confirmed',
      colorClass: 'bg-emerald-500',
      textClass: 'text-emerald-500 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/30',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    };
  } else if (score <= 69) {
    return {
      status: 'amber',
      label: 'Suspicious / Inconclusive',
      sublabel: 'Spectral or boundary anomalies detected; forensic review advised',
      colorClass: 'bg-amber-500',
      textClass: 'text-amber-500 dark:text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    };
  } else {
    return {
      status: 'deepfake',
      label: 'Manipulated / AI-Generated',
      sublabel: 'High-confidence synthetic artifacts & generative markers',
      colorClass: 'bg-rose-500',
      textClass: 'text-rose-500 dark:text-rose-400',
      bgClass: 'bg-rose-500/10',
      borderClass: 'border-rose-500/30',
      icon: <AlertOctagon className="w-5 h-5 text-rose-500" />,
    };
  }
};

export const VerdictBar: React.FC<VerdictBarProps> = ({
  score,
  verdict: explicitVerdict,
  showMarker = true,
  showLabels = true,
  size = 'md',
  className,
}) => {
  // Clamped score
  const clampedScore = Math.max(0, Math.min(100, score));
  const verdict = getVerdictCategory(clampedScore, explicitVerdict);
  const isInconclusive = verdict.status === 'inconclusive';

  const heightClasses = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {/* Top Labels */}
      {showLabels && !isInconclusive && (
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>0-25% Authentic</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>26-69% Suspicious</span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>70-100% AI Deepfake</span>
          </div>
        </div>
      )}

      {showLabels && isInconclusive && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Inconclusive — Model can only assess faces</span>
          </div>
        </div>
      )}

      {/* Bar container */}
      <div className="relative">
        <div
          className={cn(
            'w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-navy-950 p-0.5 border border-slate-300 dark:border-navy-700/80 shadow-inner',
            heightClasses[size]
          )}
        >
          {isInconclusive ? (
            /* Neutral grey bar */
            <div
              className="w-full bg-gradient-to-r from-slate-400 via-slate-400 to-slate-400 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 rounded-full"
              title="Inconclusive (No face detected)"
            />
          ) : (
            <>
              {/* Green zone (25%) */}
              <div 
                className="w-[25%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full relative group"
                title="Authentic Zone (0-25%)"
              />
              {/* Amber zone (44%) */}
              <div 
                className="w-[44%] bg-gradient-to-r from-amber-400 to-amber-500 relative group"
                title="Suspicious Zone (26-69%)"
              />
              {/* Red zone (31%) */}
              <div 
                className="w-[31%] bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full relative group"
                title="Deepfake Zone (70-100%)"
              />
            </>
          )}
        </div>

        {/* Marker Needle */}
        {showMarker && !isInconclusive && (
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out pointer-events-none"
            style={{ left: `${clampedScore}%` }}
          >
            <div className="-translate-x-1/2 flex flex-col items-center">
              {/* Needle pin indicator */}
              <div className="w-5 h-5 rounded-full bg-white dark:bg-navy-900 border-2 border-slate-900 dark:border-white shadow-lg flex items-center justify-center ring-4 ring-cyan-500/20">
                <div className={cn('w-2 h-2 rounded-full', verdict.colorClass)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marker summary indicator */}
      {showMarker && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isInconclusive ? (
              <span>Assessment: <strong className="font-semibold text-slate-700 dark:text-slate-300">Inconclusive</strong></span>
            ) : (
              <>
                Current Marker: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{clampedScore}%</span> Synthetic Likelihood
              </>
            )}
          </span>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', verdict.bgClass, verdict.textClass, verdict.borderClass)}>
            {verdict.label}
          </span>
        </div>
      )}
    </div>
  );
};
