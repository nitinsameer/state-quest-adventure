import mascot from "@/assets/mascot.png";
import airplane from "@/assets/airplane.png";
import welcomeScreenImage from "@/assets/welcome.png";
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
import { AVATAR_CONFIG, type AvatarId } from "@/lib/avatar-config";
import { useRouter, useNavigate, Link } from "@tanstack/react-router";
import { fxTap } from "@/lib/fx";
import { ReactNode } from "react";

/**
 * Map avatar ID to imported image module
 * Used throughout app to display consistent avatar images
 */
export const AVATAR_IMAGE_MAP: Record<AvatarId, string> = {
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

/**
 * Get avatar image path for a given avatar ID
 * Returns the imported image module or default
 */
export function getAvatarImage(avatarId: string): string {
  if (!avatarId) return avatarExplorerHat;
  return AVATAR_IMAGE_MAP[avatarId as AvatarId] || avatarExplorerHat;
}

/**
 * Get avatar name for a given avatar ID
 * Returns the character name from config
 */
export function getAvatarName(avatarId: string): string {
  if (!avatarId) return "Explorer";
  return AVATAR_CONFIG[avatarId as AvatarId]?.name || "Explorer";
}

export function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className}>
      <g fill="#ffffff">
        <ellipse cx="30" cy="38" rx="24" ry="18" />
        <ellipse cx="58" cy="28" rx="28" ry="22" />
        <ellipse cx="88" cy="40" rx="22" ry="16" />
        <rect x="18" y="36" width="82" height="18" rx="9" />
      </g>
    </svg>
  );
}

export function XPBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="relative h-3 w-full rounded-full bg-black/10 overflow-hidden">
      <div
        className="h-full rounded-full gradient-gold"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-0 h-1 rounded-full bg-white/70"
        style={{ width: `${pct * 0.9}%`, left: "5%" }}
      />
    </div>
  );
}

export function Chip({
  icon,
  children,
  tone = "orange",
}: {
  icon: string;
  children: ReactNode;
  tone?: "orange" | "blue" | "green" | "gold";
}) {
  const map = {
    orange: "bg-saffron-soft text-saffron",
    blue: "bg-explorer-soft text-explorer",
    green: "bg-success-soft text-success",
    gold: "bg-gold-soft text-[color:var(--gold)]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${map[tone]}`}
    >
      <span>{icon}</span>
      {children}
    </span>
  );
}

export function BottomNav({
  active,
}: {
  active: "home" | "map" | "explorer" | "badges" | "profile";
}) {
  const items = [
    { id: "home", icon: "🏠", label: "Home", to: "/home" },
    { id: "map", icon: "🗺️", label: "Journey", to: "/journey" },
    { id: "explorer", icon: "🧭", label: "Explorer", to: "/explorer" },
    { id: "badges", icon: "🏆", label: "Badges", to: "/badges" },
    { id: "profile", icon: "👤", label: "Me", to: "/me" },
  ] as const;
  return (
    <div className="fixed bottom-0 inset-x-0 z-20">
      <div className="mx-3 mb-3 rounded-3xl bg-white shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18)] border border-black/5 px-2 py-2 flex items-center justify-between">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <Link
              key={i.id}
              to={i.to}
              onClick={() => fxTap()}
              aria-label={i.label}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition active:scale-95 ${
                on ? "bg-saffron-soft" : ""
              }`}
            >
              <span className="text-lg leading-none">{i.icon}</span>
              <span
                className={`text-xs font-bold ${
                  on ? "text-saffron" : "text-muted-foreground"
                }`}
              >
                {i.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Goes back in history, falling back to Home when there is nothing to pop. */
export function useGoBack(fallback = "/home") {
  const router = useRouter();
  const navigate = useNavigate();
  return () => {
    fxTap();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: fallback });
    }
  };
}

export function HeaderBar({
  title,
  onBack = true,
  right,
  tone = "white",
}: {
  title: string;
  onBack?: boolean;
  right?: ReactNode;
  tone?: "white" | "transparent";
}) {
  const goBack = useGoBack();
  return (
    <div
      className={`flex items-center justify-between px-5 pt-3 pb-2 ${
        tone === "white" ? "bg-white" : ""
      }`}
    >
      {onBack ? (
        <button
          onClick={goBack}
          aria-label="Go back"
          className="h-12 w-12 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
        >
          ←
        </button>
      ) : (
        <div className="w-10" />
      )}
      <h2 className="text-display text-lg font-extrabold">{title}</h2>
      <div className="w-10 flex justify-end">{right}</div>
    </div>
  );
}
