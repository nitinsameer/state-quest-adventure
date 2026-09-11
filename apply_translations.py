#!/usr/bin/env python3
import json

# Read states.json
with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
    states_data = json.load(f)

# Read native translations
with open('native_translations.json', 'r', encoding='utf-8') as f:
    translations = json.load(f)

# Map states to their language codes
state_lang_map = {
    'Gujarat': 'gu',
    'Karnataka': 'kn',
    'Maharashtra': 'mr',
    'Tamil Nadu': 'ta',
    'West Bengal': 'bn'
}

# Card types to update
card_types = ['capital', 'language', 'food', 'places', 'animal', 'funFact']

print("=" * 80)
print("APPLYING NATIVE LANGUAGE TRANSLATIONS")
print("=" * 80)

# For each state
for state_name, lang_code in state_lang_map.items():
    if state_name not in states_data['states']:
        print(f"❌ {state_name}: NOT FOUND in states.json")
        continue
    
    if state_name not in translations:
        print(f"❌ {state_name}: NO TRANSLATIONS AVAILABLE")
        continue
    
    state_obj = states_data['states'][state_name]
    trans_state = translations[state_name]
    
    # For each card type
    updated_count = 0
    for card_type in card_types:
        if card_type not in state_obj:
            continue
        
        card = state_obj[card_type]
        
        # Ensure bilingual structure exists
        if not isinstance(card, dict) or 'en' not in card:
            continue
        
        # Get translated content
        if card_type not in trans_state[lang_code]:
            continue
        
        trans_card = trans_state[lang_code][card_type]
        
        # Replace the native language variant with translated content
        card[lang_code] = trans_card
        updated_count += 1
        print(f"  ✅ {card_type}: Updated")
    
    print(f"✅ {state_name}: {updated_count}/6 cards updated with native content\n")

# Save updated states.json
with open('src/lib/content/states.json', 'w', encoding='utf-8') as f:
    json.dump(states_data, f, ensure_ascii=False, indent=2)

print("=" * 80)
print("✅ ALL TRANSLATIONS APPLIED SUCCESSFULLY!")
print("=" * 80)
