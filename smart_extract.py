#!/usr/bin/env python3
"""
Smart extraction that finds complete function bodies by matching braces
"""
import re

src_file = 'd:\\NishaanTech\\state-quest-adventure\\src\\components\\screens.tsx'
screens_dir = 'd:\\NishaanTech\\state-quest-adventure\\src\\screens'

with open(src_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    content = ''.join(lines)

# Find all function definitions and their line numbers
function_pattern = r'(export\s+)?(function|const)\s+(\w+)\s*(\(|=)'
matches = list(re.finditer(function_pattern, content))

print(f"Found {len(matches)} function/const definitions\n")

# Group functions by module based on their context
# We need to manually group them since we know the structure

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

def find_function_end(content, start_pos):
    """Find the end of a function starting at start_pos (at the opening brace)"""
    brace_count = 0
    i = start_pos
    in_string = False
    string_char = None
    in_template = False
    
    while i < len(content):
        c = content[i]
        
        # Handle strings
        if c in ('"', "'") and (i == 0 or content[i-1] != '\\'):
            if not in_template:
                in_string = not in_string
                string_char = c if in_string else None
        elif c == '`':
            in_template = not in_template
        elif not in_string and not in_template:
            if c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
                if brace_count == 0:
                    return i + 1
        
        i += 1
    
    return len(content)

# Extract imports from the beginning of the file
imports_end = content.find('\n/* ---------- shared bits ---------- */')
if imports_end == -1:
    imports_end = content.find('const AVATAR_IMAGE_MAP')

imports = content[:imports_end].strip()

# Find each function and extract it with its body
for module_name, func_names in modules_def.items():
    module_content = imports + '\n\n'
    
    for func_name in func_names:
        # Find the function definition
        pattern = rf'(export\s+)?(async\s+)?(function|const)\s+{re.escape(func_name)}\s*(\(|=)'
        match = re.search(pattern, content)
        
        if not match:
            print(f"WARNING: Could not find {func_name} in {module_name}")
            continue
        
        start_pos = match.start()
        # Find opening brace
        brace_pos = content.find('{', match.end())
        if brace_pos == -1:
            print(f"ERROR: No opening brace for {func_name}")
            continue
        
        # Find matching closing brace
        end_pos = find_function_end(content, brace_pos)
        
        # Extract the function
        func_content = content[start_pos:end_pos]
        module_content += func_content + '\n\n'
        
        print(f"+ Extracted {func_name} to {module_name}")
    
    # Write module file
    output_file = f'{screens_dir}\\{module_name}_extract.tsx'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(module_content)
    print(f"  -> Wrote {module_name}_extract.tsx\n")

print("Smart extraction complete!")
