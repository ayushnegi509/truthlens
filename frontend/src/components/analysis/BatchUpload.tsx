import React, { useState, useRef } from 'react';
import { 
  Layers, 
  X, 
  FileVideo, 
  FileAudio, 
  ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { ValidatedMediaFile } from '../../types/analysis';
import { validateMediaFile, formatFileSize } from '../../utils/fileValidation';

interface BatchUploadProps {
  files: ValidatedMediaFile[];
  onFilesChanged: (files: ValidatedMediaFile[]) => void;
  disabled?: boolean;
}

export const BatchUpload: React.FC<BatchUploadProps> = ({
  files,
  onFilesChanged,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
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

  const handleFiles = async (fileList: FileList | File[]) => {
    setBatchError(null);
    setIsProcessing(true);

    try {
      const newItems: ValidatedMediaFile[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const validated = await validateMediaFile(file, 'file');
        newItems.push(validated);
      }

      // Check cumulative batch size
      const totalSize = [...files, ...newItems].reduce((acc, f) => acc + f.size, 0);
      const MAX_BATCH_BYTES = 500 * 1024 * 1024; // 500 MB

      if (totalSize > MAX_BATCH_BYTES) {
        setBatchError(`Batch exceeds maximum total size of 500 MB (${formatFileSize(totalSize)}).`);
      } else {
        onFilesChanged([...files, ...newItems]);
      }
    } catch (err: any) {
      setBatchError(err?.message || 'Error processing batch files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    onFilesChanged(files.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    onFilesChanged([]);
  };

  const validCount = files.filter((f) => f.status === 'valid').length;
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FileVideo className="w-4 h-4 text-blue-400" />;
      case 'audio':
        return <FileAudio className="w-4 h-4 text-amber-400" />;
      default:
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Batch error alert */}
      {batchError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{batchError}</div>
        </div>
      )}

      {/* Multi-file Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900/60 hover:border-cyan-500/60 dark:hover:border-navy-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/avi,audio/mpeg,audio/wav,audio/aac,audio/flac,audio/ogg,image/png,image/jpeg,image/webp,image/tiff,image/bmp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Layers className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Select or Drop Multiple Files for Batch Forensic Inspection
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload multiple videos, voice memos, or images simultaneously (Up to 500 MB total).
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
            <span>Video (≤250MB)</span>
            <span>•</span>
            <span>Audio (≤50MB)</span>
            <span>•</span>
            <span>Images (≤25MB)</span>
          </div>
        </div>
      </div>

      {/* Queue List */}
      {files.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Batch Intake Queue
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-500">
                {files.length} file{files.length > 1 ? 's' : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={clearAll}
              disabled={disabled}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200/60 dark:border-navy-800 text-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-navy-900 flex items-center justify-center shrink-0">
                    {getMediaIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{file.formattedSize}</span>
                      <span>•</span>
                      <span className="uppercase">{file.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {file.status === 'valid' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  ) : (
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-500 flex items-center gap-1"
                      title={file.error}
                    >
                      <AlertCircle className="w-3 h-3" /> Invalid
                    </span>
                  )}

                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Batch Summary Footer */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <div>
              Total: <strong className="text-slate-900 dark:text-white">{validCount} valid</strong> of {files.length} ({formatFileSize(totalSizeBytes)})
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>All items pre-hashed in parallel</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
