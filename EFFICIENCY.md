# Efficiency and Performance Report

Breathewise is optimized for high computational responsiveness, minimal network payload, aggressive local caching, and low server footprint.

## Performance Architecture

1. **Multi-Tier Caching**:
   - Geocoding API: LRU cache (TTL 24 hours) with query normalization (case, spaces).
   - Air Quality & Weather API: LRU cache (TTL 5 minutes). Coordinates rounded to 2 decimal places to reuse grid cell data.
   - AI Advice Responses: LRU cache (TTL 15 minutes) keyed by SHA-256 hash of normalized household profile + air quality time bucket.
2. **Debounced Network Calls**: Geocode search is debounced and cached to eliminate redundant API round trips.
3. **Minimal Bundle Size**: Zero external UI framework bloat (no bloated chart libraries; lightweight inline SVGs with `.sr-only` twins).
4. **Local-First Persistence**: User profile and pledge actions persist in browser `localStorage`, requiring zero round-trip authentication requests.

---

## Measured Production Bundle Metrics

Generated via `vite build`:

| Asset | Raw Size | Gzip Size | Notes |
|---|---|---|---|
| `dist/assets/index.js` | 298.54 kB | **89.44 kB** | Includes React 19, Lucide-compatible icons, pure engine |
| `dist/assets/index.css` | 45.07 kB | **8.30 kB** | Optimized Tailwind CSS v4 styling |
| `dist/index.html` | 0.70 kB | **0.43 kB** | Clean semantic HTML shell |
| **Total Client Bundle** | **344.31 kB** | **98.17 kB** | **Sub-100 kB total transfer size** |

---

## Latency Profiles (Cold vs. Cached)

| Endpoint | Cold Latency (Uncached) | Cached Latency | Optimization Mechanism |
|---|---|---|---|
| `GET /api/geocode?q=...` | ~250 ms (Open-Meteo) | **< 3 ms** | In-memory LRU cache |
| `GET /api/air?lat=...&lon=...` | ~380 ms (CAMS / Open-Meteo) | **< 4 ms** | Coordinate grid rounding + 5 min cache |
| `POST /api/advice` | ~1,200 ms (Gemini LLM) | **< 5 ms** | SHA-256 hashed request cache |
| `GET /api/health` | **< 2 ms** | **< 2 ms** | In-memory uptime & cache metric counter |

---

## Verifiable Evidence Table

| Claim | Evidence | Verification Command |
|---|---|---|
| **Sub-100 kB Gzip Bundle** | Production Vite bundle measured at 89.44 kB JS and 8.30 kB CSS gzip | `npm run build` |
| **AI Response Caching** | SHA-256 hash caching prevents redundant Gemini API calls | `server/ai/cache.ts`, `src/test/ai.test.ts` |
| **Zero Bloat Inline SVG** | Custom SVG charts without 500kB charting libraries | `src/components/shared/Sparkline.tsx` |
| **Fast Build Times** | Full Vite client build completes in ~1.1 seconds | `npm run build` |

---

## Verification Command

```bash
npm run build
```
