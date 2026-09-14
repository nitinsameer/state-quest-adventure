import json

with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('States without root-level keyFacts (likely language-variant only):')
for state_name, state_data in data['states'].items():
    card = state_data.get('capital', {})
    if 'keyFacts' not in card:
        print(f'  - {state_name}')
        # Check if they have language variants
        if 'en' in card:
            print(f'    ✅ Has en variant')
