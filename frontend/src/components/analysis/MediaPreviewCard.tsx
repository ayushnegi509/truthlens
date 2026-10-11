import React, { useState } from 'react';
import { ValidatedMediaFile } from '../../types/analysis';
import { 
  FileVideo, 
  FileAudio, 
  ImageIcon, 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Maximize2, 
  Info 
} from 'lucide-react';

interface MediaPreviewCardProps {
  media: ValidatedMediaFile;
  onRemove: () => void;
  disabled?: boolean;
}

export const MediaPreviewCard: React.FC<MediaPreviewCardProps> = ({
  media,
  onRemove,
  disabled = false,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(media.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getMediaIcon = () => {
    switch (media.type) {
      case 'video':
        return <FileVideo className="w-5 h-5 text-blue-400" />;
      case 'audio':
        return <FileAudio className="w-5 h-5 text-amber-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 rounded-2xl overflow-hidden shadow-lg transition-all animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-navy-850 border-b border-slate-200/80 dark:border-navy-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
            {getMediaIcon()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {media.name}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span>{media.formattedSize}</span>
              <span>•</span>
              <span className="uppercase text-cyan-600 dark:text-cyan-400 font-semibold">
                {media.mimeType}
              </span>
              <span>•</span>
              <span className="text-emerald-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Integrity Validated
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-navy-750 transition-colors"
            title="Toggle Forensic Metadata"
          >
            <Info className="w-4 h-4" />
          </button>
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Remove media"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Media Preview Box */}
      <div className="p-4 sm:p-6 bg-slate-100/50 dark:bg-navy-950/70 flex flex-col items-center justify-center min-h-[220px] max-h-[360px] overflow-hidden relative group">
        {media.type === 'video' && (
          <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-md bg-black relative flex items-center justify-center max-h-[320px]">
            <video
              src={media.previewUrl}
              controls
              className="w-full max-h-[300px] object-contain rounded-xl"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {media.type === 'image' && (
          <div className="relative max-w-xl max-h-[300px] overflow-hidden rounded-xl border border-slate-200 dark:border-navy-800 shadow-md flex items-center justify-center bg-slate-900/10 dark:bg-navy-900">
            <img
              src={media.previewUrl}
              alt={media.name}
              className="max-h-[300px] w-auto object-contain rounded-xl"
            />
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur text-[10px] font-mono text-white flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              <span>Full RGB Spatial Layer</span>
            </div>
          </div>
        )}

        {media.type === 'audio' && (
          <div className="w-full max-w-lg p-6 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                    {media.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Acoustic Spectral Stream ({media.formattedSize})
                  </p>
                </div>
              </div>

              <div className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                WAV/PCM Format
              </div>
            </div>

            {/* Simulated Animated Waveform Bars */}
            <div className="h-14 flex items-end gap-1 px-2 py-1 bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200/70 dark:border-navy-800/80 overflow-hidden">
              {[20, 35, 65, 45, 90, 80, 50, 75, 40, 60, 85, 95, 70, 55, 30, 80, 60, 45, 90, 75, 35, 50, 70, 85, 40, 65, 90, 55, 30, 45, 60, 75].map(
                (height, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-full bg-gradient-to-t from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{
                      height: `${height}%`,
                      opacity: isPlaying ? 0.9 : 0.4,
                      animation: isPlaying ? `pulse 1.2s ease-in-out ${idx * 0.05}s infinite alternate` : 'none',
                    }}
                  />
                )
              )}
            </div>

            {/* Standard Audio Player Controls */}
            <audio
              src={media.previewUrl}
              controls
              className="w-full h-10 rounded-lg accent-cyan-500"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}
      </div>

      {/* Forensic Hash & Metadata Bar */}
      <div className="p-4 bg-slate-50 dark:bg-navy-900 border-t border-slate-200/80 dark:border-navy-800 text-xs font-mono space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-navy-400">
              SHA-256:
            </span>
            <span className="text-slate-800 dark:text-cyan-300/90 truncate max-w-xs sm:max-w-sm">
              {media.hash}
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="p-1 hover:text-cyan-500 transition-colors shrink-0"
              title="Copy hash checksum"
            >
              {copiedHash ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Lock className="w-3 h-3" /> Ephemeral RAM
            </span>
            <span>•</span>
            <span>Client pre-hashed</span>
          </div>
        </div>

        {/* Extended Metadata drawer */}
        {showMetadata && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-400 animate-in fade-in">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-navy-950">
              <div className="text-[10px] text-slate-400 uppercase">Modality</div>
              <div className="font-bold text-slate-900 dark:text-white capitalize">{media.type}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-navy-950">
              <div className="text-[10px] text-slate-400 uppercase">File Size</div>
              <div className="font-bold text-slate-900 dark:text-white">{media.formattedSize}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-navy-950">
              <div className="text-[10px] text-slate-400 uppercase">Source Intake</div>
              <div className="font-bold text-slate-900 dark:text-white capitalize">{media.sourceType}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-navy-950">
              <div className="text-[10px] text-slate-400 uppercase">Integrity Status</div>
              <div className="font-bold text-emerald-500">Verified</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
