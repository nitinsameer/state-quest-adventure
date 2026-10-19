/**
 * Language Fallback Notice Hook
 *
 * React hook that detects when a state with unsupported native language is loaded
 * and shows a transparent info notification in the first session.
 *
 * Automatically handles:
 * - Detection of unsupported language codes
 * - Session-based tracking (no persistence)
 * - Toast notification via existing useToastStore
 */

import { useEffect } from "react";
import { EMOJI } from "@/constants/emoji";
import { useToastStore } from "@/store/toastStore";
import { isTtsLanguageSupported, getNativeLanguageName } from "@/lib/bilingual-config";
import { shouldShowFallbackNotice, markFallbackNoticeShown } from "@/lib/language-fallback-tracker";

/**
 * Hook that detects unsupported native language and shows toast
 *
 * @param stateName - State name (e.g., "Chhattisgarh")
 * @param nativeLanguageCode - Language code for the state (e.g., "hne", "mni")
 *
 * Usage in LearningCardScreen:
 * ```tsx
 * useLanguageFallbackNotice(state.name, nativeLanguageCode);
 * ```
 */
export function useLanguageFallbackNotice(
  stateName: string | undefined,
  nativeLanguageCode: string,
): void {
  const toastStore = useToastStore();

  useEffect(() => {
    // Safety checks
    if (!stateName) {
      return;
    }

    // Check if this language is supported by TTS
    if (isTtsLanguageSupported(nativeLanguageCode)) {
      return;
    }

    // Check if we've already shown the notice in this session
    if (!shouldShowFallbackNotice(stateName)) {
      return;
    }

    // Mark that we're showing the notice for this state
    markFallbackNoticeShown(stateName);

    // Get the human-readable native language name
    const nativeLanguageName = getNativeLanguageName(stateName);

    // Show the notification
    toastStore.show({
      type: "info",
      message: "Using English instead",
      subtitle: `${nativeLanguageName} audio isn't available yet. We're using English to teach about ${stateName}.`,
      icon: EMOJI.language.globe,
      duration: 5000,
    });
  }, [stateName, nativeLanguageCode, toastStore]);
}
