# BidMate Pro

Construction bidding & job-management PWA — iPhone-optimized, offline-first.
React 18 + TypeScript + Vite + Tailwind, with Dexie (IndexedDB) for storage and
Zustand for state. No backend required for core features.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build (also generates the PWA service worker)
npm run preview  # preview the production build
```

App icons are generated (dependency-free) by:

```bash
node scripts/generate-icons.mjs
```

## Features

- Jobs: lead → estimate → approved → active → complete → invoiced → paid
- 5-step estimate builder with labor & material presets and live totals
- 25 trade categories, 19 labor presets, 150+ material presets (PNW 2025–26)
- Estimate/Invoice PDF (jsPDF) with Web Share + download
- Photo documentation (capture, phase tagging, captions, full-screen viewer)
- Room measurement calculator (area, waste, paint, material suggestions)
- Clients directory, Reports (revenue, aging, top clients), Settings
- Installable PWA with offline service worker
- JSON export / import-restore for backups

## Optional: AI Room Measurement (Phase 3)

The "Scan Room with AI" button on the Measure screen POSTs a captured photo to a
serverless proxy that calls the Claude vision API and returns estimated
dimensions. The proxy keeps your API key server-side.

1. Deploy `api/ai-measure.ts` to a platform that runs serverless functions
   (e.g. Vercel). It's intentionally outside `/src` so the app build does not
   bundle or type-check it.
2. Set environment variables on the host:
   - `ANTHROPIC_API_KEY` — your Anthropic API key (required)
   - `AI_MEASURE_MODEL` — optional model override (default `claude-sonnet-4-6`)
3. Optionally point the client at a custom endpoint with `VITE_AI_MEASURE_URL`
   (defaults to `/api/ai-measure`).

Without a deployed endpoint the rest of the app works fully offline; the AI
button simply reports that the scan is unavailable.
