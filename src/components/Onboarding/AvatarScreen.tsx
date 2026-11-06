import { useState, useEffect, useRef } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { AVATAR_CONFIG, type AvatarId, getAvatarBackgroundColor } from "@/lib/avatar-config";
import { debugTracker } from "@/lib/debug-tracker";
import { EMOJI } from "@/constants/emoji";
import adventureBg from "@/assets/avatar_adventure_bg.png";
import avatarExplorerHat from "@/assets/avatars/avatar-explorer-hat.png";
import avatarExplorerPink from "@/assets/avatars/avatar-explorer-pink.png";
import avatarGeekGlasses from "@/assets/avatars/avatar-geek-glasses.png";
import avatarGirlPeace from "@/assets/avatars/avatar-girl-peace.png";
import avatarTurbanRed from "@/assets/avatars/avatar-turban-red.png";
import avatarGirlEarring from "@/assets/avatars/avatar-girl-earring.png";
import avatarBoySmi from "@/assets/avatars/avatar-boy-smile.png";
import avatarGirlTikka from "@/assets/avatars/avatar-girl-tikka.png";
import avatarSkiGoggles from "@/assets/avatars/avatar-ski-goggles.png";
import avatarFarmerHat from "@/assets/avatars/avatar-farmer-hat.png";
import avatarSportsCap from "@/assets/avatars/avatar-sports-cap.png";
import avatarGirlFlower from "@/assets/avatars/avatar-girl-flower.png";

const AVATAR_IMAGE_MAP: Record<AvatarId, string> = {
  "explorer-hat": avatarExplorerHat,
  "explorer-pink": avatarExplorerPink,
  "geek-glasses": avatarGeekGlasses,
  "girl-peace": avatarGirlPeace,
  "turban-red": avatarTurbanRed,
  "girl-earring": avatarGirlEarring,
  "boy-smile": avatarBoySmi,
  "girl-tikka": avatarGirlTikka,
  "ski-goggles": avatarSkiGoggles,
  "farmer-hat": avatarFarmerHat,
  "sports-cap": avatarSportsCap,
  "girl-flower": avatarGirlFlower,
};

const AVATAR_IDS: AvatarId[] = [
  "explorer-hat",
  "explorer-pink",
  "geek-glasses",
  "girl-peace",
  "turban-red",
  "girl-earring",
  "boy-smile",
  "girl-tikka",
  "ski-goggles",
  "farmer-hat",
  "sports-cap",
  "girl-flower",
];

function getAvatarName(avatarId: string): string {
  if (!avatarId) return "Explorer";
  return AVATAR_CONFIG[avatarId as AvatarId]?.name || "Explorer";
}

function getAvatarImage(avatarId: string): string {
  if (!avatarId) return avatarExplorerHat;
  return AVATAR_IMAGE_MAP[avatarId as AvatarId] || avatarExplorerHat;
}

export interface AvatarScreenProps {
  selectedAvatar: string | null;
  onSelectAvatar: (avatarId: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function AvatarScreen({ selectedAvatar, onSelectAvatar, onNext, onSkip }: AvatarScreenProps) {
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Debug: Log dimensions on mount and when refs update
  useEffect(() => {
    const logDimensions = () => {
      debugTracker.trackDimensions(
        'AvatarScreen',
        containerRef.current,
        headerRef.current,
        contentRef.current,
        footerRef.current
      );
    };

    // Log on mount
    logDimensions();

    // Log after a small delay to ensure layout is complete
    const timer = setTimeout(logDimensions, 500);

    // Log on resize
    window.addEventListener("resize", logDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", logDimensions);
    };
  }, []);

  // Set default avatar on mount
  useEffect(() => {
    if (!selectedAvatar) {
      onSelectAvatar("explorer-hat");
    }
  }, []);

  const handleAvatarSelect = (avatarId: AvatarId) => {
    // Play tap sound
    fxTap();

    // Play confetti and small animation
    fxConfetti();
    setConfettiBurst((n) => n + 1);

    // Trigger bounce animation
    setAnimatingId(avatarId);
    setTimeout(() => setAnimatingId(null), 400);

    // Update selected avatar
    onSelectAvatar(avatarId);
  };

  const handleNext = () => {
    if (!selectedAvatar) return;
    fxTap();
    onNext();
  };

  const handleSkipClick = () => {
    fxTap();
    onSkip();
  };

  return (
    <div className="w-full h-full flex flex-col select-none touch-none relative overflow-hidden justify-between" ref={containerRef}>
      {/* Background Image - Full Screen */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
        style={{ 
          backgroundImage: `url(${adventureBg})`,
          backgroundPosition: "center top"
        }}
      />

      {/* Subtle overlay for text readability at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent z-5" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent z-5" />

      <ConfettiBurst trigger={confettiBurst} size="small" />

      {/* Header Section - Fixed at Top */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-safe pb-2" ref={headerRef}>
        {/* Skip Button Row */}
        <div className="flex items-center justify-between mb-2">
          {/* Spacer for flex-between */}
          <div />

          {/* Skip Button - White Pill (Top Right) */}
          <button
            type="button"
            onClick={handleSkipClick}
            className="bg-white rounded-full px-3 py-1 shadow-md hover:shadow-lg active:scale-95 transition-all font-bold text-sm text-text-primary"
            aria-label="Skip onboarding"
          >
            Skip
          </button>
        </div>

        {/* Title Section - Premium Styling */}
        <div className="text-center">
          {/* Main Heading - "Pick Your" */}
          <div 
            className="text-2xl sm:text-3xl leading-tight font-black text-text-primary"
          >
            Pick Your
          </div>
          
          {/* Avatar Text with Golden Gradient - "Avatar" */}
          <div 
            className="text-4xl sm:text-6xl font-black leading-tight mt-0 mb-1 text-accent-4"
          >
            Avatar
          </div>

          {/* Subtitle */}
          <p 
            className="text-sm text-text-secondary font-semibold leading-snug"
          >
            Choose your explorer to start your adventure!
          </p>
        </div>
      </div>

      {/* Main Content Container - Scrollable Avatar Grid */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Avatar Grid Section */}
        <div className="flex-1 overflow-y-auto px-3 py-2" ref={contentRef}>
          {/* Avatar Grid - 3 Columns, compact spacing */}
          <div className="grid grid-cols-3 gap-0.5 mb-2">
            {AVATAR_IDS.map((avatarId) => (
              <button
                key={avatarId}
                type="button"
                onClick={() => handleAvatarSelect(avatarId)}
                className="relative aspect-square rounded-3xl overflow-hidden transition-all duration-300 flex items-center justify-center focus:outline-none active:scale-95"
                aria-label={`Select ${getAvatarName(avatarId)}`}
                style={{
                  backgroundColor: getAvatarBackgroundColor(avatarId),
                  boxShadow:
                    selectedAvatar === avatarId
                      ? "0 0 0 4px white, 0 0 0 6px var(--accent-4), 0 8px 16px rgba(0,0,0,0.2)"
                      : "0 4px 12px rgba(0,0,0,0.15)",
                  transform: selectedAvatar === avatarId ? "scale(1.02)" : "scale(1)",
                } as React.CSSProperties}
              >
                {/* Avatar Image */}
                <img
                  src={getAvatarImage(avatarId)}
                  alt={getAvatarName(avatarId)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Selected Checkmark Badge - Bottom Right */}
                {selectedAvatar === avatarId && (
                  <div
                    className="absolute bottom-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white"
                    style={{
                      animation: "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <span className="text-base font-black text-accent-5">
                      ✓
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Footer Section - Always Visible */}
      <div className="relative z-20 flex-shrink-0 px-5 py-2 bg-gradient-to-t from-bg-page via-bg-page to-transparent border-t border-border-color flex flex-col gap-2" ref={footerRef}>
        {/* Explorer Summary Card */}
        {selectedAvatar && (
          <div
            className="rounded-3xl p-3 shadow-md border-2 border-border-color bg-accent-4-soft pb-safe"
          >
            <div className="flex items-center gap-3">
              {/* Avatar Thumbnail */}
              <img
                src={getAvatarImage(selectedAvatar)}
                alt={getAvatarName(selectedAvatar)}
                className="w-14 h-14 rounded-2xl border-3 border-white shadow-md flex-shrink-0 object-cover"
              />

              {/* Explorer Info */}
              <div className="flex-1 min-w-0">
                <div 
                  className="text-xs font-black text-text-secondary tracking-wider"
                >
                  YOUR EXPLORER
                </div>
                <div 
                  className="text-lg font-black text-text-primary truncate"
                >
                  {getAvatarName(selectedAvatar)}
                </div>
              </div>

              {/* Compass Icon */}
              <div className="text-2xl flex-shrink-0">
                🧭
              </div>
            </div>
          </div>
        )}

        {/* Continue Button - Always Visible */}
        {selectedAvatar && (
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-2 px-6 rounded-full bg-accent-5 text-white font-bold text-base flex items-center justify-center gap-2 shadow-elevated-2 hover:shadow-elevated-3 active:scale-95 transition-all"
            aria-label="Continue to next step"
          >
            <span>Continue</span>
            <span className="text-lg">→</span>
          </button>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.6);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scale-in,
          .animate-fade-in-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
