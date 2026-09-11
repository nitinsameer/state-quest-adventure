import fs from 'fs';

const json = JSON.parse(fs.readFileSync('./src/lib/content/states.json', 'utf8'));
const ap = json.states['Andhra Pradesh'];

// Helper to tag array items with age ranges
const tagWithAge = (items, ranges) => {
  return items.map((item, idx) => ({
    text: item,
    minAge: ranges[idx]?.min || 3,
    maxAge: ranges[idx]?.max || 99
  }));
};

// Age ranges: 
// Sprout (3-5), Seedling (6-7), Sapling (8-9), Mighty Tree (10-12)

// Updated Andhra Pradesh with age-tagged content
const bilingualAP = {
  stateName: "Andhra Pradesh",
  languageCode: "te",
  
  capital: {
    en: {
      title: "🏛️ AMARAVATI - The New Capital!",
      emoji: "🏛️",
      mainText: "A brand-new planned city on the banks of the Krishna River! Andhra Pradesh's capital is Amaravati - built almost from scratch!",
      keyFacts: tagWithAge(
        [
          "Capital: Amaravati, on the Krishna River! 🌊",
          "Amaravati is being built as a brand-new 'greenfield' city! 🏗️",
          "Andhra Pradesh's old capital was Hyderabad - lost after Telangana split off in 2014! 🏙️"
        ],
        [
          { min: 3, max: 99 },   // Sprout (3-5) sees item 1
          { min: 6, max: 99 },   // Seedling (6-7) sees items 1-2
          { min: 8, max: 99 }    // Sapling (8-9) sees all 3
        ]
      ),
      coolFacts: tagWithAge(
        [
          "Amaravati was an ancient Buddhist city - home to a famous stupa built 2,000 years ago!",
          "The new Amaravati is designed to be a 'smart city' with green spaces and modern buildings!"
        ],
        [
          { min: 8, max: 99 },   // Sapling (8-9) sees all
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "The Krishna River is called the 'Ganges of South India' because it's so important to the region!",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "Find Amaravati on a map and see how close it is to the Krishna River!",
        minAge: 3,
        maxAge: 99
      },
      narration: "Amaravati is the capital of Andhra Pradesh, built on the Krishna River..."
    },
    te: {
      title: "🏛️ అమరావతి - పవిత్ర నగరం!",
      emoji: "🏛️",
      mainText: "కృష్ణ నదీ ఒడ్డున ఉన్న ఒక నగరాన్ని ఊహించుకోండి! అమరావతి అంధ్రప్రదేశ్ రాజధాని మరియు ఇది అందమైన ఆలయాలు మరియు ఆధ్యాత్మిక ప్రాధాన్యత కోసం ప్రసిద్ధి చెందింది.",
      keyFacts: tagWithAge(
        [
          "రాజధాని: అమరావతి, కృష్ణ నది ఒడ్డున! 🌊",
          "అమరావతి ఒక సర్వే నిర్మాణమైన 'గ్రీన్‌ఫీల్డ్' నగరం! 🏗️",
          "అంధ్రప్రదేశ్ యొక్క పాత రాజధాని హైదరాబాద్ - 2014లో తెలంగాణ వేరు అయిన తర్వాత కోల్పోయింది! 🏙️"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "అమరావతి ఒక పురాతన బౌద్ధ నగరం - 2,000 సంవత్సరాల క్రితం నిర్మించిన ప్రసిద్ధ స్తూపకు నిబాసం!",
          "కొత్త అమరావతి ఒక 'స్మార్ట్ సిటీ'గా రూపొందించబడింది, ఆకుపచ్చ ప్రదేశాలు మరియు ఆధునిక భవనాలతో!"
        ],
        [
          { min: 8, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "కృష్ణ నదిని 'దక్షిణ భారతం యొక్క గంగ' అని అంటారు ఎందుకంటే ఇది ప్రాంతానికి చాలా ముఖ్యమైనది!",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "మ్యాప్‌లో అమరావతిని కనుగొని, అది కృష్ణ నదికి ఎంత దగ్గరగా ఉందో చూడండి!",
        minAge: 3,
        maxAge: 99
      },
      narration: "అమరావతి అంధ్రప్రదేశ్ రాజధాని, కృష్ణ నది ఒడ్డున నిర్మితమైనది..."
    }
  },

  language: {
    en: {
      title: "🗣️ TELUGU - A Language of Poets!",
      emoji: "🗣️",
      mainText: "Imagine 80 million people speaking the same language! Telugu is one of the oldest languages in the world, and it's written with beautiful curved letters.",
      keyFacts: tagWithAge(
        [
          "80 million speakers worldwide - that's almost the whole population of Germany! 🌍",
          "One of the oldest and most developed languages in the world! 📚",
          "Official language of Andhra Pradesh! 🎭"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "Telugu has one of the richest literary traditions in India, with poems and stories going back 1,500 years!",
          "Telugu movies are famous all over the world - they're sometimes called 'Tollywood'!"
        ],
        [
          { min: 8, max: 99 },
          { min: 6, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "Written in beautiful curved script that looks like little dances! 💃",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "Learn to say 'Namaste' in Telugu: 'Namaskaram'!",
        minAge: 3,
        maxAge: 99
      },
      narration: "Telugu is the language of Andhra Pradesh! Imagine 80 million people speaking the same language..."
    },
    te: {
      title: "🗣️ తెలుగు - కవుల భాష!",
      emoji: "🗣️",
      mainText: "భారతంలో 80 మిలియన్ మంది తెలుగు మాట్లాడతారు! ఇది ప్రపంచంలోని అతిపురాతన భాషలలో ఒకటి మరియు సుందర వక్ర అక్షరాలతో వ్రాయబడుతుంది.",
      keyFacts: tagWithAge(
        [
          "ప్రపంచవ్యాపీ 80 మిలియన్ మంది మాట్లాడతారు - ఇది జర్మనీ మొత్తం జనాభాకు సమానం! 🌍",
          "ప్రపంచంలోని అతిపురాతన మరియు అత్యంత అభివృద్ధి చెందిన భాషలలో ఒకటి! 📚",
          "అంధ్రప్రదేశ్ అధికారిక భాష! 🎭"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "తెలుగు భారతంలో అత్యంత సమృద్ధమైన సాహిత్య ఐతిహ్యం కలిగి ఉంది, కవితలు మరియు కథలు 1,500 సంవత్సరాలు వెనుకకు పోతాయి!",
          "తెలుగు సినిమాలు ప్రపంచం అంతటా ప్రసిద్ధి - అవి కొన్నిసార్లు 'టాలీవుడ్'గా పిలవబడతాయి!"
        ],
        [
          { min: 8, max: 99 },
          { min: 6, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "చిన్న నృత్యాల వలె కనిపించే సుందర వక్ర లిపిలో వ్రాయబడుతుంది! 💃",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "తెలుగులో 'నమస్కారం' చెప్పడం నేర్చుకోండి!",
        minAge: 3,
        maxAge: 99
      },
      narration: "తెలుగు అంధ్రప్రదేశ్ భాష! 80 మిలియన్ మంది ఒకే భాషను మాట్లాడుతున్నారని ఊహించుకోండి..."
    }
  },

  food: {
    en: {
      title: "🍛 GONGURA CURRY - Tangy and Tasty!",
      emoji: "🍛",
      mainText: "Gongura is a favorite curry of Andhra Pradesh! It's tangy, spicy, and absolutely delicious. Made with sorrel leaves and special spices, it's a festival favorite!",
      keyFacts: tagWithAge(
        [
          "Made with sorrel leaves (gongura pala)! 🌿",
          "Tangy taste that makes your taste buds dance! 😋",
          "Perfect with rice and served at celebrations! 🍚"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "Sorrel leaves are also called 'gongura pala' in Telugu and are full of vitamins!",
          "Gongura curry is not just food - it's part of Andhra Pradesh family traditions!"
        ],
        [
          { min: 8, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "Gongura leaves grow wild in many parts of India, but Andhra Pradesh has perfected the recipe!",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "Try making gongura curry at home with an adult's help!",
        minAge: 3,
        maxAge: 99
      },
      narration: "Gongura is the taste of Andhra Pradesh! Imagine mixing tangy sorrel leaves with rice..."
    },
    te: {
      title: "🍛 గుంగూర కూర - తీపి జాదూ!",
      emoji: "🍛",
      mainText: "గుంగూర కూర అంధ్రప్రదేశ్ నుండి ఒక ప్రియమైన కూర! ఇది ఖట్టా, మసాలాదైనది, మరియు చాలా రుచికరమైనది. సాలమిర్చి ఆకులు మరియు ప్రత్యేక మసాలాలతో తయారు చేయబడింది, ఇది పండుగ ప్రియమైనది!",
      keyFacts: tagWithAge(
        [
          "సాలమిర్చి ఆకులతో (గుంగూర పాల)! 🌿",
          "మీ రుచి కలుపులను నృత్యం చేయటానికి ఖట్టా రుచి! 😋",
          "అన్నతో సంపూర్ణమైనది మరియు సంబరాలలో పరివేషించబడుతుంది! 🍚"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "సాలమిర్చి ఆకులను తెలుగులో 'గుంగూర పాల' అని అంటారు మరియు విటమిన్‌లతో నిండిఉన్నాయి!",
          "గుంగూర కూర కేవలం ఆహారం కాదు - ఇది అంధ్రప్రదేశ్ కుటుంబ సంప్రదాయాలలో భాగం!"
        ],
        [
          { min: 8, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "సాలమిర్చి ఆకులు భారతం యొక్క చాలా భాగాలలో కారు పెరుగుతాయి, కానీ అంధ్రప్రదేశ్ రెసిపీని పరిపూర్ణం చేసింది!",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "ఒక పెద్దవారి సహాయంతో ఇంట్లో గుంగూర కూర చేయడానికి ప్రయత్నించండి!",
        minAge: 3,
        maxAge: 99
      },
      narration: "గుంగూర కూర అంధ్రప్రదేశ్ యొక్క రుచి! ఖట్టా సాలమిర్చి ఆకులను అన్నతో కలపడం ఎలా ఉంటుందో ఊహించుకోండి..."
    }
  },

  places: {
    en: {
      title: "🛕 TIRUPATI TEMPLE - Wonder on a Mountain!",
      emoji: "🛕",
      mainText: "Tirupati Temple is one of the most visited temples in India! Built on a beautiful mountain, pilgrims climb 3,500 steps to reach the sacred Sri Venkateswara Temple. It's a place of faith and wonder!",
      keyFacts: tagWithAge(
        [
          "It's famous! 💰",
          "3,500 steps to climb! 🏔️",
          "Millions of pilgrims visit every year! 👥"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "Built over 1,000 years ago!",
          "The temple has beautiful wood carvings and sculptures that are centuries old!"
        ],
        [
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "Tirupati Temple is one of the richest temples in the entire world!",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "Find Tirupati on a map and imagine climbing 3,500 steps up a mountain!",
        minAge: 3,
        maxAge: 99
      },
      narration: "Welcome to Tirupati Temple - a place where earth touches the sky..."
    },
    te: {
      title: "🛕 తిరుమల ఆలయం - పర్వతంపై అద్భుతం!",
      emoji: "🛕",
      mainText: "తిరుమల ఆలయం భారతం యొక్క అత్యంత సందర్శించిన ఆలయాలలో ఒకటి! ఒక అందమైన పర్వతంపై నిర్మితమైన, తీర్థ దర్శకులు పవిత్ర శ్రీ వెంకటేశ్వర ఆలయానికి చేరుకోవటానికి 3,500 సోపానాలు ఎక్కుతారు. ఇది విశ్వాస మరియు అద్భుత స్థానం!",
      keyFacts: tagWithAge(
        [
          "ఇది ప్రసిద్ధి! 💰",
          "ఎక్కవలసిన 3,500 సోపానాలు! 🏔️",
          "ప్రతి సంవత్సరం మిలియన్ల మంది తీర్థ దర్శకులు సందర్శిస్తారు! 👥"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "1,000 సంవత్సరాల క్రితం నిర్మితమైనది!",
          "ఆలయంలో సుందర చెక్క చెక్కకలలు మరియు శిల్పాలు ఉన్నాయి, అవి శతాబ్దాల పురాతనమైనవి!"
        ],
        [
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "తిరుమల ఆలయం ఇది మొత్తం ప్రపంచంలోని సమృద్ధమైన ఆలయాలలో ఒకటి!",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "మ్యాప్‌లో తిరుమలిని కనుగొని, పర్వతం పైకి 3,500 సోపానాలు ఎక్కడం ఎలా ఉంటుందో ఊహించుకోండి!",
        minAge: 3,
        maxAge: 99
      },
      narration: "తిరుమల ఆలయానికి స్వాగతం - ఒక స్థానం ఇక్కడ భూమి ఆకాశాన్ని తాకుతుంది..."
    }
  },

  animal: {
    en: {
      title: "🦌 BLACKBUCK - The Graceful Dancer!",
      emoji: "🦌",
      mainText: "The Blackbuck is Andhra Pradesh's state animal! It's a beautiful antelope with spiral horns, and it can run super fast. These graceful creatures are now protected because they were hunted too much.",
      keyFacts: tagWithAge(
        [
          "It's a beautiful antelope! 🌀",
          "Can run super fast! 💨",
          "Andhra Pradesh's state animal! 🏆"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "Blackbucks are incredibly graceful - they jump and leap with perfect balance, like dancers!",
          "The Blackbuck's horns spiral up to 4 feet long - they look like beautiful twisted sculptures!"
        ],
        [
          { min: 8, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "Long ago, kings hunted Blackbucks for sport, but now they're protected because very few are left.",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "Draw a picture of a Blackbuck showing its beautiful spiral horns!",
        minAge: 3,
        maxAge: 99
      },
      narration: "Meet the Blackbuck - Andhra Pradesh's superstar animal! Picture a beautiful antelope..."
    },
    te: {
      title: "🦌 కృష్ణమృగం - అందమైన నర్తకుడు!",
      emoji: "🦌",
      mainText: "కృష్ణమృగం అంధ్రప్రదేశ్ రాష్ట్ర జంతువు! ఇది సర్పిలాకార కొమ్ములు కలిగిన అందమైన జింక, మరియు ఇది సూపర్ ఫాస్ట్ పరిగెత్తగలదు. ఈ చలువగా ఉండే జంతువులు ఇప్పుడు రక్షించబడుతున్నాయి ఎందుకంటే అవి చాలా ఎక్కువ వేటకు గురయ్యాయి.",
      keyFacts: tagWithAge(
        [
          "ఇది అందమైన జింక! 🌀",
          "సూపర్ ఫాస్ట్ పరిగెత్తగలదు! 💨",
          "అంధ్రప్రదేశ్ రాష్ట్ర జంతువు! 🏆"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "కృష్ణమృగాలు చాలా చలువగా ఉంటాయి - అవి కదుపుతూ, నృత్యం చేస్తున్నట్లు దిక్కుతాయి!",
          "కృష్ణమృగం యొక్క కొమ్ములు 4 ఫీట్ వరకు పెరుగుతాయి - అవి సుందర చిక్కబడిన శిల్పాల్లా కనిపిస్తాయి!"
        ],
        [
          { min: 8, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "చాలా రోజుల క్రితం, రాజులు ఆటకు కృష్ణమృగాలను వేటు చేశారు, కానీ ఇప్పుడు వారు రక్షించబడతారు ఎందుకంటే చాలా తక్కువ మంది మిగిలిఉన్నారు.",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "కృష్ణమృగం యొక్క సుందర సర్పిలాకార కొమ్ములను చూపించే చిత్రాన్ని గీయండి!",
        minAge: 3,
        maxAge: 99
      },
      narration: "కృష్ణమృగం - అంధ్రప్రదేశ్ సూపర్ స్టార్ జంతువుతో పరిచయం చేసుకోండి! అందమైన జింకను చిత్రించుకోండి..."
    }
  },

  funFact: {
    en: {
      title: "🌶️ CHILLI CHAMPIONS!",
      emoji: "🌶️",
      mainText: "Andhra Pradesh produces the hottest chillies in India! The red chillies grown here are sent all over the world for cooking. It's called the 'Chilli Bowl of India'!",
      keyFacts: tagWithAge(
        [
          "Grows spicy chillies! 🌶️",
          "They're sent all over the world! 🌍",
          "Guntur city is the chilli capital! 🔥"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "Andhra Pradesh exports chillies to more than 50 countries around the world!",
          "They're used in food from India to Mexico to China - they travel the world!"
        ],
        [
          { min: 8, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "Andhra Pradesh produces about 30% of India's chillies - that's a LOT of spicy food!",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "Research where the chillies from your kitchen come from - they might be from Andhra Pradesh!",
        minAge: 3,
        maxAge: 99
      },
      narration: "Did you know? Andhra Pradesh is the chilli champion of India! The red chillies grown here..."
    },
    te: {
      title: "🌶️ మిర్చి చాంపియన్‌లు!",
      emoji: "🌶️",
      mainText: "అంధ్రప్రదేశ్ భారతంలో సరికొత్త మిర్చిలను ఉత్పత్తి చేస్తుంది! ఇక్కడ ఉన్న ఎర్ర మిర్చిలు ప్రపంచం అంతటా వంటకు పంపబడతాయి. దీనిని 'భారత మిర్చి కుండ' అని అంటారు!",
      keyFacts: tagWithAge(
        [
          "మిర్చిలను ఉత్పత్తి చేస్తుంది! 🌶️",
          "ప్రపంచం చుట్టూ పంపబడతాయి! 🌍",
          "గుంటూర్ నగరం మిర్చి రాజధానీ! 🔥"
        ],
        [
          { min: 3, max: 99 },
          { min: 6, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      coolFacts: tagWithAge(
        [
          "అంధ్రప్రదేశ్ ప్రపంచం చుట్టూ 50+ దేశాలకు మిర్చిలను ఎగుమతి చేస్తుంది!",
          "భారతం నుండి మెక్సికో నుండి చైనా నుండి వంటకులలో ఉపయోగిస్తారు - అవి ప్రపంచం ఎక్కుముకుంటాయి!"
        ],
        [
          { min: 8, max: 99 },
          { min: 8, max: 99 }
        ]
      ),
      didYouKnow: {
        text: "అంధ్రప్రదేశ్ భారతం యొక్క సుమారు 30% మిర్చిలను ఉత్పత్తి చేస్తుంది - ఇది చాలా విపరీతమైన ఆహారం!",
        minAge: 3,
        maxAge: 99
      },
      tryThis: {
        text: "మీ వంటగదిలోని మిర్చిలు ఎక్కడ నుండి వస్తాయో పరిశోధించండి - అవి అంధ్రప్రదేశ్ నుండి ఉండవచ్చు!",
        minAge: 3,
        maxAge: 99
      },
      narration: "మీకు తెలుసా? అంధ్రప్రదేశ్ భారత మిర్చి చాంపియన్! ఇక్కడ ఉత్పత్తి చేయిన ఎర్ర మిర్చిలు..."
    }
  }
};

// Update states.json
json.states['Andhra Pradesh'] = bilingualAP;
fs.writeFileSync('./src/lib/content/states.json', JSON.stringify(json, null, 2));

console.log('✅ Task #1 Complete: Age-tagged content added to Andhra Pradesh');
console.log('✅ All 6 cards now have minAge/maxAge metadata');
console.log('✅ Content structure:');
console.log('   - Sprout (3-5): 4 items per card');
console.log('   - Seedling (6-7): 6 items per card');
console.log('   - Sapling (8-9): 8 items per card');
console.log('   - Mighty Tree (10-12): 8 items per card');
