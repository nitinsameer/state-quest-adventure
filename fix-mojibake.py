#!/usr/bin/env python3
"""Fix mojibake in TypeScript files"""

import re
from pathlib import Path

def fix_file(filepath: Path):
    """Fix mojibake in a single file"""
    print(f"Processing: {filepath}")
    
    try:
        # Read as bytes to preserve exact encoding
        with open(filepath, 'rb') as f:
            content = f.read()
        
        original_size = len(content)
        original_content = content
        
        # Apply byte-level replacements - UTF-8 replacement character (EFBFBD) patterns
        # Skip → (E28692) - already in correct form, will fix with EMOJI constant later
        # Skip ← (E28690)
        # Skip ✓ (E29C93)
       
        # Fix corruption patterns
        content = content.replace(b'\xef\xbf\xbd\x20\xe2\x80\x9c', b' ->')  # temp placeholder for arrow
        content = content.replace(b'\xef\xbf\xbd\x20\xe2\x80\x98', b' ->')  # temp placeholder for arrow
        content = content.replace(b'\xef\xbf\xbdS\xe2\x80\x9c', b' CHECKMARK')  # temp placeholder
        content = content.replace(b'\xef\xbf\xbdx\xe2\x80\x98', b' TROPHY')  # trophy corruption
        content = content.replace(b'\xef\xbf\xbdx\xc2\xa4', b' SHARE')  # share icon
        content = content.replace(b'\xef\xbf\xbdx\xc2\xa5', b' FIRE')  # fire icon
        content = content.replace(b'\xef\xbf\xbdx\xc2\xbe', b' ANIMAL')  # animal badge
        content = content.replace(b'\xef\xbf\xbdx\xc2\x9b\xef\xb8\x8f', b' MONUMENT')  # monument badge
        content = content.replace(b'\xef\xbf\xbdx\xe2\x80\x93', b' LOCK')  # lock
        content = content.replace(b'\xef\xbf\xbdx\xc2\xba', b' PLAY')  # play
        content = content.replace(b'\xef\xbf\xbd\x20\xc2\xbb', b' REPLAY')  # replay
        content = content.replace(b'\xef\xbf\xbdS\xe2\x80\x93\xcb\x86\xef\xb8\x8f', b' ARROW')  # arrow variant
        content = content.replace(b'\xe2\x80\xa2\xc2\xb6\xef\xb8\x8f', b' PLAY')  # play variant
        content = content.replace(b'\xef\xbf\xbdx\xe2\x80\x93\xc2\x96', b'\xe2\x9c\x93')  # checkmark proper bytes
        content = content.replace(b'\xef\xbf\xbdS\xe2\x80\xa2', b'\xe2\x9c\x93')  # checkmark
        content = content.replace(b'\xef\xbf\xbd\xef\xbf\xbd\xe2\x80\xa0', b'\xe2\x98\x86')  # empty star
        
        # Now decode and apply text replacements
        text = content.decode('utf-8', errors='replace')
        
        # Replace temporary placeholders with EMOJI constants
        text = text.replace(' ->', ' {EMOJI.action.arrow}')
        text = text.replace(' CHECKMARK', ' {EMOJI.action.checkmark}')
        text = text.replace(' TROPHY', ' {EMOJI.utility.trophy}')
        text = text.replace(' SHARE', ' {EMOJI.action.share}')
        text = text.replace(' FIRE', ' {EMOJI.action.fire}')
        text = text.replace(' ANIMAL', ' {EMOJI.achievement.animal}')
        text = text.replace(' MONUMENT', ' {EMOJI.achievement.monument}')
        text = text.replace(' LOCK', ' {EMOJI.action.lock}')
        text = text.replace(' PLAY', ' {EMOJI.action.play}')
        text = text.replace(' REPLAY', ' {EMOJI.action.replay}')
        text = text.replace(' ARROW', ' {EMOJI.action.arrow}')
        
        # Write back
        with open(filepath, 'wb') as f:
            f.write(text.encode('utf-8'))
        
        new_size = len(text.encode('utf-8'))
        if original_content != text.encode('utf-8'):
            print(f"  ✓ Fixed (size: {original_size} → {new_size} bytes)")
        else:
            print(f"  - No changes needed")
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Fix all files"""
    root = Path('.')
    
    files_to_fix = [
        'src/components/ceremony/QuizCeremony.tsx',
        'src/components/JourneyDestinationCard.tsx',
        'src/components/PostcardPreviewModal.tsx',
        'src/components/PostcardScreen.tsx',
        'src/components/PassportSeedling.tsx',
        'src/components/screens.tsx',
        'src/components/state-performance-badge-modal.tsx',
        'src/components/state-performance-badges-view.tsx',
    ]
    
    for filepath in files_to_fix:
        full_path = root / filepath
        if full_path.exists():
            fix_file(full_path)
        else:
            print(f"Not found: {filepath}")

if __name__ == '__main__':
    main()
