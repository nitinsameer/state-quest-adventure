import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import mascot from "@/assets/mascot.webp";
import { getState } from "@/lib/states";
import { STATE_ART, TONE_GRADIENT, TONE_HEX, preloadStateArt } from "@/lib/state-art";
import { useProgress, badgesFor, STATE_BADGES, type BadgeId } from "@/lib/progress";
import { fxTap, fxStamp } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { useCelebration } from "@/hooks/useCelebration";
import { useToast } from "@/hooks/useToast";
import { usePostcardLibrary } from "@/store/postcard-library-store";
import { sharePostcard } from "@/lib/share-postcard";
import { ResetPINDialog } from "@/components/ResetPINDialog";
import { readTokenAsHex, subscribeThemeChange } from "@/lib/theme-tokens";
import { EMOJI } from "@/constants/emoji";

const BADGE_EMOJI: Record<BadgeId, string> = {
  monument: EMOJI.achievement.monument,
  animal: EMOJI.achievement.animal,
  explorer: EMOJI.achievement.explorer,
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
  onHome,
  onNextState,
}: { stateName?: string; onHome?: () => void; onNextState?: () => void } = {}) {
  const state = getState(stateName);
  const progress = useProgress();
  const navigate = useNavigate();
  const celebration = useCelebration();
  const toast = useToast();
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";
  const earned = badgesFor(progress, state.name);
  const badge = STATE_BADGES.find((b) => b.id === earned[earned.length - 1]) ?? STATE_BADGES[0];

  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showParentGate, setShowParentGate] = useState(false);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const cheer = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setBurst((n) => n + 1);
    preloadStateArt(state.name);
    generateAndPreview();

    // Re-render postcard when theme changes
    const unsubscribe = subscribeThemeChange(() => {
      generateAndPreview();
    });

    return unsubscribe;
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
    c.fillStyle = readTokenAsHex("--surface-card");
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

    // Header text - white on gradient header
    c.fillStyle = readTokenAsHex("--text-on-header");
    c.font = "bold 30px system-ui, sans-serif";
    c.textAlign = "center";
    c.globalAlpha = 0.92;
    c.fillText("GREETINGS FROM", W / 2, 150);
    c.globalAlpha = 1;
    c.fillStyle = readTokenAsHex("--text-on-header");
    c.font = "bold 74px system-ui, sans-serif";
    c.fillText(state.name.toUpperCase(), W / 2, 235);
    c.font = "bold 30px system-ui, sans-serif";
    c.globalAlpha = 0.92;
    c.fillText(state.nickname, W / 2, 295);
    c.globalAlpha = 1;

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
        // Canvas shadow: rgba(15,23,42,0.22) maps to --shadow-raised concept
        // Note: Canvas 2D doesn't support CSS variables, so shadow colors are hardcoded
        // The rgba value is consistent across postcard shadow rendering
        c.shadowColor = "rgba(15,23,42,0.22)";
        c.shadowBlur = 26;
        c.shadowOffsetY = 12;
        c.drawImage(img, BAND_X + (BAND_W - dw) / 2, BAND_Y + (BAND_H - dh) / 2, dw, dh);
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
    c.fillStyle = readTokenAsHex("--accent-6-soft");
    roundRect(c, 120, 830, W - 240, 110, 40);
    c.fill();
    c.fillStyle = readTokenAsHex("--text-primary");
    c.font = "bold 40px system-ui, sans-serif";
    c.fillText(`${BADGE_EMOJI[badge.id]}  ${badge.name} Badge Earned`, W / 2, 900);

    // fun fact
    c.fillStyle = readTokenAsHex("--text-secondary");
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

    c.fillStyle = readTokenAsHex("--text-muted");
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

  async function handleSaveToPassport() {
    if (busy) return;
    setBusy(true);

    try {
      const blob = await generatePostcardPreview();
      if (!blob) {
        toast.error("Couldn't generate postcard", {
          subtitle: "Please try again",
        });
        setBusy(false);
        return;
      }

      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        const library = usePostcardLibrary.getState();
        const now = new Date().toISOString();

        // Generate a stamp date like "12 � MAR"
        const date = new Date();
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
        const stampDate = `${day} � ${month}`;

        // Determine badge earned
        const earned = badgesFor(progress, state.name);
        const badgeId = (earned[earned.length - 1] ?? "explorer") as BadgeId;

        // Add to postcard library with image data
        library.addPostcard(state.name, badgeId, stampDate, now, base64);

        toast.success("?? Saved to your Passport!", {
          subtitle: "View anytime from Explorer",
        });
        setBusy(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("[StatePostcardScreen] Save failed", err);
      toast.error("Something went wrong", {
        subtitle: "Please try again",
      });
      setBusy(false);
    }
  }

  async function handleSharePostcard() {
    if (busy) return;
    fxTap();

    // Show parent gate first
    try {
      const blob = await generatePostcardPreview();
      if (blob) {
        setPendingBlob(blob);
        setShowParentGate(true);
      }
    } catch (err) {
      console.error("[StatePostcardScreen] Share prep failed", err);
      toast.error("Couldn't prepare postcard", {
        subtitle: "Please try again",
      });
    }
  }

  async function proceedWithShare() {
    if (!pendingBlob) return;
    setBusy(true);

    try {
      const filename = `${state.name}-postcard`;
      const result = await sharePostcard(pendingBlob, filename);

      if (result.ok) {
        if (result.cancelled) {
          // User cancelled share sheet, just close
          setBusy(false);
        } else {
          toast.success(`${EMOJI.action.sparkle} Postcard shared!`, {
            subtitle: "Parent can view it now",
          });
          setBusy(false);
        }
      } else {
        toast.error("Couldn't share postcard", {
          subtitle: result.error || "Please try again",
        });
        setBusy(false);
      }
    } catch (err) {
      console.error("[StatePostcardScreen] Share failed", err);
      toast.error("Something went wrong", {
        subtitle: "Please try again",
      });
      setBusy(false);
    } finally {
      setPendingBlob(null);
    }
  }

  return (
    <div className={`h-full w-full ${grad} relative overflow-hidden flex flex-col`}>
      <ConfettiBurst trigger={burst} size="big" />

      {/* Header */}
      <div className="pt-5 text-center px-(--padding-lg) relative z-10">
        <div className="text-text-on-header/90 text-xs font-bold tracking-wide">Your Stamp</div>
        <div className="text-text-on-header text-xs font-semibold mt-1">
          Show your friends you beat {state.name}! ??
        </div>
      </div>

      {/* Postcard Preview */}
      <div className="flex-1 px-5 pt-(--padding-base) pb-1 relative z-10 overflow-y-auto">
        <div className="w-full rounded-[28px] ui-card ui-accent-1-soft border-4 border-text-on-header overflow-hidden animate-in zoom-in-95">
          {/* Preview Image (Loading or Generated) */}
          <div className="relative bg-muted aspect-[3/4] overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Your postcard" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl mb-2">{EMOJI.action.sparkle}</div>
                <div className="text-sm font-semibold text-muted-foreground">
                  Creating your postcard...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-(--padding-md) pt-2 relative z-10 space-y-2">
        {/* Row 1: Save to Passport & Share (side by side) */}
        <div className="flex gap-(--gap-compact)">
          {/* Primary: Save to Passport */}
          <button
            onClick={handleSaveToPassport}
            disabled={busy || !previewUrl}
            className="flex-1 h-12 rounded-2xl ui-button ui-accent-1-soft text-ink text-sm font-bold disabled:opacity-60 active:scale-95 transition-transform"
          >
            {busy ? "Saving..." : `${EMOJI.action.save} Save`}
          </button>

          {/* Secondary: Share (Parent-gated) */}
          <button
            onClick={handleSharePostcard}
            disabled={busy || !previewUrl}
            className="flex-1 h-12 rounded-2xl ui-button ui-accent-2 text-ink text-sm font-bold disabled:opacity-60 active:scale-95 transition-transform"
          >
            {EMOJI.action.share} Share
          </button>
        </div>

        {/* Row 2: Home (Primary) & Next State (Secondary) - full width each */}
        <button
          onClick={() => {
            fxTap();
            onHome?.();
          }}
          className="w-full h-14 rounded-2xl ui-button ui-accent-1 text-ink text-display font-extrabold active:scale-95 transition-transform"
        >
          {EMOJI.nav.home} Home
        </button>

        <button
          onClick={() => {
            fxTap();
            onNextState?.();
          }}
          className="w-full h-12 rounded-xl ui-button ui-accent-1-soft text-ink text-display font-bold active:scale-95 transition-transform"
        >
          Next State {EMOJI.action.arrow}
        </button>
      </div>

      {/* Parent Gate for Share */}
      <ResetPINDialog
        open={showParentGate}
        onConfirm={() => {
          setShowParentGate(false);
          proceedWithShare();
        }}
        onCancel={() => {
          setShowParentGate(false);
          setPendingBlob(null);
        }}
      />
    </div>
  );
}
