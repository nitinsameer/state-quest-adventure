#!/usr/bin/env python3
"""
Re-extract modules with correct line ranges based on actual function definitions
"""

def extract_lines(file_path, start_line, end_line):
    """Extract lines from a file (1-indexed)"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    return ''.join(lines[start_line-1:end_line])

# Correct line ranges based on actual grep output
modules = {
    'shared': [(130, 255), 'AVATAR_IMAGE_MAP, getAvatarImage, getAvatarName, Cloud, XPBar, Chip, useGoBack'],
    'states': [(4717, 4777), 'LoadingScreen, EmptyStateScreen'],
    'onboarding': [(292, 571), 'SplashScreen, WelcomeScreen, CreateProfileScreen, FloatingXPFeedback'],
    'home': [(571, 1408), 'HomeDashboardScreen, BottomNav, HeaderBar, StatCard, StatCardEnhanced, MiniStateCard, StateDetailModal'],
    'journey': [(1408, 1895), 'JourneyMapScreen'],
    'learning': [(1895, 2916), 'StateIntroScreen, IntroFact, LearningHubScreen, HubCard, learningCardsFor, getMainCardStartIndex, LearningCardScreen'],
    'quiz': [(2916, 3223), 'QuizScreen, CorrectAnswerScreen'],
    'progression': [(3223, 3425), 'StateCompletedScreen, StateUnlockScreen'],
    'passport': [(3425, 3613), 'PassportScreen, Stamp'],
    'badges': [(3495, 3921), 'BadgeDetailModal, BadgesScreen (note: BadgeDetailModal at 3495, BadgesScreen at 3613)'],
    'profile': [(3921, 4632), 'ProfileScreen, SoundToggleRow, ProfileStat, ParentZonePlaceholder, RowLink'],
    'achievements': [(4632, 4717), 'AchievementsScreen'],
}

src_file = 'd:\\NishaanTech\\state-quest-adventure\\src\\components\\screens.tsx'
screens_dir = 'd:\\NishaanTech\\state-quest-adventure\\src\\screens'

for module_name, data in modules.items():
    start, end = data[0]
    content = extract_lines(src_file, start, end)
    output_file = f'{screens_dir}\\{module_name}_new.tsx'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ Created {module_name}_new.tsx (lines {start}-{end})")

print("\nAll modules re-extracted with correct ranges!")
