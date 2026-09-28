// Profile screen and related components

import { useGoBack, BottomNav, HeaderBar, getAvatarImage, getAvatarName } from "./shared";
import { useProgress, levelInfo, resetProgress } from "@/lib/progress";
import { useState, ReactNode } from "react";
import { fxTap, useSoundOn, setSoundOn } from "@/lib/fx";
import { Link } from "@tanstack/react-router";

export function ProfileScreen() {
  const p = useProgress();
  const goBack = useGoBack();
  const { level } = levelInfo(p.xp);
  const soundOn = useSoundOn();
  const [showReset, setShowReset] = useState(false);

  const handleReset = () => {
    if (confirm("Are you sure? This will reset all your progress!")) {
      fxTap();
      resetProgress();
      window.location.href = "/welcome";
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title="Profile" onBack={false} />
      
      <div className="flex-1 overflow-auto px-6 py-6 pb-24">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-saffron mx-auto mb-4 overflow-hidden flex items-center justify-center bg-saffron-soft">
            <img src={getAvatarImage(p.avatar)} alt={getAvatarName(p.avatar)} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-display text-2xl font-extrabold">{p.name}</h2>
          <div className="text-sm text-muted-foreground mt-2">
            Level {level} • Explorer
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <ProfileStat icon="⭐" label="Experience Points" value={p.xp.toLocaleString()} />
          <ProfileStat icon="🔥" label="Consecutive Days" value={p.streak.toString()} />
          <ProfileStat icon="✓" label="States Completed" value={p.completed.length.toString()} />
          <ProfileStat icon="🎫" label="Stamps Collected" value={Object.keys(p.postcards).length.toString()} />
        </div>

        {/* Settings */}
        <div className="mb-6 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Settings
          </div>
          
          <SoundToggleRow
            enabled={soundOn}
            onChange={(enabled) => setSoundOn(enabled)}
          />
          
          <RowLink to="/profile/edit" label="Change Avatar" icon="🎨" />
          <RowLink to="/profile/language" label="Language" icon="🌐" />
          <RowLink to="/profile/parental" label="Parental Controls" icon="👨‍👩‍👧" />
        </div>

        {/* About */}
        <div className="mb-6 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            About
          </div>
          
          <RowLink to="/privacy" label="Privacy Policy" icon="📋" />
          <RowLink to="/terms" label="Terms of Service" icon="📖" />
          <RowLink to="/about" label="About India Explorer" icon="ℹ️" />
        </div>

        {/* Danger Zone */}
        <div className="mb-6 space-y-2">
          <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">
            Danger Zone
          </div>
          
          <button
            onClick={() => {
              fxTap();
              handleReset();
            }}
            className="w-full px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold hover:bg-red-100 transition"
          >
            Reset Progress
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>India Explorer v1.0</p>
          <p className="mt-1">Made with ❤️ for curious minds</p>
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

export function SoundToggleRow({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      onClick={() => {
        fxTap();
        onChange(!enabled);
      }}
      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{enabled ? "🔊" : "🔇"}</span>
        <span className="text-sm font-bold">Sound Effects</span>
      </div>
      <div className={`h-6 w-10 rounded-full transition ${enabled ? "bg-green-500" : "bg-gray-400"}`}>
        <div
          className={`h-6 w-6 rounded-full bg-white transition transform ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

export function ProfileStat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-bold text-muted-foreground">{label}</span>
      </div>
      <span className="text-display font-extrabold text-saffron">{value}</span>
    </div>
  );
}

export function ParentZonePlaceholder() {
  return (
    <div className="rounded-2xl bg-purple-50 border-2 border-dashed border-purple-300 p-6 text-center">
      <div className="text-4xl mb-3">👨‍👩‍👧</div>
      <div className="font-extrabold text-purple-900">Parent Zone</div>
      <p className="text-sm text-purple-800 mt-2 max-w-sm">
        Configure parental controls and monitoring settings
      </p>
    </div>
  );
}

export function RowLink({
  icon,
  label,
  to,
}: {
  icon: string;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      onClick={() => fxTap()}
      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className="text-gray-400">›</span>
    </Link>
  );
}
