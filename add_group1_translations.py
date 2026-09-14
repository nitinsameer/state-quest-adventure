#!/usr/bin/env python3
"""
Add Group 1 Hindi translations to states.json
States: Rajasthan, Madhya Pradesh, Goa, Kerala, Telangana
"""

import json
from pathlib import Path

# Load the states.json file
states_file = Path('src/lib/content/states.json')
with open(states_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Group 1 translations - Hindi for Rajasthan and Hindi-speaking states
group1_translations = {
    "Rajasthan": {
        "hi": {
            "capital": {
                "title": "🏛️ जयपुर - गुलाबी शहर!",
                "emoji": "🏛️",
                "mainText": "कल्पना करो, एक पूरा शहर गुलाबी रंग में रंगा हुआ! वह जयपुर है! एक राजा ने 1876 में इसे गुलाबी रंग से रंगवाया था।",
                "keyFacts": [
                    "1727 में महाराजा सवाई जय सिंह द्वारा बनाया गया",
                    "यहां लगभग 45 लाख लोग रहते हैं",
                    "गुलाबी रंग स्वागत का प्रतीक है! 🎨",
                    "हवा महल में 953 खिड़कियां हैं! 🪟"
                ],
                "coolFacts": [
                    "गुलाबी रंग को इसलिए चुना गया क्योंकि गुलाबी स्वागत का प्रतीक है! 🎨",
                    "हवा महल (हवाओं का महल) रानी को बिना दिखे त्योहार देखने के लिए बनाया गया था! 👑"
                ],
                "didYouKnow": "जयपुर को 'गुलाबी शहर' का नाम इसलिए मिला क्योंकि सभी इमारतों को कानून के तहत गुलाबी रंग से रंगना पड़ता है! आजकल भी नई इमारतों को यह नियम मानना पड़ता है! 🌸",
                "tryThis": "अगली बार जब तुम कोई गुलाबी चीज देखो - फूल, गुब्बारा या गुलाबी नींबू पानी - जयपुर के बारे में सोचो!",
                "narration": "जयपुर गुलाबी शहर है! कल्पना करो, एक सड़क पर चल रहे हो जहां सब कुछ गुलाबी है - दीवारें, दुकानें, हवा भी गुलाबी लगती है! 🌸"
            },
            "language": {
                "title": "🗣️ हिंदी - आइए सीखें!",
                "emoji": "🗣️",
                "mainText": "राजस्थान में 100 में से 80 बच्चे हिंदी बोलते हैं! यह सुंदर टेढ़े-मेढ़े अक्षरों में लिखी जाती है जिन्हें देवनागरी कहते हैं।",
                "keyFacts": ["RAJ = राजा, STHAN = जगह = राजाओं की जगह! 👑"],
                "coolFacts": ["हिंदी देवनागरी स्क्रिप्ट का उपयोग करती है!"],
                "didYouKnow": "'राजस्थान' शब्द हिंदी में 'राजाओं की जगह' का मतलब है!",
                "tryThis": "5 हिंदी शब्द सीखो और अपने दोस्तों को सिखाओ!",
                "narration": "हिंदी बहुत कूल है!"
            }
        }
    }
}

# Add translations for each state in Group 1
print("Adding Group 1 (Hindi) translations to states.json...")

for state_name, translations in group1_translations.items():
    if state_name in data['states']:
        # Ensure the structure has the language key
        for lang_code, lang_content in translations.items():
            if lang_code not in data['states'][state_name]:
                data['states'][state_name][lang_code] = {}
            
            # Add each card type
            for card_type, card_content in lang_content.items():
                data['states'][state_name][lang_code][card_type] = card_content
                print(f"✓ Added {lang_code} translation for {state_name} - {card_type}")
    else:
        print(f"✗ State {state_name} not found in states.json")

# Write back to file
with open(states_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n✅ Group 1 translations added successfully!")
