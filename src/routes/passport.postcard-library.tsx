/**
 * Postcard Library Route - Proposal C
 * Accessible from passport/postcard-library or as tab in Passport
 */

import { createFileRoute } from "@tanstack/react-router";
import { PostcardLibraryScreen } from "@/components/PostcardLibraryScreen";

export const Route = createFileRoute("/passport/postcard-library")({
  head: () => ({
    meta: [
      { title: "📸 Postcard Library — India Explorer" },
      {
        name: "description",
        content: "Browse and manage all your earned postcards with granular consent controls.",
      },
      { property: "og:title", content: "Postcard Library" },
      { property: "og:description", content: "Organize and manage your postcard collection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostcardLibraryScreen,
});
