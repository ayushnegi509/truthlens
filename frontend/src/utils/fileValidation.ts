import { MediaType, ValidatedMediaFile } from '../types/analysis';

export const FILE_LIMITS = {
  video: {
    maxSizeMB: 250,
    maxSizeBytes: 250 * 1024 * 1024,
    extensions: ['mp4', 'mov', 'webm', 'mkv', 'avi'],
    label: 'MP4, MOV, WEBM, MKV (max 250MB)',
  },
  audio: {
    maxSizeMB: 50,
    maxSizeBytes: 50 * 1024 * 1024,
    extensions: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'],
    label: 'WAV, MP3, AAC, FLAC (max 50MB)',
  },
  image: {
    maxSizeMB: 25,
    maxSizeBytes: 25 * 1024 * 1024,
    extensions: ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'bmp'],
    label: 'PNG, JPG, WEBP (max 25MB)',
  },
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const detectMediaType = (fileOrName: File | string): MediaType | null => {
  let name = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
  let mimeType = typeof fileOrName === 'object' ? fileOrName.type : '';

  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('image/')) return 'image';

  const ext = name.split('.').pop()?.toLowerCase() || '';

  if (FILE_LIMITS.video.extensions.includes(ext)) return 'video';
  if (FILE_LIMITS.audio.extensions.includes(ext)) return 'audio';
  if (FILE_LIMITS.image.extensions.includes(ext)) return 'image';

  return null;
};

export const computeSHA256 = async (file: File | Blob): Promise<string> => {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('SubtleCrypto error, using fallback hash:', err);
  }
  return generateFallbackHash(file instanceof File ? file.name : 'blob', file.size);
};

export const generateFallbackHash = (fileName: string, fileSize: number): string => {
  const seed = `${fileName}_${fileSize}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `tl_${hex}${Date.now().toString(16)}`;
};

export const generateMockHash = (fileName: string, fileSize: number): string => {
  return generateFallbackHash(fileName, fileSize);
};

export const validateMediaFile = async (
  file: File,
  sourceType: 'file' | 'recording' = 'file'
): Promise<ValidatedMediaFile> => {
  const detectedType = detectMediaType(file);
  const formattedSize = formatFileSize(file.size);
  const previewUrl = URL.createObjectURL(file);

  let hash = '';
  try {
    hash = await computeSHA256(file);
  } catch {
    hash = generateFallbackHash(file.name, file.size);
  }

  if (file.size === 0) {
    return {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: 0,
      formattedSize: '0 B',
      type: detectedType || 'image',
      mimeType: file.type || 'application/octet-stream',
      previewUrl,
      hash,
      status: 'invalid',
      error: 'Selected file is empty (0 bytes). Please upload a valid media file.',
      sourceType,
    };
  }

  if (!detectedType) {
    return {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      formattedSize,
      type: 'image',
      mimeType: file.type || 'application/octet-stream',
      previewUrl,
      hash,
      status: 'invalid',
      error: `Unsupported file format. Please upload video (${FILE_LIMITS.video.extensions.join(', ')}), audio (${FILE_LIMITS.audio.extensions.join(', ')}), or image (${FILE_LIMITS.image.extensions.join(', ')}).`,
      sourceType,
    };
  }

  const limits = FILE_LIMITS[detectedType];
  if (file.size > limits.maxSizeBytes) {
    return {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      formattedSize,
      type: detectedType,
      mimeType: file.type,
      previewUrl,
      hash,
      status: 'invalid',
      error: `File exceeds maximum allowed size of ${limits.maxSizeMB}MB for ${detectedType}s (current: ${formattedSize}).`,
      sourceType,
    };
  }

  return {
    id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    file,
    name: file.name,
    size: file.size,
    formattedSize,
    type: detectedType,
    mimeType: file.type || `${detectedType}/standard`,
    previewUrl,
    hash,
    status: 'valid',
    sourceType,
  };
};
