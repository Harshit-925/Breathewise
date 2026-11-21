const ACUTE_MEDICAL_PATTERNS = [
  /\bchest pain\b/i,
  /\b(cannot|can not|can't) breathe\b/i,
  /\bdifficulty breathing\b/i,
  /\bshortness of breath\b/i,
  /\bgasping for (air|breath)\b/i,
  /\bblue lips\b/i,
  /\bcoughing (up )?blood\b/i,
  /\bunconscious\b/i,
  /\bpassed out\b/i,
  /\bsevere asthma attack\b/i,
  /\b(i am|i'm|he is|she is|child is|baby is|someone is) choking\b/i,
  /\bchoking on\b/i,
  /सांस नहीं आ रही/,
  /सीने में दर्द/,
];

const OFF_TOPIC_KEYWORDS = [
  'crypto',
  'bitcoin',
  'stock price',
  'write python',
  'write code',
  'recipe',
  'cake',
  'movie review',
  'football match',
  'cricket score',
  'celebrity gossip',
];

export function sanitizeUserInput(input: string, maxLength = 1000): string {
  // Strip null bytes and non-printable control characters without regex
  const cleaned = Array.from(input)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return (code >= 32 || code === 9 || code === 10 || code === 13) && code !== 127;
    })
    .join('');
  // Normalize whitespace
  const normalized = cleaned.replace(/\s+/g, ' ').trim();
  // Cap length
  return normalized.slice(0, maxLength);
}

export function wrapUserInput(input: string): string {
  const sanitized = sanitizeUserInput(input);
  return `<user_input>${sanitized}</user_input>`;
}

export function checkEmergencySymptoms(input: string): boolean {
  return ACUTE_MEDICAL_PATTERNS.some((pattern) => pattern.test(input));
}

export function checkOffTopic(input: string): boolean {
  const lower = input.toLowerCase();
  return OFF_TOPIC_KEYWORDS.some((kw) => lower.includes(kw));
}

export const EMERGENCY_REDIRECT_MESSAGE =
  '⚠️ EMERGENCY WARNING: If you or someone with you is experiencing severe difficulty breathing, chest pain, blue lips, or a severe asthma attack, please seek immediate emergency medical care or call your local emergency services (e.g. 112 / 911 / 999) without delay. Breathewise provides general environmental guidance and cannot provide emergency medical treatment.';

export const OFF_TOPIC_REDIRECT_MESSAGE =
  "I am Breathewise, an assistant dedicated to air quality, pollution navigation, and respiratory wellness. I can't help with topics outside environmental health and clean air solutions. Feel free to ask about AQI forecasts, indoor air hacks, or low-exposure commuting!";
