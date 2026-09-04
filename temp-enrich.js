const fs = require('fs');
const path = require('path');

const filePath = 'src/lib/content/states.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Tamil Nadu enrichment
data.states['Tamil Nadu'].language = {
  "title": "🗣️ TAMIL - The OLDEST Language!",
  "emoji": "🗣️",
  "mainText": "TAMIL is 2500+ YEARS OLD! One of the world's oldest living languages! Spoken by 8 CRORE people! Ancient and PROUD! 📜",
  "keyFacts": ["Age: 2500+ YEARS OLD! One of the oldest languages in the world! 📜", "Speakers: 8 CRORE (80 MILLION) people worldwide! 🌍", "TAMIZH = Tamil (means 'clarity' and 'purity')! ✨", "VANAKKAM = Hello 🙏", "NANDRI = Thank you 💚", "TAMIL LETTERS: Beautiful curves and dots! 🔤", "Literature: Sangam literature from 2000 years ago! 📚", "Thirukkural: 1330 couplets of wisdom! 💡", "Official language: 6 Indian states! 🏛️", "UNESCO: Recognized as classical language! 👑"],
  "coolFacts": ["Tamil has CONTINUOUS LITERARY HISTORY for 2500 YEARS! Books, poems, stories written in ancient Tamil still EXIST! 📚", "Tamil is one of the 6 CLASSICAL LANGUAGES of India recognized by UNESCO! It's THAT important! 👑", "Sangam literature includes poetry about LOVE, WAR, NATURE - written 2000 YEARS AGO! 📖", "Thirukkural is a MASTERPIECE with 1330 couplets teaching wisdom about life! Every couplet is a LESSON! 💡", "Tamil letters look like beautiful CURVES and DOTS! When written, it looks like ART! 🎨", "Tamil influenced many languages in South Asia - it's an ANCIENT and POWERFUL language! 💪"],
  "didYouKnow": "Tamil is one of only a FEW languages that have an UNBROKEN LITERARY TRADITION of 2500 YEARS! That means books, poems, and stories written in ancient Tamil are STILL READ AND UNDERSTOOD today! 📜",
  "tryThis": "Learn Tamil words: VANAKKAM (hello), NANDRI (thank you), SAPPADU (food), and VAALKAI (life)! Try reading Tamil script - it's BEAUTIFUL! 🎨",
  "narration": "Tamil is ANCIENT and PROUD! 📜\n\n2500+ YEARS OLD! One of the world's oldest LIVING languages! That means people STILL SPEAK it today - the same language people spoke 2500 years ago!\n\n8 CRORE people speak Tamil worldwide! That's 80 MILLION!\n\nThe COOLEST part? Tamil has CONTINUOUS LITERARY HISTORY! Books written 2500 years ago are STILL READ TODAY! 📚 Try that with English - ancient English books need TRANSLATION to understand!\n\nTamil literature includes:\n- SANGAM POETRY: 2000-year-old poems about love, war, nature! 📖\n- THIRUKKURAL: 1330 wisdom couplets! Each one teaches a LIFE LESSON! 💡\n- STORIES: Ancient stories still told and loved! 🎭\n\nTamil script looks like BEAUTIFUL CURVES AND DOTS! 🔤 When written, it's like ART!\n\nHere are cool Tamil words:\n- VANAKKAM (Vuh-NUCK-um) = Hello! 🙏\n- NANDRI (NUN-dree) = Thank you! 💚\n- SAPPADU (SUP-puh-doo) = Food! 🍲\n- VAALKAI (VAHL-kai) = Life! 🌟\n\nTamil is one of 6 CLASSICAL LANGUAGES recognized by UNESCO! It's THAT IMPORTANT! 👑\n\nEvery time you speak Tamil, you're speaking a language that's been ALIVE for 2500 YEARS! That's INCREDIBLE! 🌍"
};

// Add more cards for Tamil Nadu...
data.states['Tamil Nadu'].food = {
  "title": "🥘 DOSA - The CRISPY PANCAKE SUPERSTAR!",
  "emoji": "🥘",
  "mainText": "DOSA = Thin crispy pancake made from rice and lentils! SO CRISPY it shatters when you bite it! Served with sambar, chutney, and potato filling! LEGENDARY! 😋",
  "keyFacts": ["Made from: Rice and lentil batter fermented overnight! 🌾", "Texture: PAPER-THIN and SUPER CRISPY! ✨", "Size: Can be GIANT - sometimes 3 feet long! 📏", "Fillings: Potato, onion, spices! 🥔", "Served with: Sambar (lentil soup), Chutney (spicy paste)! 🌶️", "Cost: Super affordable! ₹50-100! 💰", "Street vendor skill: They make it in SECONDS! ⚡", "Breakfast staple: Eaten by MILLIONS every morning! 🌅", "Masala dosa: Filled with spicy potato mixture! 🌶️", "Plain dosa: Just the crispy pancake! 🍽️"],
  "coolFacts": ["Dosa is made with a SPECIAL TECHNIQUE - the batter is poured in a CIRCULAR MOTION on a HOT GRIDDLE! 🌀 The edges get CRISPY while the inside stays SOFT! 🎯", "A good dosa maker can make a PERFECT dosa in just 30 SECONDS! It's pure SKILL! ⚡", "Dosa can be GIANT - some dosas are 3 FEET LONG! You need both hands to hold it! 📏", "The bottom becomes PAPER-THIN and SO CRISPY that it SHATTERS when you bite it - CRUNCH! 🎉", "South Indian restaurants outside India often FAILED before they mastered dosa! Now dosa restaurants are EVERYWHERE! 🌍", "A dosa with sambar and chutney is COMPLETE NUTRITION - carbs, protein, vegetables, spices! 💪"],
  "didYouKnow": "Dosa is SO POPULAR that it's eaten for BREAKFAST, LUNCH, DINNER, and SNACKS across India! Some people eat dosa EVERY SINGLE DAY! 😋",
  "tryThis": "Watch a dosa maker work their MAGIC! See them pour batter in a spiral, flip it PERFECTLY, and remove it CRISPY! Then eat it fresh and HOT with sambar and chutney! It's HEAVEN! 🥘",
  "narration": "Dosa is a CRISPY PANCAKE LEGEND! 🥘\n\nImagine a THIN, CRISPY pancake made from rice and lentil batter! So CRISPY it literally SHATTERS when you bite it! CRUNCH CRUNCH CRUNCH! 🎉\n\nThe magic is in the FERMENTATION! The batter sits overnight and the bacteria make it FLUFFY and TANGY! Then when it's poured on a HOT GRIDDLE, the edges become PAPER-THIN and SUPER CRISPY while the inside stays SOFT! 🔥\n\nDosa makers are ARTISTS! They pour the batter in a PERFECT SPIRAL MOTION on the griddle! ⚡ In just 30 seconds, it's DONE! The SKILL is INSANE!\n\nYou can get:\n- PLAIN DOSA: Just the crispy pancake! 🍽️\n- MASALA DOSA: Filled with spicy, fried potatoes! 🥔\n- CHEESE DOSA: Yes, cheese dosa exists! 🧀\n- ONION DOSA: With crispy fried onions! 🧅\n\nEverything comes with:\n- SAMBAR: A tangy lentil soup with vegetables! 🌶️\n- CHUTNEY: Spicy/sweet pastes made from coconut, tamarind, or chili! 🌿\n\nThe best part? A FULL dosa with sambar and chutney costs only ₹50-100! That's like $1! And it's SO FILLING!\n\nDosa is eaten by MILLIONS for breakfast EVERY DAY across South India and now WORLDWIDE! 🌍\n\nWhen you eat a fresh dosa:\n1. Feel the CRISPY edges! 👂\n2. Taste the SOFT inside! 👅\n3. Dip in sambar and chutney! 🌶️\n4. ENJOY HEAVEN! 😋"
};

// Save the updated file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated Tamil Nadu with language and food cards');
