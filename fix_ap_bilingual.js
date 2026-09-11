import fs from 'fs';
import path from 'path';

// Read states.json
const statesPath = path.join('src', 'lib', 'content', 'states.json');
const statesContent = fs.readFileSync(statesPath, 'utf8');
const statesData = JSON.parse(statesContent);

// English content for Andhra Pradesh (original)
const englishAP = {
  "stateName": "Andhra Pradesh",
  "languageCode": "te",
  "capital": {
    "title": "🏛️ VISAKHAPATNAM - Beach City with History!",
    "emoji": "🏛️",
    "mainText": "Beach city! 2 CRORE people in state! Port city! Beautiful beaches! Ancient temples! 🏖️",
    "keyFacts": [
      "Capital: Visakhapatnam (also written Vizag)! 🏙️",
      "Population: 2 CRORE (20 million)! 🌍",
      "Vizag Beach: Beautiful long beach! 🏖️",
      "Port: One of India's busiest ports! ⚓",
      "Temples: Tirupati Temple - richest temple in India! 💰",
      "Araku Valley: Tea gardens and coffee plantations! 🌿",
      "Andhra Cuisine: Rice-heavy, spicy, DELICIOUS! 🍚",
      "Kakinada: Famous for diamonds and cutch! 💎",
      "Chintapalli: Ancient Buddhist site! 🙏",
      "Art & crafts: Karnataka stone carvings! 🎨"
    ]
  },
  "language": {
    "title": "🗣️ TELUGU - Language of Culture!",
    "emoji": "🗣️",
    "mainText": "Andhra Pradesh is the home of Telugu culture! Over 80 million people speak Telugu here! 🎵",
    "keyFacts": [
      "Telugu speakers: 80+ MILLION in Andhra Pradesh! 🌍",
      "One of world's oldest languages - 1,000+ year literature! 📜",
      "Beautiful script with curved lines! 🌊",
      "ANDHRA = LAND + PRADE = GIFT of land! 💬",
      "Ancient Telugu poets (Reciters) = GREAT storytellers! 📖",
      "VANAKKAM = Hello 🙏",
      "SHUKRIYA = Thank you 💚",
      "Andhra Pradesh has world's oldest Telugu university! 🎓",
      "Rich literary tradition - 1,000+ year old texts! 📚",
      "UNESCO recognizes Telugu literary heritage! 🌍"
    ]
  },
  "food": {
    "title": "🍲 GONGURA CURRY - The Sour Surprise!",
    "emoji": "🍲",
    "mainText": "A tangy, spicy curry made from gongura leaves (sour plant)! It's UNIQUE to Andhra Pradesh and absolutely DELICIOUS! 🌶️",
    "keyFacts": [
      "Gongura leaves are SUPER sour - naturally tangy! 🍋",
      "Cooked with spices and usually meat! 🥘",
      "Andhra specialty - eaten with rice! 🍚",
      "Tastes different from other Indian curries! ✨",
      "Gongura plant grows wild in fields! 🌿",
      "High in vitamins - HEALTHY! 💪",
      "Each family has secret recipe! 👨‍🍳",
      "Usually eaten for lunch! 🌤️",
      "Pairs perfectly with hot rice! 🍛",
      "Regional vegetarian versions exist! 🥗"
    ]
  },
  "places": {
    "title": "🕉️ TIRUPATI TEMPLE - World's Richest Temple!",
    "emoji": "🕉️",
    "mainText": "The RICHEST temple in the WORLD! Millions of pilgrims visit yearly! Ancient, spiritual, and BREATHTAKING! 🙏",
    "keyFacts": [
      "Located in Tirupati, Andhra Pradesh 📍",
      "Built in 10th century - 1,000+ years old! 📜",
      "World's richest temple! 💰",
      "Receives 2-3 MILLION visitors annually! 👥",
      "Pilgrims shave their heads as offering! 💈",
      "Temple revenue: 1 BILLION+ dollars yearly! 💵",
      "Huge gold reserves - valued in billions! 🏆",
      "Intricate carvings and architecture - STUNNING! 🎨",
      "Believed to fulfill wishes! 🙏",
      "Most visited Hindu temple globally! 🌍"
    ]
  },
  "animal": {
    "title": "🦚 INDIAN PEAFOWL (Peacock) - The Royal Bird!",
    "emoji": "🦚",
    "mainText": "India's national bird! SO beautiful with brilliant blue and colorful feathers! Male peacocks have LEGENDARY tail displays! 💫",
    "keyFacts": [
      "India's national bird - since 1963! 🇮🇳",
      "Males have 200+ tail feathers! 🪶",
      "Tail display = MOST BEAUTIFUL in animal kingdom! ✨",
      "Can live 20+ years! 📅",
      "Eat snakes and insects - garden helpers! 🐍",
      "Males are called peacocks, females peahens! 🦚",
      "Mating dance is LEGENDARY! 💃",
      "Make loud honking sounds! 📢",
      "Sacred in Hindu and Buddhist religions! 🕉️",
      "Found across Andhra Pradesh! 🌏"
    ]
  },
  "funFact": {
    "title": "🎉 AMAZING FUN FACTS - Andhra Pradesh Wonders!",
    "emoji": "🎉",
    "mainText": "Andhra Pradesh blends ancient spirituality with modern innovation! From temples to tech, it's SPECIAL! 🌟",
    "keyFacts": [
      "Home of Tirupati - world's richest temple! 💰",
      "Eastern Ghats mountains - UNESCO World Heritage! 🏔️",
      "Visakhapatnam port is one of India's busiest! ⚓",
      "Fishing - major industry along coastline! 🐟",
      "Rice production - AP produces 24% of India's rice! 🍚",
      "Spice production - chili, turmeric, pepper! 🌶️",
      "IT industry thriving in Visakhapatnam! 💻",
      "Hydrabad became separate state in 2014! 🗺️",
      "Ancient Mauryan Kingdom had capitals here! 👑",
      "UNESCO World Heritage sites - 3 total! 🌍"
    ]
  }
};

// Get current Telugu version (already in states.json)
const teluguAP = statesData.states["Andhra Pradesh"];

// Create new structure with BOTH languages
const bilingualAP = {
  stateName: "Andhra Pradesh",
  languageCode: "te", // Default is Telugu (native language)
  capital: {
    en: englishAP.capital,
    te: teluguAP.capital
  },
  language: {
    en: englishAP.language,
    te: teluguAP.language
  },
  food: {
    en: englishAP.food,
    te: teluguAP.food
  },
  places: {
    en: englishAP.places,
    te: teluguAP.places
  },
  animal: {
    en: englishAP.animal,
    te: teluguAP.animal
  },
  funFact: {
    en: englishAP.funFact,
    te: teluguAP.funFact
  }
};

// Update states.json
statesData.states["Andhra Pradesh"] = bilingualAP;

// Write back
fs.writeFileSync(statesPath, JSON.stringify(statesData, null, 2) + '\n', 'utf8');
console.log('✅ Andhra Pradesh updated with bilingual content (en + te)');
