#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

files = [
    'src/components/screens.tsx',
    'src/components/ceremony/QuizCeremony.tsx'
]

replacements = [
    # Arrows  
    ('\u00e2\u0086\u0092', '\u2192'),  # â†' → →
    ('\u00e2\u0086\u0090', '\u2190'),  # â† → ←
    # Checkmarks
    ('\u00e2\u009c\u201d', '\u2713'),  # âœ" → ✓
    ('\u00e2\u009c\u2026', '\u2705'),  # âœ… → ✅
    # Other emoji
    ('\u00e2\u009c\u02c6\u00ef\u00b8', '\u2708\ufe0f'),  # âœˆï¸ → ✈️
    ('\u00e2\u0161\u2122\u00ef\u00b8', '\u2699\ufe0f'),  # âš™ï¸ → ⚙️
    ('\u00e2\u009c\u00ef\u00b8', '\u270f\ufe0f'),  # âœï¸ → ✏️
]

total_fixes = 0

for filename in files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    file_fix_count = 0
    for search, replace in replacements:
        count = content.count(search)
        if count > 0:
            file_fix_count += count
            content = content.replace(search, replace)
    
    if file_fix_count > 0:
        with open(filename, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        print(f'✓ Fixed {file_fix_count} instances in {filename}')
        total_fixes += file_fix_count
    else:
        print(f'✓ No mojibake found in {filename}')

print(f'\n✅ Total fixes applied: {total_fixes}')
