import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import mascot from "@/assets/mascot.png";
import { getState } from "@/lib/states";
import { STATE_ART, TONE_GRADIENT, TONE_HEX, preloadStateArt } from "@/lib/state-art";
import { useProgress, badgesFor, STATE_BADGES, type BadgeId } from "@/lib/progress";
import { fxTap, fxStamp } from "@/lib/fx";
import { requestStoragePermission, saveFileToDownloads } from "@/lib/permissions";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { useCelebration } from "@/hooks/useCelebration";
import { useToast } from "@/hooks/useToast";
import { hasFeatureConsent, grantFeatureConsent } from "@/lib/parental-consent";
import { usePostcardLibrary } from "@/store/postcard-library-store";
import { markPostcardAsExported } from "@/lib/postcard-library";
import { FilePermissionDialog } from "@/components/FilePermissionDialog";

const BADGE_EMOJI: Record<BadgeId, string> = {
  monument: "🏛️",
  animal: "🐾",
  explorer: "🎖️",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function StatePostcardScreen({
  stateName,
  onContinue,
}: { stateName?: string; onContinue?: () => void } = {}) {
  const state = getState(stateName);
  const progress = useProgress();
  const navigate = useNavigate();
  const celebration = useCelebration();
  const toast = useToast();
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";
  const earned = badgesFor(progress, state.name);
  const badge =
    STATE_BADGES.find((b) => b.id === earned[earned.length - 1]) ?? STATE_BADGES[0];
  
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFilePermissionDialog, setShowFilePermissionDialog] = useState(false);
  const cheer = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setBurst((n) => n + 1);
    preloadStateArt(state.name);
    generateAndPreview();
  }, [state.name]);

  async function generatePostcardPreview(): Promise<Blob | null> {
    const W = 900;
    const H = 1200;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext("2d");
    
    if (!c) return null;

    const [from, to] = TONE_HEX[state.tone] ?? TONE_HEX.orange;
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, from);
    g.addColorStop(1, to);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    // inner card
    c.fillStyle = "#ffffff";
    roundRect(c, 50, 50, W - 100, H - 100, 48);
    c.fill();

    // header band
    const g2 = c.createLinearGradient(50, 50, W - 50, 380);
    g2.addColorStop(0, from);
    g2.addColorStop(1, to);
    c.save();
    roundRect(c, 50, 50, W - 100, 330, 48);
    c.clip();
    c.fillStyle = g2;
    c.fillRect(50, 50, W - 100, 330);
    c.restore();

    c.fillStyle = "rgba(255,255,255,0.92)";
    c.font = "bold 30px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText("GREETINGS FROM", W / 2, 150);
    c.fillStyle = "#ffffff";
    c.font = "bold 74px system-ui, sans-serif";
    c.fillText(state.name.toUpperCase(), W / 2, 235);
    c.font = "bold 30px system-ui, sans-serif";
    c.fillStyle = "rgba(255,255,255,0.92)";
    c.fillText(state.nickname, W / 2, 295);

    // artwork
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";
    const BAND_X = 250;
    const BAND_Y = 410;
    const BAND_W = 480;
    const BAND_H = 320;
    try {
      if (art) {
        const img = await loadImage(art);
        const scale = Math.min(BAND_W / img.width, BAND_H / img.height, 1.6);
        const dw = img.width * scale;
        const dh = img.height * scale;
        c.save();
        c.shadowColor = "rgba(15,23,42,0.22)";
        c.shadowBlur = 26;
        c.shadowOffsetY = 12;
        c.drawImage(
          img,
          BAND_X + (BAND_W - dw) / 2,
          BAND_Y + (BAND_H - dh) / 2,
          dw,
          dh,
        );
        c.restore();
      } else {
        c.font = "200px system-ui, sans-serif";
        c.fillText(state.emoji, W / 2, BAND_Y + 230);
      }
    } catch {
      /* art optional */
    }

    try {
      const m = await loadImage(mascot);
      const scale = Math.min(220 / m.width, 220 / m.height);
      c.drawImage(m, 95, 560, m.width * scale, m.height * scale);
    } catch {
      /* mascot optional */
    }

    // badge chip
    c.fillStyle = "#F6F3EC";
    roundRect(c, 120, 830, W - 240, 110, 40);
    c.fill();
    c.fillStyle = "#1E293B";
    c.font = "bold 40px system-ui, sans-serif";
    c.fillText(`${BADGE_EMOJI[badge.id]}  ${badge.name} Badge Earned`, W / 2, 900);

    // fun fact
    c.fillStyle = "#475569";
    c.font = "30px system-ui, sans-serif";
    const words = state.funFact.split(" ");
    let line = "";
    let y = 1010;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (c.measureText(test).width > W - 220) {
        c.fillText(line, W / 2, y);
        line = w;
        y += 44;
      } else {
        line = test;
      }
    }
    if (line) c.fillText(line, W / 2, y);

    c.fillStyle = "#94A3B8";
    c.font = "bold 26px system-ui, sans-serif";
    c.fillText("India Explorer", W / 2, H - 100);

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );
  }

  async function generateAndPreview() {
    try {
      const blob = await generatePostcardPreview();
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (err) {
      console.error("[StatePostcardScreen] Failed to generate preview", err);
    }
  }

  async function handleSaveToPhotos() {
    if (busy) return;

    // Check if user has already granted file permission
    if (!hasFeatureConsent("file")) {
      fxTap();
      setShowFilePermissionDialog(true);
      return;
    }

    // Permission already granted, proceed to save
    await proceedWithSave();
  }

  async function proceedWithSave() {
    setBusy(true);
    try {
      const blob = await generatePostcardPreview();
      if (!blob) {
        toast.error("Couldn't generate stamp", {
          subtitle: "Please try again",
        });
        setBusy(false);
        return;
      }

      const filename = `${state.name}-postcard.png`;
      const success = await saveFileToDownloads(blob, filename);

      if (success) {
        const library = usePostcardLibrary.getState();
        const postcard = library.postcards.find((p) => p.state === state.name);
        if (postcard) {
          const updatedPostcard = markPostcardAsExported(postcard, filename);
          library.updatePostcard(postcard.id, updatedPostcard);
        }

        toast.success("✨ Stamp saved to Photos!", {
          subtitle: "Check your photos folder",
        });
        setBusy(false);
      } else {
        toast.error("Couldn't save stamp", {
          subtitle: "Please try again",
        });
        setBusy(false);
      }
    } catch (err) {
      console.error("[StatePostcardScreen] Save failed", err);
      toast.error("Something went wrong", {
        subtitle: "Please try again",
      });
      setBusy(false);
    }
  }

  async function handleKeepInApp() {
    fxTap();
    toast.success("📱 Stamp added to your Stamps!", {
      subtitle: "View anytime from your Stamps tab",
    });
    // Auto-navigate to unlock screen after a short delay
    setTimeout(() => {
      onContinue?.();
    }, 1500);
  }

  return (
    <div className={`h-full w-full ${grad} relative overflow-hidden flex flex-col`}>
      <ConfettiBurst trigger={burst} size="big" />

      {/* Header */}
      <div className="pt-5 text-center px-[--padding-lg] relative z-10">
        <div className="text-white/90 text-xs font-bold tracking-wide">
          Your Stamp
        </div>
        <div className="text-white text-xs font-semibold mt-1">
          Show your friends you beat {state.name}! 🎫
        </div>
      </div>

      {/* Postcard Preview */}
      <div className="flex-1 px-5 pt-[--padding-base] pb-1 relative z-10 overflow-y-auto">
        <div className="w-full rounded-[28px] bg-white shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95">
          {/* Preview Image (Loading or Generated) */}
          <div className="relative bg-gray-100 aspect-[3/4] overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Your postcard"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl mb-2">✨</div>
                <div className="text-sm font-semibold text-gray-600">
                  Creating your postcard...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-[--padding-md] pt-2 relative z-10 space-y-2">
        {/* Row 1: Save to Photos & Skip for Now (side by side) */}
        <div className="flex gap-[--gap-compact]">
          {/* Primary: Save to Photos */}
          <button
            onClick={handleSaveToPhotos}
            disabled={busy || !previewUrl}
            className="flex-1 h-12 rounded-2xl bg-white text-ink text-sm font-bold shadow-xl disabled:opacity-60 active:scale-95 transition-transform"
          >
            {busy ? "Saving..." : "📸 Save"}
          </button>

          {/* Tertiary: Skip */}
          <button
            onClick={() => {
              fxTap();
              onContinue?.();
            }}
            className="flex-1 h-12 rounded-2xl bg-white/25 backdrop-blur text-white text-sm font-bold active:scale-95 transition-transform"
          >
            ⏭️ Skip
          </button>
        </div>

        {/* Row 2: Keep in App (full width) */}
        <button
          onClick={handleKeepInApp}
          className="w-full h-14 rounded-2xl bg-blue-100 text-blue-700 text-display font-extrabold active:scale-95 transition-transform"
        >
          📱 Keep in My Stamps
        </button>
      </div>

      {/* File Permission Dialog */}
      <FilePermissionDialog
        open={showFilePermissionDialog}
        onAccept={() => {
          grantFeatureConsent("file");
          setShowFilePermissionDialog(false);
          proceedWithSave();
        }}
        onReject={() => {
          setShowFilePermissionDialog(false);
        }}
      />
    </div>
  );
}
