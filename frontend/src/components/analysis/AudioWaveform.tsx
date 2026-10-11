import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity
} from 'lucide-react';
import { AnalyzeResponse, FlaggedSegment } from '../../types/analysis';

export interface AudioWaveformProps {
  result: AnalyzeResponse;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0); // in seconds
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  // Total duration in seconds
  const totalDuration = result.flagged_segments.length > 0
    ? Math.max(...result.flagged_segments.map((s) => s.end_time), 10)
    : 10;

  // Number of visual waveform bars
  const barCount = 48;

  // Generate reproducible bar heights based on media sha256 or audio score
  const bars = React.useMemo(() => {
    const list: { height: number; timeSec: number }[] = [];
    const seed = parseInt(result.sha256.substring(0, 8), 16) || 42;
    for (let i = 0; i < barCount; i++) {
      const timeSec = (i / barCount) * totalDuration;
      // pseudo random harmonic fluctuation
      const raw = Math.sin(i * 0.45 + (seed % 10)) * 0.4 + Math.cos(i * 0.8) * 0.3 + 0.45;
      const height = Math.max(15, Math.min(95, Math.round(raw * 90)));
      list.push({ height, timeSec });
    }
    return list;
  }, [result.sha256, totalDuration]);

  // Simulated audio playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return parseFloat((prev + 0.2).toFixed(1));
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Check if a time falls inside any flagged segment
  const getFlaggedSegmentAtTime = (timeSec: number): FlaggedSegment | undefined => {
    return result.flagged_segments.find(
      (s) => timeSec >= s.start_time && timeSec <= s.end_time
    );
  };

  const currentSegment = getFlaggedSegmentAtTime(playbackTime);

  return (
    <Card variant="default" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Acoustic Waveform & Spectral Anomalies
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            HiFi-GAN vocoder frequencies, synthetic pitch flatness, and flagged temporal audio segments
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-white font-mono text-xs font-bold hover:bg-cyan-600 transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/30 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Audio' : 'Play Acoustic Track'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaybackTime(0);
              setIsPlaying(false);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors cursor-pointer"
            title="Reset playback"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Waveform Visual Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
        {/* Upper Track Info Header */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Mel-Spectrogram Window: 1024 / Hop: 256</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-cyan-400">
            <span>{playbackTime.toFixed(1)}s</span>
            <span className="text-slate-600">/</span>
            <span>{totalDuration.toFixed(1)}s</span>
          </div>
        </div>

        {/* Waveform Bars Container */}
        <div className="relative h-32 flex items-center justify-between gap-1 px-2 select-none">
          {/* Progress Playhead Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-30 transition-all pointer-events-none shadow-glow-cyan"
            style={{ left: `${(playbackTime / totalDuration) * 100}%` }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 -translate-x-[3px] -mt-1 ring-2 ring-white" />
          </div>

          {/* Continuous Flagged Segment Underlay Zones */}
          {result.flagged_segments.map((seg, idx) => {
            const leftPct = (seg.start_time / totalDuration) * 100;
            const widthPct = ((seg.end_time - seg.start_time) / totalDuration) * 100;
            const isHovered = activeSegmentIndex === idx;

            const zoneBg =
              seg.severity === 'high'
                ? 'bg-rose-500/20 border-rose-500/50'
                : seg.severity === 'medium'
                ? 'bg-amber-500/20 border-amber-500/50'
                : 'bg-emerald-500/20 border-emerald-500/50';

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveSegmentIndex(idx)}
                onMouseLeave={() => setActiveSegmentIndex(null)}
                onClick={() => setPlaybackTime(seg.start_time)}
                className={`absolute top-0 bottom-0 rounded-xl border border-dashed transition-all cursor-pointer z-10 ${zoneBg} ${
                  isHovered ? 'ring-2 ring-cyan-400 scale-[1.01]' : ''
                }`}
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                }}
                title={`${seg.description} (${seg.start_time.toFixed(1)}s - ${seg.end_time.toFixed(1)}s)`}
              >
                <div className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 text-white truncate max-w-[120px]">
                  {seg.severity.toUpperCase()}: {seg.score}%
                </div>
              </div>
            );
          })}

          {/* Frequency Bars */}
          {bars.map((bar, idx) => {
            const segment = getFlaggedSegmentAtTime(bar.timeSec);
            const isPlayed = bar.timeSec <= playbackTime;

            let barColor = 'bg-slate-700';
            if (segment) {
              if (segment.severity === 'high') {
                barColor = isPlayed ? 'bg-rose-400 shadow-rose-500/50' : 'bg-rose-600/70';
              } else if (segment.severity === 'medium') {
                barColor = isPlayed ? 'bg-amber-400 shadow-amber-500/50' : 'bg-amber-600/70';
              } else {
                barColor = isPlayed ? 'bg-emerald-400' : 'bg-emerald-600/70';
              }
            } else if (isPlayed) {
              barColor = 'bg-cyan-400 shadow-cyan-400/50';
            }

            return (
              <div
                key={idx}
                onClick={() => setPlaybackTime(bar.timeSec)}
                className="flex-1 flex flex-col items-center justify-center h-full cursor-pointer group/bar relative z-20"
              >
                <div
                  className={`w-full max-w-[5px] rounded-full transition-all duration-150 ${barColor}`}
                  style={{ height: `${bar.height}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Legend and Active Playhead Inspection Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Normal Acoustic Waveform</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Flagged Acoustic Anomaly</span>
            </span>
          </div>

          <div className="text-right">
            {currentSegment ? (
              <span className="text-rose-400 font-bold animate-pulse">
                Flagged Section: {currentSegment.description} ({currentSegment.score}%)
              </span>
            ) : (
              <span className="text-emerald-400">Harmonic profile stable at current timestamp</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
