export type AnalysisTab = 'upload' | 'link' | 'record' | 'batch';

export type MediaType = 'video' | 'audio' | 'image';

export type ScanDepth = 'fast' | 'deep';

export interface ValidatedMediaFile {
  id: string;
  file?: File;
  name: string;
  size: number; // in bytes
  formattedSize: string;
  type: MediaType;
  mimeType: string;
  previewUrl: string;
  hash: string;
  dimensions?: { width: number; height: number };
  duration?: number; // in seconds
  status: 'valid' | 'invalid';
  error?: string;
  sourceType: 'file' | 'link' | 'recording';
  rawUrl?: string;
}

export interface ValidationRule {
  maxSizeMB: number;
  allowedExtensions: string[];
  allowedMimePrefixes: string[];
}

export type ScanPhase = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'completed';

export interface StepperStep {
  id: ScanPhase;
  title: string;
  description: string;
  estimatedDurationMs: number;
}

export interface ForensicLogMessage {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'forensic';
  text: string;
}

export interface BreakdownScores {
  face: number;
  lip_sync: number;
  audio: number;
  texture: number;
  metadata: number;
}

export interface AudioChunkScore {
  chunk_index?: number;
  start_time: number;
  end_time: number;
  score: number;
}

export interface FlaggedSegment {
  start_time: number;
  end_time: number;
  description: string;
  score: number;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalyzeResponse {
  ai_probability: number;
  verdict: 'authentic' | 'suspicious' | 'fake' | 'inconclusive';
  confidence: number;
  breakdown?: BreakdownScores;
  flagged_segments: FlaggedSegment[];
  input_type: 'file' | 'url';
  media_name: string;
  sha256: string;
  demo_mode: boolean;
  /** True when results are simulated/heuristic (audio, URL, or model fallback). */
  simulated?: boolean;
  /** Set when real inference failed and simulated fallback was used. */
  inference_error?: string | null;
  /** Explanatory message such as no-face-detected or unsupported link */
  message?: string | null;
  /** Per-frame deepfake probabilities for video */
  frame_scores?: number[] | null;
  /** Per-chunk deepfake probabilities for audio */
  chunk_scores?: AudioChunkScore[] | null;
  /** Name of the classifier model used (e.g. 'Wav2Vec2 audio classifier') */
  model_name?: string | null;
}
