/**
 * Parent Gate - Secure PIN Management
 *
 * For Play Designed for Families compliance:
 * - PIN stored as salted PBKDF2 hash
 * - Lockout after 5 failed attempts (5 minute duration)
 * - No default PIN - parents must create one on first access
 * - Gate state in memory only, expires after 5 minutes
 * - Migration from plain text to hashed storage
 */

import { STORAGE_KEYS } from "@/constants/storageKeys";

const STORAGE_KEY_HASH = STORAGE_KEYS.parentPinHash;
const STORAGE_KEY_SALT = STORAGE_KEYS.parentPinSalt;
const STORAGE_KEY_LEGACY = STORAGE_KEYS.parentPinLegacy; // Old plain text key
const STORAGE_KEY_LOCKOUT = STORAGE_KEYS.parentLockout;
const STORAGE_KEY_ATTEMPTS = STORAGE_KEYS.parentAttempts;

const PBKDF2_ITERATIONS = 100000; // NIST recommendation
const PBKDF2_HASH_LENGTH = 32; // 256 bits
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const GATE_SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

let gateSessionExpiry: number | null = null;

/**
 * Generate a random salt (16 bytes = 128 bits)
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to ArrayBuffer
 */
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Hash a PIN using PBKDF2 with stored salt
 */
async function hashPIN(pin: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);

  const keyMaterial = await crypto.subtle.importKey("raw", pinBuffer, { name: "PBKDF2" }, false, [
    "deriveBits",
  ]);

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_HASH_LENGTH * 8,
  );

  return bufferToHex(derivedBits);
}

/**
 * Get the stored salt, or null if not yet created
 */
function getSalt(): Uint8Array | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const saltHex = localStorage.getItem(STORAGE_KEY_SALT);
    if (!saltHex) return null;
    const bytes = new Uint8Array(saltHex.length / 2);
    for (let i = 0; i < saltHex.length; i += 2) {
      bytes[i / 2] = parseInt(saltHex.substr(i, 2), 16);
    }
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Store salt after creation
 */
function storeSalt(salt: Uint8Array): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY_SALT, bufferToHex(salt));
  } catch {
    // Storage disabled or full
  }
}

/**
 * Get lockout state
 */
function getLockoutState(): { isLocked: boolean; remainingMs: number } {
  try {
    if (typeof localStorage === "undefined") {
      return { isLocked: false, remainingMs: 0 };
    }

    const lockoutTime = localStorage.getItem(STORAGE_KEY_LOCKOUT);
    if (!lockoutTime) {
      return { isLocked: false, remainingMs: 0 };
    }

    const lockoutMs = parseInt(lockoutTime, 10);
    const now = Date.now();
    const remainingMs = lockoutMs - now;

    if (remainingMs <= 0) {
      // Lockout expired
      localStorage.removeItem(STORAGE_KEY_LOCKOUT);
      localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
      return { isLocked: false, remainingMs: 0 };
    }

    return { isLocked: true, remainingMs };
  } catch {
    return { isLocked: false, remainingMs: 0 };
  }
}

/**
 * Increment failed attempt counter and apply lockout if needed
 */
function recordFailedAttempt(): void {
  try {
    if (typeof localStorage === "undefined") return;

    const attemptsStr = localStorage.getItem(STORAGE_KEY_ATTEMPTS) || "0";
    const attempts = Math.min(parseInt(attemptsStr, 10) + 1, MAX_FAILED_ATTEMPTS);

    localStorage.setItem(STORAGE_KEY_ATTEMPTS, attempts.toString());

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(STORAGE_KEY_LOCKOUT, lockoutUntil.toString());
    }
  } catch {
    // Storage disabled
  }
}

/**
 * Clear failed attempts (successful verification)
 */
function clearFailedAttempts(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
  } catch {
    // Storage disabled
  }
}

/**
 * Migrate old plain PIN to hashed storage (one-time)
 */
export async function migrateOldPIN(): Promise<boolean> {
  try {
    if (typeof localStorage === "undefined") return false;

    const oldPIN = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (!oldPIN) return false; // No old PIN to migrate

    const currentHash = localStorage.getItem(STORAGE_KEY_HASH);
    if (currentHash) return false; // Already migrated

    // Migrate: create salt, hash the old PIN, store both, delete old
    const salt = generateSalt();
    const hash = await hashPIN(oldPIN, salt);

    storeSalt(salt);
    localStorage.setItem(STORAGE_KEY_HASH, hash);
    localStorage.removeItem(STORAGE_KEY_LEGACY);

    return true;
  } catch (err) {
    console.error("[ParentGate] Migration failed:", err);
    return false;
  }
}

/**
 * Check if a PIN has been set (either plain or hashed)
 */
export function hasPin(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    const hasHash = !!localStorage.getItem(STORAGE_KEY_HASH);
    const hasLegacy = !!localStorage.getItem(STORAGE_KEY_LEGACY);
    return hasHash || hasLegacy;
  } catch {
    return false;
  }
}

/**
 * Set a new PIN (create or change)
 * Returns true if successful
 */
export async function setPin(pin: string): Promise<boolean> {
  if (!pin || pin.length < 4) {
    console.error("[ParentGate] PIN must be at least 4 characters");
    return false;
  }

  try {
    if (typeof localStorage === "undefined") return false;

    // Generate new salt and hash
    const salt = generateSalt();
    const hash = await hashPIN(pin, salt);

    storeSalt(salt);
    localStorage.setItem(STORAGE_KEY_HASH, hash);

    // Clean up legacy plain PIN if it exists
    localStorage.removeItem(STORAGE_KEY_LEGACY);
    clearFailedAttempts();

    return true;
  } catch (err) {
    console.error("[ParentGate] Failed to set PIN:", err);
    return false;
  }
}

/**
 * Verify a PIN attempt
 * Returns { success: boolean, lockout: boolean, remainingMinutes: number }
 */
export async function verifyPin(pin: string): Promise<{
  success: boolean;
  lockout: boolean;
  remainingMinutes: number;
}> {
  try {
    // Check if under lockout
    const { isLocked, remainingMs } = getLockoutState();
    if (isLocked) {
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return {
        success: false,
        lockout: true,
        remainingMinutes,
      };
    }

    if (typeof localStorage === "undefined") {
      return { success: false, lockout: false, remainingMinutes: 0 };
    }

    // First, handle migration if needed
    await migrateOldPIN();

    // Get stored hash and salt
    const storedHash = localStorage.getItem(STORAGE_KEY_HASH);
    if (!storedHash) {
      return { success: false, lockout: false, remainingMinutes: 0 };
    }

    const salt = getSalt();
    if (!salt) {
      return { success: false, lockout: false, remainingMinutes: 0 };
    }

    // Hash the provided PIN with the stored salt
    const providedHash = await hashPIN(pin, salt);

    // Constant-time comparison to prevent timing attacks
    const match = providedHash === storedHash && providedHash.length === storedHash.length;

    if (match) {
      clearFailedAttempts();
      setGateSession(); // Gate is now verified
      return { success: true, lockout: false, remainingMinutes: 0 };
    } else {
      recordFailedAttempt();
      const { isLocked: nowLocked, remainingMs: newRemainingMs } = getLockoutState();
      return {
        success: false,
        lockout: nowLocked,
        remainingMinutes: nowLocked ? Math.ceil(newRemainingMs / 60000) : 0,
      };
    }
  } catch (err) {
    console.error("[ParentGate] Verification failed:", err);
    return { success: false, lockout: false, remainingMinutes: 0 };
  }
}

/**
 * Set gate session (parent verified - in memory only)
 * Session expires after 5 minutes or when user leaves parent zone
 */
function setGateSession(): void {
  gateSessionExpiry = Date.now() + GATE_SESSION_DURATION_MS;
}

/**
 * Check if parent is currently gated in (verified and not expired)
 */
export function isGated(): boolean {
  if (gateSessionExpiry === null) return false;
  if (Date.now() > gateSessionExpiry) {
    gateSessionExpiry = null;
    return false;
  }
  return true;
}

/**
 * Clear gate session when leaving parent zone
 */
export function clearGateSession(): void {
  gateSessionExpiry = null;
}

/**
 * Get remaining gate session time in milliseconds
 */
export function getGateSessionRemaining(): number {
  if (gateSessionExpiry === null) return 0;
  const remaining = gateSessionExpiry - Date.now();
  return Math.max(0, remaining);
}

/**
 * Force expiry of gate session (for logout)
 */
export function expireGateSession(): void {
  gateSessionExpiry = null;
}
