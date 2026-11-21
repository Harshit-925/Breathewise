import type { HouseholdProfile, AirData, StructuredAdvice } from '../../src/types/index.js';
import { aqiCategory, whoMultiple } from '../../src/lib/engine/aqi.js';
import { cadrRequired, purificationTime } from '../../src/lib/engine/cadr.js';
import { compareModes } from '../../src/lib/engine/modes.js';

export function generateFallbackAdvice(
  household: HouseholdProfile,
  airData: AirData,
  lang: 'en' | 'hi' = 'en'
): StructuredAdvice {
  const aqi = airData.aqi;
  const cat = aqiCategory(aqi, 'epa');
  const who = whoMultiple(airData.pm25);

  let verdictLevel: 'good' | 'moderate' | 'unhealthy' | 'hazardous' = 'moderate';
  if (aqi <= 50) verdictLevel = 'good';
  else if (aqi <= 100) verdictLevel = 'moderate';
  else if (aqi <= 200) verdictLevel = 'unhealthy';
  else verdictLevel = 'hazardous';

  const DIY_CADR = 350; // m³/h Corsi-Rosenthal box cleaner
  const diyPurifyMins = Math.round(purificationTime(household.roomVolume, DIY_CADR, 1.0, 0, 0.90).minutes);

  const cadrReq = cadrRequired(household.roomVolume, 4).cadrM3h;
  const stdPurifyMins = Math.round(purificationTime(household.roomVolume, cadrReq, 1.0, 0, 0.90).minutes);

  const premCadrReq = cadrRequired(household.roomVolume, 6).cadrM3h;
  const premPurifyMins = Math.round(purificationTime(household.roomVolume, premCadrReq, 1.0, 0, 0.90).minutes);

  const comp = compareModes({ distanceKm: 10, durationMinutes: 30 }, airData.pm25, ['car', 'metro', 'bus', 'two_wheeler']);
  const metroRes = comp.results.find((r) => r.mode === 'metro');
  const carRes = comp.results.find((r) => r.mode === 'car');
  const busRes = comp.results.find((r) => r.mode === 'bus');
  const twRes = comp.results.find((r) => r.mode === 'two_wheeler');

  const expDelta0 = metroRes && carRes ? Math.round(metroRes.inhaledPm25Ug - carRes.inhaledPm25Ug) : -28;
  const co2Delta0 = metroRes && carRes ? Number((metroRes.co2eKg - carRes.co2eKg).toFixed(2)) : -1.35;

  const expDelta1 = busRes && twRes ? Math.round(busRes.inhaledPm25Ug - twRes.inhaledPm25Ug) : -35;
  const co2Delta1 = busRes && twRes ? Number((busRes.co2eKg - twRes.co2eKg).toFixed(2)) : 0.29;

  if (lang === 'hi') {
    return {
      isOffline: true,
      source: 'offline_heuristic',
      verdict: {
        level: verdictLevel,
        headline: `वर्तमान वायु गुणवत्ता ${cat.label} (AQI ${aqi}) है`,
        why: `PM2.5 का स्तर ${airData.pm25} µg/m³ है, जो विश्व स्वास्थ्य संगठन के 24-घंटे मानक (15 µg/m³) से ${who.multiple.toFixed(1)} गुना अधिक है।`,
      },
      routine: [
        {
          window: '06:00 - 08:30',
          activity: 'सुबह की बाहरी सैर से बचें या घर के अंदर योग/व्यायाम करें',
          reason: 'सुबह की ठंडी हवा में प्रदूषण जमीन के पास जम जाता है (थर्मल इनवर्जन)।',
          impact: 'दोपहर की तुलना में सुबह के चरम प्रदूषण से बचाव।',
        },
        {
          window: '12:00 - 15:30',
          activity: 'यदि आवश्यक हो तो जरूरी बाहरी काम इस समय निपटाएं (N95 मास्क पहनें)',
          reason: 'दोपहर में सौर विकिरण और हवा के कारण प्रदूषण का स्तर दिन में सबसे कम रहता है।',
          impact: 'दिन का सबसे कम जोखिम वाला समय।',
        },
        {
          window: '19:00 - 22:00',
          activity: 'खिड़कियां बंद रखें और एयर प्यूरीफायर चालू रखें',
          reason: 'शाम के ट्रैफिक और गिरते तापमान से प्रदूषण फिर बढ़ता है।',
          impact: 'रात में स्वच्छ नींद और श्वसन तंत्र की 90% सुरक्षा।',
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
          effect: `कमरे (${household.roomVolume} m³) के वायु को लगभग ${diyPurifyMins} मिनट में 90% शुद्ध करता है।`,
          assumptions: [`कमरे का आयतन: ${household.roomVolume} m³`, 'CADR ~350 m³/h', '90% कण निष्कासन समय'],
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
          effect: `Certified HEPA rated for ${cadrReq} m³/h CADR (90% शुद्धिकरण ~${stdPurifyMins} मिनट)।`,
          assumptions: [`आवश्यक CADR: ${cadrReq} m³/h`, `${household.roomVolume} m³ के लिए 4 ACH`],
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
          effect: `Hospital-grade HEPA + Carbon (${premCadrReq} m³/h CADR, 90% शुद्धिकरण ~${premPurifyMins} मिनट)।`,
          assumptions: [`आवश्यक CADR: ${premCadrReq} m³/h`, 'स्मार्ट सेंसर स्वचालित गति नियंत्रण'],
        },
      ],
      alternatives: [
        {
          from: 'अकेले कार से यात्रा (10 किमी)',
          to: 'मेट्रो या रैपिड रेल',
          effort: 'मध्यम',
          exposureDelta: expDelta0,
          co2eDelta: co2Delta0,
          assumptions: ['10 किमी यात्रा दूरी', 'DEFRA कार्बन उत्सर्जन मानक'],
        },
        {
          from: 'दोपहिया वाहन यात्रा',
          to: 'सार्वजनिक बस या मेट्रो',
          effort: 'मध्यम',
          exposureDelta: expDelta1,
          co2eDelta: co2Delta1,
          assumptions: ['10 किमी शहरी यात्रा', 'सड़क पर सीधा धुआं संपर्क कटौती'],
        },
      ],
      disclaimer: 'यह सलाह केवल सामान्य पर्यावरण कल्याण के लिए है, किसी बीमारी का चिकित्सकीय निदान नहीं है।',
    };
  }

  // English fallback
  return {
    isOffline: true,
    source: 'offline_heuristic',
    verdict: {
      level: verdictLevel,
      headline: `Current Air Quality is ${cat.label} (AQI ${aqi})`,
      why: `Ambient PM2.5 is ${airData.pm25} µg/m³ (${who.multiple.toFixed(1)}× the WHO 24-hour guideline of 15 µg/m³). Inversion trapping requires indoor mitigation and exposure reductions.`,
    },
    routine: [
      {
        window: '06:00 - 08:30',
        activity: 'Move workouts indoors; delay early outdoor runs or school walks',
        reason: 'Ground-level temperature inversions trap vehicular and particulate smog early morning.',
        impact: 'Avoids ~40-50% higher peak inversion exposure compared to midday transit.',
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
        effect: `Delivers ~350 m³/h CADR; cleans ${household.roomVolume} m³ in ~${diyPurifyMins} mins (90% particle clearance).`,
        assumptions: [`Room volume: ${household.roomVolume} m³`, 'CADR ~350 m³/h', '90% clearance time'],
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
        effect: `Certified HEPA rated for ${cadrReq} m³/h CADR (90% clearance in ~${stdPurifyMins} mins).`,
        assumptions: [`Calculated required CADR: ${cadrReq} m³/h for 4 ACH`],
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
        effect: `Hospital-grade HEPA + Carbon rated for ${premCadrReq} m³/h CADR (6 ACH, 90% clearance in ~${premPurifyMins} mins).`,
        assumptions: [`Target CADR: ${premCadrReq} m³/h for 6 ACH protection`, 'Includes active air quality monitoring sensor'],
      },
    ],
    alternatives: [
      {
        from: 'Solo Petrol/Diesel Car Commute (10 km)',
        to: 'Metro Transit + First/Last-Mile Walk with N95 Mask',
        effort: 'Low-Medium',
        exposureDelta: expDelta0,
        co2eDelta: co2Delta0,
        assumptions: [
          '10 km daily commute baseline',
          'Calculated via deterministic Breathewise transport engine',
        ],
      },
      {
        from: 'Motorbike / Open Two-Wheeler Commute',
        to: 'Air-Conditioned Public Bus or Metro',
        effort: 'Medium',
        exposureDelta: expDelta1,
        co2eDelta: co2Delta1,
        assumptions: [
          '10 km urban corridor trip',
          'Calculated via deterministic Breathewise transport engine',
        ],
      },
    ],
    disclaimer:
      'General environmental wellness guidance only. Not medical advice. For severe symptoms or medical emergencies, consult a qualified healthcare provider immediately.',
  };
}
