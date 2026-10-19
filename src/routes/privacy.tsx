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
      <div className="px-5 pt-3 pb-6 rounded-b-[32px]" style={{backgroundColor: "var(--accent-5)", color: "var(--accent-5-ink)"}}>
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

      {/* Content */}
      <div className="px-5 flex-1 overflow-auto py-6 space-y-6">
        {/* Last Updated */}
        <div className="text-label text-muted-foreground">Last updated: September 2026</div>

        {/* Overview */}
        <section>
          <h2 className="text-h4 mb-3">Overview</h2>
          <p className="text-body text-muted-foreground leading-relaxed">
            India Explorer ("we," "us," "our," or "the App") is committed to protecting your privacy
            and your child's privacy. This Privacy Policy explains how we collect, use, and protect
            information.
          </p>
        </section>

        {/* Data Storage */}
        <section>
          <h2 className="text-h4 mb-3">{EMOJI.hardware.phone} How We Store Your Data</h2>
          <div className="bg-surface-card rounded-2xl p-4 border border-border-subtle space-y-3">
            <div>
              <div className="text-body font-bold text-ink">Device Storage Only</div>
              <p className="text-caption text-muted-foreground mt-1">
                All progress (levels, badges, stamps, quiz answers) is stored locally on your device
                only. We do NOT upload this data to our servers.
              </p>
            </div>
            <div className="border-t pt-3">
              <div className="text-body font-bold text-ink">No Account Required</div>
              <p className="text-caption text-muted-foreground mt-1">
                We don't require usernames, passwords, or email addresses. Your child can play
                immediately after entering their name and age.
              </p>
            </div>
          </div>
        </section>

        {/* Analytics */}
        <section>
          <h2 className="text-h4 mb-3">{EMOJI.action.analytics} Analytics & Telemetry</h2>
          <div className="bg-accent-1-soft rounded-2xl p-4 border border-accent-1 space-y-3">
            <div>
              <div className="text-body font-bold text-accent-1">Firebase Analytics</div>
              <p className="text-caption text-accent-1 mt-1">
                We use Firebase Analytics (by Google) to understand how the app is used. We collect:
              </p>
              <ul className="text-caption text-accent-1 mt-2 ml-3 space-y-1">
                <li>• Child's age band (e.g., "8-9")</li>
                <li>• States explored and quiz performance</li>
                <li>• Session duration and visit frequency</li>
                <li>• Crash reports (for stability)</li>
              </ul>
            </div>
            <div className="border-t border-accent-1 pt-3">
              <div className="text-body font-bold text-accent-1">Parental Consent</div>
              <p className="text-caption text-accent-1 mt-1">
                This analytics collection only begins AFTER your child completes onboarding and you
                see our permission dialogs. You control whether analytics are sent.
              </p>
            </div>
          </div>
        </section>

        {/* Permissions */}
        <section>
          <h2 className="text-h4 mb-3">{EMOJI.action.lock} Permissions</h2>
          <div className="bg-surface-card rounded-2xl p-4 border border-border-subtle space-y-3">
            <div>
              <div className="text-body font-bold text-ink">Audio Permission</div>
              <p className="text-caption text-muted-foreground mt-1">
                We ask permission to play background music and sound effects. If declined, the app
                works silently.
              </p>
            </div>
            <div className="border-t pt-3">
              <div className="text-body font-bold text-ink">File Storage Permission</div>
              <p className="text-caption text-muted-foreground mt-1">
                We ask permission to save postcards that your child creates. This allows sharing
                achievements with family.
              </p>
            </div>
            <div className="border-t pt-3">
              <div className="text-body font-bold text-ink">What We DON'T Access</div>
              <p className="text-caption text-muted-foreground mt-1">
                We never request or access: camera, microphone, location, contacts, or photos.
              </p>
            </div>
          </div>
        </section>

        {/* Ads & Tracking */}
        <section>
          <h2 className="text-h4 mb-3">❌ No Ads or Third-Party Tracking</h2>
          <div className="bg-success-soft rounded-2xl p-4 border border-success">
            <ul className="text-caption text-success space-y-2">
              <li>✓ No advertisements or ad networks</li>
              <li>✓ No third-party trackers (Mixpanel, AppsFlyer, etc.)</li>
              <li>✓ No behavioral profiling or targeting</li>
              <li>✓ No user IDs or persistent identifiers across devices</li>
            </ul>
          </div>
        </section>

        {/* COPPA Compliance */}
        <section>
          <h2 className="text-h4 mb-3">{EMOJI.family.group} COPPA & Kids Safety</h2>
          <p className="text-body text-muted-foreground leading-relaxed">
            India Explorer complies with the Children's Online Privacy Protection Act (COPPA). We
            ask for parental consent before collecting age-targeted information. We do not allow
            social sharing, in-app messaging, or user-generated content that could expose children
            to inappropriate material.
          </p>
        </section>

        {/* Data Deletion */}
        <section>
          <h2 className="text-h4 mb-3">{EMOJI.action.delete} Data Deletion</h2>
          <p className="text-body text-muted-foreground leading-relaxed">
            You can delete all progress at any time by going to Settings → Parent Zone → Reset all
            progress. This permanently erases all locally stored data.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-h4 mb-3">{EMOJI.communication.email} Questions?</h2>
          <p className="text-body text-muted-foreground leading-relaxed">
            If you have questions about this privacy policy, contact us through the feedback option
            in the app.
          </p>
        </section>

        {/* Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
