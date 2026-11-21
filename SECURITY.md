# Security and Defensive Gateway Standards

Breathewise implements a rigorous defense-in-depth security posture across its client interface, Node/Express API gateway, and external AI integrations.

## Defensive Security Architecture

```
[Inbound HTTP Request]
          │
          ▼
   [Helmet Security Headers] ──► Content Security Policy (connectSrc: self, Open-Meteo, Google APIs)
          │
          ▼
     [CORS Allowlist]         ──► Exact origins from ALLOWED_ORIGINS (no wildcards allowed)
          │
          ▼
   [Payload Size Limit]      ──► Strict 16KB body cap (mitigates memory exhaustion / payload bombs)
          │
          ▼
  [Input Sanitizer]          ──► Strips null bytes (\0) and non-printable control characters
          │
          ▼
  [Rate Limiters]            ──► General (100 req/15min) & AI endpoints (30 req/15min)
          │
          ▼
  [Zod Strict Schemas]       ──► Rejects unknown/injected fields via .strict() validation
          │
          ▼
 [Emergency & Guardrails]    ──► Detects medical emergencies & redirects off-topic inputs
          │
          ▼
   [Sanitized Response]      ──► CWE-209: Error masking (stack traces never exposed)
```

---

## OWASP Top 10 (2021) Security Controls Mapping

| OWASP Risk Category | Breathewise Implementation & Defense | Verifiable Evidence File |
|---|---|---|
| **A01:2021 — Broken Access Control** | Local-first browser architecture. No server-side session stores, user IDs, or central databases to breach. All personal profile data stays in `localStorage`. | `src/context/AppContext.tsx` |
| **A02:2021 — Cryptographic Failures** | Strict server-side key custody. `GEMINI_API_KEY` is never bundled into client JS or emitted in headers. Upstream communication uses TLS 1.3 HTTPS. | `server/ai/gemini.ts` |
| **A03:2021 — Injection** | All JSON bodies validated with strict Zod schemas (`.strict()`) rejecting extra/unknown keys. Prompt injection mitigated by enclosing user inputs in `<user_input>...</user_input>` XML tags with null-byte stripping. | `server/schemas/index.ts`<br>`server/ai/guardrails.ts` |
| **A04:2021 — Insecure Design** | **"LLM does language, code does math"**: Deterministic TypeScript engine calculates all AQI, inhaled dose, CADR, and emissions. Engine values strictly overwrite any numerical values returned by LLMs. | `src/lib/engine/`<br>`server/ai/gemini.ts#L60-L90` |
| **A05:2021 — Security Misconfiguration** | Helmet security headers (strict CSP, HSTS, X-Content-Type-Options: nosniff, frameguard: DENY). Disabled `X-Powered-By`. Exact-origin CORS without wildcards. Payload cap lowered to 16KB. | `server/middleware/security.ts` |
| **A06:2021 — Vulnerable and Outdated Components** | Minimal dependency tree with zero production dependencies with known CVEs. Automated vulnerability scans via npm audit. | `package.json`<br>`package-lock.json` |
| **A07:2021 — Identification & Authentication** | Zero-login design. No passwords, tokens, or JWTs stored or susceptible to credential stuffing or brute-forcing. | `src/services/storageService.ts` |
| **A08:2021 — Software and Data Integrity** | Automated GitHub Actions CI/CD pipeline enforcing strict TypeScript compilation (`--noEmit`), oxlint static analysis, and 100% test pass rate before deployment. | `.github/workflows/ci.yml` |
| **A09:2021 — Security Logging & Monitoring** | Generic structured logging without logging any user queries, IP addresses, or PII. Health and usage endpoints monitor cache capacity and rate limit metrics. | `server/routes/health.ts`<br>`server/routes/usage.ts` |
| **A10:2021 — Server-Side Request Forgery (SSRF)** | Server gateway only calls hardcoded, trusted upstream endpoints (Open-Meteo geocoding/weather/air APIs and Google Generative Language API). No user-supplied URLs are fetched. | `server/adapters/` |

---

## Protection Against CWE-209: Generation of Error Message Containing Sensitive Information

Breathewise explicitly guards against **CWE-209** across all API routes and client interfaces:
- **Centralized Error Boundary Middleware**: All unhandled exceptions in the Express gateway are caught by `server/middleware/errorHandler.ts`.
- **Stack Trace Suppression**: Internal stack traces, server file paths, environment variable names, and underlying runtime errors are strictly suppressed in responses.
- **Client Error Format**: All client-facing error payloads return standardized, sanitized JSON:
  ```json
  {
    "error": "Invalid request data",
    "details": ["Missing required field: lat"]
  }
  ```
  or a generic `"Internal server error"` with an HTTP 500 status code.
- **Client Fallback**: If network or server issues occur, the client displays friendly offline guidance rather than raw browser fetch error dumps.

---

## Verifiable Security Controls

| Security Control | Evidence File | Verification Command |
|---|---|---|
| **CORS Exact Origin Validation** | `server/middleware/security.ts#L11-L21` | `npx vitest run src/test/api.test.ts` |
| **Strict 16KB Body Cap** | `server/middleware/security.ts#L37` | Inspect `server/middleware/security.ts` |
| **Strict Zod Rejection** | `server/schemas/index.ts` | `npx vitest run src/test/api.test.ts -t "rejects unknown fields"` |
| **Control Character Stripping** | `server/ai/guardrails.ts` | `npx vitest run src/test/ai.test.ts -t "sanitizeUserInput strips null bytes"` |
| **Emergency Symptom Detector** | `server/ai/guardrails.ts` | `npx vitest run src/test/api.test.ts -t "triggers emergency redirect"` |
| **Off-Topic Filter** | `server/ai/guardrails.ts` | `npx vitest run src/test/api.test.ts -t "triggers off-topic redirect"` |
| **CWE-209 Error Trace Masking** | `server/middleware/errorHandler.ts` | `npx vitest run src/test/api.test.ts -t "missing parameters"` |
| **No API Keys in Client** | Client source code & Vite build | Inspect `dist/assets/index-*.js` |

---

## Verification Command

```bash
npm test -- src/test/api.test.ts
```
