import { AnalyzeResponse, ValidatedMediaFile, MediaType } from '../types/analysis';
import { ScanHistoryItem, PrivacySettings, RetentionPeriod } from '../types/history';

const HISTORY_STORAGE_KEY = 'truthlens_scan_history';
const PRIVACY_SETTINGS_KEY = 'truthlens_privacy_settings';

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  retentionPeriod: '30d',
  faceBlurOnExport: false,
  stripExifBeforeUpload: true,
  clientSidePreHashingOnly: true,
  shareAnonymizedMetrics: false,
  lastUpdated: new Date().toISOString(),
};

// Seed sample forensic history if completely empty, so first-time visitors can explore stats immediately
const INITIAL_SEED_HISTORY: ScanHistoryItem[] = [
  {
    id: 'tl_seed_1',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    mediaName: 'press_briefing_statement_v2.mp4',
    mediaType: 'video',
    inputType: 'file',
    fileSize: 42 * 1024 * 1024,
    formattedSize: '42.0 MB',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    aiProbability: 88,
    verdict: 'fake',
    confidence: 96,
    breakdown: { face: 92, lip_sync: 89, audio: 84, texture: 81, metadata: 65 },
    flaggedSegmentsCount: 4,
    demoMode: true,
  },
  {
    id: 'tl_seed_2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    mediaName: 'official_podcast_ep14_audio.wav',
    mediaType: 'audio',
    inputType: 'file',
    fileSize: 18 * 1024 * 1024,
    formattedSize: '18.0 MB',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    aiProbability: 12,
    verdict: 'authentic',
    confidence: 94,
    breakdown: { face: 5, lip_sync: 8, audio: 11, texture: 14, metadata: 10 },
    flaggedSegmentsCount: 0,
    demoMode: true,
  },
  {
    id: 'tl_seed_3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
    mediaName: 'breaking_headline_clip_raw.mp4',
    mediaType: 'video',
    inputType: 'url',
    fileSize: 15 * 1024 * 1024,
    formattedSize: '15.0 MB',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    aiProbability: 54,
    verdict: 'suspicious',
    confidence: 81,
    breakdown: { face: 62, lip_sync: 58, audio: 45, texture: 51, metadata: 40 },
    flaggedSegmentsCount: 2,
    demoMode: true,
  },
  {
    id: 'tl_seed_4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 2 days ago
    mediaName: 'suspected_portrait_generator.png',
    mediaType: 'image',
    inputType: 'file',
    fileSize: 3.4 * 1024 * 1024,
    formattedSize: '3.4 MB',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    aiProbability: 95,
    verdict: 'fake',
    confidence: 99,
    breakdown: { face: 98, lip_sync: 10, audio: 5, texture: 96, metadata: 88 },
    flaggedSegmentsCount: 3,
    demoMode: true,
  },
  {
    id: 'tl_seed_5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    mediaName: 'conference_keynote_livestream.mp4',
    mediaType: 'video',
    inputType: 'file',
    fileSize: 85 * 1024 * 1024,
    formattedSize: '85.0 MB',
    sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    aiProbability: 18,
    verdict: 'authentic',
    confidence: 91,
    breakdown: { face: 15, lip_sync: 22, audio: 19, texture: 12, metadata: 14 },
    flaggedSegmentsCount: 0,
    demoMode: true,
  },
  {
    id: 'tl_seed_6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(), // 5.8 days ago
    mediaName: 'voice_memo_authorization.mp3',
    mediaType: 'audio',
    inputType: 'file',
    fileSize: 4.8 * 1024 * 1024,
    formattedSize: '4.8 MB',
    sha256: 'bc9f2add5e154944d18fa7a00f8623b313ef04791e8ba31379c65e2365bf026a',
    aiProbability: 82,
    verdict: 'fake',
    confidence: 88,
    breakdown: { face: 0, lip_sync: 0, audio: 94, texture: 10, metadata: 72 },
    flaggedSegmentsCount: 2,
    demoMode: true,
  },
];

/**
 * Filter history based on user privacy retention setting
 */
export function purgeExpiredHistory(items: ScanHistoryItem[], retention: RetentionPeriod): ScanHistoryItem[] {
  if (retention === 'forever') return items;
  if (retention === 'none') return [];

  const now = Date.now();
  let maxAgeMs = Infinity;

  switch (retention) {
    case 'session':
      // Handled outside or cleared on fresh session; for window, keep items younger than 3 hours
      maxAgeMs = 3 * 60 * 60 * 1000;
      break;
    case '24h':
      maxAgeMs = 24 * 60 * 60 * 1000;
      break;
    case '7d':
      maxAgeMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case '30d':
      maxAgeMs = 30 * 24 * 60 * 60 * 1000;
      break;
  }

  return items.filter((item) => {
    const itemTime = new Date(item.timestamp).getTime();
    return now - itemTime <= maxAgeMs;
  });
}

/**
 * Retrieve all history items from localStorage
 */
export function getScanHistory(): ScanHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const settings = getPrivacySettings();

    if (!raw) {
      if (settings.retentionPeriod === 'none') {
        return [];
      }
      // Seed with initial items for a rich first-run experience
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_SEED_HISTORY));
      return purgeExpiredHistory(INITIAL_SEED_HISTORY, settings.retentionPeriod);
    }

    const parsed: ScanHistoryItem[] = JSON.parse(raw);
    const purged = purgeExpiredHistory(parsed, settings.retentionPeriod);
    if (purged.length !== parsed.length) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(purged));
    }
    return purged;
  } catch (err) {
    console.error('Failed to read scan history from localStorage:', err);
    return [];
  }
}

/**
 * Save a newly completed analysis automatically into history
 */
export function saveScanToHistory(
  response: AnalyzeResponse,
  mediaFile?: ValidatedMediaFile | null
): ScanHistoryItem | null {
  try {
    const settings = getPrivacySettings();
    if (settings.retentionPeriod === 'none') {
      return null;
    }

    const currentHistory = getScanHistory();

    const mediaType: MediaType = 
      mediaFile?.type || 
      (response.media_name.endsWith('.mp3') || response.media_name.endsWith('.wav') ? 'audio' :
       response.media_name.endsWith('.png') || response.media_name.endsWith('.jpg') ? 'image' : 'video');

    const newItem: ScanHistoryItem = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      mediaName: mediaFile?.name || response.media_name,
      mediaType,
      inputType: response.input_type || (mediaFile?.rawUrl ? 'url' : 'file'),
      fileSize: mediaFile?.size,
      formattedSize: mediaFile?.formattedSize,
      sha256: response.sha256,
      aiProbability: response.ai_probability,
      verdict: response.verdict,
      confidence: response.confidence,
      breakdown: { ...response.breakdown },
      flaggedSegmentsCount: response.flagged_segments?.length || 0,
      demoMode: response.demo_mode,
      rawResponse: response,
    };

    // Prepend to history so newest appears first
    const updated = [newItem, ...currentHistory];
    const purged = purgeExpiredHistory(updated, settings.retentionPeriod);

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(purged));
    return newItem;
  } catch (err) {
    console.error('Failed to save scan to localStorage history:', err);
    return null;
  }
}

/**
 * Delete a single scan item by ID
 */
export function deleteScanItem(id: string): ScanHistoryItem[] {
  try {
    const items = getScanHistory().filter((i) => i.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    return items;
  } catch (err) {
    console.error('Failed to delete scan item:', err);
    return [];
  }
}

/**
 * Clear all scan history
 */
export function clearAllScanHistory(): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear scan history:', err);
  }
}

/**
 * Load Privacy Settings
 */
export function getPrivacySettings(): PrivacySettings {
  try {
    const raw = localStorage.getItem(PRIVACY_SETTINGS_KEY);
    if (!raw) return DEFAULT_PRIVACY_SETTINGS;
    return { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

/**
 * Save Privacy Settings
 */
export function savePrivacySettings(settings: Partial<PrivacySettings>): PrivacySettings {
  try {
    const current = getPrivacySettings();
    const updated: PrivacySettings = {
      ...current,
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(updated));

    // If retention changed, immediately purge expired entries
    if (settings.retentionPeriod) {
      const items = getScanHistory();
      const purged = purgeExpiredHistory(items, settings.retentionPeriod);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(purged));
    }

    return updated;
  } catch (err) {
    console.error('Failed to save privacy settings:', err);
    return DEFAULT_PRIVACY_SETTINGS;
  }
}
