/**
 * Proposal C: Premium Postcard Library
 * 
 * Advanced postcard management with:
 * - Granular, reversible consent per postcard
 * - Timestamp and location metadata
 * - COPPA-compliant consent tracking
 * - Search, filtering, and bulk operations
 * 
 * This system allows kids to:
 * - See all their postcards in one place
 * - Toggle consent ON/OFF per postcard (reversible)
 * - Understand what "consent ON" means (shareable with parents/friends)
 * - Export all postcards at once
 * - Organize by state, date, or badge earned
 */

import type { BadgeId } from "./progress";

/**
 * Consent State for each postcard
 * - "pending": Initial state, user hasn't decided yet
 * - "accepted": User consents to potential sharing with parents/friends
 * - "declined": User declines consent (still kept, just not shareable)
 */
export type ConsentState = "pending" | "accepted" | "declined";

/**
 * Location data (optional) for where postcard was earned
 * - Can be used for future map view or location-based export
 */
export type PostcardLocation = {
  stateName: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
};

/**
 * Enhanced postcard with full metadata for Proposal C
 * Extends the basic PostcardData with consent tracking and timestamps
 */
export type LibraryPostcard = {
  // Core postcard data (from progress.ts)
  id: string; // Unique identifier: "{stateName}-{timestamp}"
  generatedAt: string; // ISO timestamp when postcard was earned
  state: string; // State name (e.g., "Kerala")
  badge: BadgeId; // Badge earned (monument | animal | explorer)
  stampDate: string; // Display date like "12 · MAR"

  // Consent tracking (Proposal C addition)
  consentState: ConsentState;
  consentChangedAt?: string; // ISO timestamp of last consent change
  consentHistory: Array<{
    state: ConsentState;
    changedAt: string;
    reason?: string; // e.g., "user_toggle", "privacy_update"
  }>;

  // Export tracking (file save metadata)
  isExportedToDevice?: boolean; // Whether postcard has been saved to photos
  exportedAt?: string; // ISO timestamp when exported
  exportedFilename?: string; // Filename it was saved as
  exportCount: number; // How many times exported (for tracking multiple saves)

  // Optional location data for future use
  location?: PostcardLocation;

  // Metadata for filtering and sorting
  displayOrder: number; // For sorting in library
  tags: string[]; // e.g., ["beach", "endangered-animal", "cultural"]
};

/**
 * Library metadata tracking consent states
 */
export type PostcardLibraryMetadata = {
  totalPostcards: number;
  consentAccepted: number; // Count with consent="accepted"
  consentDeclined: number; // Count with consent="declined"
  consentPending: number; // Count with consent="pending"
  lastUpdated: string; // ISO timestamp
};

/**
 * Helper: Create a LibraryPostcard from basic PostcardData
 */
export function createLibraryPostcard(
  stateName: string,
  badgeId: BadgeId,
  stampDate: string,
  generatedAt: string
): LibraryPostcard {
  const id = `${stateName}-${new Date(generatedAt).getTime()}`;

  return {
    id,
    generatedAt,
    state: stateName,
    badge: badgeId,
    stampDate,
    consentState: "pending", // Initial state
    consentChangedAt: generatedAt,
    consentHistory: [
      {
        state: "pending",
        changedAt: generatedAt,
        reason: "initial_creation",
      },
    ],
    isExportedToDevice: false,
    exportCount: 0,
    displayOrder: 0,
    tags: [],
  };
}

/**
 * Helper: Get library metadata from postcards
 */
export function getLibraryMetadata(postcards: LibraryPostcard[]): PostcardLibraryMetadata {
  return {
    totalPostcards: postcards.length,
    consentAccepted: postcards.filter((p) => p.consentState === "accepted").length,
    consentDeclined: postcards.filter((p) => p.consentState === "declined").length,
    consentPending: postcards.filter((p) => p.consentState === "pending").length,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Helper: Update consent state for a postcard
 */
export function updatePostcardConsent(
  postcard: LibraryPostcard,
  newState: ConsentState,
  reason: string = "user_toggle"
): LibraryPostcard {
  const changedAt = new Date().toISOString();

  return {
    ...postcard,
    consentState: newState,
    consentChangedAt: changedAt,
    consentHistory: [
      ...postcard.consentHistory,
      {
        state: newState,
        changedAt,
        reason,
      },
    ],
  };
}

/**
 * Helper: Mark a postcard as exported to device
 */
export function markPostcardAsExported(
  postcard: LibraryPostcard,
  filename: string
): LibraryPostcard {
  const now = new Date().toISOString();
  
  return {
    ...postcard,
    isExportedToDevice: true,
    exportedAt: now,
    exportedFilename: filename,
    exportCount: (postcard.exportCount || 0) + 1,
  };
}

/**
 * Helper: Filter postcards by various criteria
 */
export function filterPostcards(
  postcards: LibraryPostcard[],
  filters: {
    state?: string;
    badge?: BadgeId;
    consentState?: ConsentState;
    searchTerm?: string;
  }
): LibraryPostcard[] {
  return postcards.filter((p) => {
    if (filters.state && p.state !== filters.state) return false;
    if (filters.badge && p.badge !== filters.badge) return false;
    if (filters.consentState && p.consentState !== filters.consentState) return false;
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      return (
        p.state.toLowerCase().includes(term) ||
        p.stampDate.toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term))
      );
    }
    return true;
  });
}

/**
 * Helper: Sort postcards by various criteria
 */
export function sortPostcards(
  postcards: LibraryPostcard[],
  sortBy: "date-newest" | "date-oldest" | "state-asc" | "state-desc" = "date-newest"
): LibraryPostcard[] {
  const sorted = [...postcards];

  switch (sortBy) {
    case "date-newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
    case "date-oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
      );
    case "state-asc":
      return sorted.sort((a, b) => a.state.localeCompare(b.state));
    case "state-desc":
      return sorted.sort((a, b) => b.state.localeCompare(a.state));
  }
}

/**
 * Helper: Export postcards with consent filter
 * Only includes postcards where user has consented to sharing
 */
export function getExportablePostcards(postcards: LibraryPostcard[]): LibraryPostcard[] {
  return postcards.filter((p) => p.consentState === "accepted");
}

/**
 * Helper: Calculate postcard statistics
 */
export function getPostcardStats(postcards: LibraryPostcard[]) {
  const stats = {
    total: postcards.length,
    byBadge: {
      monument: 0,
      animal: 0,
      explorer: 0,
    },
    byConsent: {
      accepted: 0,
      declined: 0,
      pending: 0,
    },
    recentCount: 0, // Last 7 days
    oldestPostcard: null as string | null,
    newestPostcard: null as string | null,
  };

  if (postcards.length === 0) return stats;

  // Count by badge
  postcards.forEach((p) => {
    stats.byBadge[p.badge]++;
    stats.byConsent[p.consentState]++;
  });

  // Count recent (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  stats.recentCount = postcards.filter(
    (p) => new Date(p.generatedAt) > sevenDaysAgo
  ).length;

  // Find oldest and newest
  const sorted = sortPostcards(postcards, "date-newest");
  if (sorted.length > 0) {
    stats.newestPostcard = sorted[0].generatedAt;
    stats.oldestPostcard = sorted[sorted.length - 1].generatedAt;
  }

  return stats;
}
