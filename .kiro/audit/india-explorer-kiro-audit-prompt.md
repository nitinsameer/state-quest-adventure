# India Explorer — Complete Production Readiness Audit & Release Hardening

*Kiro prompt — run from the project root so Kiro can inspect the actual repository.*

## Role & Objective

Act as a combined team of senior engineers and reviewers, including:

- Staff-level TypeScript and React engineer
- TanStack Start routing and application architecture specialist
- Senior UI/UX designer and frontend quality engineer
- Android, Capacitor 6, and Gradle release engineer
- QA automation engineer specializing in Vitest and Playwright
- Application security and privacy reviewer
- Performance and accessibility specialist
- Observability, diagnostics, and production operations engineer
- Google Play release-readiness reviewer

Your task is to perform a comprehensive, evidence-based production-readiness audit of the India Explorer application and make it reliable, secure, accessible, polished, testable, and ready for public release.

Do not perform a superficial code review. Review the actual implementation, trace real user journeys, run the available checks, identify defects, and fix verified problems wherever safe.

The goal is to answer:

> Can a real user install this app, navigate every major screen, use every advertised feature, lose connectivity, close and reopen the app, update the app, and use it on supported Android devices without encountering broken functionality, lost data, crashes, serious security problems, or an unfinished experience?

Do not claim production readiness unless the evidence supports it.

## 1. First: Understand the Existing Project

Before changing code:

- Inspect the repository structure and Git working tree.
- Read `package.json`, lockfiles, TypeScript configuration, Vite configuration, TanStack Start configuration, Capacitor configuration, Tailwind CSS configuration and CSS entry points, Gradle files, `AndroidManifest.xml`, and other relevant configuration.
- Inspect all routes under `src/routes/` and identify layouts, shared components, navigation, hooks, stores, utilities, services, schemas, assets, and feature modules.
- Inspect Firebase configuration and identify precisely which Firebase services are actually used.
- Identify every `localStorage` key, stored data schema, Zod validation boundary, migration mechanism, and data-clearing operation.
- Inspect existing Vitest and Playwright tests, test scripts, CI configuration, build scripts, Windows PowerShell scripts, and Android packaging scripts.
- Read project documentation and existing design conventions.
- Identify the intended user journeys and features from the actual code, copy, routes, and documentation.
- Create a feature inventory and route inventory before auditing individual features.

Do not assume that this app has a conventional backend. Treat it as a client-first application with on-device persistence and Firebase configuration, and verify its actual architecture before drawing conclusions.

### Important constraints

- Preserve the existing architecture unless a demonstrated defect justifies a change.
- Preserve the app's India Explorer identity, visual design, content, and intended user experience.
- Do not replace working features with mockups, placeholders, or simplified implementations.
- Do not invent APIs, backend endpoints, Firebase services, credentials, or product requirements.
- Never remove existing features merely to make tests pass.
- Never overwrite user changes or unrelated work in the Git working tree.
- Never expose secrets, personal data, or sensitive stored content in logs or reports.
- Do not disable tests, TypeScript checks, lint rules, security checks, or accessibility checks to obtain a green build.
- Avoid dependency upgrades, architectural rewrites, and destructive migrations unless necessary and justified.
- If a required tool, credential, device, service, or network connection is unavailable, report the limitation instead of fabricating a successful check.

## 2. Establish a Baseline

Inspect available npm scripts and determine the project's supported commands.

Run the applicable checks, such as:

- Dependency and lockfile consistency.
- TypeScript type checking.
- ESLint or the configured linter.
- Unit tests with Vitest.
- Existing Playwright end-to-end tests.
- Production web build.
- Production server or preview smoke test, if supported.
- Tailwind CSS generation and styling checks.
- Android/Capacitor synchronization and native build checks.
- Dependency vulnerability audit using available tooling.

Use the actual scripts defined in `package.json` rather than assuming command names.

Record the baseline results before making changes. Distinguish pre-existing failures from newly introduced failures.

Do not stop at the first failed command. Continue with independent checks when safe.

## 3. Complete Route, Screen, and Feature Audit

Enumerate every route, page, modal, dialog, drawer, tab, menu, onboarding flow, form, quiz, interactive component, and major user-facing feature.

For each item, inspect:

- Initial render and loading state.
- Normal successful interaction.
- Empty state.
- Invalid input and validation errors.
- Error state and recovery.
- Offline or unavailable-resource behavior where applicable.
- Persistence after refresh, app restart, or navigation.
- Back navigation and repeated interactions.
- Mobile responsiveness and keyboard behavior.
- Accessibility and focus management.
- Console errors, rejected promises, and runtime exceptions.

Test every interactive element, including buttons, links, filters, search, sorting, tabs, dropdowns, tooltips, forms, quizzes, progress controls, postcard actions, and navigation items.

Look specifically for:

- Buttons that do nothing or invoke the wrong action.
- Placeholder links, dead routes, incorrect destinations, and broken deep links.
- Stale state and UI that does not update after mutations.
- Double submissions, duplicate event handlers, and race conditions.
- Forms that silently discard input.
- Missing validation or misleading success messages.
- Modals that cannot be dismissed or trap users incorrectly.
- Broken browser refreshes on nested routes.
- Missing route-level error handling and not-found pages.
- React warnings, hydration errors, and client/server rendering mismatches.
- Features that appear implemented but are incomplete or only partially wired up.

Do not mark a feature as tested merely because its screen renders. Exercise the underlying functionality and verify its result.

Create a traceable feature matrix containing:

`Feature or route | Expected behavior | Actual result | Test evidence | Severity | Fix status`

## 4. UI/UX and Visual Quality Audit

Review the entire app on small Android phone screens, typical Android phone sizes, larger phones, and tablet or desktop layouts where supported.

Inspect:

- Layout consistency, spacing, alignment, typography, and visual hierarchy.
- Overflow, clipping, horizontal scrolling, and overlapping components.
- Text wrapping, truncated labels, and content that becomes unreadable.
- Responsive grids, cards, images, maps, lists, and navigation.
- Loading indicators, skeletons, empty states, error states, and success feedback.
- Disabled, pressed, focused, selected, and active states.
- Dialog positioning, keyboard overlap, and scroll behavior.
- Touch target sizes and spacing between interactive controls.
- Contrast in light and dark themes, if both exist.
- Use of the existing Tailwind CSS v4 design tokens and custom theme conventions.
- Image quality, aspect ratios, fallback behavior, and missing assets.
- Consistency across routes and reusable components.
- Unintended browser defaults, inconsistent iconography, and unfinished visual elements.

Verify that safe-area insets and system bars are handled correctly in the Capacitor Android experience.

Check edge-to-edge layouts, status bar appearance, navigation bar appearance, and gesture navigation behavior against the project's intended Android configuration.

Test portrait and landscape where supported.

Inspect the actual rendered UI using Playwright screenshots and browser inspection where possible. Use Android emulation or a real device when available.

If visual regression tests are feasible, establish useful baselines and add checks for important screens.

Fix verified visual defects. Do not redesign the entire app or introduce arbitrary styling changes simply because a different design is possible.

## 5. Functionality and State Management

Trace every major feature from its UI entry point through its state changes, validation, persistence, and displayed result.

Inspect:

- React component state and effect dependencies.
- Shared state and derived state consistency.
- Stale closures and asynchronous state updates.
- Event listener and subscription cleanup.
- Duplicate network or storage operations.
- Unhandled promises and race conditions.
- Invalid state transitions.
- Repeated taps and rapid navigation.
- Browser refresh and app resume behavior.
- Back-button and Escape-key handling.
- Cancellation, retry, and recovery behavior.
- Data consistency between multiple screens.
- Handling of unexpected or malformed input.

Verify that success indicators appear only after the relevant operation actually succeeds.

Do not use optimistic UI updates without appropriate rollback or error handling.

Confirm that every advertised feature performs its intended action and that failures are communicated clearly to users.

## 6. localStorage, Zod, and Data Durability

Treat localStorage-backed data as important user data.

Inventory every key and schema, including progress, quiz results, postcards, settings, onboarding state, and any other persisted information discovered in the repository.

### Validation and corruption handling

- Every read from persistent storage is treated as untrusted input.
- Zod validation occurs at the appropriate storage boundaries.
- Missing keys, invalid JSON, malformed records, unexpected types, and outdated schemas are handled safely.
- Invalid records do not crash the entire app.
- Recovery behavior is predictable and communicated where appropriate.
- Storage quota failures and `SecurityError` exceptions are handled.
- Browser storage being unavailable does not produce an uncontrolled crash.

### Persistence and integrity

- Important state is written at the correct lifecycle points.
- Data remains consistent after navigation, refresh, and app restart.
- Rapid changes do not overwrite newer state with stale data.
- Multiple screens do not maintain conflicting copies of persisted state.
- Storage writes and clears cannot silently destroy unrelated user data.
- Clearing one feature's data does not unexpectedly erase another feature's data.
- Storage events and multiple-tab behavior are handled if relevant.
- No unnecessary personal information is persisted.

### Versioning and migrations

- Determine whether existing stored data has a versioned schema.
- Implement a safe, versioned migration mechanism if required.
- Test migration from representative older schemas.
- Ensure failed migrations do not silently replace valid existing data with defaults.
- Preserve backward compatibility where practical.

### Data-loss tests

Test valid data, missing data, corrupt JSON, partially invalid records, old schemas, storage write failures, empty datasets, and large but realistic datasets.

Verify that progress, quiz results, and postcards survive normal app lifecycle events.

Do not introduce destructive reset behavior as a shortcut to recovery.

## 7. TanStack Start, Vite, and React 19

Review application initialization, routing, rendering, and production configuration.

Check:

- Correct file-based route discovery and route configuration.
- Route-level error boundaries and not-found handling.
- Browser refresh and direct navigation to nested routes.
- Server-side rendering and hydration behavior where used.
- Browser-only APIs such as `localStorage`, `window`, `document`, and `navigator` being accessed only in appropriate execution contexts.
- Client/server boundaries and accidental server-side access to browser APIs.
- Environment variable handling and build-time configuration.
- Development-only code and debug overlays leaking into production.
- Asset paths, base URLs, and production routing behavior.
- Lazy loading, code splitting, and unnecessary bundle growth.
- React keys, effects, state synchronization, and Strict Mode behavior.
- Unhandled runtime errors and rejected promises.
- Incorrect assumptions about static hosting or SPA fallback behavior.

Verify the actual TanStack Start deployment requirements before changing server or hosting configuration.

Do not assume a client-only deployment is automatically compatible with the existing TanStack Start setup.

## 8. Capacitor 6 and Android Release Audit

Inspect the actual native Android project, Gradle configuration, Capacitor plugins, generated assets, manifests, and release scripts.

Check:

- Capacitor web/native configuration consistency.
- Correct app ID, application name, version name, and version code.
- Android minimum SDK, target SDK, and compile SDK compatibility.
- Gradle and Android Gradle Plugin compatibility.
- Java and Kotlin compatibility where applicable.
- Release build configuration and signing setup.
- Debug flags, debuggable builds, and unintended development URLs.
- `AndroidManifest.xml` permissions and exported components.
- Network security configuration and cleartext traffic.
- WebView navigation and allowed external URLs.
- Deep links and Android intent handling, if supported.
- Status bar, navigation bar, safe areas, and keyboard resize behavior.
- Android back-button handling.
- App resume, pause, and process recreation behavior.
- Internet connectivity changes and offline behavior.
- Capacitor plugin registration and plugin version compatibility.
- Splash screen, app icon, adaptive icon, and launch experience.
- Orientation and screen-size behavior.
- Storage compatibility and WebView localStorage persistence.
- Native crash logs and Android runtime exceptions where tooling permits.

Check Android 12+ exported-component requirements and current Google Play target API requirements for the intended release date. Verify time-sensitive requirements against official Android and Google Play documentation rather than relying on memory.

Build a release APK or Android App Bundle using the existing project configuration where possible.

Verify the generated artifact exists, the build exits successfully, and the artifact is actually configured as a release build.

Do not fabricate signing success. Do not commit keystores, signing passwords, or release credentials. Do not replace the production application ID or signing identity.

If credentials or device access are unavailable, explicitly state which release checks remain unverified.

## 9. Firebase, Privacy, and Security

Inspect Firebase usage rather than assuming that configuration equals active functionality.

Determine whether the project uses Firebase Analytics, Firestore, Crashlytics, Remote Config, or other Firebase products, and verify each integration against actual source code and configuration.

Audit:

- Firebase initialization and failure handling.
- Environment separation for development and production.
- Accidental exposure of private keys, service-account credentials, or secrets.
- Firebase security rules if Firestore or other protected services are used.
- Unnecessary permissions or excessive data collection.
- Analytics events containing personal information or sensitive content.
- Data transmission and retention assumptions.
- External links and URL validation.
- Unsafe HTML rendering and injection risks.
- Dependency vulnerabilities and risky packages.
- Insecure WebView or network configuration.
- Debug endpoints, test credentials, and development flags.
- Sensitive data in logs, crash reports, source maps, and build artifacts.
- Privacy disclosures that do not match actual app behavior.

Remember that Firebase client configuration values are not automatically equivalent to server-side secrets. Focus on actual access controls, exposed credentials, and security rules.

Do not invent authentication requirements or backend functionality that the product does not need.

If no authentication system exists, assess the consequences honestly: on-device progress is not automatically backed up or synchronized across devices.

Do not claim that localStorage data is encrypted, backed up, or recoverable unless the implementation demonstrably provides those properties.

If Firebase services are not used, document that fact instead of adding unnecessary infrastructure.

## 10. Logging, Diagnostics, and Error Observability

Design a proportionate production diagnostics strategy for this client-side Android application.

Inspect all console logging, error reporting, exception handling, and diagnostic utilities.

Implement or recommend improvements for:

- A consistent, structured logging interface.
- Appropriate severity levels: debug, info, warn, and error.
- Removal or suppression of noisy development logs in production.
- Useful contextual information for diagnosing failures.
- Global handling of unexpected JavaScript errors and unhandled promise rejections.
- React error boundaries around appropriate UI regions.
- Route-level and feature-level failure diagnostics.
- Safe logging of storage and validation failures.
- Native Android log inspection where available.
- Crash reporting integration only when justified and properly configured.
- User-friendly recovery messages for actionable failures.

### Requirements

- Never log passwords, tokens, secrets, complete user records, postcard content, or unnecessary personal information.
- Do not silently swallow unexpected exceptions.
- Do not expose internal stack traces or sensitive implementation details to end users.
- Avoid excessive logging that degrades performance or floods production diagnostics.
- Preserve useful diagnostic context without creating privacy problems.
- Do not add a paid service or a new telemetry provider without documenting the trade-offs and obtaining the required configuration.
- Keep diagnostic instrumentation lightweight and testable.

Distinguish recoverable errors from unexpected application failures. Ensure handled errors are not reported repeatedly as separate fatal incidents.

If remote crash reporting is appropriate, explain the implementation and privacy implications. If it cannot be configured in this environment, leave a clearly documented setup requirement rather than pretending it is active.

## 11. Performance and Resource Usage

Assess both the web application and the Android WebView experience.

Inspect:

- Initial load and time to interactive.
- JavaScript bundle size and unnecessary dependencies.
- Large route bundles and missing code splitting.
- Expensive React renders and repeated calculations.
- Long lists and unnecessarily large DOM trees.
- Image sizes, formats, and loading behavior.
- Unnecessary effects, subscriptions, timers, and listeners.
- Memory leaks and stale closures.
- Large synchronous localStorage operations.
- Expensive JSON parsing or repeated Zod validation.
- Unnecessary animations and main-thread work.
- Layout shifts and visual instability.
- Slow startup, app resume, and route transitions.
- Offline startup and locally available assets.
- Excessive network requests or analytics initialization.

Use measurable evidence where available. Establish baselines before introducing optimization changes.

Do not introduce caching, service workers, virtualization, or complex state libraries without a demonstrated need.

Avoid premature micro-optimizations and preserve correctness.

## 12. Accessibility and Internationalization

Review accessibility against WCAG 2.2 AA principles where applicable and Android usability conventions.

Check:

- Semantic HTML and appropriate accessible roles.
- Keyboard navigation and visible focus.
- Screen-reader labels for icon-only controls.
- Dialog focus management and focus restoration.
- Form labels and understandable validation messages.
- Contrast and non-color status indicators.
- Text resizing and dynamic font scaling.
- Touch targets and interaction alternatives.
- Reduced-motion preferences where relevant.
- Accessible loading, error, and success announcements.
- Image alternative text.
- Heading hierarchy and navigation landmarks.
- Long text, Unicode, and Indian-language rendering if supported.
- Date, number, and currency formatting where relevant.

Do not claim full WCAG conformance based solely on automated scans. Combine automated checks with manual keyboard and screen-reader testing where feasible.

Preserve existing language support and avoid introducing hard-coded text that breaks established localization patterns.

## 13. Testing Strategy

Improve the existing Vitest and Playwright test suites based on identified risk.

### Unit tests

Prioritize:

- Zod schemas and validation.
- Storage utilities and failure recovery.
- Migration logic.
- Progress calculations.
- Quiz scoring and completion.
- Postcard creation, editing, and deletion.
- Pure business logic.
- Input validation and formatting.
- Error handling and retry behavior.

### Component and integration tests

Test:

- Loading, empty, success, and error states.
- Form validation.
- User interactions.
- Navigation.
- State updates and persistence.
- Dialogs and keyboard behavior.
- Accessible names and focus behavior.

Use the project's existing component-testing approach or add the smallest appropriate dependency if a genuine gap requires it.

### Playwright end-to-end tests

Create or strengthen tests for:

- First launch and onboarding, if present.
- Main navigation and all major routes.
- Core exploration and discovery features.
- Search, filtering, and selection, if present.
- Quiz start, answer submission, scoring, and completion, if present.
- Progress persistence after reload.
- Postcard creation and retrieval, if present.
- Settings and theme switching, if present.
- Invalid or corrupted stored data.
- Offline or unavailable network behavior where applicable.
- Missing routes and error recovery.
- Browser console errors and failed requests.
- Responsive layouts and important interaction flows.

Only test features that actually exist. Map each test to a discovered requirement or defect.

Use deterministic fixtures and isolate tests from real user data and production services.

Avoid brittle selectors, arbitrary sleep calls, and tests dependent on uncontrolled network access.

### Android verification

Where Android tooling is available, verify:

- Successful installation and launch.
- Main navigation.
- App backgrounding and resuming.
- Android back navigation.
- Persistence after force-stop and relaunch.
- Keyboard and safe-area behavior.
- Network-loss recovery.
- App upgrade behavior when a previous version's data is available.
- Absence of critical native or WebView crashes.

Record any checks that require a physical device or emulator and cannot be completed here.

## 14. Content and Product Completeness

Audit the app as a real India Explorer product, not just a software package.

Inspect:

- Missing or duplicated content.
- Broken images and invalid asset references.
- Inconsistent destination, region, state, and city information.
- Incorrect internal navigation between related content.
- Empty collections that should contain content.
- Placeholder copy, TODO markers, demo-only data, and unfinished screens.
- Quiz questions with missing answers or invalid scoring logic.
- Incorrect progress calculations.
- Postcard or saved-item features that lose their data.
- Inconsistent naming and labels.
- Misleading feature descriptions.
- Unclear permissions or privacy explanations.
- Dead-end user journeys.

Validate factual claims about Indian destinations, culture, history, and travel only where appropriate evidence is available. Do not silently rewrite factual content without verification.

Distinguish verified defects from editorial suggestions.

## 15. Resilience and Failure Injection

Test failure conditions deliberately and safely.

Include:

- localStorage read and write failures.
- Malformed persisted JSON.
- Invalid schema versions.
- Missing assets and failed image loads.
- Rejected asynchronous operations.
- Unavailable Firebase services, if used.
- Slow or interrupted network connections.
- Rapid repeated taps.
- Empty, oversized, or malformed input.
- Navigation during loading.
- App backgrounding during an operation.
- Unexpected route parameters.
- Missing environment variables.
- Production build misconfiguration.

Verify that the application either recovers correctly or presents an understandable, non-destructive failure state.

Never simulate a successful operation when the underlying action failed.

Do not delete real user data or change production Firebase data during testing.

## 16. Release Configuration and Google Play Readiness

Inspect the release checklist for:

- Correct application identity and versioning.
- Production build and signing configuration.
- Android App Bundle generation.
- Debug-only features and logging.
- Permissions justified by actual functionality.
- App icon, splash screen, and launch experience.
- Privacy policy requirements and an accurate data safety declaration.
- Analytics and crash-reporting disclosures, if applicable.
- App content rating and applicable Play Console declarations.
- Store listing assets and screenshots.
- Supported Android versions and device compatibility.
- Deep links and external navigation behavior.
- Offline and first-launch behavior.
- Play Console testing tracks and staged rollout preparation.
- Current target API and policy requirements.

Separate repository-verifiable checks from tasks that require Play Console access, release credentials, legal review, or manual product decisions.

Do not claim that an app is approved by Google Play or fully compliant with a current policy unless that has actually been verified.

## 17. Prioritize Defects

Classify findings using these levels:

- **P0 — Release blocker / critical.** Examples: exposed private credentials, severe security vulnerability, widespread crash, destructive data loss, or a core feature that makes the app unusable.
- **P1 — High.** Examples: major navigation failure, broken core functionality, persistent progress loss, release build failure, severe accessibility barrier, or serious privacy issue.
- **P2 — Medium.** Examples: intermittent feature defects, significant visual issues, poor recovery behavior, moderate performance problems, or important missing tests.
- **P3 — Low.** Examples: minor polish issues, non-critical inconsistencies, low-impact warnings, or optional improvements.

For every finding, include:

- Unique ID.
- Severity.
- Affected route, component, or file.
- Concrete reproduction steps.
- Expected behavior.
- Actual behavior.
- Evidence from source code, test output, logs, or screenshots.
- User impact.
- Root cause.
- Proposed fix.
- Regression test.
- Status: confirmed, fixed, blocked, or not reproduced.

Do not inflate severity. Do not report hypothetical issues as confirmed defects.

## 18. Fix Strategy

After completing the initial audit and baseline:

1. Fix verified P0 and P1 defects first.
2. Fix high-confidence P2 defects that can be resolved safely.
3. Address P3 issues when the changes are small and low-risk.
4. Add regression tests for every important fix.
5. Preserve existing working behavior and design.
6. Re-run the relevant tests after each logical batch of changes.
7. Re-run the complete applicable verification suite at the end.
8. Review the final diff for accidental changes, regressions, secrets, generated files, and unnecessary refactors.

Make changes directly in the repository when permissions and tools allow.

Do not stop after generating a list of recommendations if verified defects can safely be fixed.

Do not attempt a large rewrite in one pass. Work in small, logically grouped changes.

If a fix requires an unavailable credential, an external service, a product decision, or a potentially destructive migration, document the blocker and provide a precise next step rather than guessing.

## 19. Final Verification

After the fixes, run the applicable checks again:

- TypeScript.
- Linting.
- Unit tests.
- Component/integration tests, if configured.
- Playwright end-to-end tests.
- Production web build.
- Production smoke test.
- Dependency audit.
- Capacitor synchronization.
- Android release build.
- Relevant accessibility checks.
- Relevant performance checks.
- Diff and secret review.

Compare the final results against the baseline.

Report failures honestly. A pre-existing failure is not automatically a regression, and a passing build is not proof that the application is production-ready.

Verify that generated release artifacts are real and identify their actual output locations. Do not claim that an APK or AAB was created unless the build produced it.

## 20. Required Deliverables

Create a `docs/production-readiness/` directory if one does not already exist, and maintain the following audit documents without overwriting unrelated existing documentation:

### A. `AUDIT_REPORT.md`

- Executive summary.
- Actual architecture discovered.
- Scope and limitations.
- Baseline and final verification results.
- Confirmed defects and severity.
- Fixes implemented.
- Remaining issues and blockers.
- Evidence and reproduction steps.
- Final release recommendation.

### B. `FEATURE_MATRIX.md`

List all discovered routes and major features, expected behavior, test coverage, results, and unresolved issues.

### C. `SECURITY_PRIVACY_AUDIT.md`

Document the security findings, Firebase usage, data handling, logging risks, dependency concerns, privacy considerations, and unresolved items. Do not include secrets or personal data.

### D. `ANDROID_RELEASE_CHECKLIST.md`

Document Capacitor and Gradle compatibility, app identity, permissions, signing requirements, release artifact verification, device checks, and outstanding Google Play tasks.

### E. `TEST_PLAN.md`

Document unit, integration, end-to-end, resilience, accessibility, and Android test coverage, including commands and known limitations.

### F. `PRODUCTION_OPERATIONS.md`

Document the logging strategy, diagnostic procedures, crash investigation steps, privacy-safe troubleshooting, and any manual monitoring setup required.

### G. `RELEASE_CHECKLIST.md`

Provide a concise, actionable go/no-go checklist with each item marked as:

- **PASS** — verified.
- **FAIL** — verified defect.
- **BLOCKED** — requires unavailable access, credentials, tooling, or a decision.
- **NOT TESTED** — not yet verified.
- **NOT APPLICABLE** — supported by evidence.

Do not mark an item PASS based on assumption.

## 21. Final Response Format

At completion, summarize:

- Overall release status: READY, READY WITH CAVEATS, or NOT READY.
- Number of confirmed findings by severity.
- Number of defects fixed.
- Remaining P0/P1 blockers.
- TypeScript, lint, unit, and Playwright results.
- Production web build status.
- Android APK/AAB build status and actual artifact paths, if generated.
- Security, privacy, logging, and accessibility findings.
- Tests that could not be run and why.
- The exact remaining actions required before release.

Use evidence, not confidence or optimism, to determine the release status.

**Final rule:** Do not declare India Explorer ready for public release while any confirmed P0 or P1 issue remains unresolved, any critical release check is unverified, or any important data-loss or security risk remains unexplained. Clearly distinguish a repository audit from full real-device and Google Play release validation.

Begin by inspecting the repository, creating the baseline, and building the route/feature inventory. Then execute the audit systematically and fix verified defects.

---

## How to Run This in Kiro Effectively

Don't rely on a single huge execution to do everything perfectly. Use the main prompt first, then work through these stages.

**Phase 1 — Audit and baseline.** Ask Kiro to inspect the project, map every feature, run existing checks, and produce the initial reports. Make sure it identifies real files and real test results before editing large parts of the application.

**Phase 2 — Fix and harden.** Have Kiro fix P0/P1 issues first, then data persistence, navigation, UI defects, accessibility, logging, and performance. Require regression tests for each important fix.

**Phase 3 — Android validation.** Have Kiro verify Capacitor synchronization, Gradle configuration, release builds, permissions, app lifecycle, and signing configuration. Install the build on an emulator or physical Android device for checks that cannot be verified from source code alone.

**Phase 4 — Final go/no-go.** Require a fresh run of all applicable checks, review the final Git diff, inspect the release artifact, and read `docs/production-readiness/RELEASE_CHECKLIST.md`. Don't release just because Kiro says everything looks good.

### Three things to watch especially closely

1. **Local data is not automatically backed up.** Since progress, quizzes, and postcards are stored on-device, verify migration safety and data-loss recovery carefully. Firebase configuration alone does not provide synchronization or backups.
2. **A successful web build is not a successful Android release.** Test the actual Capacitor app, Android lifecycle, WebView behavior, keyboard, safe areas, and persistent data on a device.
3. **Logging must be useful without exposing private information.** Add error diagnostics and crash reporting where justified, but don't log full user records or introduce a new paid monitoring service without a reason.

**One final recommendation:** run this audit against a clean Git branch or a committed checkpoint. That gives you a safe way to inspect Kiro's changes, compare results, and roll back a problematic fix before publishing.

The goal is not simply to get a green build. It is to have evidence that the app's real features work, user data survives normal use, serious failure modes are handled, and the Android release is genuinely ready for users.
