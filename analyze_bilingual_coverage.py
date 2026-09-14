#!/usr/bin/env python3
"""
Analyze bilingual coverage across all card types for all 36 states.
Check which states have incomplete translations.
"""

import json
from collections import defaultdict

def analyze_bilingual_coverage():
    """Check bilingual completeness for each state and card type"""
    
    with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    states = data['states']
    card_types = ['capital', 'language', 'food', 'animal', 'monument', 'funFact']
    
    print("=" * 100)
    print("BILINGUAL COVERAGE ANALYSIS - ALL 36 STATES")
    print("=" * 100)
    print()
    
    # Track states by bilingual status
    fully_bilingual = []  # All card types have translations
    partially_bilingual = []  # Some card types missing translations
    english_only = []  # Only English, no translations
    
    state_issues = {}  # Track specific issues for each state
    
    for state_name in sorted(states.keys()):
        state = states[state_name]
        issues = []
        all_languages_found = set()
        
        # Check each card type
        for card_type in card_types:
            if card_type not in state:
                issues.append(f"  ❌ {card_type}: MISSING CARD")
                continue
            
            card = state[card_type]
            
            # Get available languages in this card
            languages_in_card = set()
            
            # Check root level (English facts)
            if 'keyFacts' in card and card['keyFacts']:
                languages_in_card.add('en')
            
            # Check for regional language translations
            # Common language codes used
            language_codes = ['te', 'hi', 'mr', 'ta', 'gu', 'bn', 'ml', 'kn', 'pa', 'od', 'as', 'ur', 'ne', 'kok', 'mai', 'sat', 'san', 'kok']
            
            for lang_code in language_codes:
                if lang_code in card and card[lang_code]:
                    languages_in_card.add(lang_code)
            
            all_languages_found.update(languages_in_card)
            
            # Check if only English
            if languages_in_card == {'en'} or (len(languages_in_card) == 1 and 'en' in languages_in_card):
                issues.append(f"  ⚠️  {card_type}: ENGLISH ONLY (no regional translation)")
            elif not languages_in_card:
                issues.append(f"  ❌ {card_type}: NO CONTENT")
            else:
                issues.append(f"  ✅ {card_type}: {', '.join(sorted(languages_in_card))}")
        
        # Categorize this state
        english_only_cards = sum(1 for card_type in card_types 
                                if card_type in state and 
                                state[card_type].get('keyFacts') and
                                not any(state[card_type].get(lang) for lang in ['te', 'hi', 'mr', 'ta', 'gu', 'bn', 'ml', 'kn', 'pa', 'od', 'as', 'ur', 'ne', 'kok']))
        
        if english_only_cards == 0:
            # Check if truly all bilingual
            has_regional = False
            for card_type in card_types:
                if card_type in state:
                    if any(state[card_type].get(lang) for lang in ['te', 'hi', 'mr', 'ta', 'gu', 'bn', 'ml', 'kn', 'pa', 'od', 'as', 'ur', 'ne', 'kok']):
                        has_regional = True
                        break
            
            if has_regional:
                fully_bilingual.append(state_name)
                status = "✅ FULLY BILINGUAL"
            else:
                english_only.append(state_name)
                status = "🔴 ENGLISH ONLY (ALL CARDS)"
        else:
            partially_bilingual.append(state_name)
            status = f"🟡 PARTIALLY BILINGUAL ({english_only_cards}/6 cards English-only)"
        
        state_issues[state_name] = {
            'status': status,
            'issues': issues,
            'languages': all_languages_found
        }
    
    # Print detailed report
    print(f"\n📊 SUMMARY")
    print("=" * 100)
    print(f"✅ Fully Bilingual States (all cards translated): {len(fully_bilingual)}/36")
    print(f"🟡 Partially Bilingual States (some cards English-only): {len(partially_bilingual)}/36")
    print(f"🔴 English-Only States (all cards no translation): {len(english_only)}/36")
    print()
    
    # Print fully bilingual states
    if fully_bilingual:
        print(f"\n✅ FULLY BILINGUAL STATES ({len(fully_bilingual)}):")
        print("-" * 100)
        for state in fully_bilingual:
            print(f"  ✅ {state}")
            for issue in state_issues[state]['issues']:
                print(f"     {issue}")
    
    # Print partially bilingual states
    if partially_bilingual:
        print(f"\n🟡 PARTIALLY BILINGUAL STATES ({len(partially_bilingual)}):")
        print("-" * 100)
        for state in partially_bilingual:
            print(f"  🟡 {state}")
            for issue in state_issues[state]['issues']:
                print(f"     {issue}")
    
    # Print english-only states
    if english_only:
        print(f"\n🔴 ENGLISH-ONLY STATES ({len(english_only)}) - NEEDS IMMEDIATE TRANSLATION:")
        print("-" * 100)
        for state in english_only:
            print(f"  🔴 {state}")
            for issue in state_issues[state]['issues']:
                print(f"     {issue}")
    
    # Detailed breakdown by card type
    print("\n" + "=" * 100)
    print("CARD TYPE ANALYSIS - How many states are missing bilingual for each card type?")
    print("=" * 100)
    
    card_type_issues = defaultdict(list)
    
    for state_name in sorted(states.keys()):
        state = states[state_name]
        
        for card_type in card_types:
            if card_type not in state:
                card_type_issues[card_type].append(f"{state_name} (MISSING CARD)")
                continue
            
            card = state[card_type]
            
            # Check if English only
            has_translation = any(card.get(lang) for lang in ['te', 'hi', 'mr', 'ta', 'gu', 'bn', 'ml', 'kn', 'pa', 'od', 'as', 'ur', 'ne', 'kok'])
            
            if not has_translation and 'keyFacts' in card and card['keyFacts']:
                card_type_issues[card_type].append(state_name)
    
    for card_type in card_types:
        if card_type_issues[card_type]:
            print(f"\n{card_type.upper()}: {len(card_type_issues[card_type])}/36 states MISSING TRANSLATION")
            print("-" * 100)
            for state in sorted(card_type_issues[card_type]):
                print(f"  ❌ {state}")
        else:
            print(f"\n{card_type.upper()}: ✅ ALL 36 STATES HAVE BILINGUAL CONTENT")
    
    # Summary statistics
    print("\n" + "=" * 100)
    print("IMPLEMENTATION RECOMMENDATION")
    print("=" * 100)
    
    total_english_only_cards = sum(len(v) for v in card_type_issues.values())
    
    print(f"\nTotal cards needing translation: {total_english_only_cards}")
    print(f"States needing complete translation: {len(english_only)}")
    print(f"States needing partial translation: {len(partially_bilingual)}")
    
    if english_only or len(card_type_issues[next(iter(card_type_issues))]) > 0:
        print("\n⚠️  ACTION REQUIRED:")
        print("  1. Translate all English-only card types")
        print("  2. Add regional language variants for each state")
        print("  3. Ensure consistency with existing translations")
    else:
        print("\n✅ ALL STATES ARE FULLY BILINGUAL - NO ACTION NEEDED")
    
    return {
        'fully_bilingual': fully_bilingual,
        'partially_bilingual': partially_bilingual,
        'english_only': english_only,
        'card_type_issues': dict(card_type_issues)
    }

if __name__ == '__main__':
    result = analyze_bilingual_coverage()
