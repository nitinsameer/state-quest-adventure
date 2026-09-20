/**
 * PostcardLibrary Integration with Progress System
 * 
 * Handles:
 * - Migration from old postcard format to LibraryPostcard format
 * - Auto-syncing new postcards when states are completed
 * - Lazy loading of library from storage
 */

import type { Progress, PostcardData } from "@/lib/progress";
import type { LibraryPostcard } from "@/lib/postcard-library";
import { usePostcardLibrary } from "@/store/postcard-library-store";
import { createLibraryPostcard } from "@/lib/postcard-library";

/**
 * Migrate old PostcardData to new LibraryPostcard format
 * 
 * Old format: { generatedAt, state, badge, stampDate }
 * New format: LibraryPostcard with consent tracking, history, etc.
 */
function migratePostcardData(
  stateName: string,
  oldData: PostcardData
): LibraryPostcard {
  return {
    id: `${stateName}-${new Date(oldData.generatedAt).getTime()}`,
    generatedAt: oldData.generatedAt,
    state: oldData.state,
    badge: oldData.badge,
    stampDate: oldData.stampDate,
    // Proposal C: Initialize with "pending" consent to be COPPA-safe
    consentState: "pending",
    consentChangedAt: oldData.generatedAt,
    consentHistory: [
      {
        state: "pending",
        changedAt: oldData.generatedAt,
        reason: "migrated_from_old_format",
      },
    ],
    displayOrder: 0,
    tags: [],
  };
}

/**
 * Migrate all postcards from Progress to PostcardLibrary
 * Run this once when user first accesses the library
 */
export function migratePostcardsToLibrary(progress: Progress): LibraryPostcard[] {
  const migrated: LibraryPostcard[] = [];

  if (!progress.postcards) return migrated;

  // Convert old postcard records to new LibraryPostcard format
  for (const [stateName, oldData] of Object.entries(progress.postcards)) {
    const libraryPostcard = migratePostcardData(stateName, oldData);
    migrated.push(libraryPostcard);
  }

  // Sort by date (newest first)
  migrated.sort(
    (a, b) =>
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );

  return migrated;
}

/**
 * Initialize library with existing postcards from progress
 * Should be called once when app starts (e.g., in App root)
 */
export async function initializePostcardLibrary(progress: Progress) {
  const library = usePostcardLibrary.getState();

  // Check if already initialized (library has postcards)
  if (library.postcards.length > 0) {
    return; // Already initialized
  }

  // Load from storage first
  library.loadFromStorage();

  // If still empty, migrate from progress
  const currentPostcards = usePostcardLibrary.getState().postcards;
  if (currentPostcards.length === 0 && progress.postcards) {
    const migrated = migratePostcardsToLibrary(progress);
    if (migrated.length > 0) {
      // Add all migrated postcards
      migrated.forEach((postcard) => {
        usePostcardLibrary.getState().addPostcard(
          postcard.state,
          postcard.badge,
          postcard.stampDate,
          postcard.generatedAt
        );
      });
    }
  }
}

/**
 * Sync a new postcard to library when state is completed
 * Called from completeState() in progress.ts
 */
export function syncNewPostcardToLibrary(
  stateName: string,
  badge: "monument" | "animal" | "explorer",
  stampDate: string,
  generatedAt: string
) {
  try {
    const library = usePostcardLibrary.getState();
    library.addPostcard(stateName, badge, stampDate, generatedAt);
  } catch (err) {
    console.error("[PostcardIntegration] Failed to sync new postcard", err);
  }
}

/**
 * Get count of postcards with "accepted" consent (exportable postcards)
 * Used for showing user how many postcards are shareable
 */
export function getShareablePostcardCount(): number {
  const library = usePostcardLibrary.getState();
  return library.getExportable().length;
}

/**
 * Get postcard statistics for display in passport or dashboard
 */
export function getPostcardLibraryStats() {
  const library = usePostcardLibrary.getState();
  return library.getStats();
}

/**
 * Hook: Initialize library on first access
 * Usage: Call in App root or before showing library screen
 */
export function usePostcardLibraryInit(progress: Progress) {
  return async () => {
    await initializePostcardLibrary(progress);
  };
}
