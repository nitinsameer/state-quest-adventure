import { createFileRoute } from "@tanstack/react-router";
import { ParentZoneScreen } from "@/components/ParentZone";
import { ParentGate } from "@/components/ParentGate";
import { useState } from "react";
import { clearGateSession } from "@/lib/parent-gate";

function ParentRouteComponent() {
  const [verified, setVerified] = useState(false);

  if (!verified) {
    return (
      <ParentGate
        onVerified={() => setVerified(true)}
        onCancel={() => {
          clearGateSession();
          window.history.back();
        }}
      />
    );
  }

  return <ParentZoneScreen />;
}

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
  component: ParentRouteComponent,
});
