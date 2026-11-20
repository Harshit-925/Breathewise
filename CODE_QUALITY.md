# Code Quality and Architecture Standards

Breathewise maintains strict code health, modular architectural boundaries, deterministic calculation purity, and zero compiler warnings.

## Core Architectural Separation

```
[UI Components] ──► [AppContext / Feature Hooks] ──► [Pure Engine (src/lib/engine)]
                                     │
                             [apiService (HTTP)]
                                     │
                         [Express Gateway (server/)]
                                     │
                 ┌───────────────────┴───────────────────┐
           [Data Adapters]                       [AI Gateway]
      (Open-Meteo Air/Weather)             (Gemini Flash + Fallback)
                 │                                       │
                 └───────────────┬───────────────────────┘
                                 ▼
                     [Engine Number Overwrite]
```

## Quality Principles

1. **Deterministic Engine Purity**: Every numeric metric (AQI, inhaled dose, CADR, mode comparisons, CO2e) is computed strictly by pure TypeScript functions in `src/lib/engine/`. No floating magic numbers; all constants link to published benchmarks.
2. **LLM Does Language, Code Does Math**: Generative AI is strictly used for natural language explanation and routine synthesis. Engine values overwrite model outputs before client delivery.
3. **Strict Type Safety**: `tsconfig.json` runs in strict mode with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`. **Zero `any`** types across all 71 source files.
4. **Small Modules**: Functions are kept under 30 lines where practical, and files under 200 lines to ensure maintainability and readability.
5. **No Dead Code**: Zero unused variables, clean exports, zero linter warnings under `oxlint`.

---

## Verifiable Evidence Table

| Claim | Evidence | Verification Command |
|---|---|---|
| **Zero `any` Types** | Full TypeScript strict type coverage across client, server, and engine | `npm run typecheck` |
| **Zero Linter Warnings** | 71 files checked against 97 ESLint/Oxlint rules with 0 errors and 0 warnings | `npm run lint` |
| **Pure Engine Calculations** | All engine functions in `src/lib/engine/` are pure and side-effect free | `npx vitest run src/test/engine.test.ts` (62 tests) |
| **Documented Constants** | Every constant in `src/lib/constants.ts` cites a source key | Inspect `src/lib/constants.ts` |
| **Engine Overwrite Enforced** | Gemini outputs are overwritten by deterministic math before returning to user | `server/ai/gemini.ts#L60-L95`, `src/test/ai.test.ts` |
| **Small Modular Files** | Modular directory structure dividing components, routes, middleware, and adapters | `Get-ChildItem -Recurse -File` |

---

## Verification Commands

```bash
# Type check:
npm run typecheck

# Lint check:
npm run lint

# Engine test suite:
npx vitest run src/test/engine.test.ts
```
