import mascot from "@/assets/mascot.png";
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
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { AudioPermissionDialog } from "@/components/AudioPermissionDialog";
import { AVATAR_CONFIG, type AvatarId } from "@/lib/avatar-config";
import { useNavigate } from "@tanstack/react-router";
import { fxTap, fxConfetti } from "@/lib/fx";
import { useProgress, saveProfile } from "@/lib/progress";
import { useState } from "react";
import { Cloud, getAvatarImage, getAvatarName } from "./shared";

export function SplashScreen() {
  return (
    <div className="h-full w-full gradient-saffron relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
      <Cloud className="absolute top-16 left-4 w-24 opacity-80" />
      <Cloud className="absolute top-40 right-2 w-16 opacity-70" />
      <Cloud className="absolute bottom-40 left-6 w-20 opacity-60" />

      <img
        src={mascot}
        alt="India Explorer mascot"
        className="w-52 h-52 object-contain drop-shadow-2xl relative z-10"
      />
      <div className="mt-4 text-center relative z-10 px-8">
        <h1 className="text-display text-4xl font-extrabold text-white leading-relaxed">
          India
          <br />
          Explorer
        </h1>
        <p className="mt-3 text-white/95 font-bold">
          Travel Across India,
          <br /> One State at a Time
        </p>
      </div>
      <div className="absolute bottom-20 flex items-center gap-2 text-white/90 text-sm font-bold">
        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
        <span className="h-2 w-2 rounded-full bg-white/60" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
        <span className="ml-2">Loading adventure…</span>
      </div>
    </div>
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    fxTap();
    navigate({ to: "/create" });
  };

  return (
    <div className="w-screen h-screen overflow-hidden select-none relative cursor-pointer fixed inset-0 bg-white" onClick={handleButtonClick}>
      <img 
        src={welcomeScreenImage} 
        alt="Welcome to India Explorer" 
        className="w-full h-full object-cover"
        draggable="false"
      />
    </div>
  );
}

export function CreateProfileScreen() {
  const avatarImages = [
    { id: "explorer-hat" as AvatarId, image: avatarExplorerHat },
    { id: "explorer-pink" as AvatarId, image: avatarExplorerPink },
    { id: "geek-glasses" as AvatarId, image: avatarGeekGlasses },
    { id: "girl-peace" as AvatarId, image: avatarGirlPeace },
    { id: "turban-red" as AvatarId, image: avatarTurbanRed },
    { id: "girl-earring" as AvatarId, image: avatarGirlEarring },
    { id: "boy-smile" as AvatarId, image: avatarBoySmi },
    { id: "girl-tikka" as AvatarId, image: avatarGirlTikka },
    { id: "ski-goggles" as AvatarId, image: avatarSkiGoggles },
    { id: "farmer-hat" as AvatarId, image: avatarFarmerHat },
    { id: "sports-cap" as AvatarId, image: avatarSportsCap },
    { id: "girl-flower" as AvatarId, image: avatarGirlFlower },
  ];
  
  const p = useProgress();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<AvatarId>(p.avatar as AvatarId || avatarImages[0].id);
  const [ageBand, setAgeBand] = useState(p.ageBand);
  const [saved, setSaved] = useState(false);
  const [selectedAgeIndex, setSelectedAgeIndex] = useState(0);
  const [burst, setBurst] = useState(0);
  const [showAudioPermission, setShowAudioPermission] = useState(false);

  const ageBands = [
    { value: "3-5", emoji: "🌱", label: "Sprout", gradient: "from-pink-400 to-rose-500" },
    { value: "6-7", emoji: "🌿", label: "Seedling", gradient: "from-violet-400 to-purple-500" },
    { value: "8-9", emoji: "🌳", label: "Sapling", gradient: "from-emerald-400 to-teal-500" },
    { value: "10-12", emoji: "🌲", label: "Mighty Tree", gradient: "from-amber-400 to-orange-500" },
  ];

  const handleAgeSelect = (value: string, index: number) => {
    fxTap();
    setAgeBand(value);
    setSelectedAgeIndex(index);
    setBurst((n) => n + 1);
    setSaved(false);
  };

  const handleProfileSave = () => {
    fxTap();
    fxConfetti();
    
    const avatarName = getAvatarName(avatar);
    saveProfile({ name: avatarName, avatar, ageBand });
    
    setShowAudioPermission(true);
    setSaved(true);
  };

  const handleAudioPermissionAccept = () => {
    setShowAudioPermission(false);
    setSaved(false);
    setTimeout(() => navigate({ to: "/home" }), 300);
  };

  const handleAudioPermissionReject = () => {
    setShowAudioPermission(false);
    setSaved(false);
    setTimeout(() => navigate({ to: "/home" }), 300);
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white flex flex-col select-none touch-none" style={{ touchAction: 'pan-y' }}>
      <div className="px-5 flex-1 overflow-auto">
        <div className="rounded-3xl gradient-explorer p-5 text-white relative overflow-hidden">
          <Cloud className="absolute -top-3 right-2 w-16 opacity-40" />
          <div className="text-display text-2xl font-bold mt-1">
            Pick your avatar
          </div>
          <div className="text-sm opacity-90 font-semibold">
            Choose the explorer who will travel with you
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-6">
          {avatarImages.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                fxTap();
                setAvatar(a.id);
                setSaved(false);
              }}
              className={`aspect-square rounded-2xl flex items-center justify-center border-4 transition transform overflow-hidden ${
                a.id === avatar
                  ? "border-saffron shadow-[var(--shadow-glow-orange)] scale-110"
                  : "border-gray-200 hover:scale-105"
              }`}
            >
              <img
                src={a.image}
                alt={getAvatarName(a.id)}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {avatar && (() => {
          const selectedAvatar = avatarImages.find(a => a.id === avatar);
          const avatarName = getAvatarName(avatar);
          return selectedAvatar ? (
            <div className="mt-6 rounded-2xl gradient-saffron p-4 text-center text-white animate-fade-in flex items-center justify-center gap-4">
              <img src={selectedAvatar.image} alt={avatarName} className="w-20 h-20 rounded-full border-4 border-white shadow-lg" />
              <div>
                <div className="text-sm font-bold opacity-90">Your explorer!</div>
                <div className="text-display text-lg font-extrabold">{avatarName}</div>
              </div>
            </div>
          ) : null;
        })()}

        <div className="mt-8 mb-2">
          <label className="text-display text-sm font-bold text-gray-700">
            👶 How old are you?
          </label>
          <div className="mt-3 space-y-2">
            {ageBands.map((band, idx) => {
              const isSelected = band.value === ageBand;
              return (
                <button
                  key={band.value}
                  type="button"
                  onClick={() => handleAgeSelect(band.value, idx)}
                  className={`w-full h-16 rounded-2xl flex items-center justify-between px-5 font-extrabold transition transform ${
                    isSelected
                      ? `bg-gradient-to-r ${band.gradient} text-white shadow-xl scale-105 border-4 border-white animate-pulse`
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:scale-102"
                  }`}
                >
                  <span className="text-3xl">{band.emoji}</span>
                  <div className="flex-1 text-center">
                    <div className="text-lg">{band.value}</div>
                    <div className={`text-xs font-bold ${isSelected ? "text-white/90" : "text-gray-500"}`}>
                      {band.label}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-2xl animate-bounce">✨</div>
                  )}
                </button>
              );
            })}
          </div>

          {ageBand && (
            <ConfettiBurst key={`age-${burst}`} trigger={burst} size="big" />
          )}
        </div>
      </div>

      <div className="p-5 pb-safe bg-white border-t border-gray-100">
        <button
          onClick={handleProfileSave}
          className={`w-full h-14 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-display text-lg font-bold shadow-xl transition transform ${
            saved ? "scale-95 opacity-80" : "hover:shadow-2xl active:scale-95"
          }`}
        >
          {saved ? "✅ Saved ✓" : "Continue → Let's Explore!"}
        </button>
      </div>

      <AudioPermissionDialog
        open={showAudioPermission}
        forceShow={true}
        context="profile-creation"
        onAccept={handleAudioPermissionAccept}
        onReject={handleAudioPermissionReject}
      />
    </div>
  );
}

/**
 * Floating XP Animation Component
 * Displays "+X XP" feedback with animation rising up and fading out
 */
export function FloatingXPFeedback({ xp, key: feedbackKey }: { xp: number; key: string }) {
  return (
    <div
      className="fixed pointer-events-none z-50 font-extrabold text-lg text-yellow-500 drop-shadow-lg animate-ping-rise"
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        animation: "rise-fade 1.5s ease-out forwards",
      }}
    >
      <style>{`
        @keyframes rise-fade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -150px);
          }
        }
      `}</style>
      +{xp} XP ⭐
    </div>
  );
}
