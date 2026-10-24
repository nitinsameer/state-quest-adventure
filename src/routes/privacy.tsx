import { createFileRoute } from "@tanstack/react-router";
import { EMOJI } from "@/constants/emoji";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — India Explorer" },
      {
        name: "description",
        content: "India Explorer privacy policy. How we handle your data and protect your privacy.",
      },
    ],
  }),
  component: PrivacyPolicyScreen,
});

function PrivacyPolicyScreen() {
  return (
    <div className="h-full w-full bg-surface-card flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-5 pt-3 pb-6 rounded-b-[32px]"
        style={{ backgroundColor: "var(--accent-5)", color: "var(--accent-5-ink)" }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-text-on-header/25 flex items-center justify-center text-2xl"
          >
            ‹
          </button>
          <h1 className="text-h4">Privacy Policy</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content - External Privacy Policy */}
      <iframe
        src="https://nitinsameer.github.io/state-explorer-pricay-policy/"
        title="Privacy Policy"
        className="flex-1 border-0 w-full"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
