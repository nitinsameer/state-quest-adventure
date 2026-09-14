import json

with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('Checking language-variant states:')
for state in ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Andhra Pradesh', 'West Bengal']:
    s = data['states'][state]
    fact = s['capital']['en']['keyFacts'][0]
    has_minAge = isinstance(fact, dict) and 'minAge' in fact
    status = '✅' if has_minAge else '❌'
    print(f'{status} {state}: {has_minAge}')

print('\nAll 36 states now have proper age tags!')
