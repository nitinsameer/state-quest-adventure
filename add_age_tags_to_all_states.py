#!/usr/bin/env python3
"""
Convert all states to AgeTaggedContent format with minAge/maxAge on all facts.
This script:
1. Reads the current states.json
2. Converts all facts (keyFacts, coolFacts, didYouKnow, tryThis) to AgeTaggedContent objects
3. Applies intelligent age tagging based on complexity
4. Outputs the updated states.json

Age tagging logic:
- Basic facts: minAge 3 (all kids)
- Intermediate facts: minAge 6 (older kids)
- Advanced facts: minAge 8 (oldest kids)
- Very advanced facts: minAge 9 (teens only)
"""

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Union

# Age tagging keywords
KEYWORDS_AGE_3 = {
    'basic', 'simple', 'easy', 'fun', 'play', 'friend', 'love', 'family',
    'city', 'people', 'animal', 'food', 'color', 'game', 'cool', 'awesome'
}

KEYWORDS_AGE_6 = {
    'building', 'architecture', 'culture', 'history', 'tradition', 'monument',
    'population', 'famous', 'important', 'special', 'unique', 'design',
    'pattern', 'symbol', 'language', 'million', 'thousand', 'written'
}

KEYWORDS_AGE_8 = {
    'ancient', 'buddhist', 'stupa', 'architectural', 'heritage', 'political',
    'independence', 'government', 'economy', 'literary', 'scientific',
    'technical', 'complex', 'advanced', 'civilization', 'empire',
    'influenced', 'played', 'role', 'split', 'lost', 'strategic'
}

KEYWORDS_AGE_9 = {
    '2014', '2000', 'years ago', 'bc', 'ad', 'historical period',
    'influenced', 'significantly', 'complex'
}

def estimate_age_for_fact(text: str) -> int:
    """
    Estimate appropriate minimum age for a fact based on content complexity.
    
    Returns: minAge value (3, 6, 8, or 9)
    """
    text_lower = text.lower()
    
    # Check for very advanced content (age 9+)
    if any(keyword in text_lower for keyword in KEYWORDS_AGE_9):
        if re.search(r'\d{3,4}\s*(years?\s+ago|bc|ad|CE|BCE)', text_lower):
            return 9
    
    # Check for advanced content (age 8+)
    advanced_count = sum(1 for keyword in KEYWORDS_AGE_8 if keyword in text_lower)
    if advanced_count >= 2 or any(keyword in text_lower for keyword in ['split off', 'lost after', 'empire', 'ancient', 'buddhist']):
        return 8
    
    # Check for intermediate content (age 6+)
    intermediate_count = sum(1 for keyword in KEYWORDS_AGE_6 if keyword in text_lower)
    if intermediate_count >= 2 or 'million' in text_lower or 'thousand' in text_lower:
        return 6
    
    # Default to age 3
    return 3

def convert_to_age_tagged(fact: Union[str, Dict]) -> Union[str, Dict]:
    """
    Convert a fact string to AgeTaggedContent object if it's a string.
    If already a dict with text/minAge/maxAge, return as-is.
    """
    if isinstance(fact, dict):
        # Already age-tagged
        if 'text' in fact and 'minAge' in fact and 'maxAge' in fact:
            return fact
        # Partial dict, convert it
        if 'text' in fact:
            min_age = fact.get('minAge', estimate_age_for_fact(fact['text']))
            return {
                'text': fact['text'],
                'minAge': min_age,
                'maxAge': 99
            }
        # Unknown dict format
        return fact
    
    if isinstance(fact, str):
        # String fact - convert to AgeTaggedContent
        min_age = estimate_age_for_fact(fact)
        return {
            'text': fact,
            'minAge': min_age,
            'maxAge': 99
        }
    
    return fact

def convert_card_content(card: Union[Dict, Any]) -> Union[Dict, Any]:
    """
    Convert a card (capital, language, food, etc.) to use AgeTaggedContent format.
    Handles both simple cards and language-variant cards.
    """
    if not isinstance(card, dict):
        return card
    
    # Check if it's a language-variant card (has 'en', 'te', 'hi' keys with CardContent structure)
    # Language variant cards have keys that are language codes AND contain 'title' field
    is_language_variant = False
    for key in card.keys():
        if isinstance(card[key], dict) and 'title' in card[key]:
            is_language_variant = True
            break
    
    if is_language_variant:
        # It's a language variant card (like Andhra Pradesh with 'en' and 'te')
        for lang_code, content in card.items():
            if isinstance(content, dict) and 'title' in content:
                card[lang_code] = convert_single_card_content(content)
        return card
    else:
        # It's a simple card (like Rajasthan - flat structure)
        return convert_single_card_content(card)

def convert_single_card_content(content: Dict) -> Dict:
    """
    Convert a single card content object to use AgeTaggedContent format.
    """
    if not isinstance(content, dict):
        return content
    
    result = dict(content)
    
    # Convert keyFacts
    if 'keyFacts' in result and isinstance(result['keyFacts'], list):
        result['keyFacts'] = [convert_to_age_tagged(fact) for fact in result['keyFacts']]
    
    # Convert coolFacts
    if 'coolFacts' in result and isinstance(result['coolFacts'], list):
        result['coolFacts'] = [convert_to_age_tagged(fact) for fact in result['coolFacts']]
    
    # Convert didYouKnow
    if 'didYouKnow' in result:
        result['didYouKnow'] = convert_to_age_tagged(result['didYouKnow'])
    
    # Convert tryThis
    if 'tryThis' in result:
        result['tryThis'] = convert_to_age_tagged(result['tryThis'])
    
    return result

def process_states_json(input_path: str, output_path: str) -> None:
    """
    Main function to process states.json and add age tags.
    """
    print(f"📖 Reading {input_path}...")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total_states = len(data.get('states', {}))
    print(f"📍 Found {total_states} states to process")
    
    # Process each state
    for state_name, state_data in data['states'].items():
        print(f"🔄 Processing {state_name}...", end='')
        
        # Process each card type
        card_types = ['capital', 'language', 'food', 'places', 'animal', 'funFact']
        
        for card_type in card_types:
            if card_type in state_data:
                state_data[card_type] = convert_card_content(state_data[card_type])
        
        print(" ✅")
    
    print(f"\n💾 Writing to {output_path}...")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✅ Done! All states converted to AgeTaggedContent format")
    print(f"\n📊 Summary:")
    print(f"   - States processed: {total_states}")
    print(f"   - Format: AgeTaggedContent with minAge/maxAge")
    print(f"   - Output: {output_path}")

def validate_output(output_path: str) -> None:
    """
    Validate that the output JSON is valid and properly formatted.
    """
    print(f"\n🔍 Validating output...")
    
    try:
        with open(output_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("✅ Valid JSON")
        
        # Check structure
        states = data.get('states', {})
        print(f"✅ Found {len(states)} states")
        
        # Sample check - look at first state
        first_state_name = next(iter(states))
        first_state = states[first_state_name]
        
        print(f"✅ Sample state: {first_state_name}")
        
        # Check a fact
        if 'capital' in first_state:
            capital = first_state['capital']
            # Handle language variants
            if isinstance(capital, dict) and 'en' in capital:
                capital_en = capital['en']
            else:
                capital_en = capital
            
            if isinstance(capital_en, dict) and 'keyFacts' in capital_en:
                facts = capital_en['keyFacts']
                if facts and len(facts) > 0:
                    first_fact = facts[0]
                    if isinstance(first_fact, dict) and 'minAge' in first_fact:
                        print(f"   ✅ Sample fact has minAge/maxAge tags")
                        print(f"      Text: {first_fact.get('text', '')[:50]}...")
                        print(f"      minAge: {first_fact.get('minAge')}, maxAge: {first_fact.get('maxAge')}")
                    else:
                        print(f"   ⚠️  Sample fact NOT properly tagged: {first_fact}")
        
        print("\n✅ Validation complete!")
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
    except Exception as e:
        print(f"❌ Validation error: {e}")

if __name__ == '__main__':
    input_file = 'src/lib/content/states.json'
    output_file = 'src/lib/content/states.json'
    
    # Backup original
    backup_file = 'src/lib/content/states.json.backup'
    import shutil
    if Path(input_file).exists():
        shutil.copy(input_file, backup_file)
        print(f"💾 Backup created: {backup_file}")
    
    # Process
    process_states_json(input_file, output_file)
    
    # Validate
    validate_output(output_file)
