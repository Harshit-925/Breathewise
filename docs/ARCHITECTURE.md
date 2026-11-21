# Breathewise System Architecture

```mermaid
flowchart TD
    subgraph Browser ["Client: Browser (React 19 + TypeScript + Tailwind v4)"]
        UI["AppShell & Feature Views\n(Today · Routine · Indoor · Alternatives · Impact · Community · Chat)"]
        Context["AppContext\n(Language · Theme · Household · Location · Pledges)"]
        Engine["Pure Compute Engine (src/lib/engine/)\n(AQI · Inhaled Dose · CADR · Modes · Impact · Stagnation)"]
        Storage["Browser localStorage\n(Local-first, no account required)"]
        
        UI <--> Context
        Context --> Storage
        UI --> Engine
    end

    subgraph Gateway ["Defensive API Gateway (Node.js + Express + Zod)"]
        SecMW["Security Pipeline\n(Helmet CSP · CORS Allowlist · 16KB Body Cap · Rate Limiters)"]
        Sanitize["Input Sanitizer & Guardrails\n(Null-byte Stripping · Emergency Check · Off-topic Filter)"]
        Adapters["Data Adapters (LRU Cache)\n(Open-Meteo Geocoding · CAMS Air Quality · Weather Forecast)"]
        AIGateway["AI Engine Interface (Gemini 2.5 Flash)\n(Structured Output Schema · Fallback Generator · LRU Cache)"]
        Overwrite["Engine Number Overwrite\n('LLM does language, code does math')"]
        
        SecMW --> Sanitize
        Sanitize --> Adapters
        Sanitize --> AIGateway
        AIGateway --> Overwrite
    end

    UI -- "REST + SSE (Streaming Chat)" --> Gateway
    Overwrite -- "Validated Response" --> UI
    Adapters -- "CAMS Ensemble / ECMWF" --> ExternalAPIs["Open-Meteo Air Quality & Weather API"]
    AIGateway -- "Prompts (Temp 0.3)" --> GeminiAPI["Google Generative AI (Gemini Flash)"]
```

## Core Architectural Invariants

1. **Deterministic Verification Over Generative Hallucination**:
   - The AI language model is strictly restricted to linguistic tailoring and persona empathy.
   - All critical numbers (AQI, WHO factor, exposure dose, CADR, room decay time, CO2e reduction) are computed deterministically in pure TypeScript and overwrite any numbers in the LLM payload before reaching the client.

2. **Local-First Privacy Guarantee**:
   - User profile configurations, child sensitivities, room dimensions, and community pledges remain exclusively in the client's `localStorage`.
   - No authentication, user tracking, analytics cookies, or cloud database storage.
   - 1-click JSON export and 1-click full local data wipe.

3. **Defensive API Gateway**:
   - 16KB request body limit.
   - Strict Zod schema parsing with `.strict()` preventing parameter injection.
   - Null-byte and ASCII control character sanitization.
   - Emergency medical red-flags routed to emergency health resources immediately.
   - CWE-209 error masking suppressing internal server details and traces.
