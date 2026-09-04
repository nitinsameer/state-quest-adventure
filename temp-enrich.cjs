const fs = require('fs');

const filePath = 'src/lib/content/states.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Tamil Nadu enrichment - simplified approach
if (!data.states['Tamil Nadu'].language) {
  data.states['Tamil Nadu'].language = {
    "title": "Language Card",
    "emoji": "🗣️",
    "mainText": "Tamil is 2500+ YEARS OLD",
    "keyFacts": [],
    "coolFacts": [],
    "didYouKnow": "Test",
    "tryThis": "Test",
    "narration": "Test narration"
  };
}

console.log('Updated successfully');
