import { Navigate, Link, useNavigate } from "@tanstack/react-router";
import {
  useProgress,
  levelInfo,
  statesWithProgress,
  cardsDone,
  completedCategoriesCount,
  getLevelName,
} from "@/lib/progress";
import { learningCardsFor } from "@/components/screens";
import { getUpNext } from "@/lib/passport-helpers";
import { STATE_ART } from "@/lib/state-art";
import { fxTap } from "@/lib/fx";
import { KidsButton } from "./KidsButton";

// Background Assets
import screenBg from "@/assets/home/background/screen-bg.png";

// Icon Assets
import streakBadge from "@/assets/home/streak_badge.png";
import mapIcon from "@/assets/home/map_icon.png";
import indiaFlag from "@/assets/home/india_flag.png";

// Navigation Icons
import navHomeIcon from "@/assets/home/nav_home_icon.png";
import navJourneyIcon from "@/assets/home/nav_journey_icon.png";
import navExplorerIcon from "@/assets/home/nav_explorer_icon.png";
import navBadgesIcon from "@/assets/home/nav_badges_icon.png";
import navMeIcon from "@/assets/home/nav_me_icon.png";
import { EMOJI } from "@/constants/emoji";

const TOTAL_STATES = 36;

export function HomeScreen() {
  const p = useProgress();
  const navigate = useNavigate();

  if (!p.onboarded) {
    return <Navigate to="/welcome" replace />;
  }

  const { level } = levelInfo(p.xp);
  const journey = statesWithProgress(p);

  // Prefer last played state if it exists and is not completed
  let current = null;
  if (p.lastPlayedState) {
    current = journey.find((s) => s.name === p.lastPlayedState);
    // If last played is completed, fallback to first uncompleted
    if (current?.status === "done") {
      current = null;
    }
  }
  // Fallback: first uncompleted or last state
  if (!current) {
    current = journey.find((s) => s.status !== "done") ?? journey[journey.length - 1];
  }

  const allCards = learningCardsFor(current.name, "en", p.ageBand);
  const currentDone = completedCategoriesCount(p, current.name, allCards);

  const nextStates = getUpNext(current.name, journey, 2);

  const handlePlayClick = () => {
    fxTap();
    navigate({ to: `/state/${current.name}` });
  };

  const handleStateClick = (name: string) => {
    fxTap();
    navigate({ to: `/state/${name}` });
  };

  const handleTabClick = (tab: string) => {
    fxTap();
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-muted-light"
      style={{ backgroundImage: `url(${screenBg})`, backgroundSize: "cover" }}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-safe pb-safe">
        {/* HEADER SECTION - Orange gradient with character */}
        <div
          className="flex-shrink-0 bg-header px-(--padding-lg) pt-6 pb-8 rounded-b-3xl"
          style={{ color: "var(--text-on-header)" }}
        >
          {/* Top Row: Character + Streak & Coins */}
          <div className="flex items-start justify-between mb-(--space-2)">
            {/* Left: Character Avatar Circle */}
            <div className="w-16 h-16 bg-surface-card rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
              {p.avatar ? (
                <div className="w-14 h-14 text-2xl">{p.avatar}</div>
              ) : (
                <div className="w-14 h-14 bg-accent-2-soft rounded-full flex items-center justify-center text-2xl">
                  👧
                </div>
              )}
            </div>

            {/* Right: Streak + Coins */}
            <div className="flex items-center gap-(--gap-base)">
              <div className="bg-surface-card/80 rounded-full w-12 h-12 flex items-center justify-center shadow-md text-lg">
                {EMOJI.action.fire}
              </div>
              <div className="bg-surface-card/80 rounded-full w-12 h-12 flex items-center justify-center shadow-md text-lg">
                {EMOJI.quiz.question}
              </div>
            </div>
          </div>

          {/* Greeting + Level */}
          <div>
            <h1 className="text-h2" style={{ color: "var(--text-on-header)" }}>
              Namaste, Explorer! 👋
            </h1>
            <p className="text-body-sm font-semibold" style={{ color: "var(--text-on-header)" }}>
              Level {level} • {getLevelName(level)} • v3.0
            </p>
          </div>
        </div>

        {/* STATS CARDS ROW */}
        <div className="px-(--padding-md) pt-(--space-4) pb-(--space-1) flex gap-(--gap-base)">
          {/* States Card */}
          <div className="flex-1 bg-surface-card rounded-2xl shadow-sm p-(--padding-base) text-center">
            <div className="text-2xl mb-1">{EMOJI.nav.map}</div>
            <div className="text-h5" style={{ color: "var(--text-primary)" }}>
              {p.completed.length}
            </div>
            <div className="text-caption font-semibold" style={{ color: "var(--text-secondary)" }}>
              States
            </div>
          </div>

          {/* Badges Card */}
          <div className="flex-1 bg-surface-card rounded-2xl shadow-sm p-(--padding-base) text-center">
            <div className="text-2xl mb-1">{EMOJI.milestone.hundred}</div>
            <div className="text-h5" style={{ color: "var(--text-primary)" }}>
              0
            </div>
            <div className="text-caption font-semibold" style={{ color: "var(--text-secondary)" }}>
              Badges
            </div>
          </div>

          {/* Stamps Card */}
          <div className="flex-1 bg-surface-card rounded-2xl shadow-sm p-(--padding-base) text-center">
            <div className="text-2xl mb-1">{EMOJI.action.stamp}</div>
            <div className="text-h5" style={{ color: "var(--text-primary)" }}>
              0
            </div>
            <div className="text-caption font-semibold" style={{ color: "var(--text-secondary)" }}>
              Stamps
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="px-(--padding-md) py-(--space-4) space-y-(--space-5)">
          {/* CONTINUE YOUR JOURNEY */}
          <div>
            <h2 className="text-h3 mb-(--space-2)" style={{ color: "var(--text-primary)" }}>
              Continue your journey
            </h2>

            {/* Current State Card with IMAGE */}
            <div className="bg-surface-card rounded-2xl shadow-sm p-(--padding-md) flex items-center gap-(--gap-loose)">
              {/* Left: STATE IMAGE */}
              <div
                className="w-20 h-20 rounded-2xl flex-shrink-0"
                style={{
                  backgroundImage: STATE_ART[current.name]
                    ? `url(${STATE_ART[current.name]})`
                    : undefined,
                  backgroundColor: STATE_ART[current.name] ? undefined : "var(--surface-muted)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* CENTER: STATE INFO */}
              <div className="flex-1 min-w-0">
                <div className="text-caption font-semibold text-accent-1 uppercase">
                  Currently Exploring
                </div>
                <h3 className="text-h4" style={{ color: "var(--text-primary)" }}>
                  {current.name}
                </h3>
                <div className="mt-(--space-1) h-1.5 bg-progress-track rounded-full overflow-hidden">
                  <div
                    className="h-full bg-progress-fill transition-all duration-300"
                    style={{ width: `${(currentDone / 6) * 100}%` }}
                  />
                </div>
                <div
                  className="text-caption font-semibold mt-(--space-0-5)"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {currentDone}/6
                </div>
              </div>

              {/* RIGHT: PLAY BUTTON */}
              <KidsButton variant="primary" size="md" onClick={handlePlayClick}>
                Play →
              </KidsButton>
            </div>
          </div>

          {/* UP NEXT - STATE CARDS */}
          <div>
            <div className="flex items-center justify-between mb-(--space-2)">
              <h2 className="text-h3" style={{ color: "var(--text-primary)" }}>
                Up next
              </h2>
              <Link
                to="/journey"
                onClick={() => fxTap()}
                className="text-body-sm font-bold"
                style={{ color: "var(--text-link)" }}
              >
                View all
              </Link>
            </div>

            {/* Next States Grid */}
            <div className="grid grid-cols-2 gap-(--gap-base)">
              {nextStates.map((state) => (
                <button
                  key={state.name}
                  onClick={() => handleStateClick(state.name)}
                  className="bg-surface-card rounded-2xl shadow-sm p-(--padding-md) text-center"
                >
                  {/* State Image */}
                  <div
                    className="w-full h-24 rounded-lg mb-(--space-1)"
                    style={{
                      backgroundImage: STATE_ART[state.name]
                        ? `url(${STATE_ART[state.name]})`
                        : undefined,
                      backgroundColor: STATE_ART[state.name] ? undefined : "var(--surface-sunken)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <h3 className="text-h5 mb-(--space-1)" style={{ color: "var(--text-primary)" }}>
                    {state.name}
                  </h3>
                  <div className="text-body-sm font-bold" style={{ color: "var(--text-link)" }}>
                    ✌️ Open
                  </div>
                  <div
                    className="text-caption font-semibold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Start exploring
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Spacing for bottom nav */}
          <div className="h-(--space-1)" />
        </div>
      </div>

      {/* BOTTOM NAVIGATION - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card shadow-2xl rounded-t-3xl border-t border-border-color">
        <div className="flex items-center justify-around py-(--padding-base) px-safe">
          <Link
            to="/home"
            onClick={() => fxTap()}
            className="flex flex-col items-center gap-1 py-(--padding-base) px-(--padding-md) rounded-2xl bg-accent-1-soft"
          >
            <img src={navHomeIcon} alt="home" className="w-6 h-6" />
            <span className="text-label text-accent-1">Home</span>
          </Link>

          <Link
            to="/journey"
            onClick={() => fxTap()}
            className="flex flex-col items-center gap-1 py-(--padding-base) px-(--padding-md)"
          >
            <img src={navJourneyIcon} alt="journey" className="w-6 h-6" />
            <span className="text-label" style={{ color: "var(--text-primary)" }}>
              Journey
            </span>
          </Link>

          <Link
            to="/explorer"
            onClick={() => fxTap()}
            className="flex flex-col items-center gap-1 py-(--padding-base) px-(--padding-md)"
          >
            <img src={navExplorerIcon} alt="explorer" className="w-6 h-6" />
            <span className="text-label" style={{ color: "var(--text-primary)" }}>
              Explorer
            </span>
          </Link>

          <Link
            to="/badges"
            onClick={() => fxTap()}
            className="flex flex-col items-center gap-1 py-(--padding-base) px-(--padding-md)"
          >
            <img src={navBadgesIcon} alt="badges" className="w-6 h-6" />
            <span className="text-label" style={{ color: "var(--text-primary)" }}>
              Badges
            </span>
          </Link>

          <Link
            to="/me"
            onClick={() => fxTap()}
            className="flex flex-col items-center gap-1 py-(--padding-base) px-(--padding-md)"
          >
            <img src={navMeIcon} alt="me" className="w-6 h-6" />
            <span className="text-label" style={{ color: "var(--text-primary)" }}>
              Me
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
