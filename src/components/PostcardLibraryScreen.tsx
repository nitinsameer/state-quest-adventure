/**
 * PostcardLibraryScreen - Proposal C Premium Feature
 * 
 * Browse, filter, and manage all saved postcards with granular consent controls
 * Features:
 * - View all postcards in grid layout
 * - Filter by state, badge, consent state
 * - Sort by date (newest/oldest) or state name
 * - Search by state name or tags
 * - Toggle consent per postcard
 * - Bulk operations (select multiple, export all, delete)
 * - Statistics dashboard (total, by consent state, by badge)
 */

import { useEffect, useState } from "react";
import { usePostcardLibrary } from "@/store/postcard-library-store";
import { PostcardCard } from "@/components/PostcardCard";
import { GranularConsentDialog } from "@/components/GranularConsentDialog";
import type { LibraryPostcard, ConsentState } from "@/lib/postcard-library";
import { fxTap } from "@/lib/fx";
import { useToast } from "@/hooks/useToast";

export function PostcardLibraryScreen() {
  const library = usePostcardLibrary();
  const toast = useToast();

  // Local state for UI
  const [selectedPostcardId, setSelectedPostcardId] = useState<string | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [selectedPostcards, setSelectedPostcards] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<string>("");
  const [filterConsent, setFilterConsent] = useState<ConsentState | "">(
    ""
  );
  const [sortBy, setSortBy] = useState<"date-newest" | "date-oldest" | "state-asc" | "state-desc">(
    "date-newest"
  );
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load library from storage on mount
  useEffect(() => {
    library.loadFromStorage();
  }, []);

  // Apply filters and sorting
  const filteredPostcards = library.getFilteredAndSorted();
  const stats = library.getStats();

  // Update filters in store
  useEffect(() => {
    library.setFilters({
      state: filterState || undefined,
      consentState: filterConsent || undefined,
      searchTerm: searchTerm || undefined,
    });
  }, [filterState, filterConsent, searchTerm]);

  // Update sorting in store
  useEffect(() => {
    library.setSortBy(sortBy);
  }, [sortBy]);

  const handlePostcardSelect = (id: string) => {
    fxTap();
    setSelectedPostcardId(id);
    setShowConsentDialog(true);
  };

  const handleToggleSelectPostcard = (id: string) => {
    fxTap();
    const newSelected = new Set(selectedPostcards);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPostcards(newSelected);
  };

  const handleSelectAll = () => {
    fxTap();
    if (selectedPostcards.size === filteredPostcards.length) {
      setSelectedPostcards(new Set());
    } else {
      setSelectedPostcards(new Set(filteredPostcards.map((p) => p.id)));
    }
  };

  const handleBulkConsent = (consentState: ConsentState) => {
    fxTap();
    library.bulkSetConsent(Array.from(selectedPostcards), consentState);
    setSelectedPostcards(new Set());
    setShowBulkActions(false);

    const action =
      consentState === "accepted"
        ? "Accepted consent for"
        : consentState === "declined"
          ? "Declined consent for"
          : "Marked pending";
    toast.success(`${action} ${selectedPostcards.size} stamp${selectedPostcards.size !== 1 ? "s" : ""}`);
  };

  const handleClearFilters = () => {
    fxTap();
    setFilterState("");
    setFilterConsent("");
    setSearchTerm("");
    setSortBy("date-newest");
    library.clearFilters();
  };

  const handleExportAll = () => {
    fxTap();
    const exportable = library.getExportable();
    if (exportable.length === 0) {
      toast.info("No stamps with consent to export");
      return;
    }
    toast.success(`Ready to export ${exportable.length} stamp${exportable.length !== 1 ? "s" : ""}`);
    // Future: Implement actual export to ZIP or PDF
  };

  const handleDeleteSelected = () => {
    fxTap();
    if (selectedPostcards.size === 0) {
      toast.info("No stamps selected");
      return;
    }

    if (confirm(`Delete ${selectedPostcards.size} stamp${selectedPostcards.size !== 1 ? "s" : ""}? This cannot be undone.`)) {
      selectedPostcards.forEach((id) => {
        library.deletePostcard(id);
      });
      setSelectedPostcards(new Set());
      toast.success(`Deleted ${selectedPostcards.size} stamp${selectedPostcards.size !== 1 ? "s" : ""}`);
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-50 to-white overflow-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-ink">🎫 Stamp Library</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredPostcards.length} stamp{filteredPostcards.length !== 1 ? "s" : ""}{" "}
                {filteredPostcards.length !== stats.total ? `(${stats.total} total)` : ""}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="bg-green-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{stats.byConsent.accepted}</div>
              <div className="text-xs font-semibold text-green-600">Consent ✅</div>
            </div>
            <div className="bg-red-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{stats.byConsent.declined}</div>
              <div className="text-xs font-semibold text-red-600">Declined ❌</div>
            </div>
            <div className="bg-amber-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">{stats.byConsent.pending}</div>
              <div className="text-xs font-semibold text-amber-600">Pending ⏳</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-xs font-semibold text-blue-600">Total 📚</div>
            </div>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by state, date, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="sticky top-24 z-30 bg-white/80 backdrop-blur border-b border-gray-200 p-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Filter by State */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States</option>
            {Array.from(new Set(stats.total > 0 ? library.postcards.map((p) => p.state) : [])).map((
              state
            ) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* Filter by Consent */}
          <select
            value={filterConsent}
            onChange={(e) => setFilterConsent(e.target.value as ConsentState | "")}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Consent States</option>
            <option value="accepted">✅ Accepted</option>
            <option value="declined">❌ Declined</option>
            <option value="pending">⏳ Pending</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "date-newest"
                  | "date-oldest"
                  | "state-asc"
                  | "state-desc"
              )
            }
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-newest">Newest First</option>
            <option value="date-oldest">Oldest First</option>
            <option value="state-asc">State A→Z</option>
            <option value="state-desc">State Z→A</option>
          </select>

          {/* Clear Filters */}
          {(filterState || filterConsent || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {selectedPostcards.size > 0 && (
            <>
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-semibold"
              >
                {selectedPostcards.size === filteredPostcards.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <span className="text-sm font-semibold text-gray-600">
                {selectedPostcards.size} selected
              </span>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 text-sm font-semibold"
              >
                Actions ⚙️
              </button>
            </>
          )}
        </div>

        {/* Bulk Actions Menu */}
        {showBulkActions && selectedPostcards.size > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <button
              onClick={() => handleBulkConsent("accepted")}
              className="px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
            >
              ✅ Accept Consent
            </button>
            <button
              onClick={() => handleBulkConsent("declined")}
              className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
            >
              ❌ Decline Consent
            </button>
            <button
              onClick={() => handleBulkConsent("pending")}
              className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition"
            >
              ⏳ Mark Pending
            </button>
            <button
              onClick={handleExportAll}
              className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
            >
              📥 Export All
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition"
            >
              🗑️ Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto">
          {filteredPostcards.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-ink mb-2">No stamps found</h2>
              <p className="text-muted-foreground mb-4">
                {stats.total === 0
                  ? "Complete state quizzes to earn stamps!"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPostcards.map((postcard) => (
                <PostcardCard
                  key={postcard.id}
                  postcard={postcard}
                  isSelected={selectedPostcards.has(postcard.id)}
                  onToggleSelect={() => handleToggleSelectPostcard(postcard.id)}
                  onTapConsent={() => handlePostcardSelect(postcard.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Consent Dialog */}
      {selectedPostcardId && (
        <GranularConsentDialog
          open={showConsentDialog}
          postcard={
            library.postcards.find((p) => p.id === selectedPostcardId) || null
          }
          onClose={() => {
            setShowConsentDialog(false);
            setSelectedPostcardId(null);
          }}
          onConsentChange={(newState) => {
            library.setPostcardConsent(selectedPostcardId, newState);
            setShowConsentDialog(false);
            setSelectedPostcardId(null);
          }}
        />
      )}
    </div>
  );
}
