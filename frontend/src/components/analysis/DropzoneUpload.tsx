import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileVideo, 
  FileAudio, 
  ImageIcon, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import { validateMediaFile } from '../../utils/fileValidation';
import { ValidatedMediaFile } from '../../types/analysis';

interface DropzoneUploadProps {
  onFileSelected: (media: ValidatedMediaFile) => void;
  disabled?: boolean;
}

export const DropzoneUpload: React.FC<DropzoneUploadProps> = ({
  onFileSelected,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setValidationError(null);
    try {
      const validated = await validateMediaFile(file, 'file');
      if (validated.status === 'invalid') {
        setValidationError(validated.error || 'Failed to validate file.');
      } else {
        onFileSelected(validated);
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Error processing file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Validation Error:</span>
            <p>{validationError}</p>
          </div>
        </div>
      )}

      {/* Main Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01] shadow-glow-cyan'
            : 'border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900/60 hover:border-cyan-500/60 dark:hover:border-navy-600 hover:bg-slate-50/50 dark:hover:bg-navy-850/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/avi,audio/mpeg,audio/wav,audio/aac,audio/flac,audio/ogg,image/png,image/jpeg,image/webp,image/tiff,image/bmp"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Animated Cloud Icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 text-cyan-500 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Drop media file here, or <span className="text-cyan-500 underline decoration-cyan-500/50 hover:decoration-cyan-500">browse</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Drag video, voice recording, or photos directly to initiate client-side cryptographic hashing.
            </p>
          </div>

          {/* Supported Format Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full max-w-lg pt-2 text-xs font-mono">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800 text-slate-700 dark:text-slate-300">
              <FileVideo className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Video</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">MP4, MOV (≤250MB)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800 text-slate-700 dark:text-slate-300">
              <FileAudio className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Audio</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">WAV, MP3 (≤50MB)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800 text-slate-700 dark:text-slate-300">
              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Image</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">PNG, JPG (≤25MB)</div>
              </div>
            </div>
          </div>

          {/* Privacy badge */}
          <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero-retention ephemeral memory • Client pre-hashing active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
