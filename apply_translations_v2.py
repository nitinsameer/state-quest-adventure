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
print("APPLYING NATIVE LANGUAGE TRANSLATIONS - VERSION 2")
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
    trans_lang = trans_state.get(lang_code, {})
    
    print(f"\n✅ Processing {state_name}...")
    
    # For each card type
    updated_count = 0
    for card_type in card_types:
        if card_type not in state_obj:
            print(f"   - {card_type}: NOT FOUND in state")
            continue
        
        card = state_obj[card_type]
        
        # If card is not a dict or doesn't have 'en', skip it (may be old format)
        if not isinstance(card, dict):
            print(f"   - {card_type}: NOT A DICT, skipping")
            continue
        
        # Get translated content for this card
        if card_type not in trans_lang:
            print(f"   - {card_type}: NO TRANSLATION AVAILABLE")
            continue
        
        trans_card_content = trans_lang[card_type]
        
        # If 'en' exists, it's bilingual format - add native variant
        if 'en' in card:
            # Bilingual format: copy all fields from translation
            card[lang_code] = trans_card_content
            print(f"   ✅ {card_type}: Updated (bilingual format)")
            updated_count += 1
        else:
            # Single format - need to convert to bilingual
            # First save English version, then add native version
            en_version = dict(card)
            card.clear()
            card['en'] = en_version
            card[lang_code] = trans_card_content
            print(f"   ✅ {card_type}: Converted to bilingual + updated native")
            updated_count += 1
    
    print(f"\n   Summary: {updated_count}/6 cards updated for {state_name}")

# Save updated states.json
with open('src/lib/content/states.json', 'w', encoding='utf-8') as f:
    json.dump(states_data, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 80)
print("✅ ALL TRANSLATIONS APPLIED SUCCESSFULLY!")
print("=" * 80)
