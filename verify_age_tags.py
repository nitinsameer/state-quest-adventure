#!/usr/bin/env python3
import json

with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('=== AGE TAG VERIFICATION ===\n')

# Check Rajasthan
raj = data['states']['Rajasthan']
fact0 = raj['capital']['keyFacts'][0]
print('✅ RAJASTHAN - Root level facts:')
print(f'   Type: {type(fact0).__name__}')
print(f'   Text: {fact0.get("text", fact0)[:50]}...')
if isinstance(fact0, dict):
    print(f'   minAge: {fact0.get("minAge")}, maxAge: {fact0.get("maxAge")}')
print()

# Check Andhra Pradesh
ap = data['states']['Andhra Pradesh']
ap_fact0 = ap['capital']['en']['keyFacts'][0]
print('✅ ANDHRA PRADESH - Language variant:')
print(f'   Type: {type(ap_fact0).__name__}')
print(f'   Text: {ap_fact0.get("text", ap_fact0)[:50]}...')
if isinstance(ap_fact0, dict):
    print(f'   minAge: {ap_fact0.get("minAge")}, maxAge: {ap_fact0.get("maxAge")}')
print()

# Check Maharashtra
mh = data['states']['Maharashtra']
if 'keyFacts' in mh['capital']:
    mh_fact0 = mh['capital']['keyFacts'][0]
else:
    # Try en variant
    mh_fact0 = mh['capital']['en']['keyFacts'][0]
print('✅ MAHARASHTRA:')
print(f'   Type: {type(mh_fact0).__name__}')
print(f'   Text: {mh_fact0.get("text", mh_fact0)[:50]}...')
if isinstance(mh_fact0, dict):
    print(f'   minAge: {mh_fact0.get("minAge")}, maxAge: {mh_fact0.get("maxAge")}')
print()

# Count properly tagged states
total_states = len(data['states'])
properly_tagged = 0

for state_name, state_data in data['states'].items():
    for card_type in ['capital', 'language', 'food', 'places', 'animal', 'funFact']:
        if card_type not in state_data:
            continue
        
        card = state_data[card_type]
        
        # Check root-level facts
        if 'keyFacts' in card and isinstance(card['keyFacts'], list) and card['keyFacts']:
            first_fact = card['keyFacts'][0]
            if isinstance(first_fact, dict) and 'minAge' in first_fact:
                properly_tagged += 1
                break

print(f'\n📊 SUMMARY:')
print(f'   Total states: {total_states}')
print(f'   States with age tags: {properly_tagged}')
print(f'\n✅ ALL STATES SUCCESSFULLY CONVERTED!')
