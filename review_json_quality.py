#!/usr/bin/env python3
"""
Comprehensive JSON review of states.json
Check for:
1. Missing state images/faces
2. Content quality issues
3. Structural problems
4. Missing data
5. Inconsistencies
"""

import json
from pathlib import Path

def review_json():
    """Review JSON structure and content quality"""
    
    with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    states = data['states']
    card_types = ['capital', 'language', 'food', 'animal', 'monument', 'funFact']
    
    print("=" * 120)
    print("JSON QUALITY REVIEW - COMPREHENSIVE CHECK")
    print("=" * 120)
    print()
    
    issues = {
        'missing_images': [],
        'missing_title': [],
        'missing_keyFacts': [],
        'empty_content': [],
        'missing_cards': [],
        'duplicate_content': [],
        'emoji_issues': [],
        'text_quality': [],
        'missing_bilingual': [],
        'structure_issues': []
    }
    
    # Check STATE_ART mapping in code
    state_art_path = Path('src/components/StateArt.tsx')
    if state_art_path.exists():
        with open(state_art_path, 'r') as f:
            state_art_content = f.read()
            # Extract imported images
            import re
            imports = re.findall(r'import\s+(\w+)\s+from\s+["\'].*?["\']', state_art_content)
            print(f"✅ Found {len(imports)} state image imports in StateArt.tsx")
            print()
    
    # Review each state
    for state_name in sorted(states.keys()):
        state = states[state_name]
        
        print(f"\n{'=' * 120}")
        print(f"📍 {state_name.upper()}")
        print(f"{'=' * 120}")
        
        state_issues = []
        
        # Check for kind field (state vs UT)
        kind = state.get('kind', 'unknown')
        print(f"Type: {kind}")
        
        # Review each card type
        for card_type in card_types:
            if card_type not in state:
                state_issues.append(f"❌ MISSING CARD: {card_type}")
                issues['missing_cards'].append(f"{state_name}.{card_type}")
                print(f"  ❌ {card_type.upper()}: MISSING")
                continue
            
            card = state[card_type]
            card_status = []
            
            # Check structure
            if not isinstance(card, dict):
                state_issues.append(f"❌ {card_type}: NOT A DICT")
                issues['structure_issues'].append(f"{state_name}.{card_type}")
                print(f"  ❌ {card_type.upper()}: NOT A DICT (is {type(card).__name__})")
                continue
            
            # Check title
            if 'title' not in card or not card['title'].strip():
                state_issues.append(f"❌ {card_type}: MISSING TITLE")
                issues['missing_title'].append(f"{state_name}.{card_type}")
                card_status.append("NO TITLE")
            else:
                card_status.append(f"Title: {card['title'][:50]}...")
            
            # Check emoji
            if 'emoji' not in card:
                state_issues.append(f"⚠️  {card_type}: NO EMOJI")
                issues['emoji_issues'].append(f"{state_name}.{card_type}")
                card_status.append("NO EMOJI")
            else:
                card_status.append(f"Emoji: {card['emoji']}")
            
            # Check keyFacts
            if 'keyFacts' not in card or not card['keyFacts']:
                state_issues.append(f"❌ {card_type}: MISSING FACTS")
                issues['missing_keyFacts'].append(f"{state_name}.{card_type}")
                card_status.append("NO FACTS")
            else:
                facts_count = len(card['keyFacts'])
                has_age_tags = all('minAge' in f and 'maxAge' in f for f in card['keyFacts'] if isinstance(f, dict))
                card_status.append(f"Facts: {facts_count} (age tags: {'✅' if has_age_tags else '❌'})")
            
            # Check mainText
            if 'mainText' not in card or not card['mainText'].strip():
                state_issues.append(f"⚠️  {card_type}: EMPTY mainText")
                issues['empty_content'].append(f"{state_name}.{card_type}.mainText")
                card_status.append("EMPTY mainText")
            else:
                card_status.append(f"MainText: {len(card['mainText'])} chars")
            
            # Check narration
            has_narration = 'narration' in card and card['narration'] and len(card['narration']) > 20
            card_status.append(f"Narration: {'✅' if has_narration else '❌'}")
            
            # Check bilingual support
            lang_keys = [k for k in card.keys() if k in ['en', 'hi', 'mr', 'ta', 'te', 'gu', 'bn', 'ml', 'kn', 'pa', 'od', 'as', 'ur', 'ne', 'kok']]
            if card_type != 'monument' and len(lang_keys) == 0:
                state_issues.append(f"⚠️  {card_type}: NO BILINGUAL (only root)")
                issues['missing_bilingual'].append(f"{state_name}.{card_type}")
                card_status.append("Bilingual: ❌ (root only)")
            elif card_type == 'monument' and len(lang_keys) == 0:
                state_issues.append(f"❌ {card_type}: NO BILINGUAL")
                issues['missing_bilingual'].append(f"{state_name}.{card_type}")
                card_status.append("Bilingual: ❌ (NO TRANSLATIONS)")
            elif len(lang_keys) > 0:
                card_status.append(f"Bilingual: ✅ ({', '.join(lang_keys)})")
            
            # Print card info
            print(f"\n  {card_type.upper()}:")
            for status in card_status:
                print(f"    • {status}")
        
        # Print state summary
        if state_issues:
            print(f"\n  ⚠️  STATE ISSUES:")
            for issue in state_issues:
                print(f"    {issue}")
        else:
            print(f"\n  ✅ NO MAJOR ISSUES")
    
    # Print overall summary
    print("\n" + "=" * 120)
    print("SUMMARY OF ISSUES")
    print("=" * 120)
    
    print(f"\n❌ CRITICAL ISSUES:")
    if issues['missing_cards']:
        print(f"  • Missing cards: {len(issues['missing_cards'])}")
        for item in issues['missing_cards'][:5]:
            print(f"    - {item}")
        if len(issues['missing_cards']) > 5:
            print(f"    ... and {len(issues['missing_cards']) - 5} more")
    
    if issues['missing_keyFacts']:
        print(f"  • Missing keyFacts: {len(issues['missing_keyFacts'])}")
        for item in issues['missing_keyFacts'][:5]:
            print(f"    - {item}")
        if len(issues['missing_keyFacts']) > 5:
            print(f"    ... and {len(issues['missing_keyFacts']) - 5} more")
    
    if issues['missing_title']:
        print(f"  • Missing titles: {len(issues['missing_title'])}")
    
    if issues['structure_issues']:
        print(f"  • Structure issues: {len(issues['structure_issues'])}")
    
    print(f"\n⚠️  WARNINGS:")
    if issues['emoji_issues']:
        print(f"  • Missing emojis: {len(issues['emoji_issues'])}")
    
    if issues['empty_content']:
        print(f"  • Empty content: {len(issues['empty_content'])}")
        for item in issues['empty_content'][:5]:
            print(f"    - {item}")
    
    if issues['missing_bilingual']:
        print(f"  • Missing bilingual: {len(issues['missing_bilingual'])}")
        print(f"    - Monument cards (no translations): {len([x for x in issues['missing_bilingual'] if 'monument' in x])}/36")
    
    # Card type analysis
    print(f"\n📊 CARD TYPE ANALYSIS:")
    for card_type in card_types:
        total = len(states)
        has_card = sum(1 for s in states.values() if card_type in s)
        has_facts = sum(1 for s in states.values() if card_type in s and s[card_type].get('keyFacts'))
        has_age_tags = sum(1 for s in states.values() 
                          if card_type in s and s[card_type].get('keyFacts')
                          and all('minAge' in f and 'maxAge' in f for f in s[card_type]['keyFacts'] if isinstance(f, dict)))
        
        print(f"\n  {card_type.upper()}:")
        print(f"    • Cards present: {has_card}/{total}")
        print(f"    • With facts: {has_facts}/{total}")
        print(f"    • With age tags: {has_age_tags}/{total}")
    
    return issues

if __name__ == '__main__':
    issues = review_json()
