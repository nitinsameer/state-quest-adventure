/**
 * PostcardLibraryStore - Zustand store for managing postcard collection
 * 
 * Proposal C: Manages all postcard operations with granular consent tracking
 * - CRUD operations on postcards
 * - Consent state management
 * - Persistence to localStorage
 * - Filtering and sorting
 */

import { create } from "zustand";
import type {
  LibraryPostcard,
  PostcardLibraryMetadata,
  ConsentState,
} from "@/lib/postcard-library";
import {
  createLibraryPostcard,
  getLibraryMetadata,
  updatePostcardConsent,
  filterPostcards,
  sortPostcards,
  getExportablePostcards,
  getPostcardStats,
} from "@/lib/postcard-library";
import { validatePostcardLibrary } from "@/lib/localStorage-schema";

export type PostcardLibrarySortBy = "date-newest" | "date-oldest" | "state-asc" | "state-desc";

export type PostcardLibraryFilters = {
  state?: string;
  badge?: "monument" | "animal" | "explorer";
  consentState?: ConsentState;
  searchTerm?: string;
};

interface PostcardLibraryStore {
  // State
  postcards: LibraryPostcard[];
  metadata: PostcardLibraryMetadata;
  filters: PostcardLibraryFilters;
  sortBy: PostcardLibrarySortBy;

  // Loading
  isLoading: boolean;
  error: string | null;

  // Actions - CRUD
  addPostcard: (
    stateName: string,
    badgeId: "monument" | "animal" | "explorer",
    stampDate: string,
    generatedAt: string,
    imageData?: string
  ) => void;
  updatePostcard: (id: string, updates: Partial<LibraryPostcard>) => void;
  deletePostcard: (id: string) => void;
  deletePostcardsByState: (stateName: string) => void;

  // Actions - Consent
  setPostcardConsent: (id: string, consentState: ConsentState) => void;
  bulkSetConsent: (postcardsIds: string[], consentState: ConsentState) => void;

  // Actions - Filtering & Sorting
  setFilters: (filters: PostcardLibraryFilters) => void;
  setSortBy: (sortBy: PostcardLibrarySortBy) => void;
  clearFilters: () => void;

  // Actions - Data
  getFilteredAndSorted: () => LibraryPostcard[];
  getExportable: () => LibraryPostcard[];
  getStats: () => ReturnType<typeof getPostcardStats>;

  // Actions - Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  clearLibrary: () => void;
}

const STORAGE_KEY = "india-explorer:postcard-library:v1";

const createPostcardLibraryStore = (): PostcardLibraryStore => {
  // Initialize with empty state
  let initialPostcards: LibraryPostcard[] = [];
  let initialMetadata = getLibraryMetadata([]);

  // Try to load from localStorage
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // CRITICAL FIX #1.5: Validate postcard library with Zod schema
      const validated = validatePostcardLibrary(stored);
      if (validated.length > 0) {
        initialPostcards = validated;
        initialMetadata = getLibraryMetadata(initialPostcards);
      }
    } catch (err) {
      // Validation failed - start fresh
      initialPostcards = [];
      initialMetadata = getLibraryMetadata([]);
    }
  }

  return {
    postcards: initialPostcards,
    metadata: initialMetadata,
    filters: {},
    sortBy: "date-newest",
    isLoading: false,
    error: null,

    // CRUD Operations
    addPostcard: (stateName, badgeId, stampDate, generatedAt, imageData) => {
      usePostcardLibrary.setState((state) => {
        const newPostcard = createLibraryPostcard(
          stateName,
          badgeId,
          stampDate,
          generatedAt
        );
        if (imageData) {
          newPostcard.imageData = imageData;
        }
        const updatedPostcards = [...state.postcards, newPostcard];
        const updatedMetadata = getLibraryMetadata(updatedPostcards);

        usePostcardLibrary.getState().saveToStorage();

        return {
          postcards: updatedPostcards,
          metadata: updatedMetadata,
        };
      });
    },

    updatePostcard: (id, updates) => {
      usePostcardLibrary.setState((state) => {
        const updatedPostcards = state.postcards.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        );
        const updatedMetadata = getLibraryMetadata(updatedPostcards);

        usePostcardLibrary.getState().saveToStorage();

        return {
          postcards: updatedPostcards,
          metadata: updatedMetadata,
        };
      });
    },

    deletePostcard: (id) => {
      usePostcardLibrary.setState((state) => {
        const updatedPostcards = state.postcards.filter((p) => p.id !== id);
        const updatedMetadata = getLibraryMetadata(updatedPostcards);

        usePostcardLibrary.getState().saveToStorage();

        return {
          postcards: updatedPostcards,
          metadata: updatedMetadata,
        };
      });
    },

    deletePostcardsByState: (stateName) => {
      usePostcardLibrary.setState((state) => {
        const updatedPostcards = state.postcards.filter(
          (p) => p.state !== stateName
        );
        const updatedMetadata = getLibraryMetadata(updatedPostcards);

        usePostcardLibrary.getState().saveToStorage();

        return {
          postcards: updatedPostcards,
          metadata: updatedMetadata,
        };
      });
    },

    // Consent Operations
    setPostcardConsent: (id, consentState) => {
      usePostcardLibrary.setState((state) => {
        const updatedPostcards = state.postcards.map((p) => {
          if (p.id === id) {
            return updatePostcardConsent(p, consentState, "user_toggle");
          }
          return p;
        });
        const updatedMetadata = getLibraryMetadata(updatedPostcards);

        usePostcardLibrary.getState().saveToStorage();

        return {
          postcards: updatedPostcards,
          metadata: updatedMetadata,
        };
      });
    },

    bulkSetConsent: (postcardsIds, consentState) => {
      usePostcardLibrary.setState((state) => {
        const idsSet = new Set(postcardsIds);
        const updatedPostcards = state.postcards.map((p) => {
          if (idsSet.has(p.id)) {
            return updatePostcardConsent(p, consentState, "bulk_operation");
          }
          return p;
        });
        const updatedMetadata = getLibraryMetadata(updatedPostcards);

        usePostcardLibrary.getState().saveToStorage();

        return {
          postcards: updatedPostcards,
          metadata: updatedMetadata,
        };
      });
    },

    // Filtering & Sorting
    setFilters: (filters) => {
      usePostcardLibrary.setState({ filters });
    },

    setSortBy: (sortBy) => {
      usePostcardLibrary.setState({ sortBy });
    },

    clearFilters: () => {
      usePostcardLibrary.setState({ filters: {}, sortBy: "date-newest" });
    },

    // Data Access
    getFilteredAndSorted: () => {
      const state = usePostcardLibrary.getState();
      let result = state.postcards;

      // Apply filters
      if (Object.keys(state.filters).length > 0) {
        result = filterPostcards(result, state.filters);
      }

      // Apply sorting
      result = sortPostcards(result, state.sortBy);

      return result;
    },

    getExportable: () => {
      return getExportablePostcards(usePostcardLibrary.getState().postcards);
    },

    getStats: () => {
      return getPostcardStats(usePostcardLibrary.getState().postcards);
    },

    // Persistence
    loadFromStorage: () => {
      if (typeof localStorage === "undefined") return;

      try {
        usePostcardLibrary.setState({ isLoading: true, error: null });
        const stored = localStorage.getItem(STORAGE_KEY);

        // CRITICAL FIX #1.5: Validate postcard library with Zod schema
        const validated = validatePostcardLibrary(stored);
        if (validated.length > 0) {
          const metadata = getLibraryMetadata(validated);
          usePostcardLibrary.setState({
            postcards: validated,
            metadata,
            isLoading: false,
          });
        } else {
          usePostcardLibrary.setState({ isLoading: false });
        }
      } catch (err) {
        usePostcardLibrary.setState({
          error: "Failed to load postcard library",
          isLoading: false,
        });
      }
    },

    saveToStorage: () => {
      if (typeof localStorage === "undefined") return;

      try {
        const state = usePostcardLibrary.getState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.postcards));
      } catch (err) {
        usePostcardLibrary.setState({
          error: "Failed to save postcard library",
        });
        console.error("[PostcardLibraryStore] Failed to save to storage", err);
      }
    },

    clearLibrary: () => {
      usePostcardLibrary.setState({
        postcards: [],
        metadata: getLibraryMetadata([]),
        filters: {},
        sortBy: "date-newest",
      });

      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  };
};

export const usePostcardLibrary = create<PostcardLibraryStore>((set, get) => ({
  ...createPostcardLibraryStore(),
}));
