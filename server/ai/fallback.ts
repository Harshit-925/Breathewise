import type { HouseholdProfile, AirData } from '../../src/types/index.js';
import { aqiCategory } from '../../src/lib/engine/aqi.js';
import { cadrRequired, purificationTime } from '../../src/lib/engine/cadr.js';

export interface StructuredAdvice {
  readonly verdict: {
    readonly level: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
    readonly headline: string;
    readonly why: string;
  };
  readonly routine: Array<{
    readonly window: string;
    readonly activity: string;
    readonly reason: string;
    readonly impact: string;
  }>;
  readonly indoor: Array<{
    readonly tier: 'diy' | 'standard' | 'premium';
    readonly title: string;
    readonly steps: string[];
    readonly costBand: string;
    readonly effect: string;
    readonly assumptions: string[];
  }>;
  readonly alternatives: Array<{
    readonly from: string;
    readonly to: string;
    readonly effort: string;
    readonly exposureDelta: number;
    readonly co2eDelta: number;
    readonly assumptions: string[];
  }>;
  readonly disclaimer: string;
}

export function generateFallbackAdvice(
  household: HouseholdProfile,
  airData: AirData,
  lang: 'en' | 'hi' = 'en'
): StructuredAdvice {
  const aqi = airData.aqi;
  const cat = aqiCategory(aqi, 'epa');

  let verdictLevel: 'good' | 'moderate' | 'unhealthy' | 'hazardous' = 'moderate';
  if (aqi <= 50) verdictLevel = 'good';
  else if (aqi <= 100) verdictLevel = 'moderate';
  else if (aqi <= 200) verdictLevel = 'unhealthy';
  else verdictLevel = 'hazardous';

  const cadrReq = cadrRequired(household.roomVolume, 4).cadrM3h;
  const purifyMins = purificationTime(household.roomVolume, cadrReq, 0.9).minutes;

  if (lang === 'hi') {
    return {
      verdict: {
        level: verdictLevel,
        headline: `वर्तमान वायु गुणवत्ता ${cat.label} (AQI ${aqi}) है`,
        why: `PM2.5 का स्तर ${airData.pm25} µg/m³ है, जो विश्व स्वास्थ्य संगठन के दिशानिर्देशों से अधिक है।`,
      },
      routine: [
        {
          window: '06:00 - 08:00',
          activity: 'सुबह की बाहरी सैर से बचें या घर के अंदर योग/व्यायाम करें',
          reason: 'सुबह की ठंडी हवा में प्रदूषण जमीन के पास जम जाता है (थर्मल इनवर्जन)।',
          impact: 'सांस में जाने वाले PM2.5 में 40% तक की कमी।',
        },
        {
          window: '12:00 - 15:00',
          activity: 'यदि आवश्यक हो तो जरूरी बाहरी काम इस समय निपटाएं',
          reason: 'दोपहर में धूप और हवा के कारण प्रदूषण का स्तर अपेक्षाकृत कम रहता है।',
          impact: 'कम से कम जोखिम में कार्य संपादन।',
        },
        {
          window: '19:00 - 22:00',
          activity: 'खिड़कियां बंद रखें और एयर प्यूरीफायर चालू रखें',
          reason: 'शाम के ट्रैफिक और तापमान में गिरावट से प्रदूषण फिर बढ़ता है।',
          impact: 'रात में स्वच्छ नींद और श्वसन तंत्र की सुरक्षा।',
        },
      ],
      indoor: [
        {
          tier: 'diy',
          title: 'कोर्सी-रोसेन्थल बॉक्स (DIY एयर क्लीनर)',
          steps: [
            'एक 20-इंच बॉक्स फैन और 4 MERV-13 फिल्टर लें।',
            'डक्ट टेप से फिल्टर को फैन के चारों ओर सुरक्षित बॉक्स में जोड़ें।',
            'कमरे में निरंतर मध्यम गति पर चलाएं।',
          ],
          costBand: '₹1,500 - ₹2,500',
          effect: `कमरे के वायु को लगभग ${purifyMins} मिनट में शुद्ध करता है।`,
          assumptions: [`कमरे का आयतन: ${household.roomVolume} m³`, '4 वायु परिवर्तन प्रति घंटा (ACH)'],
        },
        {
          tier: 'standard',
          title: 'मानक HEPA एयर प्यूरीफायर',
          steps: [
            `कम से कम ${cadrReq} m³/h CADR वाला HEPA H13 प्यूरीफायर चुनें।`,
            'प्यूरीफायर को दीवार से कम से कम 2 फीट दूर रखें।',
            'दरवाजे और खिड़कियां बंद रखें।',
          ],
          costBand: '₹7,000 - ₹12,000',
          effect: '99.97% महीन कणों को फिल्टर करता है।',
          assumptions: [`आवश्यक CADR: ${cadrReq} m³/h`],
        },
        {
          tier: 'premium',
          title: 'स्मार्ट मल्टी-स्टेज HEPA + कार्बन सिस्टम',
          steps: [
            'उच्च क्षमता वाला ट्रू HEPA और सक्रिय कार्बन प्यूरीफायर लगाएं।',
            'दरवाजों और खिड़कियों पर वेदर-स्ट्रिपिंग सील लगाएं।',
            'CO2 स्तर की निगरानी करें और दोपहर में नियंत्रित वेंटिलेशन करें।',
          ],
          costBand: '₹20,000+',
          effect: 'PM2.5, VOCs और गंध का संपूर्ण नियंत्रण।',
          assumptions: ['स्मार्ट सेंसर स्वचालित गति नियंत्रण'],
        },
      ],
      alternatives: [
        {
          from: 'अकेले कार से यात्रा (10 किमी)',
          to: 'मेट्रो या रैपिड रेल',
          effort: 'मध्यम',
          exposureDelta: -35,
          co2eDelta: -1.8,
          assumptions: ['10 किमी यात्रा दूरी', 'DEFRA कार्बन उत्सर्जन मानक'],
        },
      ],
      disclaimer: 'यह सलाह केवल सामान्य पर्यावरण कल्याण के लिए है, किसी बीमारी का चिकित्सकीय निदान नहीं है।',
    };
  }

  // English fallback
  return {
    verdict: {
      level: verdictLevel,
      headline: `Current Air Quality is ${cat.label} (AQI ${aqi})`,
      why: `PM2.5 concentration is ${airData.pm25} µg/m³, which warrants targeted protective measures for sensitive individuals.`,
    },
    routine: [
      {
        window: '06:00 - 08:30',
        activity: 'Move workouts indoors; delay early outdoor runs or school walks',
        reason: 'Ground-level temperature inversions trap vehicular and particulate smog early morning.',
        impact: 'Reduces morning PM2.5 inhaled dose by an estimated 45%.',
      },
      {
        window: '12:00 - 15:30',
        activity: 'Safest window for errands and brief outdoor transit (wear N95 mask)',
        reason: 'Solar heating lifts the atmospheric boundary layer, dispersing peak pollutant concentrations.',
        impact: 'Lowest hourly exposure rate of the daytime.',
      },
      {
        window: '19:00 - 22:00',
        activity: 'Seal windows and engage indoor air filtration',
        reason: 'Evening commute emissions and cooling night temperatures re-concentrate smog.',
        impact: 'Maintains healthy indoor sleep air quality below 15 µg/m³.',
      },
    ],
    indoor: [
      {
        tier: 'diy',
        title: 'Corsi-Rosenthal Box (Affordable DIY Clean Air)',
        steps: [
          'Tape four 20x20 MERV-13 filters into a cube with cardboard bottom.',
          'Mount a 20-inch box fan facing upward on top and seal edges with duct tape.',
          'Run on medium speed in central living or sleeping space.',
        ],
        costBand: '$40 - $70 (₹2,500 - ₹4,500)',
        effect: `Delivers ~300-400 m³/h CADR; cleans ${household.roomVolume} m³ in ~${purifyMins} mins.`,
        assumptions: [`Room volume: ${household.roomVolume} m³`, 'Target ACH: 4.0'],
      },
      {
        tier: 'standard',
        title: 'Certified HEPA H13 Air Purifier',
        steps: [
          `Deploy a certified HEPA air purifier sized for at least ${cadrReq} m³/h CADR.`,
          'Place in central location, raised off floor, away from curtains.',
          'Keep bedroom doors closed while operating continuously on auto/medium mode.',
        ],
        costBand: '$120 - $220 (₹9,000 - ₹15,000)',
        effect: 'Traps 99.97% of PM2.5 and allergen particulates.',
        assumptions: [`Calculated required CADR: ${cadrReq} m³/h`],
      },
      {
        tier: 'premium',
        title: 'Multi-Stage HEPA + Carbon Filtration with Positive Pressure',
        steps: [
          'Install high-capacity True HEPA combined with activated carbon for VOC and odor removal.',
          'Apply adhesive weather-stripping foam around leaky window frames and door sweeps.',
          'Monitor indoor CO2 and execute brief ventilation flushes during lowest AQI hours.',
        ],
        costBand: '$350+ (₹25,000+)',
        effect: 'Comprehensive protection against fine particles and harmful gaseous co-pollutants.',
        assumptions: ['Includes active air quality monitoring sensor'],
      },
    ],
    alternatives: [
      {
        from: 'Solo Petrol/Diesel Car Commute (10 km)',
        to: 'Metro Transit + First/Last-Mile Walk with N95 Mask',
        effort: 'Low-Medium',
        exposureDelta: -28,
        co2eDelta: -1.75,
        assumptions: [
          '10 km daily commute baseline',
          'Cabin filter assumption: moderate leakage in congested traffic',
          'DEFRA UK & CPCB transport emissions factors',
        ],
      },
      {
        from: 'Motorbike / Open Two-Wheeler Commute',
        to: 'Air-Conditioned Public Bus or Metro',
        effort: 'Medium',
        exposureDelta: -42,
        co2eDelta: -0.9,
        assumptions: ['Direct exhaust plume exposure on two-wheelers is 2-3x ambient background'],
      },
    ],
    disclaimer:
      'General environmental wellness guidance only. Not medical advice. For severe symptoms or medical emergencies, consult a qualified healthcare provider immediately.',
  };
}
