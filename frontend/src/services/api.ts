import { AnalyzeResponse } from '../types/analysis';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeMedia(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append('file', file);

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
