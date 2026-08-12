import { createFileRoute } from "@tanstack/react-router";
import { ParentZoneScreen } from "@/components/ParentZone";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent Zone — India Explorer" },
      {
        name: "description",
        content:
          "Parent dashboard: learning coverage, weekly activity, screen-time guidance and data controls for your child's India Explorer progress.",
      },
      { property: "og:title", content: "Parent Zone" },
      { property: "og:description", content: "See what your child has learned and manage their app data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParentZoneScreen,
});
