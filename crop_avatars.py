#!/usr/bin/env python3
"""
Crop individual avatar images from the grid image
12 avatars in a 4x3 grid, each in a circular colored background
"""

from PIL import Image
import os

# Download or place the image first
# For now, we'll work with whatever path contains the avatars image

# Check for the image in different possible locations
possible_paths = [
    "avatars-grid.png",
    "avatars.png",
    "src/assets/avatars-grid.png",
    "./avatars-grid.png",
]

img_path = None
for path in possible_paths:
    if os.path.exists(path):
        img_path = path
        break

if not img_path:
    print("Avatar grid image not found!")
    print("Please save the avatar grid image as 'avatars-grid.png' in the project root")
    print("Searched locations:")
    for path in possible_paths:
        print(f"  - {path}")
    exit(1)

print(f"Found image: {img_path}")

# Load the image
img = Image.open(img_path)
width, height = img.size
print(f"Image size: {width}x{height}")

# Grid layout: 4 columns x 3 rows
cols, rows = 4, 3
cell_width = width // cols
cell_height = height // rows

print(f"Cell size: {cell_width}x{cell_height}")

# Avatar names in order (left to right, top to bottom)
avatar_names = [
    "avatar-explorer-hat",          # Yellow - explorer with hat
    "avatar-explorer-pink",         # Pink - explorer
    "avatar-geek-glasses",          # Blue - geek with glasses
    "avatar-girl-peace",            # Purple - girl with peace sign
    "avatar-turban-red",            # Green - turban
    "avatar-girl-earring",          # Orange - girl with earring
    "avatar-boy-smile",             # Purple - boy
    "avatar-girl-tikka",            # Cyan - girl with tikka
    "avatar-ski-goggles",           # Blue - ski goggles
    "avatar-farmer-hat",            # Green - farmer hat
    "avatar-sports-cap",            # Orange - sports cap
    "avatar-girl-flower",           # Pink - girl with flower
]

# Create output directory
output_dir = "src/assets/avatars"
os.makedirs(output_dir, exist_ok=True)

# Crop each avatar
for idx, (row, col) in enumerate([(r, c) for r in range(rows) for c in range(cols)]):
    # Calculate crop box
    left = col * cell_width
    top = row * cell_height
    right = left + cell_width
    bottom = top + cell_height
    
    # Crop the image
    cropped = img.crop((left, top, right, bottom))
    
    # Save with avatar name
    output_path = os.path.join(output_dir, f"{avatar_names[idx]}.png")
    cropped.save(output_path)
    print(f"✓ Saved: {output_path}")

print(f"\n✅ Done! Created {len(avatar_names)} avatar images in {output_dir}/")
