/**
 * Avatar configuration for CreateProfileScreen
 * Maps avatar IDs to display information
 */

export type AvatarId = 
  | "explorer-hat"
  | "explorer-pink"
  | "geek-glasses"
  | "girl-peace"
  | "turban-red"
  | "girl-earring"
  | "boy-smile"
  | "girl-tikka"
  | "ski-goggles"
  | "farmer-hat"
  | "sports-cap"
  | "girl-flower";

export const AVATAR_CONFIG: Record<AvatarId, {
  name: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  "explorer-hat": {
    name: "Mia",
    emoji: "🧑‍🔬",
    color: "from-yellow-400 to-yellow-500",
    description: "Adventure seeker"
  },
  "explorer-pink": {
    name: "Alex",
    emoji: "🧑‍🔬",
    color: "from-pink-400 to-pink-500",
    description: "Pink explorer"
  },
  "geek-glasses": {
    name: "Rohan",
    emoji: "🤓",
    color: "from-blue-400 to-blue-500",
    description: "Smart explorer"
  },
  "girl-peace": {
    name: "Priya",
    emoji: "👧",
    color: "from-purple-400 to-purple-500",
    description: "Peace keeper"
  },
  "turban-red": {
    name: "Ishaan",
    emoji: "👦",
    color: "from-green-400 to-green-500",
    description: "Brave explorer"
  },
  "girl-earring": {
    name: "Zara",
    emoji: "👧",
    color: "from-orange-400 to-orange-500",
    description: "Bold explorer"
  },
  "boy-smile": {
    name: "Aditya",
    emoji: "👦",
    color: "from-purple-400 to-purple-500",
    description: "Happy adventurer"
  },
  "girl-tikka": {
    name: "Anaya",
    emoji: "👧",
    color: "from-cyan-400 to-cyan-500",
    description: "Joyful explorer"
  },
  "ski-goggles": {
    name: "Karan",
    emoji: "🎿",
    color: "from-blue-400 to-blue-500",
    description: "Cool explorer"
  },
  "farmer-hat": {
    name: "Vikram",
    emoji: "👨‍🌾",
    color: "from-green-400 to-green-500",
    description: "Nature lover"
  },
  "sports-cap": {
    name: "Nikhil",
    emoji: "👦",
    color: "from-orange-400 to-orange-500",
    description: "Active explorer"
  },
  "girl-flower": {
    name: "Diya",
    emoji: "👧",
    color: "from-pink-400 to-pink-500",
    description: "Bright explorer"
  },
};

/**
 * Get all available avatars as array
 */
export function getAvailableAvatars(): AvatarId[] {
  return Object.keys(AVATAR_CONFIG) as AvatarId[];
}

/**
 * Get avatar config by ID
 */
export function getAvatarConfig(id: AvatarId) {
  return AVATAR_CONFIG[id];
}

/**
 * Get avatar image by ID - returns the imported image module
 * This is used throughout the app to display avatar images consistently
 */
export function getAvatarImageModule(id: AvatarId): string {
  // Avatar images are imported in screens.tsx
  // This returns a placeholder - actual image must be passed from screens.tsx
  return AVATAR_CONFIG[id]?.name || "Explorer";
}
