import { AnalyzeResponse, MediaType } from '../types/analysis';

export interface ScanHistoryItem {
  id: string;
  timestamp: string; // ISO string
  mediaName: string;
  mediaType: MediaType;
  inputType: 'file' | 'url';
  fileSize?: number;
  formattedSize?: string;
  sha256: string;
  aiProbability: number;
  verdict: 'authentic' | 'suspicious' | 'fake' | 'inconclusive';
  confidence: number;
  breakdown: {
    face: number;
    lip_sync: number;
    audio: number;
    texture: number;
    metadata: number;
  };
  flaggedSegmentsCount: number;
  demoMode: boolean;
  rawResponse?: AnalyzeResponse;
}

export type RetentionPeriod = 'session' | '24h' | '7d' | '30d' | 'forever' | 'none';

export interface PrivacySettings {
  retentionPeriod: RetentionPeriod;
  faceBlurOnExport: boolean;
  stripExifBeforeUpload: boolean;
  clientSidePreHashingOnly: boolean;
  shareAnonymizedMetrics: boolean;
  lastUpdated: string;
}

export interface ExifMetadataResult {
  fileName: string;
  fileSize: number;
  formattedSize: string;
  mimeType: string;
  dimensions?: { width: number; height: number };
  hasExif: boolean;
  hasGps: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    mapsUrl?: string;
    locationNameApprox?: string;
  };
  device?: {
    make?: string;
    model?: string;
    lensModel?: string;
    software?: string;
  };
  captureDate?: string;
  cameraSettings?: {
    iso?: number;
    focalLength?: string;
    aperture?: string;
    exposureTime?: string;
    flash?: string;
  };
  rawTags: Record<string, string | number | boolean>;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  privacyRisks: string[];
}
