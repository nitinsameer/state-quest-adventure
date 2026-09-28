#!/usr/bin/env python3
"""
Extract modular components from screens.tsx following the Phase 3 refactoring plan.
This script reads the original file and creates 12 separate module files.
"""

def extract_lines(file_path, start_line, end_line):
    """Extract lines from a file (1-indexed)"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    return ''.join(lines[start_line-1:end_line])

# Define all modules with their line ranges
modules = {
    'onboarding': (303, 567),  # SplashScreen, WelcomeScreen, CreateProfileScreen, FloatingXPFeedback
    'home': (568, 1049),  # HomeDashboardScreen and related components
    'journey': (1309, 1802),  # JourneyMapScreen
    'learning': (1803, 2947),  # StateIntroScreen, LearningHubScreen, etc.
    'quiz': (2948, 3260),  # QuizScreen, CorrectAnswerScreen
    'progression': (3261, 3526),  # StateCompletedScreen, StateUnlockScreen
    'passport': (3527, 3596),  # PassportScreen, Stamp
    'badges': (3597, 4028),  # BadgesScreen, BadgeDetailModal, StateBadgesView
    'profile': (4425, 5237),  # ProfileScreen and related components
    'achievements': (5239, 5323),  # AchievementsScreen
}

src_file = 'd:\\NishaanTech\\state-quest-adventure\\src\\components\\screens.tsx'
screens_dir = 'd:\\NishaanTech\\state-quest-adventure\\src\\screens'

for module_name, (start, end) in modules.items():
    content = extract_lines(src_file, start, end)
    output_file = f'{screens_dir}\\{module_name}.tsx'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ Created {module_name}.tsx (lines {start}-{end})")

print("\nAll modules extracted successfully!")
