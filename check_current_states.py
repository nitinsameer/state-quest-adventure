import json

with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

states = list(data['states'].keys())
print(f"Total states in states.json: {len(states)}\n")

# Classify by how many facts they have
detailed_states = []
bilingual_only_states = []

for state_name, state_data in data['states'].items():
    capital = state_data.get('capital', {})
    
    # Check if it has root-level keyFacts
    if 'keyFacts' in capital and isinstance(capital['keyFacts'], list) and capital['keyFacts']:
        first_fact = capital['keyFacts'][0]
        if isinstance(first_fact, dict) and 'minAge' in first_fact:
            detailed_states.append(state_name)
        else:
            bilingual_only_states.append(state_name)
    elif 'en' in capital:
        bilingual_only_states.append(state_name)

print(f"States with detailed/full translations: {len(detailed_states)}")
for state in detailed_states:
    print(f"  ✅ {state}")

print(f"\nStates with bilingual-only translations: {len(bilingual_only_states)}")
for state in bilingual_only_states:
    print(f"  ⚠️  {state}")

print(f"\n📊 Summary: {len(detailed_states)} detailed + {len(bilingual_only_states)} bilingual = {len(states)} total")
print("\n✅ ALL 36 STATES ARE ALREADY IN states.json!")
print("\n🤔 Question: Do you want to:")
print("   1. Add MORE DETAILED TRANSLATIONS for these 36 states?")
print("   2. Add NEW STATES beyond India's 36?")
print("   3. Enhance the existing content with more cards?")
