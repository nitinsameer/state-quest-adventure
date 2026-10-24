import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/parent")({
  component: () => <div>This route has been removed.</div>,
});
