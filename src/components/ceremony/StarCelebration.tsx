import { useEffect, useState, useRef } from "react";
import { EMOJI } from "@/constants/emoji";
import { hasFeatureConsent } from "@/lib/parental-consent";
import { fxCorrect, fxConfetti } from "@/lib/fx";

interface StarCelebrationProps {
  stars: number; // 1-3
  elapsedMs: number;
  prefersReducedMotion: boolean;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  startTime: number;
}

export function StarCelebration({
  stars,
  elapsedMs,
  prefersReducedMotion,
}: StarCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleCounterRef = useRef(0);
  const lastParticleTimeRef = useRef(-1);

  // Generate particles for a star pop
  const generateParticles = () => {
    const particleCount = 25;
    const colors = ["#FFD700", "#FF9933", "#FFFFFF"];
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 40;

      newParticles.push({
        id: particleCounterRef.current++,
        angle,
        distance,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 4,
        startTime: elapsedMs,
      });
    }

    return newParticles;
  };

  // Trigger particles when stars pop
  useEffect(() => {
    if (prefersReducedMotion) return;

    let shouldAddParticles = false;
    let soundIndex = -1;

    // Star 1 pop at 200ms
    if (elapsedMs >= 200 && elapsedMs < 600 && lastParticleTimeRef.current < 200) {
      shouldAddParticles = true;
      soundIndex = 0;
      lastParticleTimeRef.current = 200;
    }

    // Star 2 pop at 900ms
    if (elapsedMs >= 900 && elapsedMs < 1300 && lastParticleTimeRef.current < 900) {
      shouldAddParticles = true;
      soundIndex = 1;
      lastParticleTimeRef.current = 900;
    }

    // Star 3 pop at 1600ms
    if (elapsedMs >= 1600 && elapsedMs < 2000 && lastParticleTimeRef.current < 1600) {
      shouldAddParticles = true;
      soundIndex = 2;
      lastParticleTimeRef.current = 1600;
    }

    if (shouldAddParticles) {
      const newParticles = generateParticles();
      setParticles((prev) => [...prev, ...newParticles]);

      if (hasFeatureConsent("audio")) {
        if (soundIndex === 2) {
          fxConfetti();
        } else {
          fxCorrect();
        }
      }
    }

    // Cleanup old particles (remove after they fade out - 600ms)
    setParticles((prev) =>
      prev.filter((p) => elapsedMs - p.startTime < 600)
    );
  }, [elapsedMs, prefersReducedMotion]);

  // Calculate animation progress for each star
  const getStarProgress = (startMs: number) => {
    if (prefersReducedMotion) return 1;
    const progress = Math.max(0, Math.min(1, (elapsedMs - startMs) / 400));
    return progress;
  };

  const star1Progress = getStarProgress(200);
  const star2Progress = getStarProgress(900);
  const star3Progress = getStarProgress(1600);

  const showStar1 = star1Progress > 0;
  const showStar2 = star2Progress > 0;
  const showStar3 = star3Progress > 0;
  const showUnfilled = elapsedMs >= 1800;

  // Bounce easing: scale overshoots to 1.3 then settles to 1.0
  const bounceScale = (progress: number) => {
    const bounce = Math.sin(progress * Math.PI) * 0.3;
    return 0.5 + progress * 0.5 + bounce;
  };

  // Rotation: full 360 degrees during pop
  const rotation = (progress: number) => progress * 360;

  // Opacity ease-in
  const opacity = (progress: number) => Math.pow(progress, 0.5);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 relative w-full">
      {/* Particle effects layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => {
          const elapsed = elapsedMs - p.startTime;
          const traveled = Math.min(1, elapsed / 600); // Travel over 600ms
          const px = Math.cos(p.angle) * p.distance * traveled;
          const py = Math.sin(p.angle) * p.distance * traveled;

          return (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`,
                width: p.size,
                height: p.size,
                background: p.color,
                opacity: Math.max(0, 1 - traveled),
              }}
            />
          );
        })}
      </div>

      {/* Stars container - center aligned, responsive sizing */}
      <div className="flex justify-center items-center gap-8 relative z-10 w-full px-4">
        {/* Star 1 */}
        {showStar1 && (
          <div
            style={{
              transform: `scale(${bounceScale(star1Progress)}) rotate(${rotation(star1Progress)}deg)`,
              opacity: opacity(star1Progress),
              filter: `drop-shadow(0 0 ${Math.max(0, 20 * opacity(star1Progress))}px rgba(255, 215, 0, 0.6))`,
            }}
          >
            <div className="text-7xl leading-none" aria-label="Star 1 earned">
              {stars >= 1 ? EMOJI.action.star : EMOJI.action.emptyStar}
            </div>
          </div>
        )}

        {/* Star 2 */}
        {showStar2 && (
          <div
            style={{
              transform: `scale(${bounceScale(star2Progress)}) rotate(${rotation(star2Progress)}deg)`,
              opacity: opacity(star2Progress),
              filter: `drop-shadow(0 0 ${Math.max(0, 20 * opacity(star2Progress))}px rgba(255, 215, 0, 0.6))`,
            }}
          >
            <div className="text-7xl leading-none" aria-label="Star 2 earned">
              {stars >= 2 ? EMOJI.action.star : EMOJI.action.emptyStar}
            </div>
          </div>
        )}

        {/* Star 3 */}
        {showStar3 && (
          <div
            style={{
              transform: `scale(${bounceScale(star3Progress)}) rotate(${rotation(star3Progress)}deg)`,
              opacity: opacity(star3Progress),
              filter: `drop-shadow(0 0 ${Math.max(0, 20 * opacity(star3Progress))}px rgba(255, 215, 0, 0.6))`,
            }}
          >
            <div className="text-7xl leading-none" aria-label="Star 3 earned">
              {stars >= 3 ? EMOJI.action.star : EMOJI.action.emptyStar}
            </div>
          </div>
        )}
      </div>

      {/* Result text */}
      {elapsedMs >= 2000 && (
        <div
          className="text-center space-y-2 transition-all"
          style={{
            opacity: Math.min(1, (elapsedMs - 2000) / 300),
          }}
        >
          <p className="text-body text-ink/70 text-sm">
            {stars === 3
              ? "Perfect! You mastered this quiz."
              : stars === 2
                ? "Great job! Play again for more stars."
                : "Good start! Play again for more stars."}
          </p>
        </div>
      )}
    </div>
  );
}

