import fs from 'fs';

// Read current states.json
const states = JSON.parse(fs.readFileSync('./src/lib/content/states.json', 'utf8'));

// Read the existing Andhra Pradesh English content (to keep the structure)
const enAP = states.states['Andhra Pradesh'];

// Create bilingual Andhra Pradesh with en/te variants
const bilingualAP = {
  stateName: "Andhra Pradesh",
  languageCode: "te",
  capital: {
    en: enAP.capital,
    te: {
      title: "🏛️ అమరావతి - పవిత్ర నగరం!",
      emoji: "🏛️",
      mainText: "కృష్ణ నదీ ఒడ్డున ఉన్న ఒక నగరాన్ని ఊహించుకోండి! అమరావతి అంధ్రప్రదేశ్ రాజధాని మరియు ఇది అందమైన ఆలయాలు మరియు ఆధ్యాత్మిక ప్రాధాన్యత కోసం ప్రసిద్ధి చెందింది.",
      keyFacts: ["1656లో నిర్మించబడినది", "అంధ్రప్రదేశ్ రాజధానిగా ఉంది", "అందమైన ఆలయాలకు ప్రసిద్ధి", "కృష్ణ నదీ ఒడ్డున ఉంది"],
      narration: "అమరావతి కృష్ణ నదీ ఒడ్డున ఉన్న ఒక పవిత్ర నగరం. పురాతన ఆలయాల గుండా నడుస్తూ, ఆ నదిని చూస్తూ ఉండటం ఎలా ఉంటుందో ఊహించుకోండి.",
      coolFacts: [],
      didYouKnow: "",
      tryThis: ""
    }
  },
  language: {
    en: enAP.language,
    te: {
      title: "🗣️ తెలుగు - భారతం యొక్క సంపద!",
      emoji: "🗣️",
      mainText: "భారతంలో 80 మిలియన్ మంది తెలుగు మాట్లాడతారు! ఇది ప్రపంచంలోని అతిపురాతన భాషలలో ఒకటి మరియు సుందర వక్ర అక్షరాలతో వ్రాయబడుతుంది.",
      keyFacts: ["అంధ్రప్రదేశ్ అధికారిక భాష", "80 మిలియన్ మంది మాట్లాడతారు", "ప్రపంచంలోని అతిపురాతన భాషలలో ఒకటి", "అందమైన వక్ర లిపి"],
      narration: "తెలుగు అంధ్రప్రదేశ్ భాష! ఒకే భాషలో 80 మిలియన్ మంది మాట్లాడుతున్నారని ఊహించుకోండి! ఇది జర్మనీ మొత్తం జనాభాకు సమానం!",
      coolFacts: [],
      didYouKnow: "",
      tryThis: ""
    }
  },
  food: {
    en: enAP.food,
    te: {
      title: "🍜 పులిహోర - ఖట్టా జాదూ!",
      emoji: "🍜",
      mainText: "పులిహోర అంధ్రప్రదేశ్ నుండి ఒక ప్రియమైన అన్న భోజనం! ఇది ఖట్టా, వంటకి కూర, మరియు అద్భుత రుచికరమైనవి నిండిఉంటుంది.",
      keyFacts: ["ఖట్టా అన్న అని అర్థం", "చింతలో తయారు చేయబడుతుంది", "పండుగ ప్రత్యేష నిడిష్", "సంబరాలలో వడుతుంది"],
      narration: "పులిహోర అంధ్రప్రదేశ్ యొక్క రుచి! అన్నతో చింత యొక్క ఖట్టా సాద మరియు కరకరలాడిన వేరుశెనగలను కలపడం ఎలా ఉంటుందో ఊహించుకోండి.",
      coolFacts: [],
      didYouKnow: "",
      tryThis: ""
    }
  },
  places: {
    en: enAP.places,
    te: {
      title: "🛕 తిరుమల ఆలయం - అద్భుత పర్వతం!",
      emoji: "🛕",
      mainText: "తిరుమల ఆలయం భారతం యొక్క అత్యంత సందర్శించిన ఆలయాలలో ఒకటి! ఒక అందమైన పర్వతంపై నిర్మితమైన, తీర్థ దర్శకులు 3,500 సోపానాలు ఎక్కుతారు.",
      keyFacts: ["సమృద్ధమైన ఆలయాలలో ఒకటి", "3,500 సోపానాలు ఎక్కవలసి ఉంటుంది", "9వ శతాబ్దంలో నిర్మితం", "ఏటా మిలియన్ల మంది సందర్శించారు"],
      narration: "తిరుమల ఆలయానికి స్వాగతం - ఒక స్థానం ఇక్కడ భూమి ఆకాశాన్ని తాకుతుంది! ఈ అద్భుత ఆలయం అంధ్రప్రదేశ్ పర్వతం చిట్టిపై కూర్చోబడి ఉంది.",
      coolFacts: [],
      didYouKnow: "",
      tryThis: ""
    }
  },
  animal: {
    en: enAP.animal,
    te: {
      title: "🦌 కృష్ణమృగం - అందమైన నర్తకుడు!",
      emoji: "🦌",
      mainText: "కృష్ణమృగం అంధ్రప్రదేశ్ రాష్ట్ర జంతువు! ఇది సర్పిలాకార కొమ్ములు కలిగిన అందమైన జింక, మరియు ఇది సూపర్ ఫాస్ట్ పరిగెత్తగలదు.",
      keyFacts: ["అంధ్రప్రదేశ్ రాష్ట్ర జంతువు", "అందమైన సర్పిలాకార కొమ్ములు", "గంటకు 80 కిమీ వేగంతో పరిగెత్తగలదు", "గడ్డి భూములలో నివసిస్తుంది"],
      narration: "కృష్ణమృగం - అంధ్రప్రదేశ్ సూపర్ స్టార్ జంతువుతో పరిచయం చేసుకోండి! పొడవైన సర్పిలాకార కొమ్ములు కలిగిన అందమైన జింకను చిత్రించుకోండి.",
      coolFacts: [],
      didYouKnow: "",
      tryThis: ""
    }
  },
  funFact: {
    en: enAP.funFact,
    te: {
      title: "🌶️ మిర్చి చాంపియన్‌లు!",
      emoji: "🌶️",
      mainText: "అంధ్రప్రదేశ్ భారతంలో సరికొత్త మిర్చిలను ఉత్పత్తి చేస్తుంది! ఇక్కడ ఉన్న ఎర్ర మిర్చిలు ప్రపంచం అంతటా వంటకు పంపబడతాయి.",
      keyFacts: ["ప్రపంచం యొక్క సరికొత్త మిర్చిలు", "ఎర్ర మిర్చిలు ప్రపంచవ్యాపీ ప్రసిద్ధి", "50+ దేశాలకు ఎగుమతి", "గుంటూర్ మిర్చి ప్రసిద్ధి"],
      narration: "మీకు తెలుసా? అంధ్రప్రదేశ్ భారత మిర్చి చాంపియన్! ఇక్కడ ఉత్పత్తి చేయిన ఎర్ర మిర్చిలు చాలా వేడిగా మరియు ప్రసిద్ధి, ఇవి ప్రపంచం అంతటా వంటకుకు సంచరిస్తాయి.",
      coolFacts: [],
      didYouKnow: "",
      tryThis: ""
    }
  }
};

// Update states.json with bilingual Andhra Pradesh
states.states['Andhra Pradesh'] = bilingualAP;

// Write back
fs.writeFileSync('./src/lib/content/states.json', JSON.stringify(states, null, 2));

console.log('✅ Bilingual Andhra Pradesh created and merged into states.json');
console.log('Structure: Each card type now has {en: {...}, te: {...}} variants');
console.log('Initial language: Telugu (te)');
