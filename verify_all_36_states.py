#!/usr/bin/env python3
"""
Verify all 36 states and identify which ones need enhancement.
Create a detailed report of what's missing.
"""

import json
from collections import defaultdict

def analyze_states():
    """Analyze all 36 states and report their status"""
    
    with open('src/lib/content/states.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    states = data['states']
    print(f"Total states: {len(states)}\n")
    
    card_types = ['capital', 'language', 'food', 'animal', 'monument', 'funFact']
    
    # Categorize states
    fully_detailed = []  # Have all 6 cards with keyFacts
    partial_detailed = []  # Have some cards
    language_variants_only = []  # Only have en + native language
    
    stats = {
        'total_states': 0,
        'states_with_all_6_cards': 0,
        'states_with_root_details': 0,
        'states_language_only': 0,
        'total_cards': 0,
        'cards_with_facts': 0,
        'cards_missing_facts': 0,
    }
    
    print("=" * 80)
    print("DETAILED STATE ANALYSIS")
    print("=" * 80)
    print()
    
    state_details = {}
    
    for state_name in sorted(states.keys()):
        state = states[state_name]
        state_cards_status = {}
        has_any_root_facts = False
        has_all_6_cards = True
        
        for card_type in card_types:
            if card_type not in state:
                state_cards_status[card_type] = "❌ MISSING"
                has_all_6_cards = False
                stats['cards_missing_facts'] += 1
                continue
            
            card = state[card_type]
            
            # Check if it has root-level facts
            has_root_facts = 'keyFacts' in card and isinstance(card['keyFacts'], list) and len(card['keyFacts']) > 0
            
            if has_root_facts:
                # Check if facts have age tags
                first_fact = card['keyFacts'][0]
                if isinstance(first_fact, dict) and 'minAge' in first_fact:
                    state_cards_status[card_type] = "✅ COMPLETE"
                    has_any_root_facts = True
                    stats['cards_with_facts'] += 1
                else:
                    state_cards_status[card_type] = "⚠️ NO AGE TAGS"
                    has_any_root_facts = True
                    stats['cards_with_facts'] += 1
            else:
                # Check if it has language variants
                has_lang_variant = any(key in card for key in ['en', 'te', 'hi', 'mr', 'ta', 'gu', 'bn', 'ml', 'kn', 'pa', 'od', 'as', 'ur', 'ne', 'kok'])
                if has_lang_variant:
                    state_cards_status[card_type] = "🔶 LANG ONLY"
                else:
                    state_cards_status[card_type] = "❌ MISSING"
                stats['cards_missing_facts'] += 1
        
        state_details[state_name] = {
            'cards': state_cards_status,
            'has_all_6': has_all_6_cards,
            'has_root_details': has_any_root_facts
        }
        
        if has_all_6_cards and has_any_root_facts:
            fully_detailed.append(state_name)
            stats['states_with_all_6_cards'] += 1
        elif has_any_root_facts:
            partial_detailed.append(state_name)
            stats['states_with_root_details'] += 1
        else:
            language_variants_only.append(state_name)
            stats['states_language_only'] += 1
        
        stats['total_states'] += 1
        stats['total_cards'] += len(card_types)
    
    # Print detailed results
    print(f"\n🟢 FULLY DETAILED STATES ({len(fully_detailed)}):")
    print("-" * 80)
    for state in fully_detailed:
        print(f"  ✅ {state}")
    
    print(f"\n🟡 PARTIALLY DETAILED STATES ({len(partial_detailed)}):")
    print("-" * 80)
    for state in partial_detailed:
        details = state_details[state]['cards']
        cards_with_facts = sum(1 for v in details.values() if '✅' in v or '⚠️' in v)
        print(f"  ⚠️ {state} ({cards_with_facts}/6 with details)")
        for card_type, status in details.items():
            if '✅' not in status:
                print(f"      - {card_type}: {status}")
    
    print(f"\n🔴 LANGUAGE VARIANTS ONLY ({len(language_variants_only)}):")
    print("-" * 80)
    for state in language_variants_only:
        print(f"  🔶 {state}")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY STATISTICS")
    print("=" * 80)
    print(f"Total states: {stats['total_states']}")
    print(f"  - Fully detailed (all 6 cards with facts): {stats['states_with_all_6_cards']}")
    print(f"  - Partially detailed (some cards with facts): {stats['states_with_root_details']}")
    print(f"  - Language variants only (no root facts): {stats['states_language_only']}")
    print(f"\nTotal cards across all states: {stats['total_cards']}")
    print(f"  - Cards with detailed facts: {stats['cards_with_facts']}")
    print(f"  - Cards missing facts: {stats['cards_missing_facts']}")
    print(f"  - Completion percentage: {(stats['cards_with_facts'] / stats['total_cards'] * 100):.1f}%")
    
    print("\n" + "=" * 80)
    print("ACTION PLAN")
    print("=" * 80)
    print(f"\n✅ GOOD NEWS: {stats['states_with_all_6_cards']} states are COMPLETE!")
    print(f"⚠️ NEEDS WORK: {stats['states_with_root_details'] + stats['states_language_only']} states need enhancement")
    print(f"\nTo reach 100% completion:")
    print(f"  1. Add root-level details to {stats['states_language_only']} language-variant-only states")
    print(f"  2. Complete the {stats['cards_missing_facts']} missing cards")
    print(f"  3. Ensure ALL facts have minAge/maxAge tags")
    
    return state_details

if __name__ == '__main__':
    state_details = analyze_states()
