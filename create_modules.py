#!/usr/bin/env python3
"""
Extract screen components from screens-original.tsx and create modular files.
This script reads the original file, extracts function bodies, and creates 12 separate module files.
"""

import re
import os
from pathlib import Path

# Read the original file
original_file = r'd:\NishaanTech\state-quest-adventure\src\components\screens-original.tsx'
with open(original_file, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Extract all imports (first part of file)
imports_section = []
import_end_idx = 0
for i, line in enumerate(lines):
    if line.strip().startswith('const TOTAL_STATES'):
        import_end_idx = i + 2  # Include the const line
        break
    if line.strip().startswith('import') or line.strip().startswith('from') or line.strip().startswith('}'):
        imports_section.append(line)
    elif line.strip() == '':
        imports_section.append(line)

imports_text = '\n'.join(imports_section[:import_end_idx])

# Define module extraction ranges (1-indexed lines from PowerShell output, convert to 0-indexed)
modules = {
    'onboarding': {
        'start': 291,  # SplashScreen
        'end': 570,    # CreateProfileScreen + FloatingXPFeedback
        'exports': ['SplashScreen', 'WelcomeScreen', 'CreateProfileScreen', 'FloatingXPFeedback'],
    },
    'home': {
        'start': 570,
        'end': 1407,
        'exports': ['HomeDashboardScreen', 'StatCard', 'StatCardEnhanced', 'MiniStateCard', 'StateDetailModal'],
    },
    'journey': {
        'start': 1407,
        'end': 1894,
        'exports': ['JourneyMapScreen'],
    },
    'learning': {
        'start': 1894,
        'end': 2481,
        'exports': ['StateIntroScreen', 'IntroFact', 'LearningHubScreen', 'HubCard'],
    },
    'quiz': {
        'start': 2915,
        'end': 3168,
        'exports': ['QuizScreen', 'CorrectAnswerScreen'],
    },
    'progression': {
        'start': 3222,
        'end': 3424,
        'exports': ['StateCompletedScreen', 'StateUnlockScreen'],
    },
    'passport': {
        'start': 3424,
        'end': 3612,
        'exports': ['PassportScreen', 'Stamp'],
    },
    'badges': {
        'start': 3612,
        'end': 3920,
        'exports': ['BadgesScreen', 'BadgeDetailModal'],
    },
    'achievements': {
        'start': 4631,
        'end': 4716,
        'exports': ['AchievementsScreen'],
    },
    'profile': {
        'start': 3920,
        'end': 4631,
        'exports': ['ProfileScreen', 'SoundToggleRow', 'ProfileStat', 'ParentZonePlaceholder', 'RowLink'],
    },
}

# Create output directory
output_dir = Path(r'd:\NishaanTech\state-quest-adventure\src\screens')
output_dir.mkdir(parents=True, exist_ok=True)

# Extract each module
for module_name, config in modules.items():
    start_idx = config['start'] - 1  # Convert to 0-indexed
    end_idx = config['end']
    module_lines = lines[start_idx:end_idx]
    module_content = '\n'.join(module_lines)
    
    # Write module file
    output_file = output_dir / f'{module_name}.tsx'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(imports_text)
        f.write('\n\n')
        f.write(module_content)
    
    print(f'✓ Created {module_name}.tsx ({len(module_lines)} lines)')

print('\nAll modules created successfully!')
