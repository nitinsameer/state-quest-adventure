#!/usr/bin/env python3
"""
Final comprehensive extraction using correct boundary detection for multi-line signatures
"""
import re

src_file = 'd:\\NishaanTech\\state-quest-adventure\\src\\components\\screens.tsx'
screens_dir = 'd:\\NishaanTech\\state-quest-adventure\\src\\screens'

with open(src_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    content = ''.join(lines)

# Read imports section (everything before the first function)
imports_match = re.search(r'^(import.*?\n)*const TOTAL_STATES = 36;', content, re.MULTILINE | re.DOTALL)
imports = imports_match.group(0) if imports_match else ""

# Module definitions with function names to include
modules_def = {
    'shared': [
        'getAvatarImage',
        'getAvatarName',
        'Cloud',
        'XPBar',
        'Chip',
        'useGoBack',
    ],
    'states': [
        'LoadingScreen',
        'EmptyStateScreen',
    ],
    'onboarding': [
        'SplashScreen',
        'WelcomeScreen',
        'CreateProfileScreen',
        'FloatingXPFeedback',
    ],
    'home': [
        'BottomNav',
        'HomeDashboardScreen',
        'StatCard',
        'StatCardEnhanced',
        'MiniStateCard',
        'StateDetailModal',
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
        'BadgeDetailModal',
        'BadgesScreen',
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

def find_function_complete(content, start_pos):
    """Extract a complete function from its definition to its end"""
    # Find the opening brace of the function body
    body_start = content.find('{', start_pos)
    if body_start == -1:
        return None
    
    # Now find the matching closing brace
    brace_count = 0
    i = body_start
    in_string = False
    string_char = None
    in_template = False
    
    while i < len(content):
        c = content[i]
        
        # Handle template literals
        if c == '`' and (i == 0 or content[i-1] != '\\'):
            in_template = not in_template
        # Handle regular strings
        elif c in ('"', "'") and (i == 0 or content[i-1] != '\\') and not in_template:
            if not in_string:
                in_string = True
                string_char = c
            elif c == string_char:
                in_string = False
        # Count braces outside of strings
        elif not in_string and not in_template:
            if c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
                if brace_count == 0:
                    return content[start_pos:i+1]
        
        i += 1
    
    return content[start_pos:]

# Extract imports plus AVATAR_IMAGE_MAP and constants for shared module
shared_imports = imports + '''

/**
 * Map avatar ID to imported image module
 * Used throughout app to display consistent avatar images
 */
export const AVATAR_IMAGE_MAP: Record<AvatarId, string> = {
  "explorer-hat": avatarExplorerHat,
  "explorer-pink": avatarExplorerPink,
  "geek-glasses": avatarGeekGlasses,
  "girl-peace": avatarGirlPeace,
  "turban-red": avatarTurbanRed,
  "girl-earring": avatarGirlEarring,
  "boy-smile": avatarBoySmi,
  "girl-tikka": avatarGirlTikka,
  "ski-goggles": avatarSkiGoggles,
  "farmer-hat": avatarFarmerHat,
  "sports-cap": avatarSportsCap,
  "girl-flower": avatarGirlFlower,
};

'''

# Extract each function and build modules
for module_name, func_names in modules_def.items():
    if module_name == 'shared':
        module_content = shared_imports
    else:
        module_content = imports + '\n\n'
    
    for func_name in func_names:
        # Find the function definition
        pattern = rf'(export\s+)?(async\s+)?(function|const)\s+{re.escape(func_name)}\s*(\(|=)'
        match = re.search(pattern, content)
        
        if not match:
            print(f"WARNING: Could not find {func_name}")
            continue
        
        start_pos = match.start()
        func_content = find_function_complete(content, start_pos)
        
        if func_content:
            module_content += func_content + '\n\n'
            print(f"+ {func_name} in {module_name}")
        else:
            print(f"ERROR: Could not extract {func_name}")
    
    # Write module file
    output_file = f'{screens_dir}\\{module_name}_final.tsx'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(module_content)
    print(f"  -> {module_name}_final.tsx\n")

print("Final extraction complete!")
