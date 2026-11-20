export const SYSTEM_PROMPT = `You are Breathewise, an expert urban air quality and environmental health assistant.
You help families and communities navigate severe smog and urban air pollution with practical, low-emission daily routines, indoor air hacks, and sustainable travel alternatives.

NON-NEGOTIABLE CORE RULES:
1. HEALTH SAFETY: You provide general environmental wellness guidance only. You NEVER diagnose medical conditions or prescribe medications. If a user describes emergency symptoms (e.g., severe breathlessness, chest pain, blue lips, severe asthma attack), immediately instruct them to seek urgent medical attention or call local emergency services.
2. NUMBER ACCURACY: Never invent air quality numbers, pollutant concentrations, or mathematical calculations. All figures must strictly come from the provided air quality context.
3. SCOPE CONSTRAINT: Stay strictly focused on air quality, pollution exposure, respiratory wellness routines, indoor air management, sustainable transportation, and community clean-air actions. Politely decline questions outside this domain.
4. TONE & EMPATHY: Be calm, encouraging, evidence-based, and actionable. Avoid doom-mongering; focus on practical mitigations.
5. LOCAL CONTEXT: Adapt advice to household members (e.g. children, elderly, asthmatics) and home building types.`;

export const PERSONA_DESCRIPTIONS: Record<string, string> = {
  infant: 'Infant (high respiratory rate, developing lungs, needs maximum indoor protection)',
  child: 'Child (active, developing airways, needs safe outdoor play scheduling)',
  adult: 'Adult (healthy baseline, active daily routine)',
  elderly: 'Elderly relative (vulnerable cardiovascular and respiratory systems, minimize exertion in high AQI)',
};

export const BUILDING_DESCRIPTIONS: Record<string, string> = {
  modern_sealed: 'Modern well-sealed apartment (low infiltration, good for purifiers, needs scheduled CO2 ventilation)',
  standard: 'Standard construction home (moderate air infiltration)',
  older_leaky: 'Older or permeable building (high outdoor air infiltration, needs weatherstripping hacks)',
  open_plan: 'Open-plan living space (large air volume requiring higher clean air delivery rate)',
};

export function buildAdvicePrompt(householdStr: string, airDataStr: string, lang: 'en' | 'hi'): string {
  const langInstruction = lang === 'hi'
    ? 'Write the explanation, routine recommendations, and indoor hacks in clear, conversational Hindi (using Devanagari script). Maintain the exact JSON schema structure.'
    : 'Write in clear, actionable English.';

  return `Based on the following household and current air quality context, generate tailored recommendations.

Household Profile:
${householdStr}

Air Quality Context:
${airDataStr}

Instructions:
${langInstruction}
Return a structured JSON matching the requested schema with:
- verdict: level ("good"|"moderate"|"unhealthy"|"hazardous"), headline, and clear why
- routine: 3-5 scheduled time windows with recommended activity, reason, and expected impact
- indoor: 3 tiers of indoor air hacks (DIY/budget, standard, and premium)
- alternatives: 2-3 sustainable transport or lifestyle swaps
- disclaimer: standard wellness notice
`;
}
