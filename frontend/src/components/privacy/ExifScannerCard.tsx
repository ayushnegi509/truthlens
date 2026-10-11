import React, { useState } from 'react';
import { 
  FileSearch, 
  MapPin, 
  Smartphone, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  UploadCloud, 
  Sparkles, 
  Camera, 
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { extractExifMetadata } from '../../utils/exifScanner';
import { ExifMetadataResult } from '../../types/history';

export const ExifScannerCard: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [exifResult, setExifResult] = useState<ExifMetadataResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsScanning(true);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const result = await extractExifMetadata(file);
      setExifResult(result);
    } catch (err) {
      console.error('EXIF scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSamplePhoto = () => {
    // Generate a dummy File that triggers simulated camera photo with GPS
    const dummyBlob = new Blob(['sample-jpeg-payload'], { type: 'image/jpeg' });
    const sampleFile = new File([dummyBlob], 'sample_camera_photo_with_gps.jpg', { type: 'image/jpeg' });
    handleFile(sampleFile);
  };

  const clearScan = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setExifResult(null);
  };

  const getRiskBadge = (level: ExifMetadataResult['riskLevel']) => {
    switch (level) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>CRITICAL PRIVACY LEAK</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>HIGH RISK DETECTED</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4" />
            <span>MODERATE METADATA EXPOSURE</span>
          </span>
        );
      case 'clean':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>CLEAN / STRIPPED (SAFE)</span>
          </span>
        );
    }
  };

  return (
    <Card variant="default" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-navy-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <FileSearch className="w-4 h-4" />
            <span>Client-Side Metadata Audit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Metadata & EXIF Privacy Scanner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Upload an image to reveal hidden GPS coordinates, hardware serial identifiers, and camera settings embedded within the file before sharing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadSamplePhoto}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
          >
            Load Sample Photo
          </Button>
        </div>
      </div>

      {/* Upload Dropzone */}
      {!exifResult ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
              : 'border-slate-300 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/50 hover:border-cyan-500/50'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Drag and drop any photo to audit EXIF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports JPG, JPEG, TIFF, PNG. Files are inspected 100% locally in your browser.
              </p>
            </div>

            <label className="inline-block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/tiff"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-md transition-all">
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning EXIF Headers...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Browse Photo
                  </>
                )}
              </span>
            </label>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Status Header */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getRiskBadge(exifResult.riskLevel)}
                <span className="text-xs font-mono text-slate-400">{exifResult.formattedSize}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                {exifResult.fileName}
              </h3>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={clearScan}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Scan Another Photo
            </Button>
          </div>

          {/* Privacy Vulnerability Warnings */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Privacy Vulnerability Diagnostics
            </h4>

            <div className="space-y-2">
              {exifResult.privacyRisks.map((risk, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    exifResult.riskLevel === 'critical'
                      ? 'bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-300'
                      : exifResult.riskLevel === 'high'
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {exifResult.riskLevel === 'critical' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  ) : exifResult.riskLevel === 'clean' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed font-medium">{risk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* GPS Location Box */}
            <Card variant="default" className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Geographical GPS Data</span>
              </div>

              {exifResult.hasGps && exifResult.coordinates ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 font-mono text-[11px] text-rose-600 dark:text-rose-400 space-y-1">
                    <div>Lat: <strong>{exifResult.coordinates.latitude.toFixed(6)}</strong></div>
                    <div>Lon: <strong>{exifResult.coordinates.longitude.toFixed(6)}</strong></div>
                    {exifResult.coordinates.altitude && <div>Alt: {exifResult.coordinates.altitude}m</div>}
                  </div>

                  {exifResult.coordinates.locationNameApprox && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Approximate Area: <strong className="text-slate-800 dark:text-slate-200">{exifResult.coordinates.locationNameApprox}</strong>
                    </p>
                  )}

                  {exifResult.coordinates.mapsUrl && (
                    <a
                      href={exifResult.coordinates.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:underline pt-1 font-medium"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  ✓ No GPS coordinates found. Location is not exposed.
                </p>
              )}
            </Card>

            {/* Hardware / Device Fingerprint Box */}
            <Card variant="default" className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Hardware Device Info</span>
              </div>

              {exifResult.device ? (
                <div className="space-y-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                  {exifResult.device.make && (
                    <div className="flex justify-between border-b border-slate-100 dark:border-navy-800 py-1">
                      <span className="text-slate-400">Make:</span>
                      <strong>{exifResult.device.make}</strong>
                    </div>
                  )}
                  {exifResult.device.model && (
                    <div className="flex justify-between border-b border-slate-100 dark:border-navy-800 py-1">
                      <span className="text-slate-400">Model:</span>
                      <strong>{exifResult.device.model}</strong>
                    </div>
                  )}
                  {exifResult.device.software && (
                    <div className="flex justify-between border-b border-slate-100 dark:border-navy-800 py-1">
                      <span className="text-slate-400">OS / Software:</span>
                      <strong>{exifResult.device.software}</strong>
                    </div>
                  )}
                  {exifResult.device.lensModel && (
                    <div className="text-[11px] text-slate-400 pt-1 line-clamp-2">
                      Lens: {exifResult.device.lensModel}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  ✓ Device make & model stripped or unavailable.
                </p>
              )}
            </Card>

            {/* Timestamp & Capture Parameters */}
            <Card variant="default" className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Calendar className="w-4 h-4 text-cyan-500" />
                <span>Capture Timestamp & Camera</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                {exifResult.captureDate ? (
                  <div className="flex justify-between border-b border-slate-100 dark:border-navy-800 py-1">
                    <span className="text-slate-400">Timestamp:</span>
                    <strong>{exifResult.captureDate}</strong>
                  </div>
                ) : (
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs py-1">
                    ✓ Capture time metadata scrubbed.
                  </p>
                )}

                {exifResult.cameraSettings && (
                  <>
                    {exifResult.cameraSettings.aperture && (
                      <div className="flex justify-between border-b border-slate-100 dark:border-navy-800 py-1">
                        <span className="text-slate-400">Aperture:</span>
                        <span>{exifResult.cameraSettings.aperture}</span>
                      </div>
                    )}
                    {exifResult.cameraSettings.iso && (
                      <div className="flex justify-between border-b border-slate-100 dark:border-navy-800 py-1">
                        <span className="text-slate-400">ISO:</span>
                        <span>{exifResult.cameraSettings.iso}</span>
                      </div>
                    )}
                    {exifResult.cameraSettings.exposureTime && (
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Exposure:</span>
                        <span>{exifResult.cameraSettings.exposureTime}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Raw Tag Drawer */}
          {Object.keys(exifResult.rawTags).length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Raw EXIF Headers ({Object.keys(exifResult.rawTags).length} tags)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                {Object.entries(exifResult.rawTags).map(([key, val]) => (
                  <div key={key} className="bg-slate-900 p-2 rounded border border-slate-800 truncate">
                    <span className="text-cyan-400">{key}:</span>{' '}
                    <span className="text-slate-200">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
