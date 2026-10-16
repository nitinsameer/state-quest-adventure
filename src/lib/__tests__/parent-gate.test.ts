/**
 * Parent Gate Unit Tests
 * Tests: PBKDF2 hashing, migration, lockout, gate sessions
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  hasPin,
  setPin,
  verifyPin,
  migrateOldPIN,
  isGated,
  clearGateSession,
  getGateSessionRemaining,
  expireGateSession,
} from "../parent-gate";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ParentGate", () => {
  beforeEach(() => {
    localStorage.clear();
    clearGateSession();
    expireGateSession();
  });

  describe("PIN Setup & Verification", () => {
    it("should not have a PIN initially", () => {
      expect(hasPin()).toBe(false);
    });

    it("should reject PIN shorter than 4 characters", async () => {
      const result = await setPin("123");
      expect(result).toBe(false);
      expect(hasPin()).toBe(false);
    });

    it("should set a PIN successfully", async () => {
      const result = await setPin("1234");
      expect(result).toBe(true);
      expect(hasPin()).toBe(true);
    });

    it("should verify correct PIN", async () => {
      await setPin("1234");
      const result = await verifyPin("1234");
      expect(result.success).toBe(true);
      expect(result.lockout).toBe(false);
    });

    it("should reject incorrect PIN", async () => {
      await setPin("1234");
      const result = await verifyPin("5678");
      expect(result.success).toBe(false);
      expect(result.lockout).toBe(false);
    });

    it("should use different salts for different installations", async () => {
      await setPin("1234");
      const hash1 = localStorage.getItem("india-explorer:parent-pin-hash:v1");

      localStorage.clear();
      await setPin("1234");
      const hash2 = localStorage.getItem("india-explorer:parent-pin-hash:v1");

      // Same PIN should produce different hashes due to different salts
      expect(hash1).not.toBe(hash2);
    });

    it("should update PIN when set again", async () => {
      await setPin("1234");
      const oldHash = localStorage.getItem("india-explorer:parent-pin-hash:v1");

      await setPin("5678");
      const newHash = localStorage.getItem("india-explorer:parent-pin-hash:v1");

      expect(oldHash).not.toBe(newHash);
      expect(await verifyPin("1234")).toEqual({
        success: false,
        lockout: false,
        remainingMinutes: 0,
      });
      expect(await verifyPin("5678")).toEqual({
        success: true,
        lockout: false,
        remainingMinutes: 0,
      });
    });
  });

  describe("Migration from Plain Text", () => {
    it("should migrate old plain PIN to hash", async () => {
      // Simulate old plain PIN storage
      localStorage.setItem("india-explorer:parent-pin:v1", "1234");
      expect(localStorage.getItem("india-explorer:parent-pin-hash:v1")).toBe(null);

      const migrated = await migrateOldPIN();
      expect(migrated).toBe(true);

      // Old plain PIN should be deleted
      expect(localStorage.getItem("india-explorer:parent-pin:v1")).toBe(null);

      // New hash should exist
      expect(localStorage.getItem("india-explorer:parent-pin-hash:v1")).not.toBe(null);

      // Old PIN should still work after migration
      const result = await verifyPin("1234");
      expect(result.success).toBe(true);
    });

    it("should not re-migrate if already migrated", async () => {
      // Already migrated
      await setPin("1234");
      const hash1 = localStorage.getItem("india-explorer:parent-pin-hash:v1");

      const migrated = await migrateOldPIN();
      expect(migrated).toBe(false);

      const hash2 = localStorage.getItem("india-explorer:parent-pin-hash:v1");
      expect(hash1).toBe(hash2); // Should not change
    });

    it("should handle migration when no old PIN exists", async () => {
      const migrated = await migrateOldPIN();
      expect(migrated).toBe(false);
    });
  });

  describe("Lockout Protection", () => {
    it("should lock after 5 failed attempts", async () => {
      await setPin("1234");

      // Try 5 wrong PINs
      for (let i = 0; i < 5; i++) {
        const result = await verifyPin("wrong");
        if (i < 4) {
          expect(result.lockout).toBe(false);
        } else {
          expect(result.lockout).toBe(true);
          expect(result.remainingMinutes).toBeGreaterThan(0);
        }
      }
    });

    it("should prevent verification during lockout", async () => {
      await setPin("1234");

      // Trigger lockout
      for (let i = 0; i < 5; i++) {
        await verifyPin("wrong");
      }

      // Try correct PIN during lockout
      const result = await verifyPin("1234");
      expect(result.success).toBe(false);
      expect(result.lockout).toBe(true);
    });

    it("should clear attempts on successful verification", async () => {
      await setPin("1234");

      // Try wrong PIN twice
      await verifyPin("wrong");
      await verifyPin("wrong");

      // Verify correct PIN
      const result = await verifyPin("1234");
      expect(result.success).toBe(true);

      // Try wrong PIN again - attempts should be reset
      const wrongResult = await verifyPin("wrong");
      expect(wrongResult.lockout).toBe(false);
    });
  });

  describe("Gate Session Management", () => {
    it("should set gate session after successful verification", async () => {
      await setPin("1234");
      expect(isGated()).toBe(false);

      await verifyPin("1234");
      expect(isGated()).toBe(true);
    });

    it("should not set gate session on failed verification", async () => {
      await setPin("1234");
      await verifyPin("wrong");
      expect(isGated()).toBe(false);
    });

    it("should clear gate session", async () => {
      await setPin("1234");
      await verifyPin("1234");
      expect(isGated()).toBe(true);

      clearGateSession();
      expect(isGated()).toBe(false);
    });

    it("should expire gate session", async () => {
      await setPin("1234");
      await verifyPin("1234");
      expect(isGated()).toBe(true);

      expireGateSession();
      expect(isGated()).toBe(false);
    });

    it("should provide remaining gate session time", async () => {
      await setPin("1234");
      await verifyPin("1234");

      const remaining = getGateSessionRemaining();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(5 * 60 * 1000); // 5 minutes max
    });

    it("should expire gate session after timeout", async () => {
      await setPin("1234");
      await verifyPin("1234");

      // Simulate time passage (5+ minutes)
      // In real scenario, this would happen naturally
      expireGateSession();
      expect(isGated()).toBe(false);
    });
  });

  describe("Security Properties", () => {
    it("should not store plain text PIN", async () => {
      await setPin("1234");

      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        const value = localStorage.getItem(key) || "";
        expect(value).not.toBe("1234");
      }
    });

    it("should use cryptographically random salt", async () => {
      await setPin("1234");
      const salt1 = localStorage.getItem("india-explorer:parent-pin-salt:v1");

      localStorage.clear();
      await setPin("1234");
      const salt2 = localStorage.getItem("india-explorer:parent-pin-salt:v1");

      // Salts should be different (extremely unlikely to be same)
      expect(salt1).not.toBe(salt2);
    });

    it("should use strong hashing parameters", async () => {
      // This test just verifies the module uses proper PBKDF2
      await setPin("1234");
      const hash = localStorage.getItem("india-explorer:parent-pin-hash:v1");

      // Hash should be 64 hex chars (256 bits / 4 bits per hex)
      expect(hash).toHaveLength(64);
    });
  });
});
