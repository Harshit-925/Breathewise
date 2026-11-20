# Problem Alignment & Standards Reference

**Challenge 6 — Urban Air Quality Assistant:**
> Create a GenAI-powered assistant that helps families and communities navigate severe winter smog and urban air pollution. The application should suggest low-emission daily routines, indoor air quality hacks, and sustainable alternatives tailored to their location and lifestyle, while clearly explaining the direct impact of their choices.

Breathewise is purposefully designed to solve this challenge through a privacy-first, evidence-grounded architecture.

---

## 1. Requirement Traceability Matrix

| Challenge Requirement | Implemented Feature | Primary Source Code | Verification Test |
|---|---|---|---|
| **Severe Winter Smog Navigation** | Live AQI snapshot, diurnal 24h hourly forecast, and atmospheric stagnation risk heuristic. | `src/components/Today/AirSnapshot.tsx`, `server/routes/air.ts` | `src/test/api.test.ts -t "GET /api/air"` |
| **Low-Emission Daily Routines** | Time-windowed daily routine planner advising on safe outdoor hours and peak-inversion windows. | `src/components/Routine/index.tsx`, `server/ai/gemini.ts` | `src/test/ai.test.ts -t "generateFallbackAdvice"` |
| **Indoor Air Quality Hacks** | 3-tier indoor solutions (Corsi-Rosenthal DIY box fan, Standard HEPA, Premium), CADR calculator, and window schedule. | `src/components/Indoor/index.tsx`, `src/lib/engine/cadr.ts` | `src/test/engine.test.ts -t "cadrRequired"` |
| **Tailored to Location & Lifestyle** | Dynamic geocoding city search, household profiles with sensitive group toggles (child, elderly, asthmatic), and room volume sizing. | `src/context/AppContext.tsx`, `src/hooks/useHousehold.ts` | `src/test/dom.test.tsx -t "CADR calculator"` |
| **Sustainable Travel Alternatives** | Multimodal transport comparison (metro, bus, car, EV, two-wheeler, cycle, walk) comparing inhaled PM2.5 and CO2e. | `src/components/Alternatives/index.tsx`, `src/lib/engine/modes.ts` | `src/test/engine.test.ts -t "compareModes"` |
| **Direct Impact of Choices** | Interactive Before/After Impact Meter with live toggles (mask, purifier, transit) updating directly from deterministic math. | `src/components/Impact/index.tsx`, `src/lib/engine/impact.ts` | `src/test/dom.test.tsx -t "ImpactView allows toggling"` |
| **Community Engagement** | Collective neighborhood pledge counter computing aggregate avoided carbon and ambient particulate reduction. | `src/components/Community/index.tsx`, `src/lib/engine/impact.ts` | `src/test/dom.test.tsx -t "CommunityView pledge button"` |
| **GenAI-Powered Assistant** | Streaming conversational assistant (SSE) with quick-ask toggle, guardrails for health safety, and prompt injection protection. | `src/components/Chat/index.tsx`, `server/routes/chat.ts` | `src/test/api.test.ts -t "POST /api/chat responds with SSE"` |
| **What-If Scenario Simulation** | Smog spike slider allowing users to test protective measures even on clear-air days. | `src/components/Today/index.tsx`, `src/hooks/useAirData.ts` | `src/test/dom.test.tsx -t "smog multiplier slider"` |

---

## 2. Standards and Sources Appendix

Every numerical constant in Breathewise is tied to a primary scientific standard:

### A. US EPA PM2.5 Breakpoints (Revised 2024 Table)
- **Standard**: US EPA Revised National Ambient Air Quality Standards for Particulate Matter (Effective May 2024).
- **Primary Change**: Good/Moderate threshold revised from 12.0 µg/m³ down to 9.0 µg/m³; Unhealthy for Sensitive Groups revised to 35.5 - 55.4 µg/m³.
- **Formula**:
  $$\text{AQI} = \frac{I_{\text{high}} - I_{\text{low}}}{C_{\text{high}} - C_{\text{low}}} (C - C_{\text{low}}) + I_{\text{low}}$$
- **Code Reference**: `src/lib/constants.ts` (`EPA_PM25_BREAKPOINTS`), `src/lib/engine/aqi.ts`.

### B. World Health Organization (WHO) Air Quality Guidelines
- **Standard**: WHO Global Air Quality Guidelines (2021).
- **24-hour PM2.5 Guideline Value**: $15 \ \mu\text{g/m}^3$.
- **Annual PM2.5 Guideline Value**: $5 \ \mu\text{g/m}^3$.
- **Code Reference**: `src/lib/constants.ts` (`WHO_GUIDELINE_PM25_24H`), `src/lib/engine/aqi.ts`.

### C. Clean Air Delivery Rate (CADR) & First-Order Decay
- **Standards**: Association of Home Appliance Manufacturers (AHAM AC-1) and EPA Clean Air in Buildings Guidelines.
- **Formulas**:
  - Required CADR:
    $$\text{CADR}_{\text{required}} = V_{\text{room}} \times \text{ACH}_{\text{target}}$$
  - Exponential Particle Decay Time:
    $$t = -\frac{V}{\text{CADR}} \ln(1 - \eta)$$
    where $\eta = 0.90$ for 90% particle clearance.
- **DIY Corsi-Rosenthal Box Benchmark**: 4× MERV-13 filters + 20" box fan delivering ~300 - 450 m³/h CADR.
- **Code Reference**: `src/lib/constants.ts`, `src/lib/engine/cadr.ts`.

### D. Inhaled Respiratory Dose & Activity Breathing Rates
- **Standards**: US EPA Exposure Factors Handbook (Chapter 6: Inhalation Rates).
- **Adult Resting**: $0.45 \ \text{m}^3/\text{h}$; **Light**: $0.75 \ \text{m}^3/\text{h}$; **Moderate Exercise**: $1.20 \ \text{m}^3/\text{h}$; **Heavy Exertion**: $2.10 \ \text{m}^3/\text{h}$.
- **Mask Efficiencies**: N95 / FFP2: 95% ($0.95$); Surgical: 40% ($0.40$); Cloth: 15% ($0.15$).
- **Formula**:
  $$\text{Dose} (\mu\text{g}) = C_{\text{PM2.5}} \times \text{Hours} \times \text{BreathingRate} \times (1 - \text{FilterEfficiency}) \times \text{IO\_Ratio}$$
- **Code Reference**: `src/lib/constants.ts`, `src/lib/engine/exposure.ts`.

### E. Passenger Transport Emission Factors
- **Standards**: UK Department for Environment, Food & Rural Affairs (DEFRA 2024 Greenhouse Gas Reporting Conversion Factors) & India Central Pollution Control Board (CPCB) urban transport emission factors.
- **Emissions Factors**:
  - Solo Petrol/Diesel Car: $0.192 \ \text{kg CO}_2\text{e/km}$
  - Battery Electric Car: $0.053 \ \text{kg CO}_2\text{e/km}$ (grid average)
  - Public Bus: $0.089 \ \text{kg CO}_2\text{e/passenger-km}$
  - Electric Metro / Rapid Rail: $0.038 \ \text{kg CO}_2\text{e/passenger-km}$
  - Bicycle / Walk: $0.000 \ \text{kg CO}_2\text{e/km}$
- **Code Reference**: `src/lib/constants.ts` (`EMISSION_FACTORS`), `src/lib/engine/modes.ts`.

### F. Data Attribution & API Compliance
- **Data Source**: CAMS (Copernicus Atmosphere Monitoring Service) ENSEMBLE model & ECMWF forecasts accessed via Open-Meteo Air Quality & Weather API.
- **Attribution Display**: Prominently displayed in header, air snapshot, and global application footer.
