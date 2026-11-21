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
| **Tailored to Location & Lifestyle** | Dynamic geocoding city search, 6 named household personas, sensitive group toggles, and room volume sizing. | `src/context/AppContext.tsx`, `src/lib/personas.ts` | `src/test/dom.test.tsx -t "CADR calculator"` |
| **Sustainable Travel Alternatives** | Multimodal transport comparison (metro, bus, car, EV, two-wheeler, cycle, walk) with mode-specific speeds and exertion breathing rates. | `src/components/Alternatives/index.tsx`, `src/lib/engine/modes.ts` | `src/test/engine.test.ts -t "compareModes"` |
| **Route & Diurnal Commute Optimization** | **Best Time to Travel**: Hourly departure exposure window calculation identifying lowest-exposure commute intervals without fake map graphs. | `src/components/Alternatives/index.tsx` | `src/test/engine.test.ts -t "compareModes"` |
| **Direct Impact of Choices** | Interactive Before/After Impact Meter with live toggles (mask, purifier, transit) updating directly from deterministic math. | `src/components/Impact/index.tsx`, `src/lib/engine/impact.ts` | `src/test/dom.test.tsx -t "ImpactView allows toggling"` |
| **Community Engagement** | Collective neighborhood pledge counter computing aggregate avoided carbon and ambient particulate reduction. | `src/components/Community/index.tsx`, `src/lib/engine/impact.ts` | `src/test/dom.test.tsx -t "CommunityView pledge button"` |
| **GenAI-Powered Assistant** | Streaming conversational assistant (SSE) with quick-ask toggle, guardrails for health safety, and prompt injection protection. | `src/components/Chat/index.tsx`, `server/routes/chat.ts` | `src/test/api.test.ts -t "POST /api/chat responds with SSE"` |
| **What-If Scenario Simulation** | Smog spike slider allowing users to test protective measures even on clear-air days. | `src/components/Today/index.tsx`, `src/hooks/useAirData.ts` | `src/test/dom.test.tsx -t "smog multiplier slider"` |

---

## 2. Target Personas & Real-World Use Cases

Breathewise explicitly models six distinct urban personas vulnerable to winter atmospheric inversions:

1. **Priya (Asthmatic Child, Age 8)**
   - *Vulnerability*: High minute ventilation rate per kilogram of body mass; hyper-reactive bronchial tree sensitive to PM2.5 particulate deposition.
   - *System Alignment*: Routine Planner alerts parents to shift outdoor school recess indoors during morning inversions; Indoor Center sizes bedroom CADR to 250 m³/h.
2. **Arjun (Newborn, Age 6 Months)**
   - *Vulnerability*: Immature alveolar development; cannot wear respiratory masks (asphyxiation risk).
   - *System Alignment*: Focuses exclusively on indoor air containment, 4+ Air Changes per Hour (ACH), and solar-window ventilation timing.
3. **Dadi (Elderly Relative, Age 72)**
   - *Vulnerability*: Pre-existing cardiovascular risk; inhalation of ultrafine particulates promotes systemic inflammation and arterial vasoconstriction.
   - *System Alignment*: Shifts early morning walking habits (06:30 smog peak) to optimal afternoon solar-warming windows (13:00 - 15:00).
4. **Meera (School-Run Parent)**
   - *Vulnerability*: Manages multiple daily school drop-offs and after-school pickups in localized vehicle idling hot-spots.
   - *System Alignment*: Consults diurnal commute windows and air snapshots before school departures; coordinates anti-idling practices.
5. **Rahul (Daily Commuter)**
   - *Vulnerability*: Traverses 12 km daily across congested urban corridors; two-wheeler and open auto-rickshaw riders experience 2.5x to 3x higher PM2.5 exposure than sealed transit.
   - *System Alignment*: Uses "Best Time to Travel" and Mode Comparison to evaluate subway/metro vs. two-wheeler tradeoffs and optimize departure timing.
6. **Sunita (Community Lead / RWA Organizer)**
   - *Vulnerability*: Frustrated by lack of neighborhood coordination against open municipal and biomass burning.
   - *System Alignment*: Mobilizes collective Community Pledges, organizes shared DIY Corsi-Rosenthal filter workshops, and monitors airshed progress.

---

## 3. Standards and Sources Appendix

Every numerical constant in Breathewise is tied to a primary scientific standard or peer-reviewed empirical study. The table below delineates verified official regulatory standards from empirical literature approximations:

| Parameter Category | Primary Scientific / Regulatory Source | Verification Status | Source Reference & Retrieval Date |
|---|---|---|---|
| **PM2.5 AQI Breakpoints** | US EPA 40 CFR Part 58 (2024 Revised NAAQS for PM) | **Verified Standard** | [US EPA PM Standards](https://www.epa.gov/pm-pollution) (May 2024) |
| **Clean Air Benchmarks** | WHO Global Air Quality Guidelines (2021) | **Verified Standard** | [WHO Guidelines 2021](https://www.who.int/publications/i/item/9789240034228) (Feb 2024) |
| **CADR & Decay Dynamics** | AHAM AC-1 & EPA Clean Air in Buildings | **Verified Standard** | [EPA Indoor Air Cleaners](https://www.epa.gov/indoor-air-quality-iaq) (Jan 2024) |
| **Adult Inhalation Rates** | US EPA Exposure Factors Handbook (2011), Table 6-2 | **Verified Standard** | [EPA Expobox Table 6-2](https://www.epa.gov/expobox) (Feb 2024) |
| **Infant/Elderly Inhalation** | Extrapolated from EPA pediatric & geriatric ranges | **Empirical Estimate** | Age-bracket literature normalization (Feb 2024) |
| **N95 Mask Filtration** | NIOSH TEB-APR-STP-0059 / 3M Technical Bulletin (2020) | **Verified Standard** | [3M Bioaerosols Bulletin](https://multimedia.3m.com) (Mar 2024) |
| **Surgical & Cloth Masks** | Davies et al. (2013) & Shakya et al. (2017) | **Empirical Estimate** | Disaster Med & J Expo Sci (Mar 2024) |
| **Transport Emissions** | UK DEFRA GHG Factors (2024) & CPCB Vehicle Guidelines | **Verified Standard** | [UK DEFRA Conversion 2024](https://www.gov.uk) (Jun 2024) |
| **Transport Exposure Multipliers** | Cepeda et al. (2017), Int. J. Environ. Res. Public Health | **Partial / Empirical** | Literature commuter exposure ratios (May 2024) |
| **Building I/O Penetration** | Chen & Zhao (2011), Building and Environment | **Partial / Empirical** | Residential envelope infiltration studies (May 2024) |

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
- **Code Reference**: `src/lib/constants.ts` (`WHO_GUIDELINES`), `src/lib/engine/aqi.ts`.

### C. Clean Air Delivery Rate (CADR) & First-Order Decay
- **Standards**: Association of Home Appliance Manufacturers (AHAM AC-1) and EPA Clean Air in Buildings Guidelines.
- **Formulas**:
  - Required CADR:
    $$\text{CADR}_{\text{required}} = V_{\text{room}} \times \text{ACH}_{\text{target}}$$
  - Exponential Particle Decay Time:
    $$t_{90\%} = -\frac{V}{\text{CADR} \times \eta} \ln(0.10) \times 60$$
    where $\eta = 0.90$ for 90% particle clearance.
- **DIY Corsi-Rosenthal Box Benchmark**: 4× MERV-13 filters + 20" box fan delivering fixed $\text{CADR} \approx 350 \ \text{m}^3/\text{h}$, scaling clean time proportionally to room volume.
- **Code Reference**: `src/lib/constants.ts`, `src/lib/engine/cadr.ts`.

### D. Inhaled Respiratory Dose & Activity Breathing Rates
- **Standards**: US EPA Exposure Factors Handbook (Chapter 6: Inhalation Rates, Table 6-2).
- **Breathing Rates (L/min and $\text{m}^3/\text{h}$)**:
  - **Adult Resting**: $7.5 \ \text{L/min} \ (0.45 \ \text{m}^3/\text{h})$
  - **Adult Light Activity**: $16.0 \ \text{L/min} \ (0.96 \ \text{m}^3/\text{h})$
  - **Adult Moderate Exercise**: $30.0 \ \text{L/min} \ (1.80 \ \text{m}^3/\text{h})$
  - **Adult Heavy Exertion**: $45.0 \ \text{L/min} \ (2.70 \ \text{m}^3/\text{h})$
- **Mask Efficiencies**: N95 / FFP2: 95% ($0.95$); Surgical: 65% ($0.65$); Cloth: 30% ($0.30$); None: 0% ($0.00$).
- **Formula**:
  $$\text{Dose} (\mu\text{g}) = C_{\text{PM2.5}} \times \text{Hours} \times \text{BreathingRate}_{\text{m}^3/\text{h}} \times (1 - \text{FilterEfficiency}) \times \text{IO\_Ratio}$$
- **Code Reference**: `src/lib/constants.ts` (`BREATHING_RATES`, `MASK_EFFICIENCY`), `src/lib/engine/exposure.ts`.

### E. Passenger Transport Emission & Physics Factors
- **Standards**: UK Department for Environment, Food & Rural Affairs (DEFRA 2024 Greenhouse Gas Reporting Conversion Factors) & India Central Pollution Control Board (CPCB) urban transport emission factors.
- **Physical Modeling (`MODE_PHYSICS`)**:
  - Solo Petrol/Diesel Car: $0.170 \ \text{kg CO}_2\text{e/km}$, $22 \ \text{km/h}$, $12 \ \text{L/min}$ breathing
  - Battery Electric Car: $0.050 \ \text{kg CO}_2\text{e/km}$, $22 \ \text{km/h}$, $12 \ \text{L/min}$ breathing
  - Public Bus: $0.089 \ \text{kg CO}_2\text{e/pkm}$, $16 \ \text{km/h}$, $14 \ \text{L/min}$ breathing
  - Electric Metro: $0.035 \ \text{kg CO}_2\text{e/pkm}$, $32 \ \text{km/h}$, $14 \ \text{L/min}$ breathing
  - Two-Wheeler: $0.060 \ \text{kg CO}_2\text{e/km}$, $24 \ \text{km/h}$, $16 \ \text{L/min}$ breathing
  - Bicycle: $0.000 \ \text{kg CO}_2\text{e/km}$, $14 \ \text{km/h}$, $32 \ \text{L/min}$ exertion breathing
  - Walking: $0.000 \ \text{kg CO}_2\text{e/km}$, $4.5 \ \text{km/h}$, $24 \ \text{L/min}$ exertion breathing
- **Code Reference**: `src/lib/constants.ts` (`EMISSION_FACTORS`, `MODE_PHYSICS`), `src/lib/engine/modes.ts`.

### F. Data Attribution & API Compliance
- **Data Source**: CAMS (Copernicus Atmosphere Monitoring Service) ENSEMBLE model & ECMWF forecasts accessed via Open-Meteo Air Quality & Weather API.
- **Attribution Display**: Prominently displayed in header, air snapshot, and global application footer.
