import { useState } from 'react';

export interface AIMeasureResult {
  estimatedLengthFt: number | null;
  estimatedWidthFt: number | null;
  estimatedHeightFt: number | null;
  confidence: 'high' | 'medium' | 'low';
  referenceObjectUsed: string;
  notes: string;
}

const ENDPOINT = import.meta.env.VITE_AI_MEASURE_URL || '/api/ai-measure';

function captureImage(): Promise<{ base64: string; mediaType: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const [, mediaType = 'image/jpeg', base64 = ''] =
          dataUrl.match(/^data:(.*?);base64,(.*)$/) ?? [];
        resolve({ base64, mediaType });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

export function useAIMeasure() {
  const [loading, setLoading] = useState(false);

  /** Capture a photo and ask the AI proxy to estimate room dimensions. */
  const scanRoom = async (): Promise<AIMeasureResult | null> => {
    const img = await captureImage();
    if (!img) return null;
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageBase64: img.base64, mediaType: img.mediaType }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as AIMeasureResult;
      if (data && typeof data === 'object' && 'confidence' in data) return data;
      throw new Error('Bad response');
    } finally {
      setLoading(false);
    }
  };

  return { scanRoom, loading };
}
