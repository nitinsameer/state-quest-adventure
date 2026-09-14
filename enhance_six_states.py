#!/usr/bin/env python3
"""
Enhance 6 bilingual-only states with full detailed translations.
This script integrates complete content for:
1. Maharashtra (already have root-level content)
2. Karnataka (already have root-level content)
3. Tamil Nadu (already have root-level content)
4. Gujarat (already have root-level content)
5. Andhra Pradesh (already have language variants - verify complete)
6. West Bengal (add new detailed content)

Strategy:
- For states with only language variants (5 states): Add root-level details
- For Andhra Pradesh: Verify it already has complete language variants
- Add age tags to ALL facts
"""

import json
from pathlib import Path

# Sample enhanced content for the 6 states
# This is EXAMPLE structure - in production, this would be read from markdown files

def create_maharashtra_details():
    """Create full Maharashtra content"""
    return {
        "capital": {
            "title": "🏙️ MUMBAI - The City of Dreams!",
            "emoji": "🏙️",
            "mainText": "Mumbai is India's BIGGEST and BUSIEST city! Where Bollywood movies are made, where dreams come true, and where the sea touches the sky!",
            "keyFacts": [
                {"text": "Capital of Maharashtra, home to 2 CRORE people (20 million!) - HUGE! 🏙️", "minAge": 3, "maxAge": 99},
                {"text": "Bollywood movie studios are here - this is where Indian movies are MADE! 🎬", "minAge": 3, "maxAge": 99},
                {"text": "Gateway of India - a GIANT monument on the seashore, built by British rulers 🏛️", "minAge": 6, "maxAge": 99},
                {"text": "Mumbai is built on an ISLAND - surrounded by water on three sides! 🌊", "minAge": 3, "maxAge": 99},
            ],
            "coolFacts": [
                {"text": "Gateway of India was built in 1911 as a grand entrance to British India! 🏛️", "minAge": 8, "maxAge": 99},
                {"text": "Mumbai was actually SEVEN ISLANDS before they were connected by filling water! 🏝️", "minAge": 6, "maxAge": 99},
            ],
            "didYouKnow": {"text": "Mumbai's nickname is 'The City of Dreams' because people come here from ALL over India to try their luck! 💫", "minAge": 3, "maxAge": 99},
            "tryThis": {"text": "Watch a Bollywood movie! Can you spot the Gateway of India? 🎥", "minAge": 3, "maxAge": 99},
            "narration": "Mumbai is the CITY OF DREAMS! 💫\n\nImagine a city where EVERYONE has a dream...",
            "en": {"title": "🏙️ MUMBAI - The City of Dreams!", "mainText": "Mumbai is India's BIGGEST and BUSIEST city!", "emoji": "🏙️"},
            "mr": {"title": "🏙️ मुंबई - स्वप्नांचे शहर!", "mainText": "मुंबई भारतातील सर्वात मोठे शहर!", "emoji": "🏙️"}
        }
    }

def enhance_states_json(input_path, output_path):
    """
    Enhance 6 bilingual-only states with detailed content.
    """
    print("Reading states.json...")
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    states = data['states']
    
    # List of states to enhance
    enhance_list = [
        'Maharashtra',
        'Karnataka', 
        'Tamil Nadu',
        'Gujarat',
        'West Bengal'
    ]
    
    # Check current state
    print("\n📊 CURRENT STATE OF 6 STATES:\n")
    for state_name in enhance_list + ['Andhra Pradesh']:
        if state_name not in states:
            print(f"❌ {state_name}: NOT FOUND")
            continue
        
        state = states[state_name]
        capital = state.get('capital', {})
        
        # Check structure
        has_root_facts = 'keyFacts' in capital
        has_language_variant = any(key in capital for key in ['en', 'te', 'hi', 'mr', 'ta', 'gu', 'bn'])
        
        status = "✅ Has both root + language variants"
        if has_root_facts and not has_language_variant:
            status = "⚠️ Root-level only (needs language variants)"
        elif has_language_variant and not has_root_facts:
            status = "⚠️ Language variants only (needs root details)"
        elif not has_root_facts and not has_language_variant:
            status = "❌ Missing both!"
        
        print(f"{state_name}: {status}")
    
    print("\n" + "="*70)
    print("✅ ENHANCEMENT STATUS")
    print("="*70)
    
    # For now, just verify structure
    print("\n📝 NEXT STEPS:")
    print("1. Verify all 6 states have proper structure")
    print("2. Add root-level details for states missing them")
    print("3. Add language variants for states missing them")
    print("4. Ensure ALL facts have minAge/maxAge tags")
    print("5. Run npm run build and test")
    
    return data

if __name__ == '__main__':
    input_file = 'src/lib/content/states.json'
    output_file = 'src/lib/content/states.json'
    
    data = enhance_states_json(input_file, output_file)
    
    print("\n✅ Analysis complete!")
    print("\n💡 ACTION ITEMS:")
    print("- Manually integrate content from SIX_STATES_*_COMPLETE.md files")
    print("- Verify JSON syntax after each state")
    print("- Test on device after final integration")
