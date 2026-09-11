import fs from 'fs';

// Read current states.json
const states = JSON.parse(fs.readFileSync('./src/lib/content/states.json', 'utf8'));

// Read the existing Andhra Pradesh English content
const enAP = states.states['Andhra Pradesh'];

// Create bilingual Andhra Pradesh with COMPLETE en/te variants for ALL content layers
const bilingualAP = {
  stateName: "Andhra Pradesh",
  languageCode: "te",
  
  capital: {
    en: {
      title: "🏛️ AMARAVATI - The New Capital!",
      emoji: "🏛️",
      mainText: "A brand-new planned city on the banks of the Krishna River! Andhra Pradesh's capital is Amaravati - built almost from scratch!",
      keyFacts: [
        "Capital: Amaravati, on the Krishna River! 🌊",
        "Andhra Pradesh's old capital was Hyderabad - lost after Telangana split off in 2014! 🏙️",
        "Amaravati is being built as a brand-new 'greenfield' city! 🏗️"
      ],
      narration: "Amaravati is the capital of Andhra Pradesh, built on the Krishna River. Imagine walking through ancient temples and seeing that river!",
      coolFacts: [
        "Amaravati was an ancient Buddhist city - home to a famous stupa built 2,000 years ago!",
        "The new Amaravati is designed to be a 'smart city' with green spaces and modern buildings!"
      ],
      didYouKnow: "The Krishna River is called the 'Ganges of South India' because it's so important to the region!",
      tryThis: "Find Amaravati on a map and see how close it is to the Krishna River!"
    },
    te: {
      title: "🏛️ అమరావతి - పవిత్ర నగరం!",
      emoji: "🏛️",
      mainText: "కృష్ణ నదీ ఒడ్డున ఉన్న ఒక నగరాన్ని ఊహించుకోండి! అమరావతి అంధ్రప్రదేశ్ రాజధాని మరియు ఇది అందమైన ఆలయాలు మరియు ఆధ్యాత్మిక ప్రాధాన్యత కోసం ప్రసిద్ధి చెందింది.",
      keyFacts: [
        "రాజధాని: అమరావతి, కృష్ణ నది ఒడ్డున! 🌊",
        "అంధ్రప్రదేశ్ యొక్క పాత రాజధాని హైదరాబాద్ - 2014లో తెలంగాణ వేరు అయిన తర్వాత కోల్పోయింది! 🏙️",
        "అమరావతి ఒక సర్వే నిర్మాణమైన 'గ్రీన్‌ఫీల్డ్' నగరం! 🏗️"
      ],
      narration: "అమరావతి అంధ్రప్రదేశ్ రాజధాని, కృష్ణ నది ఒడ్డున నిర్మితమైనది. పురాతన ఆలయాల గుండా నడుస్తూ, ఆ నదిని చూస్తూ ఉండటం ఎలా ఉంటుందో ఊహించుకోండి!",
      coolFacts: [
        "అమరావతి ఒక పురాతన బౌద్ధ నగరం - 2,000 సంవత్సరాల క్రితం నిర్మించిన ప్రసిద్ధ స్తూపకు నిবాసం!",
        "కొత్త అమరావతి ఒక 'స్మార్ట్ సిటీ'గా రూపొందించబడింది, ఆకుపచ్చ ప్రదేశాలు మరియు ఆధునిక భవనాలతో!"
      ],
      didYouKnow: "కృష్ణ నదిని 'దక్షిణ భారతం యొక్క గంగ' అని అంటారు ఎందుకంటే ఇది ప్రాంతానికి చాలా ముఖ్యమైనది!",
      tryThis: "మ్యాప్‌లో అమరావతిని కనుగొని, అది కృష్ణ నదికి ఎంత దగ్గరగా ఉందో చూడండి!"
    }
  },
  
  language: {
    en: {
      title: "🗣️ TELUGU - A Language of Poets!",
      emoji: "🗣️",
      mainText: "Imagine 80 million people speaking the same language! Telugu is one of the oldest languages in the world, and it's written with beautiful curved letters.",
      keyFacts: [
        "Official language of Andhra Pradesh! 🎭",
        "80 million speakers worldwide - that's almost the whole population of Germany! 🌍",
        "One of the oldest and most developed languages in the world! 📚",
        "Written in beautiful curved script that looks like little dances! 💃"
      ],
      narration: "Telugu is the language of Andhra Pradesh! Imagine 80 million people speaking the same language - that's like the entire population of Germany!",
      coolFacts: [
        "Telugu has one of the richest literary traditions in India, with poems and stories going back 1,500 years!",
        "The Telugu script is so beautiful, many artists use it in their artwork!"
      ],
      didYouKnow: "Telugu movies are famous all over the world - they're sometimes called 'Tollywood'!",
      tryThis: "Learn to say 'Namaste' in Telugu: 'Namaskaram'!"
    },
    te: {
      title: "🗣️ తెలుగు - కవుల భాష!",
      emoji: "🗣️",
      mainText: "భారతంలో 80 మిలియన్ మంది తెలుగు మాట్లాడతారు! ఇది ప్రపంచంలోని అతిపురాతన భాషలలో ఒకటి మరియు సుందర వక్ర అక్షరాలతో వ్రాయబడుతుంది.",
      keyFacts: [
        "అంధ్రప్రదేశ్ అధికారిక భాష! 🎭",
        "ప్రపంచవ్యాపీ 80 మిలియన్ మంది మాట్లాడతారు - ఇది జర్మనీ మొత్తం జనాభాకు సమానం! 🌍",
        "ప్రపంచంలోని అతిపురాతన మరియు అత్యంత అభివృద్ధి చెందిన భాషలలో ఒకటి! 📚",
        "చిన్న నృత్యాలలా కనిపించే సుందర వక్ర లిపిలో వ్రాయబడుతుంది! 💃"
      ],
      narration: "తెలుగు అంధ్రప్రదేశ్ భాష! 80 మిలియన్ మంది ఒకే భాషను మాట్లాడుతున్నారని ఊహించుకోండి - ఇది జర్మనీ మొత్తం జనాభాకు సమానం!",
      coolFacts: [
        "తెలుగు భారతంలో అత్యంత సమృద్ధమైన సాహిత్య ఐతిహ్యం కలిగి ఉంది, కవితలు మరియు కథలు 1,500 సంవత్సరాలు వెనుకకు పోతాయి!",
        "తెలుగు లిపి చాలా సుందరమైనది, చాలా కళాకారులు దీనిని వారి కళాకృతిలో ఉపయోగిస్తారు!"
      ],
      didYouKnow: "తెలుగు సినిమాలు ప్రపంచం అంతటా ప్రసిద్ధి - అవి కొన్నిసార్లు 'టాలీవుడ్'గా పిలవబడతాయి!",
      tryThis: "తెలుగులో 'నమస్కారం' చెప్పడం నేర్చుకోండి!"
    }
  },
  
  food: {
    en: {
      title: "🍛 GONGURA CURRY - Tangy and Tasty!",
      emoji: "🍛",
      mainText: "Gongura is a favorite curry of Andhra Pradesh! It's tangy, spicy, and absolutely delicious. Made with sorrel leaves and special spices, it's a festival favorite!",
      keyFacts: [
        "Famous dish of Andhra Pradesh! 🎉",
        "Made with sorrel leaves (gongura pala)! 🌿",
        "Tangy taste that makes your taste buds dance! 😋",
        "Perfect with rice and served at celebrations! 🍚"
      ],
      narration: "Gongura is the taste of Andhra Pradesh! Imagine mixing tangy sorrel leaves with rice and crunchy peanuts - it's sour, it's spicy, and it's delicious!",
      coolFacts: [
        "Sorrel leaves are also called 'gongura pala' in Telugu and are full of vitamins!",
        "Gongura curry is not just food - it's part of Andhra Pradesh family traditions!"
      ],
      didYouKnow: "Gongura leaves grow wild in many parts of India, but Andhra Pradesh has perfected the recipe!",
      tryThis: "Try making gongura curry at home with an adult's help!"
    },
    te: {
      title: "🍛 గుంగూర కూర - తీపి జాదూ!",
      emoji: "🍛",
      mainText: "గుంగూర కూర అంధ్రప్రదేశ్ నుండి ఒక ప్రియమైన కూర! ఇది ఖట్టా, మసాలాదైనది, మరియు చాలా రుచికరమైనది. సాలమిర్చి ఆకులు మరియు ప్రత్యేక మసాలాలతో తయారు చేయబడింది, ఇది పండుగ ప్రియమైనది!",
      keyFacts: [
        "అంధ్రప్రదేశ్ ప్రసిద్ధ భోజనం! 🎉",
        "సాలమిర్చి ఆకులతో (గుంగూర పాల)! 🌿",
        "మీ రుచి కలుపులను నృత్యం చేయటానికి ఖట్టా రుచి! 😋",
        "అన్నతో సంపూర్ణమైనది మరియు సంబరాలలో పరివేషించబడుతుంది! 🍚"
      ],
      narration: "గుంగూర కూర అంధ్రప్రదేశ్ యొక్క రుచి! ఖట్టా సాలమిర్చి ఆకులను అన్నతో మరియు కరకరలాడిన వేరుశెనగలతో కలపడం ఎలా ఉంటుందో ఊహించుకోండి - ఇది ఖట్టా, ఇది మసాలాదైనది, మరియు ఇది రుచికరమైనది!",
      coolFacts: [
        "సాలమిర్చి ఆకులను తెలుగులో 'గుంగూర పాల' అని అంటారు మరియు విటమిన్‌లతో నిండిఉన్నాయి!",
        "గుంగూర కూర కేవలం ఆహారం కాదు - ఇది అంధ్రప్రదేశ్ కుటుంబ సంప్రదాయాలలో భాగం!"
      ],
      didYouKnow: "సాలమిర్చి ఆకులు భారతం యొక్క చాలా భాగాలలో కారు పెరుగుతాయి, కానీ అంధ్రప్రదేశ్ రెసిపీని పరిపూర్ణం చేసింది!",
      tryThis: "ఒక పెద్దవారి సహాయంతో ఇంట్లో గుంగూర కూర చేయడానికి ప్రయత్నించండి!"
    }
  },
  
  places: {
    en: {
      title: "🛕 TIRUPATI TEMPLE - Wonder on a Mountain!",
      emoji: "🛕",
      mainText: "Tirupati Temple is one of the most visited temples in India! Built on a beautiful mountain, pilgrims climb 3,500 steps to reach the sacred Sri Venkateswara Temple. It's a place of faith and wonder!",
      keyFacts: [
        "One of India's richest temples! 💰",
        "3,500 steps to climb! 🏔️",
        "Built over 1,000 years ago! 🏛️",
        "Millions of pilgrims visit every year! 👥"
      ],
      narration: "Welcome to Tirupati Temple - a place where earth touches the sky! This amazing temple sits on a mountain top in Andhra Pradesh. To reach the temple, pilgrims climb 3,500 steps!",
      coolFacts: [
        "Tirupati is called the 'Eastern Gateway of Lord Venkateswara' and is one of the oldest temples in India!",
        "The temple has beautiful wood carvings and sculptures that are centuries old!"
      ],
      didYouKnow: "Tirupati Temple collects so much in donations that it's one of the richest temples in the entire world!",
      tryThis: "Find Tirupati on a map and imagine climbing 3,500 steps up a mountain!"
    },
    te: {
      title: "🛕 తిరుమల ఆలయం - పర్వతంపై అద్భుతం!",
      emoji: "🛕",
      mainText: "తిరుమల ఆలయం భారతం యొక్క అత్యంత సందర్శించిన ఆలయాలలో ఒకటి! ఒక అందమైన పర్వతంపై నిర్మితమైన, తీర్థ దర్శకులు పవిత్ర శ్రీ వెంకటేశ్వర ఆలయానికి చేరుకోవటానికి 3,500 సోపానాలు ఎక్కుతారు. ఇది విశ్వాస మరియు అద్భుత స్థానం!",
      keyFacts: [
        "భారతం యొక్క సమృద్ధమైన ఆలయాలలో ఒకటి! 💰",
        "ఎక్కవలసిన 3,500 సోపానాలు! 🏔️",
        "1,000 సంవత్సరాల క్రితం నిర్మితమైనది! 🏛️",
        "ప్రతి సంవత్సరం మిలియన్ల మంది తీర్థ దర్శకులు సందర్శిస్తారు! 👥"
      ],
      narration: "తిరుమల ఆలయానికి స్వాగతం - ఒక స్థానం ఇక్కడ భూమి ఆకాశాన్ని తాకుతుంది! ఈ అద్భుత ఆలయం అంధ్రప్రదేశ్ పర్వతం చిట్టిపై కూర్చోబడి ఉంది. ఆలయానికి చేరుకోవటానికి, తీర్థ దర్శకులు 3,500 సోపానాలు ఎక్కుతారు!",
      coolFacts: [
        "తిరుమల 'ప్రభువు వెంకటేశ్వర యొక్క తూర్పు ద్వారం' అని పిలువబడుతుంది మరియు భారతంలోని పురాతన ఆలయాలలో ఒకటి!",
        "ఆలయంలో సుందర చెక్క చెక్కకలలు మరియు శిల్పాలు ఉన్నాయి, అవి శతాబ్దాల పురాతనమైనవి!"
      ],
      didYouKnow: "తిరుమల ఆలయం దానమనం సేకరించిన దానం కారణంగా ఇది మొత్తం ప్రపంచంలోని సమృద్ధమైన ఆలయాలలో ఒకటి!",
      tryThis: "మ్యాప్‌లో తిరుమలిని కనుగొని, పర్వతం పైకి 3,500 సోపానాలు ఎక్కడం ఎలా ఉంటుందో ఊహించుకోండి!"
    }
  },
  
  animal: {
    en: {
      title: "🦌 BLACKBUCK - The Graceful Dancer!",
      emoji: "🦌",
      mainText: "The Blackbuck is Andhra Pradesh's state animal! It's a beautiful antelope with spiral horns, and it can run super fast. These graceful creatures are now protected because they were hunted too much.",
      keyFacts: [
        "Andhra Pradesh's state animal! 🏆",
        "Beautiful spiral horns! 🌀",
        "Can run up to 80 km per hour! 💨",
        "Lives in grasslands! 🌾"
      ],
      narration: "Meet the Blackbuck - Andhra Pradesh's superstar animal! Picture a beautiful antelope with long spiral horns that stick up like little trees. Blackbucks can run very fast - 80 kilometers per hour!",
      coolFacts: [
        "Blackbucks are incredibly graceful - they jump and leap with perfect balance, like dancers!",
        "The Blackbuck's horns spiral up to 4 feet long - they look like beautiful twisted sculptures!"
      ],
      didYouKnow: "Long ago, kings hunted Blackbucks for sport, but now they're protected because very few are left.",
      tryThis: "Draw a picture of a Blackbuck showing its beautiful spiral horns!"
    },
    te: {
      title: "🦌 కృష్ణమృగం - అందమైన నర్తకుడు!",
      emoji: "🦌",
      mainText: "కృష్ణమృగం అంధ్రప్రదేశ్ రాష్ట్ర జంతువు! ఇది సర్పిలాకార కొమ్ములు కలిగిన అందమైన జింక, మరియు ఇది సూపర్ ఫాస్ట్ పరిగెత్తగలదు. ఈ చలువగా ఉండే జంతువులు ఇప్పుడు రక్షించబడుతున్నాయి ఎందుకంటే అవి చాలా ఎక్కువ వేటకు గురయ్యాయి.",
      keyFacts: [
        "అంధ్రప్రదేశ్ రాష్ట్ర జంతువు! 🏆",
        "సర్పిలాకార సుందర కొమ్ములు! 🌀",
        "గంటకు 80 కిమీ వేగంతో పరిగెత్తగలదు! 💨",
        "గడ్డి భూములలో నివసిస్తుంది! 🌾"
      ],
      narration: "కృష్ణమృగం - అంధ్రప్రదేశ్ సూపర్ స్టార్ జంతువుతో పరిచయం చేసుకోండి! పొడవైన సర్పిలాకార కొమ్ములు కలిగిన అందమైన జింకను చిత్రించుకోండి. కృష్ణమృగం చాలా వేగంగా పరిగెట్టగలదు - గంటకు 80 కిలోమీటర్లు!",
      coolFacts: [
        "కృష్ణమృగాలు చాలా చలువగా ఉంటాయి - అవి కదుపుతూ, నృత్యం చేస్తున్నట్లు దిక్కుతాయి!",
        "కృష్ణమృగం యొక్క కొమ్ములు 4 ఫీట్ వరకు పెరుగుతాయి - అవి సుందర చిక్కబడిన శిల్పాల్లా కనిపిస్తాయి!"
      ],
      didYouKnow: "చాలా రోజుల క్రితం, రాజులు ఆటకు కృష్ణమృగాలను వేటు చేశారు, కానీ ఇప్పుడు వారు రక్షించబడతారు ఎందుకంటే చాలా తక్కువ మంది మిగిలిఉన్నారు.",
      tryThis: "కృష్ణమృగం యొక్క సుందర సర్పిలాకార కొమ్ములను చూపించే చిత్రాన్ని గీయండి!"
    }
  },
  
  funFact: {
    en: {
      title: "🌶️ CHILLI CHAMPIONS!",
      emoji: "🌶️",
      mainText: "Andhra Pradesh produces the hottest chillies in India! The red chillies grown here are sent all over the world for cooking. It's called the 'Chilli Bowl of India'!",
      keyFacts: [
        "World's hottest chillies! 🌶️",
        "Red chillies are world-famous! 🌍",
        "Guntur chillies are the most famous! 🔥",
        "Exported to 50+ countries! ✈️"
      ],
      narration: "Did you know? Andhra Pradesh is the chilli champion of India! The red chillies grown here are super hot and famous. Guntur city is the chilli capital - it produces the hottest chillies!",
      coolFacts: [
        "Andhra Pradesh exports chillies to more than 50 countries around the world!",
        "Guntur chillies are used in cuisines from India to Mexico to China - they travel the world!"
      ],
      didYouKnow: "Andhra Pradesh produces about 30% of India's chillies - that's a LOT of spicy food!",
      tryThis: "Research where the chillies from your kitchen come from - they might be from Andhra Pradesh!"
    },
    te: {
      title: "🌶️ మిర్చి చాంపియన్‌లు!",
      emoji: "🌶️",
      mainText: "అంధ్రప్రదేశ్ భారతంలో సరికొత్త మిర్చిలను ఉత్పత్తి చేస్తుంది! ఇక్కడ ఉన్న ఎర్ర మిర్చిలు ప్రపంచం అంతటా వంటకు పంపబడతాయి. దీనిని 'భారత మిర్చి కుండ' అని అంటారు!",
      keyFacts: [
        "ప్రపంచం యొక్క సరికొత్త మిర్చిలు! 🌶️",
        "ఎర్ర మిర్చిలు ప్రపంచవ్యాపీ ప్రసిద్ధి! 🌍",
        "గుంటూర్ మిర్చిలు అత్యంత ప్రసిద్ధి! 🔥",
        "50+ దేశాలకు ఎగుమతి! ✈️"
      ],
      narration: "మీకు తెలుసా? అంధ్రప్రదేశ్ భారత మిర్చి చాంపియన్! ఇక్కడ ఉత్పత్తి చేయిన ఎర్ర మిర్చిలు చాలా వేడిగా మరియు ప్రసిద్ధి. గుంటూర్ నగరం మిర్చి రాజధానీ - ఇది సరికొత్త మిర్చిలను ఉత్పత్తి చేస్తుంది!",
      coolFacts: [
        "అంధ్రప్రదేశ్ ప్రపంచం చుట్టూ 50+ దేశాలకు మిర్చిలను ఎగుమతి చేస్తుంది!",
        "గుంటూర్ మిర్చిలను భారతం నుండి మెక్సికో నుండి చైనా నుండి వంటకులలో ఉపయోగిస్తారు - అవి ప్రపంచం ఎక్కుముకుంటాయి!"
      ],
      didYouKnow: "అంధ్రప్రదేశ్ భారతం యొక్క సుమారు 30% మిర్చిలను ఉత్పత్తి చేస్తుంది - ఇది చాలా విపరీతమైన ఆహారం!",
      tryThis: "మీ వంటగదిలోని మిర్చిలు ఎక్కడ నుండి వస్తాయో పరిశోధించండి - అవి అంధ్రప్రదేశ్ నుండి ఉండవచ్చు!"
    }
  }
};

// Update states.json with complete bilingual Andhra Pradesh
states.states['Andhra Pradesh'] = bilingualAP;

// Write back
fs.writeFileSync('./src/lib/content/states.json', JSON.stringify(states, null, 2));

console.log('✅ COMPLETE bilingual Andhra Pradesh created!');
console.log('✅ All 6 cards now have FULL English + Telugu translations');
console.log('✅ Including: main text, key facts, cool facts, did you know, try this');
console.log('✅ Initial display: Telugu (button shows "Telugu")');
console.log('✅ Toggle: Click button to switch to English');
