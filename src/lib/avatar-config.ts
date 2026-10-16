/**
 * Avatar configuration for CreateProfileScreen
 * Maps avatar IDs to display information
 */

// Import all avatar images
import avatarExplorerHat from "@/assets/avatars/avatar-explorer-hat.png";
import avatarExplorerPink from "@/assets/avatars/avatar-explorer-pink.png";
import avatarGeekGlasses from "@/assets/avatars/avatar-geek-glasses.png";
import avatarGirlPeace from "@/assets/avatars/avatar-girl-peace.png";
import avatarTurbanRed from "@/assets/avatars/avatar-turban-red.png";
import avatarGirlEarring from "@/assets/avatars/avatar-girl-earring.png";
import avatarBoySmi from "@/assets/avatars/avatar-boy-smile.png";
import avatarGirlTikka from "@/assets/avatars/avatar-girl-tikka.png";
import avatarSkiGoggles from "@/assets/avatars/avatar-ski-goggles.png";
import avatarFarmerHat from "@/assets/avatars/avatar-farmer-hat.png";
import avatarSportsCap from "@/assets/avatars/avatar-sports-cap.png";
import avatarGirlFlower from "@/assets/avatars/avatar-girl-flower.png";

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

export const AVATAR_CONFIG: Record<
  AvatarId,
  {
    name: string;
    emoji: string;
    color: string;
    description: string;
  }
> = {
  "explorer-hat": {
    name: "Mia",
    emoji: "🧑‍🔬",
    color: "bg-accent-4",
    description: "Adventure seeker",
  },
  "explorer-pink": {
    name: "Alex",
    emoji: "🧑‍🔬",
    color: "bg-accent-1-soft",
    description: "Pink explorer",
  },
  "geek-glasses": {
    name: "Rohan",
    emoji: "🤓",
    color: "bg-accent-2",
    description: "Smart explorer",
  },
  "girl-peace": {
    name: "Priya",
    emoji: "👧",
    color: "bg-accent-5",
    description: "Peace keeper",
  },
  "turban-red": {
    name: "Ishaan",
    emoji: "👦",
    color: "bg-success",
    description: "Brave explorer",
  },
  "girl-earring": {
    name: "Zara",
    emoji: "👧",
    color: "bg-warning",
    description: "Bold explorer",
  },
  "boy-smile": {
    name: "Aditya",
    emoji: "👦",
    color: "bg-accent-5",
    description: "Happy adventurer",
  },
  "girl-tikka": {
    name: "Anaya",
    emoji: "👧",
    color: "bg-accent-2",
    description: "Joyful explorer",
  },
  "ski-goggles": {
    name: "Karan",
    emoji: "🎿",
    color: "bg-accent-2",
    description: "Cool explorer",
  },
  "farmer-hat": {
    name: "Vikram",
    emoji: "👨‍🌾",
    color: "bg-success",
    description: "Nature lover",
  },
  "sports-cap": {
    name: "Nikhil",
    emoji: "👦",
    color: "bg-warning",
    description: "Active explorer",
  },
  "girl-flower": {
    name: "Diya",
    emoji: "👧",
    color: "bg-accent-1-soft",
    description: "Bright explorer",
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

/**
 * Avatar image map for quick lookup
 */
const AVATAR_IMAGE_MAP: Record<AvatarId, string> = {
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

/**
 * Get avatar image by ID
 * Returns the imported image module or default
 */
export function getAvatarImage(avatarId: string): string {
  if (!avatarId) return avatarExplorerHat;
  return AVATAR_IMAGE_MAP[avatarId as AvatarId] || avatarExplorerHat;
}

/**
 * Get avatar name for a given avatar ID
 * Returns the character name from config
 */
export function getAvatarName(avatarId: string): string {
  if (!avatarId) return "Explorer";
  return AVATAR_CONFIG[avatarId as AvatarId]?.name || "Explorer";
}
