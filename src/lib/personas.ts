import type { HouseholdProfile } from '../types/index.js';

export interface PredefinedPersona {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly vulnerabilityHighlight: string;
  readonly recommendedAction: string;
  readonly profile: HouseholdProfile;
}

export const PREDEFINED_PERSONAS: readonly PredefinedPersona[] = [
  {
    id: 'priya-asthmatic-child',
    name: 'Priya',
    role: 'Asthmatic Child (Age 8)',
    description: 'High minute ventilation relative to body mass; hyper-reactive bronchial airways triggered by fine PM2.5 spikes.',
    vulnerabilityHighlight: 'Alveolar inflammation risk during morning temperature inversions; requires recess scheduling guidance.',
    recommendedAction: 'Fit N95 mask for school walks; operate HEPA filter in bedroom sized to 35 m³ volume.',
    profile: {
      id: 'persona-priya',
      name: 'Priya (Asthmatic Child, 8y)',
      members: [
        {
          ageGroup: 'child',
          activityLevel: 'moderate',
          mask: 'N95',
          outdoorHoursPerDay: 1.5,
          maxPm25: 15,
        },
      ],
      buildingType: 'standard',
      roomVolume: 35,
      hasPurifier: true,
      purifierCadr: 250,
    },
  },
  {
    id: 'arjun-newborn',
    name: 'Arjun',
    role: 'Newborn (Age 6 months)',
    description: 'Immature respiratory defense mechanisms; developing alveoli cannot tolerate airborne combustion toxins.',
    vulnerabilityHighlight: 'Cannot wear masks; dependent 100% on indoor air purification and strategic window scheduling.',
    recommendedAction: 'Keep windows strictly sealed during morning smog hours; maintain minimum 4-5 Air Changes per Hour (ACH).',
    profile: {
      id: 'persona-arjun',
      name: 'Arjun (Newborn, 6m)',
      members: [
        {
          ageGroup: 'infant',
          activityLevel: 'rest',
          mask: 'none',
          outdoorHoursPerDay: 0.5,
          maxPm25: 10,
        },
      ],
      buildingType: 'modern_sealed',
      roomVolume: 30,
      hasPurifier: true,
      purifierCadr: 300,
    },
  },
  {
    id: 'dadi-elderly',
    name: 'Dadi',
    role: 'Elderly Relative (Age 72)',
    description: 'Pre-existing cardiovascular hypertension; fine particulates enter bloodstream causing arterial vasoconstriction.',
    vulnerabilityHighlight: 'Morning walk during smog inversion (06:00-08:00) dramatically elevates myocardial infarction risk.',
    recommendedAction: 'Shift walking routine to 13:00-15:00 solar mixing window; wear well-sealed N95 respirator if stepping out.',
    profile: {
      id: 'persona-dadi',
      name: 'Dadi (Elderly Relative, 72y)',
      members: [
        {
          ageGroup: 'elderly',
          activityLevel: 'light',
          mask: 'N95',
          outdoorHoursPerDay: 1,
          maxPm25: 25,
        },
      ],
      buildingType: 'standard',
      roomVolume: 40,
      hasPurifier: true,
      purifierCadr: 200,
    },
  },
  {
    id: 'meera-school-run',
    name: 'Meera',
    role: 'School-Run Parent',
    description: 'Manages morning and afternoon school drop-offs and after-school outdoor recreation for children.',
    vulnerabilityHighlight: 'Idling cars and diesel school buses at pickup zones create high-density toxic micro-climates.',
    recommendedAction: 'Check daily diurnal forecast before morning departure; advocate for carpool and anti-idling zones.',
    profile: {
      id: 'persona-meera',
      name: 'Meera (School Run Parent)',
      members: [
        {
          ageGroup: 'adult',
          activityLevel: 'moderate',
          mask: 'N95',
          outdoorHoursPerDay: 3,
          maxPm25: 35,
        },
        {
          ageGroup: 'child',
          activityLevel: 'moderate',
          mask: 'N95',
          outdoorHoursPerDay: 2,
          maxPm25: 25,
        },
      ],
      buildingType: 'standard',
      roomVolume: 50,
      hasPurifier: false,
      purifierCadr: 200,
    },
  },
  {
    id: 'rahul-commuter',
    name: 'Rahul',
    role: 'Daily Urban Commuter',
    description: 'Travels 12 km each way through high-traffic arterial corridors across the city.',
    vulnerabilityHighlight: 'Two-wheeler and bus commutes result in 2.5x to 3x higher inhaled particulate doses compared to metro.',
    recommendedAction: 'Shift to underground metro or EV transit; use Best Time to Travel window to avoid 08:30 smog peak.',
    profile: {
      id: 'persona-rahul',
      name: 'Rahul (Daily Commuter)',
      members: [
        {
          ageGroup: 'adult',
          activityLevel: 'moderate',
          mask: 'N95',
          outdoorHoursPerDay: 3.5,
          maxPm25: 45,
        },
      ],
      buildingType: 'standard',
      roomVolume: 45,
      hasPurifier: false,
      purifierCadr: 200,
    },
  },
  {
    id: 'sunita-community-lead',
    name: 'Sunita',
    role: 'Community Lead / RWA Organizer',
    description: 'Resident Welfare Association coordinator mobilizing neighborhood clean air interventions.',
    vulnerabilityHighlight: 'Neighborhood biomass waste burning and localized diesel generator usage spike street-level PM2.5.',
    recommendedAction: 'Organize community pledge drives; coordinate shared DIY air cleaner builds; monitor colony air sensors.',
    profile: {
      id: 'persona-sunita',
      name: 'Sunita (Community Lead)',
      members: [
        {
          ageGroup: 'adult',
          activityLevel: 'light',
          mask: 'N95',
          outdoorHoursPerDay: 2,
          maxPm25: 35,
        },
      ],
      buildingType: 'standard',
      roomVolume: 60,
      hasPurifier: true,
      purifierCadr: 350,
    },
  },
];
