import React, { useState } from 'react';
import { 
  Link2, 
  AlertCircle, 
  Globe,
  UploadCloud,
  Info
} from 'lucide-react';
import { Button } from '../common/Button';
import { ValidatedMediaFile } from '../../types/analysis';

interface PasteLinkUploadProps {
  onMediaLoaded?: (media: ValidatedMediaFile) => void;
  disabled?: boolean;
}

export const PasteLinkUpload: React.FC<PasteLinkUploadProps> = ({
  disabled = false,
}) => {
  const [url, setUrl] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInfoMessage(
      'Link analysis is not available in this version. Download the file and upload it instead.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Informational Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong className="font-semibold block mb-0.5">Link Analysis Notice</strong>
          Link analysis is not available in this version. Download the file and upload it instead.
        </div>
      </div>

      {infoMessage && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-cyan-500" />
          <div>{infoMessage}</div>
        </div>
      )}

      {/* URL Input Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 shadow-md space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-500" />
            Media or Social Stream URL
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste a public media URL, YouTube, TikTok, X (Twitter), or CDN direct video/audio link.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="url"
              placeholder="https://example.com/stream/suspect_media.mp4"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setInfoMessage(null);
              }}
              disabled={disabled}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            disabled={disabled || !url.trim()}
            onClick={() => handleSubmit()}
            leftIcon={<UploadCloud className="w-4 h-4" />}
            className="sm:w-auto w-full"
          >
            Check URL
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
          <UploadCloud className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>
            To analyze this media with our deep learning face models, please save the target file to your device and use the <strong>Upload Media</strong> tab.
          </span>
        </div>
      </div>
    </div>
  );
};
