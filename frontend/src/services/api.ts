import { AnalyzeResponse } from '../types/analysis';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeMedia(
  file?: File | null,
  url?: string | null
): Promise<AnalyzeResponse> {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  } else if (url) {
    formData.append('url', url);
  } else {
    throw new Error('Please provide either a media file or URL to analyze.');
  }

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorMsg = errData.detail;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return (await response.json()) as AnalyzeResponse;
}
