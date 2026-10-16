/**
 * Generate a stable, deterministic passport number based on avatar + name
 * Uses simple hash algorithm to create consistent ID per user
 * Format: IN-YYYY-XXXX (e.g., IN-2026-7429)
 */
export function generatePassportNumber(avatarId: string, profileName: string): string {
  // Create a simple hash from avatar ID + profile name
  const combined = `${avatarId}:${profileName}`;
  let hash = 0;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert hash to positive number and normalize to 0-9999 range
  const passportNum = Math.abs(hash) % 10000;

  // Format: IN-YYYY-XXXX where YYYY is year, XXXX is hash
  const year = new Date().getFullYear();
  return `IN-${year}-${String(passportNum).padStart(4, "0")}`;
}
