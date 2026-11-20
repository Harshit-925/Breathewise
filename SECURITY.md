# Security and Defensive Gateway Standards

Breathewise implements a defensive security-in-depth posture across its client interface, Node/Express API gateway, and external AI integrations.

## Defensive Security Architecture

```
[Inbound HTTP Request]
          │
          ▼
   [Helmet Security Headers] ──► Content Security Policy (connectSrc: self, Open-Meteo)
          │
          ▼
    [CORS Allowlist]         ──► Exact origins from ALLOWED_ORIGINS (no wildcards)
          │
          ▼
   [Payload Size Limit]      ──► Strict 100KB body cap (prevents payload bombs)
          │
          ▼
  [Input Sanitizer]          ──► Strips null bytes (\0) and control characters
          │
          ▼
  [Rate Limiters]            ──► General (100 req/15min) & AI (30 req/15min)
          │
          ▼
  [Zod Strict Schemas]       ──► Rejects unknown/injected fields (.strict())
          │
          ▼
 [Emergency & Guardrails]    ──► Detects medical emergencies & off-topic inputs
          │
          ▼
   [Sanitized Response]      ──► Generic error messages (stack traces never exposed)
```

## Security Controls

1. **Server-Side Key Custody**:
   - `GEMINI_API_KEY` is strictly held on the server. No API keys or secrets are ever exposed in Vite client environment or frontend bundles.
2. **Content Security Policy (CSP)**:
   - Configured via Helmet to permit connections only to `'self'`, Open-Meteo endpoints, and Google Generative Language APIs.
3. **CORS Allowlist**:
   - Strict origin allowlist matching exact configured origins in `ALLOWED_ORIGINS` (e.g. `http://localhost:5173`). Wildcards like `*.vercel.app` are rejected.
4. **Body-Size Caps & Rate Limiting**:
   - JSON parser restricted to `100kb` to thwart memory exhaustion / Denial of Service.
   - Dual rate limiters via `express-rate-limit`: general endpoints capped at 100 req/15 min; AI endpoints capped at 30 req/15 min with `X-RateLimit-*` headers.
5. **Strict Schema Validation**:
   - Zod schemas enforce `.strict()`, rejecting payloads with unknown or injected properties.
6. **Input Sanitization & Guardrails**:
   - Strips non-printable ASCII/Unicode control characters.
   - Wraps user prompt in `<user_input>...</user_input>`.
   - Emergency keyword detection redirects medical emergencies immediately to local emergency services.
7. **Error Masking & Privacy**:
   - No stack traces, file system paths, or internal error dumps are leaked to clients.
   - Zero user PII logged.

---

## Verifiable Evidence Table

| Security Control | Evidence File | Verification Command |
|---|---|---|
| **CORS Exact Origin Validation** | `server/middleware/security.ts#L10-L24` | `npx vitest run src/test/api.test.ts` |
| **Strict 100KB Body Cap** | `server/middleware/security.ts#L38` | Inspect `server/middleware/security.ts` |
| **Strict Zod Rejection** | `server/schemas/index.ts` | `npx vitest run src/test/api.test.ts -t "rejects unknown fields"` |
| **Control Character Stripping** | `server/ai/guardrails.ts#L32` | `npx vitest run src/test/ai.test.ts -t "sanitizeUserInput strips null bytes"` |
| **Emergency Symptom Detector** | `server/ai/guardrails.ts#L46` | `npx vitest run src/test/api.test.ts -t "triggers emergency redirect"` |
| **Off-Topic Topic Filter** | `server/ai/guardrails.ts#L51` | `npx vitest run src/test/api.test.ts -t "triggers off-topic redirect"` |
| **Error Trace Masking** | `server/middleware/errorHandler.ts` | `npx vitest run src/test/api.test.ts -t "missing parameters"` |
| **No API Keys in Client** | Client source code & Vite build | Inspect `dist/assets/index-*.js` |

---

## Verification Command

```bash
npm test -- src/test/api.test.ts
```
