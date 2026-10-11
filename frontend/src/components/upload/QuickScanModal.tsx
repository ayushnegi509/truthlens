import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileVideo, 
  FileAudio, 
  ImageIcon, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../common/Button';

interface QuickScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAnalysis?: (file: File) => void;
}

export const QuickScanModal: React.FC<QuickScanModalProps> = ({ isOpen, onClose, onStartAnalysis }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanType, setScanType] = useState<'fast' | 'deep'>('deep');

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Forensic Intake Pipeline</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Analyze Media for Deepfake Artifacts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload video, audio, or high-res image to initiate multi-layer decomposition.
          </p>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragActive
              ? 'border-cyan-500 bg-cyan-500/5 scale-[1.01]'
              : 'border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950/60 hover:border-slate-400 dark:hover:border-navy-600'
          }`}
        >
          <input
            id="file-upload"
            type="file"
            accept="video/*,audio/*,image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for forensic parsing
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Drag and drop file here, or <span className="text-cyan-500 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports MP4, MOV, WAV, MP3, PNG, JPG, WEBP (up to 250 MB)
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <FileVideo className="w-3.5 h-3.5 text-blue-400" /> Video
              </span>
              <span className="flex items-center gap-1">
                <FileAudio className="w-3.5 h-3.5 text-amber-400" /> Audio
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Image
              </span>
            </div>
          </div>
        </div>

        {/* Scan Depth Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Forensic Scan Depth
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setScanType('fast')}
              className={`p-3 rounded-xl border text-left transition-all ${
                scanType === 'fast'
                  ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/10 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="font-bold text-xs">Standard Fast Scan</div>
              <div className="text-[11px] text-slate-500 mt-0.5">&lt;1.5s sub-second check</div>
            </button>

            <button
              type="button"
              onClick={() => setScanType('deep')}
              className={`p-3 rounded-xl border text-left transition-all ${
                scanType === 'deep'
                  ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/10 text-slate-900 dark:text-white ring-1 ring-cyan-500/30'
                  : 'border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-850 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5">
                Deep Forensic Audit
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Multi-frame sampled inspection</div>
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-navy-950 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-navy-800">
          <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong>Zero Retention:</strong> Media is processed ephemerally in RAM and wiped post-analysis.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              onClose();
              if (onStartAnalysis && selectedFile) {
                onStartAnalysis(selectedFile);
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            disabled={!selectedFile}
            onClick={() => {
              if (selectedFile && onStartAnalysis) {
                onStartAnalysis(selectedFile);
              }
              onClose();
            }}
          >
            Run Forensic Scan
          </Button>
        </div>
      </div>
    </div>
  );
};
