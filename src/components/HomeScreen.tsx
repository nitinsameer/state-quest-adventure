import { Navigate, Link, useNavigate } from "@tanstack/react-router";
import { useProgress, levelInfo, statesWithProgress, cardsDone } from "@/lib/progress";
import { getUpNext } from "@/lib/passport-helpers";
import { STATE_ART } from "@/lib/state-art";
import { fxTap } from "@/lib/fx";

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
    current = journey.find(s => s.name === p.lastPlayedState);
    // If last played is completed, fallback to first uncompleted
    if (current?.status === "done") {
      current = null;
    }
  }
  // Fallback: first uncompleted or last state
  if (!current) {
    current = journey.find(s => s.status !== "done") ?? journey[journey.length - 1];
  }
  
  const currentDone = cardsDone(p, current.name);
  const nextStates = getUpNext(current.name, journey, 2);

  const handlePlayClick = () => {
    fxTap();
    navigate({ to: `/state/${current.slug}` });
  };

  const handleStateClick = (slug: string) => {
    fxTap();
    navigate({ to: `/state/${slug}` });
  };

  const handleTabClick = (tab: string) => {
    fxTap();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50" style={{ backgroundImage: `url(${screenBg})`, backgroundSize: "cover" }}>
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-safe pb-safe">
        
        {/* HEADER SECTION - Orange gradient with character */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-5 pt-6 pb-8 rounded-b-3xl text-white">
          {/* Top Row: Character + Streak & Coins */}
          <div className="flex items-start justify-between mb-4">
            {/* Left: Character Avatar Circle */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
              {p.avatar ? (
                <div className="w-14 h-14 text-2xl">{p.avatar}</div>
              ) : (
                <div className="w-14 h-14 bg-pink-200 rounded-full flex items-center justify-center text-2xl">👧</div>
              )}
            </div>

            {/* Right: Streak + Coins */}
            <div className="flex items-center gap-2">
              <div className="bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md text-lg">
                🔥
              </div>
              <div className="bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md text-lg">
                ❓
              </div>
            </div>
          </div>

          {/* Greeting + Level */}
          <div>
            <h1 className="text-h2 text-white">Namaste, Explorer! 👋</h1>
            <p className="text-body-sm font-semibold text-white/90">Level {level} • Explorer • v3.0</p>
          </div>
        </div>

        {/* STATS CARDS ROW */}
        <div className="px-4 pt-4 pb-2 flex gap-3">
          {/* States Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-3 text-center">
            <div className="text-2xl mb-1">🗺️</div>
            <div className="text-h5 text-blue-900">{p.completed.length}</div>
            <div className="text-caption font-semibold text-gray-600">States</div>
          </div>

          {/* Badges Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-3 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-h5 text-blue-900">0</div>
            <div className="text-caption font-semibold text-gray-600">Badges</div>
          </div>

          {/* Stamps Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-3 text-center">
            <div className="text-2xl mb-1">🎫</div>
            <div className="text-h5 text-blue-900">0</div>
            <div className="text-caption font-semibold text-gray-600">Stamps</div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="px-4 py-4 space-y-5">

          {/* CONTINUE YOUR JOURNEY */}
          <div>
            <h2 className="text-h3 text-gray-900 mb-3">Continue your journey</h2>

            {/* Current State Card with IMAGE */}
            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
              {/* Left: STATE IMAGE */}
              <div 
                className="w-20 h-20 rounded-2xl flex-shrink-0"
                style={{
                  backgroundImage: STATE_ART[current.name] ? `url(${STATE_ART[current.name]})` : undefined,
                  backgroundColor: STATE_ART[current.name] ? undefined : "#e5e7eb",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              />

              {/* CENTER: STATE INFO */}
              <div className="flex-1 min-w-0">
                <div className="text-caption font-semibold text-orange-600 uppercase">Currently Exploring</div>
                <h3 className="text-h4 text-gray-900">{current.name}</h3>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${(currentDone / 6) * 100}%` }} />
                </div>
                <div className="text-caption font-semibold text-gray-600 mt-1">{currentDone}/6</div>
              </div>

              {/* RIGHT: PLAY BUTTON */}
              <button 
                onClick={handlePlayClick}
                className="h-14 px-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full text-white font-bold text-sm shadow-md flex items-center justify-center flex-shrink-0"
              >
                Play →
              </button>
            </div>
          </div>

          {/* UP NEXT - STATE CARDS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-h3 text-gray-900">Up next</h2>
              <Link to="/journey" onClick={() => fxTap()} className="text-body-sm font-bold text-blue-600">
                View all
              </Link>
            </div>

            {/* Next States Grid */}
            <div className="grid grid-cols-2 gap-3">
              {nextStates.map((state) => (
                <button
                  key={state.slug}
                  onClick={() => handleStateClick(state.slug)}
                  className="bg-white rounded-2xl shadow-sm p-4 text-center"
                >
                  {/* State Image */}
                  <div 
                    className="w-full h-24 rounded-lg mb-2"
                    style={{
                      backgroundImage: STATE_ART[state.name] ? `url(${STATE_ART[state.name]})` : undefined,
                      backgroundColor: STATE_ART[state.name] ? undefined : "#e5e7eb",
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />
                  <h3 className="text-h5 text-gray-900 mb-2">{state.name}</h3>
                  <div className="text-body-sm font-bold text-blue-600">✌️ Open</div>
                  <div className="text-caption font-semibold text-gray-600">Start exploring</div>
                </button>
              ))}
            </div>
          </div>

          {/* Spacing for bottom nav */}
          <div className="h-4" />
        </div>
      </div>

      {/* BOTTOM NAVIGATION - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl rounded-t-3xl border-t border-gray-100">
        <div className="flex items-center justify-around py-3 px-safe">
          <Link to="/home" onClick={() => fxTap()} className="flex flex-col items-center gap-1 py-2 px-4 rounded-2xl bg-orange-50">
            <img src={navHomeIcon} alt="home" className="w-6 h-6" />
            <span className="text-label text-orange-600">Home</span>
          </Link>

          <Link to="/journey" onClick={() => fxTap()} className="flex flex-col items-center gap-1 py-2 px-4">
            <img src={navJourneyIcon} alt="journey" className="w-6 h-6" />
            <span className="text-label text-gray-900">Journey</span>
          </Link>

          <Link to="/explorer" onClick={() => fxTap()} className="flex flex-col items-center gap-1 py-2 px-4">
            <img src={navExplorerIcon} alt="explorer" className="w-6 h-6" />
            <span className="text-label text-gray-900">Explorer</span>
          </Link>

          <Link to="/badges" onClick={() => fxTap()} className="flex flex-col items-center gap-1 py-2 px-4">
            <img src={navBadgesIcon} alt="badges" className="w-6 h-6" />
            <span className="text-label text-gray-900">Badges</span>
          </Link>

          <Link to="/me" onClick={() => fxTap()} className="flex flex-col items-center gap-1 py-2 px-4">
            <img src={navMeIcon} alt="me" className="w-6 h-6" />
            <span className="text-label text-gray-900">Me</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
