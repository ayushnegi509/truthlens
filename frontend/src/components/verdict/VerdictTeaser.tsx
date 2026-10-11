import React, { useState } from 'react';
import { VerdictBar, getVerdictCategory } from './VerdictBar';
import { Card } from '../common/Card';
import { 
  Video, 
  Mic, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SampleCase {
  id: string;
  title: string;
  mediaType: 'video' | 'audio' | 'image';
  score: number;
  icon: React.ReactNode;
  tags: string[];
  forensicHighlights: {
    label: string;
    result: string;
    status: 'good' | 'warning' | 'bad';
  }[];
}

const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'authentic',
    title: 'Authentic 4K Press Briefing',
    mediaType: 'video',
    score: 8,
    icon: <Video className="w-4 h-4" />,
    tags: ['MP4 Video', 'Original Sensor', '24fps'],
    forensicHighlights: [
      { label: 'Optical Sensor Pattern', result: 'Natural CMOS sensor noise profile', status: 'good' },
      { label: 'Eye Blink & Micro-Tremors', result: 'Normal biological cadence (18/min)', status: 'good' },
      { label: 'Lip-Sync Acoustic Match', result: '99.4% cross-spectral alignment', status: 'good' },
    ],
  },
  {
    id: 'suspicious',
    title: 'Dubbed Face-Swap Clip',
    mediaType: 'video',
    score: 54,
    icon: <Video className="w-4 h-4" />,
    tags: ['MOV Video', 'Boundary Warping', 'Possible Dub'],
    forensicHighlights: [
      { label: 'Boundary Edge Blending', result: 'Spatial gradient blur detected along perimeter', status: 'warning' },
      { label: 'Lighting & Specular Reflection', result: 'Minor ambient shadow vector offset', status: 'warning' },
      { label: 'Audio-Visual Phoneme Sync', result: 'Subtle 120ms lag at bilabial stops', status: 'warning' },
    ],
  },
  {
    id: 'deepfake',
    title: 'Synthetic Voice & Diffusion Clone',
    mediaType: 'audio',
    score: 91,
    icon: <Mic className="w-4 h-4" />,
    tags: ['WAV Audio', 'Synthetic Vocoder', 'Cloned Voice'],
    forensicHighlights: [
      { label: 'Acoustic Harmonic Grid', result: 'Periodic spectral synthesis artifacts', status: 'bad' },
      { label: 'Synthetic Pitch Jitter', result: 'Unnatural pitch contours & flat breath', status: 'bad' },
      { label: 'Spectral Phase Discontinuity', result: 'High-frequency phase collapse at 8kHz+', status: 'bad' },
    ],
  },
];

export const VerdictTeaser: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<SampleCase>(SAMPLE_CASES[0]);
  const [manualScore, setManualScore] = useState<number>(selectedCase.score);
  const [isManual, setIsManual] = useState<boolean>(false);

  const activeScore = isManual ? manualScore : selectedCase.score;
  const verdict = getVerdictCategory(activeScore);

  const handleSelectCase = (sample: SampleCase) => {
    setSelectedCase(sample);
    setManualScore(sample.score);
    setIsManual(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualScore(Number(e.target.value));
    setIsManual(true);
  };

  return (
    <Card 
      variant="glass" 
      className="p-1 rounded-3xl border border-slate-200/90 dark:border-navy-700/80 shadow-2xl overflow-hidden"
    >
      <div className="bg-slate-50/90 dark:bg-navy-900/90 rounded-[22px] p-6 sm:p-8 space-y-6">
        {/* Header with Case Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-navy-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Forensic Simulation</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Signature Verdict Bar in Action
            </h3>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 self-start sm:self-auto">
            {SAMPLE_CASES.map((sample) => {
              const isActive = !isManual && selectedCase.id === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectCase(sample)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                    isActive
                      ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {sample.icon}
                  <span className="capitalize">{sample.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Verdict Bar Component */}
        <div className="space-y-4">
          <VerdictBar score={activeScore} size="lg" />

          {/* Interactive Slider to scrub score */}
          <div className="pt-2 flex items-center gap-3 bg-slate-100/80 dark:bg-navy-950/60 p-3 rounded-xl border border-slate-200 dark:border-navy-800">
            <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">0%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={activeScore}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-xs text-slate-500 font-mono">100%</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-navy-900 px-2 py-1 rounded border border-slate-200 dark:border-navy-700">
              {activeScore}%
            </span>
          </div>
        </div>

        {/* Inspection Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Verdict Summary Box */}
          <div className={cn('p-4 rounded-xl border flex flex-col justify-between', verdict.bgClass, verdict.borderClass)}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                {verdict.icon}
                <span className={cn('font-bold text-sm', verdict.textClass)}>
                  {verdict.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {verdict.sublabel}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-navy-700/60 flex items-baseline justify-between">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                Confidence
              </span>
              <span className={cn('text-lg font-extrabold font-mono', verdict.textClass)}>
                {activeScore > 50 ? `${activeScore}% Synthetic` : `${100 - activeScore}% Natural`}
              </span>
            </div>
          </div>

          {/* Forensic Decomposition Highlights */}
          <div className="md:col-span-2 bg-white dark:bg-navy-850 p-4 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Neural Forensic Breakdown: {selectedCase.title}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-900 text-slate-500">
                {selectedCase.tags.join(' • ')}
              </span>
            </div>

            <div className="space-y-2">
              {selectedCase.forensicHighlights.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-start justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-navy-900/60 border border-slate-100 dark:border-navy-800/60"
                >
                  <div className="flex items-center gap-2">
                    {item.status === 'good' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                    {item.status === 'warning' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    {item.status === 'bad' && (
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-right">
                    {item.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
