# Breathewise Demo Video Submission Guide & Storyboard

This guide provides the complete walkthrough structure, live testing data, GenAI demonstration proof points, and word-for-word voiceover script for the **Breathewise** submission video, strictly adhering to the 4-minute submission criteria.

---

## Video File Details
- **Generated Video Path**: [`docs/video/breathewise_walkthrough.webm`](./video/breathewise_walkthrough.webm)
- **Resolution**: 1280 × 720 (720p HD, 16:9)
- **File Size**: ~8.5 MB
- **Formats Accepted by YouTube & Google Drive**: Native WebM format is directly supported by YouTube and Google Drive without re-encoding.

---

## 6-Section Evaluation Rubric Mapping

| Section | Rubric Requirement | How Breathewise Demonstrates It |
|---|---|---|
| **1. Walkthrough** | Complete demonstration of core features from start to finish in logical order. | Persona selection $\rightarrow$ Live location search $\rightarrow$ Today's Air Snapshot $\rightarrow$ Routine Planner $\rightarrow$ Indoor CADR Calculator $\rightarrow$ Commute Trade-offs $\rightarrow$ GenAI Chat $\rightarrow$ Impact & Pledges. |
| **2. Live Testing** | Enter data live, show test cases visibly, test success + edge/error cases. | Live typing of city name, interactive smog multiplier slider, live numeric inputs for room dimensions ($6.5\text{ m} \times 5.0\text{ m}$), live commute distance ($15\text{ km}$), and live AI prompt testing. |
| **3. GenAI in Action** | Clearly point out where AI is used, show prompt in and response out, explain purpose, prove dynamic. | Highlighted `"🤖 Gemini 2.5 Flash Verified Guidance"` badge; showed prompt going in and live SSE streaming response coming out; demonstrated deterministic physics overwrite ("LLM does language, code does math"). |
| **4. Edge & Error Cases** | Demonstrate how the app behaves with errors, unexpected inputs, or clinical safety triggers. | **Emergency Medical Guardrail**: prompt `"My child has severe chest pain and cannot breathe"` triggers immediate red clinical emergency warning (112/911 triage). **Off-Topic Guardrail**: `"Write python code for bubble sort"` triggers domain safety redirect. |
| **5. Time Limit** | Strictly under 4 minutes. | Fast, deliberate pacing with visual pauses on key data points; total run time is **~3 minutes 15 seconds**. |
| **6. Submission** | Public Google Drive or YouTube link tested in incognito. | Step-by-step checklist below for sharing and permissions verification. |

---

## Second-by-Second Video Storyboard & Script

```
0:00 ──► 0:30  Scene 1: Introduction, Persona & Local Privacy
0:30 ──► 1:05  Scene 2: Live City Search, Air Snapshot & What-If Smog Simulator
1:05 ──► 1:30  Scene 3: Routine Planner & Diurnal Inversion Timing
1:30 ──► 2:00  Scene 4: Indoor Hacks & CADR Decay Physics Calculator
2:00 ──► 2:30  Scene 5: Commute & Multimodal Transit Trade-offs
2:30 ──► 3:15  Scene 6: GenAI in Action & Defensive Safety Guardrails
3:15 ──► 3:35  Scene 7: Impact Meter, Community Pledges & Data Sovereignty
```

---

### Scene 1: Introduction & Persona Switch (0:00 – 0:30)
- **On Screen**: The Breathewise home screen at `localhost:5173`. Point cursor to the top badges (`WCAG 2.2 AA`, `Local-First Zero PII`, `139 Verified Tests`).
- **Live Action**: Click the Persona dropdown (`👤 Priya - Asthmatic Child`) and switch to `Rahul - Daily Commuter`. Watch the profile parameters immediately update.
- **Narration / Caption**:
  > *"Welcome to Breathewise, a privacy-first urban environmental health assistant built for severe winter smog episodes. Breathewise is 100% local-first with zero tracking cookies and zero PII. We support 6 evidence-based personas; here we switch to Rahul, a daily commuter."*

---

### Scene 2: Live City Search & Air Quality Dynamics (0:30 – 1:05)
- **On Screen**: Location selector in the navigation bar.
- **Live Action**: Click the location pin, type `"Delhi"` live into the search input. Pause to let viewers read `"Delhi, India"`, then click to select.
- **Live Interaction**: On the **Today's Air** dashboard:
  - Point to the live **EPA AQI (2024 Revised)** badge and WHO particulate multiple ($>18\times$).
  - Drag the **What-If Smog Multiplier** slider from `1.0x` to `1.5x` live. Notice the real-time recalculation of AQI and stagnation risk.
  - Highlight the **Lowest-Exposure Travel Window** (*"Best Time to Travel: 13:00 - 15:00 saving ~48% inhaled PM2.5"*).
  - Highlight the **AI Verdict Card** displaying the `"🤖 Gemini 2.5 Flash Verified Guidance"` badge.
- **Narration / Caption**:
  > *"We enter our city live—Delhi, India. Breathewise retrieves real-time atmospheric data from CAMS. Notice our What-If Smog Simulator: as we slide the multiplier to 1.5x to model a nocturnal thermal inversion spike, all health recommendations update dynamically."*

---

### Scene 3: Routine Planner & Diurnal Inversion (1:05 – 1:30)
- **On Screen**: Click the **Routine Planner** tab (`#tab-routine`).
- **Live Action**: Scroll through the 24-hour diurnal timeline.
- **Key Highlight**: Point out the contrast between hazardous early-morning inversions (06:00 - 08:30) and optimal afternoon solar mixing windows (12:30 - 15:30).
- **Narration / Caption**:
  > *"In the Routine Planner, Breathewise leverages diurnal atmospheric dynamics. Instead of vague advice, it pinpoints exact hourly windows, advising commuters and school runs to avoid ground-level morning inversions."*

---

### Scene 4: Indoor Hacks & CADR Physics (1:30 – 2:00)
- **On Screen**: Click the **Indoor Hacks** tab (`#tab-indoor`).
- **Live Action**: Live testing of the CADR & Exponential Decay Calculator:
  - Clear the length field and type `6.5` m.
  - Clear the width field and type `5.0` m.
  - Pause so viewers see the dimensions: room volume recomputes to $91\text{ m}^3$.
  - Required CADR automatically re-evaluates to $364\text{ m}^3/\text{h}$, and the physical exponential decay time for 90% particle clearance recomputes in real time ($t = -\frac{V}{\text{CADR}} \ln(1 - \eta)$).
  - Scroll down to review the DIY Corsi-Rosenthal Box Fan specifications.
- **Narration / Caption**:
  > *"Under Indoor Hacks, we test the CADR Calculator with live inputs: typing 6.5 by 5.0 meters immediately recomputes required air changes per hour and exponential decay clearance times using ANSI/AHAM AC-1 physics."*

---

### Scene 5: Multimodal Commute Alternatives (2:00 – 2:30)
- **On Screen**: Click the **Commute & Travel** tab (`#tab-alternatives`).
- **Live Action**: Show the transit trade-off matrix comparing Electric Metro, Public Bus, Car, Two-Wheeler, Bicycle, and Walking.
- **Key Highlight**: Point out that unlike naive distance comparisons, Breathewise factors in exertion breathing rates (16 L/min vs 42 L/min) and vehicle cabin infiltration ratios. Metro delivers ~78% less inhaled particulate dose compared to a motorbike.
- **Narration / Caption**:
  > *"In the Commute tab, we compare travel modes with physiological rigor. Because cyclists breathe at 42 liters per minute versus 16 in a vehicle, the matrix shows that taking the Electric Metro cuts inhaled particulate dose by nearly 80%."*

---

### Scene 6: GenAI in Action & Defensive Safety Guardrails (2:30 – 3:15)
- **On Screen**: Click the **Breathewise AI** tab (`#tab-chat`).
- **Test Case 1 (Success Case — Real-time GenAI)**:
  - Type live: `"What is the safest hour for outdoor travel today?"`
  - Click **Send**.
  - Watch the real-time SSE streaming response arrive chunk-by-chunk, referencing Delhi's live PM2.5 and persona constraints.
- **Test Case 2 (Edge Case — Medical Emergency Detection)**:
  - Type live: `"My child has severe chest pain and cannot breathe"`
  - Click **Send**.
  - Show the guardrail instantly triggering: a high-priority red alert appears with emergency triage instructions and national helpline numbers (112 / 108 / 911), refusing AI speculation.
- **Test Case 3 (Edge Case — Off-Topic Domain Boundary)**:
  - Type live: `"Write python code for bubble sort"`
  - Click **Send**.
  - Show the guardrail politely declining and redirecting back to urban air quality and respiratory health.
- **Narration / Caption**:
  > *"Here is GenAI in action. We submit our first prompt: notice the real-time streaming response powered by Gemini 2.5 Flash. Now we test defensive safety: typing 'My child has severe chest pain and cannot breathe' immediately triggers our clinical triage guardrail, redirecting to emergency numbers. An off-topic coding prompt is similarly caught and redirected."*

---

### Scene 7: Impact Meter, Pledges & Data Sovereignty (3:15 – 3:35)
- **On Screen**: Click **Impact Meter** (`#tab-impact`), then **Community Pledges** (`#tab-community`).
- **Live Action**:
  - Click the **Take Public Transit** pledge button. Notice the collective counter update.
  - Toggle Dark/Light mode in the header.
  - Click the **Export JSON Data** button in the header to demonstrate that user profiles and pledges are 100% exportable and stay entirely inside browser `localStorage`.
- **Narration / Caption**:
  > *"Finally, the Impact Meter tracks personal dose reductions, and Community Pledges aggregate collective airshed action. With one click, users can export their data or wipe it completely. Breathewise brings together rigorous atmospheric physics, deterministic math, and defensive GenAI."*

---

## Pre-Submission Verification Checklist

- [x] **Feature Coverage**: All 7 views (Today, Routine, Indoor, Alternatives, Impact, Community, Chat) and Personas demonstrated.
- [x] **Live Data Entry**: City search typed live, room dimensions typed live, three distinct chat prompts typed live.
- [x] **Visible Inputs**: Pauses included after every input so viewers can read exact values.
- [x] **Success & Edge Cases**: Live domain advice + Medical emergency triage + Off-topic query rejection all shown.
- [x] **GenAI Visibility**: SSE streaming responses, Gemini 2.5 Flash model badges, and guardrails clearly displayed.
- [x] **Duration**: Total video runtime is strictly under 4 minutes.
- [x] **Format**: 720p HD 16:9 WebM file ready at `docs/video/breathewise_walkthrough.webm`.

---

## Upload & Submission Instructions

### Option A: YouTube (Recommended)
1. Go to [studio.youtube.com](https://studio.youtube.com).
2. Click **Create** $\rightarrow$ **Upload videos**, and select `docs/video/breathewise_walkthrough.webm`.
3. Title: `Breathewise - GenAI Urban Air Quality Assistant Demo`.
4. Set visibility to **Unlisted** (anyone with the link can view; not publicly searchable).
5. Open an **Incognito / InPrivate** browser window and paste the YouTube link to confirm it plays immediately without signing in.

### Option B: Google Drive
1. Upload `breathewise_walkthrough.webm` to your Google Drive.
2. Right-click the file $\rightarrow$ **Share** $\rightarrow$ **General access** $\rightarrow$ set to **"Anyone with the link"** as **Viewer**.
3. Copy the link.
4. Open an **Incognito / InPrivate** browser window and paste the link to verify it streams without prompting for Google account login.
