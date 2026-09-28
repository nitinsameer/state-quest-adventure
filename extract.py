import re
import sys

# Read the original file
with open(r'd:\NishaanTech\state-quest-adventure\src\components\screens-original.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all export function/const declarations and their line numbers
exports = re.findall(r'^export\s+(function|const)\s+(\w+)', content, re.MULTILINE)
print(f"Found {len(exports)} exports")

# Get the file for analysis
lines = content.split('\n')
print(f"Total lines: {len(lines)}")

# Print first 50 lines of imports for reference
print("\n=== IMPORTS ===")
for i, line in enumerate(lines[0:100]):
    if line.strip() and (line.startswith('import') or line.startswith('from')):
        print(f"  {line}")
    if line.strip().startswith('const TOTAL_STATES'):
        print(f"  {line}")
        break

