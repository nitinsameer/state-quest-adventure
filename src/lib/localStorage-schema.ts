/**
 * CRITICAL FIX #1.5: localStorage Type Safety with Zod Validation
 * 
 * Validates all localStorage data before use to prevent type corruption, data loss,
 * and security vulnerabilities. Each schema enforces strict validation of:
 * - Data types (strings, numbers, objects)
 * - Value ranges and formats
 * - Required vs optional fields
 * - Nested object structures
 * 
 * This prevents runtime crashes from corrupted localStorage data.
 */

import { z } from 'zod';
import { debugError } from './debug';

/**
 * SOUND TOGGLE - Simple boolean stored as "1" or "0"
 * Key: "india-explorer:sound:v1"
 */
export const SoundToggleSchema = z.enum(['0', '1']).catch('1');

export function validateSoundToggle(raw: string | null): string {
  if (raw === null) return '1'; // Default: sound ON
  try {
    return SoundToggleSchema.parse(raw);
  } catch (err) {
    debugError('localStorage-schema', 'Invalid sound toggle value, using default', { raw });
    return '1'; // Fallback to default
  }
}

/**
 * PARENTAL CONSENT - Array of consent records with feature, grant status, timestamp, version
 * Key: "india-explorer:parental-consent:v1"
 */
const ConsentRecordSchema = z.object({
  feature: z.enum(['audio', 'file', 'analytics']),
  granted: z.boolean(),
  timestamp: z.number().int().positive(),
  version: z.number().int(),
});

export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

export const ConsentStorageSchema = z.array(ConsentRecordSchema);

export function validateConsentStorage(raw: string | null): ConsentRecord[] {
  if (raw === null) return [];
  
  try {
    const parsed = JSON.parse(raw);
    return ConsentStorageSchema.parse(parsed);
  } catch (err) {
    debugError('localStorage-schema', 'Invalid consent storage, using empty array', { raw, error: err });
    return [];
  }
}

/**
 * PROGRESS - Main app state including XP, badges, stamps, postcards, etc.
 * Key: "india-explorer:progress:v2"
 * 
 * This is the largest and most critical schema - it contains all user progress data.
 */

const PostcardDataSchema = z.object({
  generatedAt: z.string().datetime(), // ISO timestamp
  state: z.string().min(1),
  badge: z.enum(['monument', 'animal', 'explorer']),
  stampDate: z.string(),
});

const StatePerformanceSchema = z.object({
  state: z.string().min(1),
  cardIndex: z.number().int().nonnegative(),
  category: z.string(),
  timeTaken: z.number().nonnegative(),
  isReplay: z.boolean(),
  timestamp: z.number().int().positive(),
}).optional();

export const ProgressSchema = z.object({
  name: z.string().min(1).max(50),
  avatar: z.string().emoji().optional(),
  ageBand: z.string().regex(/^\d+-\d+$/), // Format: "8-9", "10-12", etc.
  onboarded: z.boolean(),
  xp: z.number().int().nonnegative().max(999999), // Max XP cap to prevent overflow
  streak: z.number().int().nonnegative().max(9999),
  lastActive: z.string().regex(/^\d{4}-\d{2}-\d{2}$|^$/), // ISO date or empty
  completed: z.array(z.string().min(1)).max(36), // Max 36 states in India
  stamps: z.record(z.string(), z.string()), // state name -> stamp date
  postcards: z.record(z.string(), PostcardDataSchema), // state name -> postcard
  answered: z.array(z.string().min(1)), // Quiz question IDs
  badges: z.record(z.string(), z.array(z.enum(['monument', 'animal', 'explorer']))), // state -> badges
  cards: z.record(z.string(), z.array(z.number().int().nonnegative())), // state -> card indexes
  replayCount: z.record(z.string(), z.record(z.string(), z.number().int().nonnegative())).optional(),
  cardVisits: z.record(z.string(), z.record(z.string(), z.array(z.number().int().nonnegative()))).optional(),
  lastPlayedState: z.string().min(1).optional(),
  statePerformance: z.record(z.string(), StatePerformanceSchema).optional(),
});

export type Progress = z.infer<typeof ProgressSchema>;

export function validateProgress(raw: string | null): Progress | null {
  if (raw === null) return null;
  
  try {
    const parsed = JSON.parse(raw);
    return ProgressSchema.parse(parsed);
  } catch (err) {
    debugError('localStorage-schema', 'Invalid progress data, clearing corrupted state', { error: err });
    return null; // Corrupted - will force reset to defaults
  }
}

/**
 * RECENTLY COMPLETED STATE - Tracks the most recent state completion
 * Key: "india-explorer:recently-completed:v1"
 */
export const RecentlyCompletedSchema = z.object({
  stateName: z.string().min(1),
  timestamp: z.number().int().positive(),
});

export type RecentlyCompleted = z.infer<typeof RecentlyCompletedSchema>;

export function validateRecentlyCompleted(raw: string | null): RecentlyCompleted | null {
  if (raw === null) return null;
  
  try {
    const parsed = JSON.parse(raw);
    return RecentlyCompletedSchema.parse(parsed);
  } catch (err) {
    debugError('localStorage-schema', 'Invalid recently-completed data', { error: err });
    return null;
  }
}

/**
 * APP VERSION - Track app version for migration/cache clearing
 * Key: "india-explorer:app-version"
 */
export const AppVersionSchema = z.string().regex(/^\d+\.\d+$/); // Format: "3.0"

export function validateAppVersion(raw: string | null): string | null {
  if (raw === null) return null;
  
  try {
    return AppVersionSchema.parse(raw);
  } catch (err) {
    debugError('localStorage-schema', 'Invalid app version', { raw });
    return null;
  }
}

/**
 * POSTCARD LIBRARY - Collection of generated postcards
 * Key: "postcard-library-v1"
 * 
 * Postcards are stored with full metadata including base64 image data for in-app persistence.
 * The imageData field is optional for backward compatibility with postcards saved before the
 * permission removal. However, new postcards always include imageData as base64 PNG.
 */
const ConsentHistorySchema = z.object({
  state: z.enum(['pending', 'accepted', 'declined']),
  changedAt: z.string().datetime(),
  reason: z.string().optional(),
});

export const PostcardLibrarySchema = z.array(
  z.object({
    id: z.string().min(1),
    state: z.string().min(1),
    badge: z.enum(['monument', 'animal', 'explorer']),
    stampDate: z.string(),
    generatedAt: z.string().datetime(),
    consentState: z.enum(['pending', 'accepted', 'declined']).default('pending'),
    consentChangedAt: z.string().datetime().optional(),
    consentHistory: z.array(ConsentHistorySchema).default([]),
    isExportedToDevice: z.boolean().default(false),
    exportedAt: z.string().datetime().optional(),
    exportedFilename: z.string().optional(),
    exportCount: z.number().int().nonnegative().default(0),
    location: z.object({
      stateName: z.string(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    }).optional(),
    displayOrder: z.number().int().nonnegative().default(0),
    tags: z.array(z.string()).default([]),
    imageData: z.string().optional(), // Base64 PNG, nullable for backward compat
    imageUrl: z.string().url().optional(), // Deprecated, kept for backward compat
  })
);

export type PostcardLibraryItem = z.infer<typeof PostcardLibrarySchema>[number];

export function validatePostcardLibrary(raw: string | null): PostcardLibraryItem[] {
  if (raw === null) return [];
  
  try {
    const parsed = JSON.parse(raw);
    return PostcardLibrarySchema.parse(parsed);
  } catch (err) {
    debugError('localStorage-schema', 'Invalid postcard library, using empty array', { error: err });
    return [];
  }
}

/**
 * GENERIC STORAGE VALIDATOR
 * Used for data we may not have a specific schema for yet
 */
export function validateStorageData<T>(raw: string | null, schema: z.ZodSchema<T>): T | null {
  if (raw === null) return null;
  
  try {
    const parsed = JSON.parse(raw);
    return schema.parse(parsed);
  } catch (err) {
    debugError('localStorage-schema', 'Storage validation failed', { error: err });
    return null;
  }
}

/**
 * Storage error enum for better error handling
 */
export enum StorageError {
  CORRUPTED_DATA = 'corrupted_data',
  INVALID_TYPE = 'invalid_type',
  QUOTA_EXCEEDED = 'quota_exceeded',
  NOT_AVAILABLE = 'not_available',
}
