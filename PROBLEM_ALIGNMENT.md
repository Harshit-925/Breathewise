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

Every numerical constant in Breathewise is tied to a primary scientific standard or peer-reviewed empirical study. The table below provides complete citations, verified URLs/DOIs, retrieval dates, and verification statuses:

| Parameter Category | Primary Scientific / Regulatory Source | Verification Status | Source Reference & URL | Retrieval Date |
|---|---|---|---|---|
| **PM2.5 AQI Breakpoints** | US EPA 40 CFR Part 58 (89 FR 16202, May 2024 Revised NAAQS) | **Verified Standard** | [US Federal Register 2024-04317](https://www.federalregister.gov/documents/2024/03/06/2024-04317/reconsideration-of-the-national-ambient-air-quality-standards-for-particulate-matter) | 2024-05-15 |
| **Clean Air Benchmarks** | WHO Global Air Quality Guidelines (2021) | **Verified Standard** | [WHO Guidelines IRIS 10665/345329](https://iris.who.int/handle/10665/345329) | 2024-02-10 |
| **CADR Clean Air Metric** | ANSI/AHAM AC-1-2020 & EPA Clean Air in Buildings | **Verified Standard** | [US EPA Guide to Air Cleaners](https://www.epa.gov/indoor-air-quality-iaq/air-cleaners-and-air-filters-home) | 2024-01-20 |
| **DIY Corsi-Rosenthal Box** | Rosenthal, J. (2020), UC Davis Air Quality Research Center | **Verified Benchmark** | [UC Davis AQRC Corsi-Rosenthal Box](https://aqrc.ucdavis.edu/news/corsi-rosenthal-box-air-filter) | 2024-01-20 |
| **Adult Inhalation Rates** | US EPA Exposure Factors Handbook (2011), Chapter 6: Table 6-2 | **Verified Standard** | [US EPA Expobox Chapter 6](https://www.epa.gov/expobox/exposure-factors-handbook-chapter-6) | 2024-02-18 |
| **Infant/Elderly Inhalation** | US EPA Exposure Factors Handbook (2011), Table 6-1 & 6-2 | **Empirical Estimate** | [US EPA National Center for Env Assessment](https://cfpub.epa.gov/ncea/risk/recordisplay.cfm?deid=236252) | 2024-02-18 |
| **N95 Respirator Filtration** | NIOSH 42 CFR Part 84 / 3M Technical Bulletin (2020) | **Verified Standard** | [3M Respiratory Protection Bulletin](https://multimedia.3m.com/mws/media/409903O/respiratory-protection-against-bioaerosols.pdf) | 2024-03-12 |
| **Surgical Mask Efficacy** | Davies et al. (2013), Disaster Med Public Health Prep | **Empirical Estimate** | [DOI: 10.1017/dmp.2013.43](https://doi.org/10.1017/dmp.2013.43) | 2024-03-14 |
| **Cloth Mask Filtration** | Shakya et al. (2017), J Expo Sci Environ Epidemiol | **Empirical Estimate** | [DOI: 10.1038/jes.2016.42](https://doi.org/10.1038/jes.2016.42) | 2024-03-14 |
| **Transport GHG Factors** | UK DESNZ / DEFRA (2024) Conversion Factors & CPCB | **Verified Standard** | [UK DEFRA GHG Factors 2024](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024) | 2024-06-15 |
| **Vehicular Plume Ratios** | Goel et al. (2015), Atmospheric Environment 123: 129-138 | **Partial / Empirical** | [DOI: 10.1016/j.atmosenv.2015.10.037](https://doi.org/10.1016/j.atmosenv.2015.10.037) | 2024-05-18 |
| **Mode Exposure Ratios** | Cepeda et al. (2017), The Lancet Public Health 2(1): e23-e34 | **Partial / Empirical** | [DOI: 10.1016/S2468-2667(16)30021-4](https://doi.org/10.1016/S2468-2667(16)30021-4) | 2024-05-18 |
| **Building I/O Infiltration** | Chen, C., & Zhao, B. (2011), Atmos Environ 45(2): 275-288 | **Partial / Empirical** | [DOI: 10.1016/j.atmosenv.2010.09.048](https://doi.org/10.1016/j.atmosenv.2010.09.048) | 2024-05-20 |
| **Community Pledges (AR6)** | IPCC Sixth Assessment Report (AR6), Working Group III | **Verified Model** | [IPCC AR6 WG3 Report](https://www.ipcc.ch/report/ar6/wg3/) | 2024-04-10 |
| **Boundary Layer Stagnation** | NOAA Air Resources Lab (ARL) Air Stagnation Index | **Meteorological Model** | [NOAA ARL Research](https://www.arl.noaa.gov/research/air-quality/) | 2024-04-22 |

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
- **Standards**: Association of Home Appliance Manufacturers (ANSI/AHAM AC-1-2020) and US EPA Clean Air in Buildings Guidelines.
- **Physical Invariant**: Clean Air Delivery Rate ($\text{CADR} = Q \times \eta$) by definition represents the equivalent volume of 100% clean air delivered per hour, already incorporating single-pass filtration efficiency $\eta$. Efficiency is therefore not double-discounted in decay modeling.
- **Formulas**:
  - Required Room CADR (for target ACH):
    $$\text{CADR}_{\text{required}} = V_{\text{room}} \times \text{ACH}_{\text{target}}$$
  - Exponential 90% Particle Decay Time:
    $$t_{90\%} = -\frac{V}{\text{CADR}} \ln(0.10) \times 60 \approx \frac{2.3026 \times V}{\text{CADR}} \times 60 \text{ minutes}$$
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
- **Standards**: UK Department for Energy Security and Net Zero (DESNZ) / DEFRA (2024) Greenhouse Gas Conversion Factors & CPCB Urban Transport Emission Guidelines.
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
- **Data Source**: CAMS (Copernicus Atmosphere Monitoring Service) ENSEMBLE model & ECMWF forecasts accessed via Open-Meteo Air Quality & Weather API ([https://open-meteo.com/en/docs/air-quality-api](https://open-meteo.com/en/docs/air-quality-api)).
- **Attribution Display**: Prominently displayed in header, air snapshot, and global application footer.
