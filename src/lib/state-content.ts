/**
 * Enhanced state content with kid-friendly data for each card.
 * Rajasthan implemented as the pilot state.
 */

export type CardContent = {
  title: string;
  emoji: string;
  mainText: string;
  keyFacts: string[];
  narration: string;
  coolFacts?: string[]; // Additional cool facts for expanded section
  didYouKnow?: string; // Single trivia fact
  tryThis?: string; // Activity suggestion
};

export type StateEnrichedContent = {
  stateName: string;
  capital: CardContent;
  language: CardContent;
  food: CardContent;
  places: CardContent;
  animal: CardContent;
  funFact: CardContent;
};

/**
 * RAJASTHAN - Enhanced Content for Kids
 */
export const RAJASTHAN_CONTENT: StateEnrichedContent = {
  stateName: "Rajasthan",

  // 🏛️ CAPITAL: JAIPUR
  capital: {
    title: "🏛️ JAIPUR - The PINK CITY!",
    emoji: "🌸",
    mainText:
      "Imagine a whole city painted PINK! That's Jaipur! A king painted it pink in 1876 to welcome visitors.",
    keyFacts: [
      "Built in 1727 by Maharaja Sawai Jai Singh II",
      "~45 Lakh people live here",
      "Why PINK? Because pink = WELCOME! 🎨",
      "Hawa Mahal has 953 tiny windows! 🪟",
      "City Palace is still a real palace - the king's family LIVES there! 👑",
      "Jantar Mantar = Giant stone telescope 🔭",
      "Street food: Mirchi Pakora, Ker Sangri, Fafda Jalebi 🍜",
      "Best time to visit: October-March 🌤️",
    ],
    coolFacts: [
      "The pink color was chosen because pink represents HOSPITALITY and WELCOME! 🎨",
      "Hawa Mahal (Palace of Winds) was built so the queen could watch street festivals without being seen! 👑",
      "Jaipur was one of the FIRST planned cities in the world! 🏗️",
      "The streets are designed in a perfect GRID pattern - super organized! 📐",
      "City Palace blends Mughal and European architecture - it's a FUSION! 🏰",
      "Jantar Mantar is an ancient astronomy observation tool made of STONE! 🔭",
    ],
    didYouKnow:
      "Jaipur gets its nickname 'The Pink City' because ALL buildings must be painted pink by law! Even today, new buildings have to follow this rule! 🌸",
    tryThis:
      "Next time you see something pink - a flower, a balloon, or even pink lemonade - think of Jaipur and imagine walking through the world's PINKEST city! 💕",
    narration: `Jaipur is the PINK CITY! Imagine walking down a street where EVERYTHING is pink - the walls, the shops, even the air feels pink! 🌸

Long, long ago, a clever king wanted visitors to feel super welcome, so he painted the WHOLE city pink - the color of love! 💕

The Hawa Mahal is the most famous building - it has 953 TINY windows! Why so many? A queen wanted to watch street parties without anyone seeing her. So the king built this magic screen - she could look OUT, but people couldn't see IN! Genius! 💡

If you visit Jaipur, wear your brightest pink clothes and take the coolest photos! The City Palace is STILL where the king's family lives! And the Jantar Mantar is like the world's oldest telescope made of stone! 🔭

Jaipur street food is AMAZING - try Mirchi Pakora (fried spicy peppers) and Fafda Jalebi (sweet and crispy)! 🍜`,
  },

  // 🗣️ LANGUAGE: HINDI
  language: {
    title: "🗣️ HINDI - Let's Learn!",
    emoji: "🗣️",
    mainText:
      "80 out of 100 kids in Rajasthan speak Hindi! It's written in beautiful curvy letters called Devanagari.",
    keyFacts: [
      "RAJASTHAN = RAJ (King) + STHAN (Place) = LAND OF KINGS! 👑",
      "NAMASTE = Hello/Goodbye 🙏",
      "SHUKRIYA = Thank you 💚",
      "HAWA = Wind (Hawa Mahal = Palace of Winds!) 💨",
      "DAL BAATI = Lentils + Bread 🍲",
      "THAR = Desert 🏜️",
      "UNT = Camel 🐪",
      "Hindi is spoken by 600 MILLION people worldwide! 🌍",
      "Devanagari script = Beautiful connected mountains! ⛰️",
      "Tongue twister: 'Rajasthan mein camel chale, Thar desert mein camel gale!' 😄",
    ],
    coolFacts: [
      "Hindi uses Devanagari script - looks like little mountains connected together! ⛰️",
      "600 MILLION people speak Hindi - that's more than the USA, Indonesia, and Brazil combined! 🌍",
      "Devanagari has 45 basic letters - each one looks like a tiny picture! 📸",
      "Hindi was declared the official language of India in 1950! 🇮🇳",
      "You can write Hindi from left to right (like English) but it reads like a continuous line! 📝",
      "Hindi borrowed words from Urdu, Arabic, Persian, English, and Sanskrit! It's a language soup! 🍲",
      "No capital letters in Hindi - all letters are the same size! EQUAL and FAIR! ✨",
      "Many Bollywood songs are in Hindi - have you heard them? 🎵",
    ],
    didYouKnow:
      "The word 'Rajasthan' literally means 'Land of Kings' in Hindi! RAJ = King, STHAN = Place/Land! Every time you say Rajasthan, you're saying a Hindi sentence! 👑",
    tryThis:
      "Learn 5 Hindi words and teach your friends! NAMASTE (hello), SHUKRIYA (thank you), KHANA (food), PANI (water), and HAWA (wind). Practice saying them - it's SO much fun! 🎤",
    narration: `Hindi is SUPER cool! The word 'Rajasthan' means LAND OF KINGS - RAJ means King, and STHAN means Place! 👑

When you say Rajasthan, you're saying you're in the King's Land! 

Hindi letters look like little connected mountains - SO PRETTY! देवनागरी - Look at these curvy letters!

Over 600 MILLION people speak Hindi all around the world! That's like... everyone in a HUGE city that stretches across 10 countries! 🌍

Here are cool words to say:
- NAMASTE (Nah-muh-STAY) = Hello!
- SHUKRIYA (SHOO-kree-yah) = Thank you!
- UNT (OON-T) = Camel!

Try saying them 3 times fast - it's fun! 😄`,
  },

  // 🍲 FOOD: DAL BAATI
  food: {
    title: "🍲 DAL BAATI - The YUMMIEST FOOD!",
    emoji: "🍲",
    mainText:
      "DAL = Soft beans with spices. BAATI = Round bread baked with LOTS of butter (ghee). Together = SUPER DELICIOUS! 🤤",
    keyFacts: [
      "3 parts: DAL (lentils), BAATI (bread), CHURMA (sweet crumble) 🍽️",
      "Takes 45 minutes to make",
      "Farmers ate it because it gave them ENERGY to work all day! 💪",
      "Even KINGS ate it at festivals! 👑",
      "Every family has their OWN special recipe",
      "Why it's good: Protein + Carbs + Fat = Perfect fuel! ⚡",
      "Variations: Spicy, mild, or sweet versions!",
      "Try it in: Jaipur, Jodhpur, Udaipur dhabas 🍜",
      "Best with: Thick yogurt (lassi) 🥛",
      "Calories: ~400 per serving (perfect for active kids!) 💪",
    ],
    coolFacts: [
      "Dal Baati was warrior food! Soldiers ate it before battles for ENERGY! ⚔️",
      "The 'churma' topping is made by crushing baati with ghee and sugar - it's like bread pudding! 🍮",
      "Some families add dried fruits like dates and raisins to make it sweet! 🍯",
      "Dal Baati tastes best when eaten with pickles and yogurt (lassi)! 🥒",
      "There are regional variations - Jodhpuri Dal Baati tastes different from Udaipuri! 🏰",
      "You can make Dal Baati in 45 minutes - perfect for weekend cooking! ⏰",
      "It's PROTEIN-PACKED - perfect fuel for sports and activities! 💪",
      "Every restaurant in Rajasthan has its own secret recipe! 🤐",
    ],
    didYouKnow:
      "Dal Baati is SO popular that there's a tongue twister in Hindi: 'Dal Baati, Churma, Ker Sangri' - it's the traditional Rajasthani meal combo! Even kids chant it like a rhyme! 🎵",
    tryThis:
      "Ask your parents to make Dal Baati at home and help them cook! Mix the dough, help shape the baati, and crush the churma. Then taste it fresh and hot - NOTHING tastes better than food you cooked yourself! 🍳",
    narration: `Dal Baati is the BEST food in Rajasthan! 🍲

Long, long ago, shepherds and farmers ate it because it had SO MUCH ENERGY! It's like... superhero food! 💪

The 'dal' is soft beans cooked with yummy spices - warm, comforting, and SO tasty!

The 'baati' is bread baked in an oven - crunchy outside, fluffy inside!

And when you crush the baati and mix it with butter and sugar... WOW! It becomes 'churma' - absolutely delicious! 🤤

Every family in Rajasthan makes it their OWN way - some add dried fruit, some make it spicy, some make it sweet!

It takes only 45 minutes to make - you can help your parents cook it!

Did you know? This food is so good that even kings ate it during special festivals and celebrations! 👑

You HAVE to try it! Your taste buds will do a happy dance! 🎉`,
  },

  // 🏰 PLACES: HAWA MAHAL
  places: {
    title: "🏰 HAWA MAHAL - Palace of Winds!",
    emoji: "🏰",
    mainText:
      "The WEIRDEST, COOLEST building ever! It looks like a giant pink screen with 953 TINY windows! 🪟",
    keyFacts: [
      "Built in 1799 (200+ years old!) 📅",
      "Made of pink sandstone ✨",
      "Only 43cm THICK at the back! (Like 3 school notebooks!) 📚",
      "953 TINY windows - try counting them! 🪟",
      "Why so many windows? A queen wanted to watch street parties without being seen! 👑",
      "NO stairs inside - it's just a beautiful FRONT! 🎪",
      "5 stories tall 🏢",
      "Best photo time: Sunrise = GOLDEN LIGHT! 🌅",
      "Sunset = PINK ON PINK = MAGICAL! 🌄",
      "Take 30 minutes to explore 🚶",
      "Nearby: City Palace, Jantar Mantar, Bapu Bazaar 🛍️",
    ],
    coolFacts: [
      "Hawa Mahal is so THIN - only 43cm! - that it's basically a wall, not a real building! 📏",
      "The windows are SO SMALL that you can barely fit your hand through them! 👋",
      "It took workers 2 years to build all 953 windows by HAND! 🔨",
      "The pink color comes from local pink sandstone quarries! 🪨",
      "Inside, there are narrow passages connecting the windows - like a secret maze! 🌀",
      "Sunrise photography: The light turns the building GOLD! 📸",
      "Sunset photography: Pink building + pink sky = DREAM SCENE! 🌅",
      "The royal family used it like a VIP booth at a sports stadium - watching, not being seen! 👑",
    ],
    didYouKnow:
      "Hawa Mahal means 'Palace of Winds' - and it actually has windows on BOTH sides so cool breezes flow through the entire building! That's why women inside felt comfortable even in hot weather! 💨",
    tryThis:
      "If you visit Jaipur, take a photo through one of the tiny windows! Can you see the street through it? Or visit at sunrise and watch the building turn from pink to golden - it's like magic happening in real-time! ✨",
    narration: `Hawa Mahal means PALACE OF WINDS! 💨

This building has 953 TINY windows - can you imagine? That's like... the number of kids in 10 schools! 🏫

The building is SO THIN at the back - only 43cm! - that it's like a giant pink screen. 

A long time ago, a queen wanted to watch all the street festivals and parties happening outside. But there was a rule that royal women couldn't let people see them. 

So what did the king do? He built this GENIUS building with 953 windows! She could look OUT at the parties, but people couldn't see IN! It's like the world's coolest hide-and-seek spot! 👀

The building is made of pink sandstone - SO PRETTY! When sunlight shines through all those windows, it looks like magic! ✨

If you go to Jaipur, you HAVE to see it! Try counting the windows - I bet you can't! 😄

Best time for photos? Sunrise when the light is golden, or sunset when everything turns pink! 🌅

Challenge: Take a picture of your face reflected in one of the tiny windows! 📸`,
  },

  // 🐪 ANIMAL: CAMEL
  animal: {
    title: "🐪 THE AMAZING CAMEL - Desert Superhero!",
    emoji: "🐪",
    mainText:
      "Camels are the SUPERPOWERS animal! They can go 2 WEEKS without water and run at 65 km/hour! 💨",
    keyFacts: [
      "Superpower #1: Can go 2 WEEKS without water! 💧",
      "Can drink 100 LITERS in 10 minutes! (400 water bottles!) 🚰",
      "Humps store FAT, not water! (Common mistake!) 🏔️",
      "Superpower #2: Giant padded feet spread out like snowshoes! 👣",
      "Superpower #3: Desert eyes! Can see for MILES! 👀",
      "Long eyelashes block sand & dust! 🧖",
      "Can close nostrils in sandstorms! 🌪️",
      "Superpower #4: Can SPIT! (When angry!) 💦",
      "Speed: Can run 65 km/hour! 🏃",
      "Weight: 600kg! (Like 10 kids!) 💪",
      "Height: 3 meters! (Taller than your room!) 📏",
      "Lifespan: 40-50 years 📅",
      "Baby camel = calf (born WITHOUT humps!) 👶",
      "~500,000 camels live in Rajasthan! 🐫",
      "Pushkar Camel Fair: 50,000+ camels in November! 🎪",
    ],
    coolFacts: [
      "Camel humps are like BACKUP BATTERIES! They store fat that turns into energy and water when needed! 🔋",
      "When a camel uses its hump energy, the hump actually SHRINKS! It's like deflating a balloon! 🎈",
      "Camel blood is SO special that it can mix with different salt levels - perfect for desert survival! 🩸",
      "Their padded feet spread out when they walk - like having built-in snowshoes! They never sink in sand! 👣",
      "Baby camels (calves) can walk within HOURS of being born! They're ready for adventure immediately! 👶",
      "Camel teeth NEVER stop growing - they're like elephant tusks! 🦷",
      "The Pushkar Camel Fair has been happening for over 1000 YEARS! 🎪",
      "Camels remember people and places for YEARS - they have amazing memories! 🧠",
    ],
    didYouKnow:
      "Camels are called 'Ships of the Desert' because traders rode them across the Sahara and Thar deserts for thousands of years! Before cars, they were the ONLY way to travel! 🚢",
    tryThis:
      "If you ever get to Rajasthan, ride a camel on a desert safari! It's bumpy, it's wild, and it's one of the coolest adventures you can have. Wear sunscreen and bring water for yourself (the camel won't need it!) 🐪",
    narration: `Camels are the SUPERSTARS of the desert! 🐪

They have AMAZING superpowers that make them perfect for living in hot, sandy places! 💪

Superpower #1: They can go 2 WHOLE WEEKS without water! How? Their humps don't store water - they store FAT! So they have energy even when there's no water. And when they find water? They can drink 100 LITERS in just 10 minutes! That's like 400 water bottles at once! 🚰

Superpower #2: Giant padded feet! They spread out like snowshoes so the camel doesn't sink in sand. It's like walking on clouds! ☁️

Superpower #3: Desert eyes! Those long eyelashes? They block sand and dust! And they can see for MILES across the desert! 👀

Superpower #4: They can close their nostrils in sandstorms! And when they get angry? They SPIT! 💦 (Don't make them angry!)

Other cool facts:
- They can run 65 km/hour!
- They weigh 600kg - like 10 kids!
- They grow to 3 meters tall!
- Baby camels are called 'calves' and they're born WITHOUT humps!
- Their humps grow as they get older!

~500,000 camels live in Rajasthan! And every November, there's the PUSHKAR CAMEL FAIR with 50,000+ camels! That's like... 50,000 four-legged friends having a HUGE party! 🎉

When you visit Rajasthan, you can ride a camel on a desert safari! It's bumpy and super fun! 🐪`,
  },

  // 💡 FUN FACT: THAR DESERT
  funFact: {
    title: "🏜️ THAR DESERT - India's Giant Sandbox!",
    emoji: "🏜️",
    mainText:
      "Bigger than Israel! Hotter than an oven! And 5 MILLION people live there! It's India's only desert and it's AMAZING! 🌍",
    keyFacts: [
      "Size: 200,000 km² - bigger than the UK! 📈",
      "Hottest: 50°C in summer! (Hotter than an oven!) 🔥",
      "Coldest: -5°C at night! (Freezing!) ❄️",
      "Sand dunes: Some are 150 METERS tall! (40-story building!) 🏗️",
      "Population: 5 MILLION people live here! 🏡",
      "Desert animals: Camels, lions, desert foxes, gazelles, eagles, snakes! 🦁",
      "Desert plants: Date palms (yummy dates!), acacia trees, cacti 🌴",
      "Night sky: THOUSANDS of stars! You can see the Milky Way! ✨",
      "Age: 4,000 years old! Used to be GREEN with water! 🌱",
      "Expanding: Getting bigger because of climate change 🌍",
      "Things to do: Camel safari, desert camping, watch sunrise/sunset! 🐪",
      "Best time: October-March (summer is TOO HOT!) 🌞",
      "Jaisalmer Fort: Golden fort in the middle of the desert! 🏰",
      "Pushkar: Famous for camel fair and hot springs! 🔥",
      "Exotic: 5 MILLION people know incredible desert secrets! 🤐",
    ],
    coolFacts: [
      "The Thar Desert is one of the most POPULATED deserts in the world! 5 million people live here! 🏡",
      "Some sand dunes are 150 meters tall - that's like a 50-story building made of sand! 🏢",
      "The temperature difference between day and night is CRAZY - 50°C during day, -5°C at night! Your body wouldn't know what to do! 🌡️",
      "The night sky has NO light pollution - you can see 1000+ STARS and the Milky Way galaxy across the sky! 🌌",
      "Jaisalmer Fort is a GOLDEN FORT literally IN the middle of the desert - it glows at sunset! 🏰",
      "The Pushkar Camel Fair started 1000+ years ago and STILL happens every November! 🎪",
      "Thar used to be GREEN and have lots of water 4000 years ago - then climate changed! 🌊",
      "The desert is slowly EXPANDING due to climate change - it's growing bigger every year! 🌍",
    ],
    didYouKnow:
      "The Thar Desert is home to one of the rarest cats in the world - the Indian Desert Cat! It's smaller than a house cat and hunts at night! 🐱",
    tryThis:
      "Visit the Thar Desert at night and lie on the sand looking up! You'll see the Milky Way galaxy stretching across the entire sky - it's so amazing that you'll forget to breathe! ✨",
    narration: `The Thar Desert is AMAZING! 🏜️

It's one of the most populated deserts in the ENTIRE world! Over 5 MILLION people live here! How? They know incredible desert secrets passed down through their families for thousands of years!

The size is HUGE - 200,000 km²! That's BIGGER than the entire UK! Imagine that!

The sand dunes are SO TALL - some are 150 meters high! That's like looking up at a 40-story building, but made of SAND! 🏗️

The temperature swings are CRAZY! In summer it's 50°C - hotter than your home oven! But at night it drops to -5°C and it's freezing! Your body wouldn't know what to do!

But here's the COOLEST part: At night, there are NO city lights! So you can see the ENTIRE Milky Way galaxy across the sky! It looks like someone poured milk across the sky! ✨ Over 1000 stars are visible!

The Thar Desert is home to SO many cool animals:
- Camels 🐪
- Lions (wild ones!) 🦁
- Desert foxes 🦊
- Gazelles 🦌
- Eagles 🦅
- Snakes (stay away!) 🐍
- Desert lizards 🦎

And plants too! Date palms (you can eat the dates!), acacia trees, and tough desert shrubs! 🌴

Long, long ago - 4,000 years ago - this area was GREEN and had lots of water! But then the climate changed and it became a desert. Now it's slowly expanding because of climate change.

When you visit the Thar, you can:
- Ride camels across the sand! 🐪
- Sleep in desert camps under the stars! ⛺
- Watch sunsets that paint the sky orange, red, and purple! 🌅
- Watch sunrise when the sand turns golden! 🌄
- Explore Jaisalmer Fort - a golden fort in the middle of the desert! 🏰
- Visit Pushkar for the camel fair and hot springs! 🔥

Best time to visit? October to March! Summer is way too hot - stay away in June-August! 🌞

The Thar Desert teaches us that even in harsh, extreme places, life finds a way! 5 million people, thousands of animals, and amazing plants have all adapted to survive! That's the power of nature! 🌍`,
  },
};

// Export all state contents (future expansion)
export const ALL_STATE_CONTENTS: Record<string, StateEnrichedContent> = {
  Rajasthan: RAJASTHAN_CONTENT,
};

export function getStateContent(stateName: string): StateEnrichedContent | null {
  return ALL_STATE_CONTENTS[stateName] ?? null;
}
