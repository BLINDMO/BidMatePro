// Serverless proxy for AI room measurement (Vercel/Netlify-style handler).
//
// Keeps the Anthropic API key server-side. Deploy this alongside the static
// PWA (e.g. Vercel Functions) and set ANTHROPIC_API_KEY in the environment.
// Optionally set AI_MEASURE_MODEL (defaults to a current Claude model).
//
// This file lives outside /src and is intentionally NOT bundled by Vite or
// type-checked by the app build — it runs in your hosting platform's
// Node/Edge runtime.

const SYSTEM_PROMPT = `You are a construction estimator. Analyze this job-site photo and estimate visible
dimensions. Look for reference objects: doors ≈ 6'8" tall, outlets ≈ 18" AFF,
standard counters ≈ 36" tall, ceiling tiles ≈ 2'×4', standard windows ≈ 36"W.
Respond ONLY with JSON:
{
  "estimatedLengthFt": number | null,
  "estimatedWidthFt": number | null,
  "estimatedHeightFt": number | null,
  "confidence": "high" | "medium" | "low",
  "referenceObjectUsed": "string",
  "notes": "string"
}`;

interface MeasureRequest {
  imageBase64: string; // raw base64, no data: prefix
  mediaType?: string; // e.g. "image/jpeg"
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'Server not configured: missing ANTHROPIC_API_KEY' }, 500);
  }

  let body: MeasureRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!body.imageBase64) {
    return json({ error: 'imageBase64 is required' }, 400);
  }

  const model = process.env.AI_MEASURE_MODEL || 'claude-sonnet-4-6';

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: body.mediaType || 'image/jpeg',
                data: body.imageBase64,
              },
            },
            { type: 'text', text: 'Estimate the room dimensions from this photo.' },
          ],
        },
      ],
    }),
  });

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text();
    return json({ error: 'Upstream error', detail }, 502);
  }

  const data = await anthropicRes.json();
  const text: string = data?.content?.[0]?.text ?? '';

  // The model is asked to return ONLY JSON; extract defensively.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return json({ error: 'Could not parse model response', raw: text }, 502);
  }
  try {
    return json(JSON.parse(match[0]), 200);
  } catch {
    return json({ error: 'Invalid JSON from model', raw: text }, 502);
  }
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
