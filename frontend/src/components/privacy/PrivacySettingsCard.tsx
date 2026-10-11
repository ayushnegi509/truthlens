import React, { useState } from 'react';
import { 
  Lock, 
  Trash2, 
  EyeOff, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { RetentionPeriod, PrivacySettings } from '../../types/history';
import { 
  getPrivacySettings, 
  savePrivacySettings, 
  clearAllScanHistory 
} from '../../services/historyService';

interface PrivacySettingsCardProps {
  onSettingsChanged?: (settings: PrivacySettings) => void;
}

export const PrivacySettingsCard: React.FC<PrivacySettingsCardProps> = ({ onSettingsChanged }) => {
  const [settings, setSettings] = useState<PrivacySettings>(getPrivacySettings());
  const [savedNotification, setSavedNotification] = useState(false);

  const updateRetention = (retention: RetentionPeriod) => {
    const updated = savePrivacySettings({ retentionPeriod: retention });
    setSettings(updated);
    triggerSaved();
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  const updateToggle = (key: keyof PrivacySettings, val: boolean) => {
    const updated = savePrivacySettings({ [key]: val });
    setSettings(updated);
    triggerSaved();
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  const triggerSaved = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Wipe all locally stored forensic scans and inspection hashes immediately?')) {
      clearAllScanHistory();
      alert('Local scan history completely erased.');
    }
  };

  const retentionOptions: { value: RetentionPeriod; label: string; desc: string }[] = [
    { value: 'none', label: 'Zero Retention', desc: 'Never store history; flush immediately upon scan completion' },
    { value: 'session', label: 'Session Only', desc: 'Retain only for the current active browser session (<3 hrs)' },
    { value: '24h', label: '24 Hours', desc: 'Automatically purge records older than 24 hours' },
    { value: '7d', label: '7 Days', desc: 'Retain forensic audit history for up to one week' },
    { value: '30d', label: '30 Days', desc: 'Default enterprise retention window for active audits' },
    { value: 'forever', label: 'Unlimited', desc: 'Persist until manual deletion or local storage purge' },
  ];

  return (
    <Card variant="default" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-navy-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Local Governance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Data Retention & Export Privacy Controls
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control how long scan records exist on your device and sanitize sensitive facial identities in forensic PDF reports.
          </p>
        </div>

        {savedNotification && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </span>
        )}
      </div>

      {/* 1. History Retention Period Radio Group */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Scan History Retention Lifespan
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Determines when past scans stored in your browser's <code className="font-mono text-cyan-600 dark:text-cyan-400">localStorage</code> are automatically expunged.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {retentionOptions.map((opt) => {
            const isSelected = settings.retentionPeriod === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateRetention(opt.value)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white ring-1 ring-emerald-500/40 shadow-sm'
                    : 'border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-navy-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm">{opt.label}</span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border ${
                      isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Privacy Checkboxes / Toggles */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-navy-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-cyan-500" />
          <span>Report Anonymization & Protective Modifiers</span>
        </h3>

        <div className="space-y-3">
          {/* Face Blur Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                Face-Blur Option for Exported PDF Reports
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  Recommended
                </span>
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically masks and pixelates facial crop bounding boxes in generated forensic PDF reports to protect bystander identity and comply with GDPR / CCPA.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.faceBlurOnExport}
                onChange={(e) => updateToggle('faceBlurOnExport', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-navy-950 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-navy-700 peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Client Pre-Hashing Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Client-Side SHA-256 Pre-Hashing
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compute file checksums locally in browser prior to transmission to verify file integrity.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.clientSidePreHashingOnly}
                onChange={(e) => updateToggle('clientSidePreHashingOnly', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-navy-950 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-navy-700 peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Emergency Erase Local Data */}
      <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Emergency Local Storage Purge
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Instantly obliterate all scan records, cached forensic hashes, and metadata logs.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={handleClearHistory}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Purge All Local Records
        </Button>
      </div>
    </Card>
  );
};
