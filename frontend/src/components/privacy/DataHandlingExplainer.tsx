import React from 'react';
import { 
  ServerOff, 
  Cpu, 
  Lock, 
  HardDriveDownload, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck
} from 'lucide-react';
import { Card } from '../common/Card';

export const DataHandlingExplainer: React.FC = () => {
  return (
    <Card variant="default" className="p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-navy-800">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Security Protocol Architecture</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          TruthLens Data Handling & Zero-Retention Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          How media is processed, evaluated, and immediately purged. We believe forensic integrity requires uncompromising respect for data confidentiality.
        </p>
      </div>

      {/* 4 Process Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1 */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <HardDriveDownload className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-wider block">
            Phase 1 • Intake
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Client-Side Pre-Hashing
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Prior to upload, SHA-256 hashes are calculated client-side in the browser via Web Crypto APIs to verify file integrity.
          </p>
        </div>

        {/* Stage 2 */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-wider block">
            Phase 2 • Transport
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Encrypted TLS Transport
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Payloads are transmitted over encrypted TLS/HTTPS connections directly to the backend analysis endpoint.
          </p>
        </div>

        {/* Stage 3 */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider block">
            Phase 3 • Execution
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            RAM Sandbox Inspection
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Neural model weights execute in isolated volatile memory buffers. Files are never written to permanent disk or persistent object storage.
          </p>
        </div>

        {/* Stage 4 */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <ServerOff className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider block">
            Phase 4 • Disposal
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Immediate Buffer Purge
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The instant the JSON verdict payload is returned to your browser, temporary RAM memory buffers are zeroed and destroyed.
          </p>
        </div>
      </div>

      {/* 3 Core Assurances */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-500" />
          <span>Non-Negotiable Privacy Guarantees</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>No AI Model Training</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Your audio samples, voice clips, video recordings, and facial portraits are never used to train or fine-tune neural architectures.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Client-Side Local Storage</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              History logs exist exclusively on your personal browser machine using <code className="font-mono text-cyan-600 dark:text-cyan-400">localStorage</code>. We host zero centralized database of your scans.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>GDPR / CCPA Compliant</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Full user agency with instant local storage purge, configurable retention expiration dates, and face-blur report anonymization.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
