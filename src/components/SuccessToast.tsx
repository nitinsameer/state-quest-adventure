import { useEffect, useState } from "react";
import { useToastStore } from "@/store/toastStore";
import { playSuccessChime } from "@/lib/tone-generator";

/**
 * Success Toast Component
 * Displays at the bottom of the screen with bounce animation, emoji particles, and sound
 * Renders only when a success toast is active in the toast store
 */
export function SuccessToast() {
  const current = useToastStore((state) => state.current);
  const dismiss = useToastStore((state) => state.dismiss);
  const [isExiting, setIsExiting] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Show only when current is a success toast
  const isSuccessToast = current?.type === "success";
  const isVisible = isSuccessToast && !isExiting;

  // Play sound and schedule pulse animation on mount
  useEffect(() => {
    if (!isSuccessToast || hasPlayedSound) return;

    // Play chime sound on entrance
    playSuccessChime();
    setHasPlayedSound(true);
  }, [isSuccessToast, hasPlayedSound]);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!isSuccessToast || isExiting) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, current?.duration ?? 2500);

    return () => clearTimeout(timer);
  }, [isSuccessToast, isExiting, current?.duration]);

  // Reset sound flag and exiting state when toast changes
  useEffect(() => {
    if (!isSuccessToast) {
      setHasPlayedSound(false);
      setIsExiting(false);
    }
  }, [current?.id]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      dismiss();
    }, 350); // Match animation duration
  };

  if (!isVisible) return null;

  // Emoji particles for celebration
  const emojiList = ["🎉", "⭐", "✨", "🎊", "🎈", "🌟", "💫", "🏆", "🎯", "🥳", "🌈", "💥", "🎆", "🎇"];

  // Deterministic positioning based on index (no Math.random for hydration safety)
  const particles = emojiList.map((emoji, index) => {
    const angle = (index / emojiList.length) * Math.PI * 2;
    const distance = 50;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const delay = (index % 4) * 0.05;

    return (
      <div
        key={index}
        className="absolute text-xl pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          animation: shouldReduceMotion
            ? "none"
            : `toast-emoji-particle 1.2s ease-out forwards`,
          animationDelay: `${delay}s`,
        }}
      >
        {emoji}
      </div>
    );
  });

  return (
    <div
      className="fixed inset-x-0 z-50 pointer-events-none"
      style={{
        bottom: "calc(var(--nav-h, 80px) + 20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "12px",
        paddingRight: "12px",
        pointerEvents: "none", // Non-blocking - allows clicks through
      }}
    >
      {/* Particle container - absolutely positioned relative to toast */}
      <div
        className="relative"
        style={{
          width: "100%",
          maxWidth: "360px",
        }}
      >
        {/* Particles layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            inset: "-40px",
            overflow: "visible",
          }}
        >
          {particles}
        </div>

        {/* Toast card */}
        <div
          className={`relative bg-surface-card rounded-3xl p-4 flex items-center gap-3 shadow-lg border-2 flex-nowrap w-full ${
            isExiting ? "toast-bounce-down" : "toast-bounce-up"
          }`}
          style={{
            backgroundColor: "var(--success-soft, var(--accent-3-soft))",
            borderColor: "var(--success, var(--accent-3))",
            color: "var(--success, var(--accent-3))",
            minHeight: "56px",
          }}
          role="status"
          aria-live="polite"
          aria-label={current?.message}
        >
          {/* Checkmark icon with pulse */}
          <div
            className="flex-shrink-0 text-3xl font-bold toast-icon-pulse"
            style={{
              animation: shouldReduceMotion ? "none" : "toast-icon-pulse 400ms ease-out forwards",
              animationDelay: "100ms",
            }}
          >
            {current?.icon ?? "✓"}
          </div>

          {/* Message text */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight drop-shadow">
              {current?.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
