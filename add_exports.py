#!/usr/bin/env python3
"""Add export keyword to functions in extracted modules"""

import re
import os

screens_dir = 'd:\\NishaanTech\\state-quest-adventure\\src\\screens'

# Define which functions should be exported in each module
exports_per_module = {
    'onboarding': [
        'SplashScreen',
        'WelcomeScreen',
        'CreateProfileScreen',
        'FloatingXPFeedback',
    ],
    'home': [
        'HomeDashboardScreen',
        'BottomNav',
        'HeaderBar',
        'StatCard',
        'StateDetailModal',
        'StatCardEnhanced',
        'MiniStateCard',
    ],
    'journey': [
        'JourneyMapScreen',
    ],
    'learning': [
        'StateIntroScreen',
        'IntroFact',
        'LearningHubScreen',
        'HubCard',
        'learningCardsFor',
        'getMainCardStartIndex',
        'LearningCardScreen',
    ],
    'quiz': [
        'QuizScreen',
        'CorrectAnswerScreen',
        'StateCompletedScreen',
        'StateUnlockScreen',
    ],
    'progression': [
        'StateCompletedScreen',
        'StateUnlockScreen',
    ],
    'passport': [
        'PassportScreen',
        'Stamp',
    ],
    'badges': [
        'BadgesScreen',
        'BadgeDetailModal',
        'StateBadgesView',
    ],
    'profile': [
        'ProfileScreen',
        'SoundToggleRow',
        'ProfileStat',
        'ParentZonePlaceholder',
        'RowLink',
    ],
    'achievements': [
        'AchievementsScreen',
    ],
}

for module_name, funcs_to_export in exports_per_module.items():
    file_path = os.path.join(screens_dir, f'{module_name}.tsx')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # For each function that needs to be exported, add export if not already there
    for func_name in funcs_to_export:
        # Pattern for function declaration
        # Match: function funcName(...) or const funcName = (...) =>
        patterns = [
            (f'function {func_name}(', f'export function {func_name}('),
            (f'const {func_name} = (', f'export const {func_name} = ('),
            (f'const {func_name} = async (', f'export const {func_name} = async ('),
            (f'const {func_name} = function(', f'export const {func_name} = function('),
        ]
        
        for pattern, replacement in patterns:
            if pattern in content and replacement not in content:
                content = content.replace(pattern, replacement)
                print(f"✓ Added export to {func_name} in {module_name}.tsx")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("\nAll exports added!")
