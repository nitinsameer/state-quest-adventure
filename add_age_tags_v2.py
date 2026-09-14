#!/usr/bin/env python3
"""
Convert all states to AgeTaggedContent format - FIXED VERSION
"""

import json
from pathlib import Path

# Age estimation
KEYWORDS_AGE_8_9 = {
    'ancient', 'buddhist', 'stupa', 'heritage', 'political', 'independence',
    'split', 'lost', '2014', 'years ago', 'empire', 'civilization'
}

KEYWORDS_AGE_6_7 = {
    'building', 'architecture', 'culture', 'history', 'monument', 'population',
    'million', 'thousand', 'famous', 'important', 'design', 'language'
}

def estimate_age(text: str) -> int:
    """Estimate minimum age for a fact."""
    text_lower = text.lower()
    
    # Advanced facts
    if any(kw in text_lower for kw in KEYWORDS_AGE_8_9):
        return 8
    
    # Intermediate facts
    if any(kw in text_lower for kw in KEYWORDS_AGE_6_7):
        return 6
    
    # Basic facts
    return 3

def convert_fact(fact):
    """Convert a single fact to AgeTaggedContent."""
    if isinstance(fact, dict):
        # Already a dict
        if 'text' in fact and 'minAge' in fact and 'maxAge' in fact:
            return fact
        # Partial dict
        if 'text' in fact:
            return {
                'text': fact['text'],
                'minAge': fact.get('minAge', estimate_age(fact['text'])),
                'maxAge': 99
            }
        return fact
    elif isinstance(fact, str):
        # String - convert it
        return {
            'text': fact,
            'minAge': estimate_age(fact),
            'maxAge': 99
        }
    return fact

def process_file(input_path, output_path):
    """Process states.json and add age tags."""
    print(f"Reading {input_path}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    states = data['states']
    print(f"Found {len(states)} states")
    
    for state_name, state_data in states.items():
        print(f"Processing {state_name}...", end='', flush=True)
        
        # Process each card type
        for card_type in ['capital', 'language', 'food', 'places', 'animal', 'funFact']:
            if card_type not in state_data:
                continue
            
            card = state_data[card_type]
            
            # Always convert root-level facts first (Rajasthan has these)
            if 'keyFacts' in card and isinstance(card['keyFacts'], list):
                card['keyFacts'] = [convert_fact(f) for f in card['keyFacts']]
            if 'coolFacts' in card and isinstance(card['coolFacts'], list):
                card['coolFacts'] = [convert_fact(f) for f in card['coolFacts']]
            if 'didYouKnow' in card and not isinstance(card['didYouKnow'], dict):
                card['didYouKnow'] = convert_fact(card['didYouKnow'])
            if 'tryThis' in card and not isinstance(card['tryThis'], dict):
                card['tryThis'] = convert_fact(card['tryThis'])
            
            # Then check for language variants (Andhra Pradesh has 'en' and 'te' with full CardContent)
            # Language variants should have 'title' field
            for key in ['en', 'te', 'hi', 'ta', 'ka', 'ml', 'kn', 'mr', 'gu']:
                if key in card and isinstance(card[key], dict) and 'title' in card[key]:
                    lang_content = card[key]
                    # Convert facts in this language variant
                    if 'keyFacts' in lang_content and isinstance(lang_content['keyFacts'], list):
                        lang_content['keyFacts'] = [convert_fact(f) for f in lang_content['keyFacts']]
                    if 'coolFacts' in lang_content and isinstance(lang_content['coolFacts'], list):
                        lang_content['coolFacts'] = [convert_fact(f) for f in lang_content['coolFacts']]
                    if 'didYouKnow' in lang_content:
                        lang_content['didYouKnow'] = convert_fact(lang_content['didYouKnow'])
                    if 'tryThis' in lang_content:
                        lang_content['tryThis'] = convert_fact(lang_content['tryThis'])
        
        print(" ✅")
    
    print(f"\nWriting to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✅ Done!")
    
    # Verify
    print("\nVerifying...")
    with open(output_path, 'r', encoding='utf-8') as f:
        verified = json.load(f)
    
    sample_state = verified['states']['Rajasthan']
    sample_fact = sample_state['capital']['keyFacts'][0]
    
    if isinstance(sample_fact, dict) and 'minAge' in sample_fact:
        print(f"✅ Sample fact properly tagged:")
        print(f"   Text: {sample_fact['text'][:60]}...")
        print(f"   minAge: {sample_fact['minAge']}, maxAge: {sample_fact['maxAge']}")
    else:
        print(f"❌ Sample fact NOT tagged properly: {sample_fact}")

if __name__ == '__main__':
    # Restore backup first
    backup = 'src/lib/content/states.json.backup'
    current = 'src/lib/content/states.json'
    
    import shutil
    if Path(backup).exists():
        print(f"Restoring from backup...")
        shutil.copy(backup, current)
    
    # Process
    process_file(current, current)
