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
import { readTokenAsHex, subscribeThemeChange } from "@/lib/theme-tokens";
import { EMOJI } from "@/constants/emoji";

const BADGE_EMOJI: Record<BadgeId, string> = {
  monument: EMOJI.achievement.monument,
  animal: EMOJI.achievement.animal,
  explorer: EMOJI.achievement.explorer,
};

function loadImageWithTimeout(src: string, timeoutMs: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    const timeoutId = setTimeout(() => {
      img.src = ""; // Cancel load
      reject(new Error("Image load timeout"));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(img);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error("Image load failed"));
    };

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
  const grad = TONE_GRADIENT[state.tone] ?? "var(--accent-1)";
  const earned = badgesFor(progress, state.name);
  const badge = STATE_BADGES.find((b) => b.id === earned[earned.length - 1]) ?? STATE_BADGES[0];
  const postcardDescriptionId = `postcard-desc-${state.name}`;

  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    try {
      const W = 900;
      const H = 1200;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const c = canvas.getContext("2d");

      if (!c) {
        console.error("[StatePostcardScreen] Failed to get canvas context");
        return null;
      }

      // Calculate responsive font sizes based on canvas dimensions
      const baseSize = Math.min(W, H);
      const headerSmallFont = Math.round(baseSize * 0.033); // ~30px for 900px
      const headerLargeFont = Math.round(baseSize * 0.082); // ~74px for 900px
      const badgeLabelFont = Math.round(baseSize * 0.044); // ~40px for 900px
      const funFactFont = Math.round(baseSize * 0.033); // ~30px for 900px
      const footerFont = Math.round(baseSize * 0.029); // ~26px for 900px

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
      c.font = `bold ${headerSmallFont}px system-ui, sans-serif`;
      c.textAlign = "center";
      c.globalAlpha = 0.92;
      c.fillText("GREETINGS FROM", W / 2, 150);
      c.globalAlpha = 1;
      c.fillStyle = readTokenAsHex("--text-on-header");
      c.font = `bold ${headerLargeFont}px system-ui, sans-serif`;
      c.fillText(state.name.toUpperCase(), W / 2, 235);
      c.font = `bold ${headerSmallFont}px system-ui, sans-serif`;
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
          const img = await loadImageWithTimeout(art, 5000);
          const scale = Math.min(BAND_W / img.width, BAND_H / img.height, 1.6);
          const dw = img.width * scale;
          const dh = img.height * scale;
          c.save();
          // Canvas shadow: read from token at runtime for theme compatibility
          // Note: Canvas 2D doesn't support CSS variables directly, so we read the hex at draw time
          c.shadowColor = readTokenAsHex("--shadow-raised");
          c.shadowBlur = 26;
          c.shadowOffsetY = 12;
          c.drawImage(img, BAND_X + (BAND_W - dw) / 2, BAND_Y + (BAND_H - dh) / 2, dw, dh);
          c.restore();
        } else {
          c.font = "200px system-ui, sans-serif";
          c.fillText(state.emoji, W / 2, BAND_Y + 230);
        }
      } catch (error) {
        /* art optional - fallback to emoji handled above */
        console.error("[StatePostcardScreen] Failed to load state art:", error);
      }

      try {
        const m = await loadImageWithTimeout(mascot, 5000);
        const scale = Math.min(220 / m.width, 220 / m.height);
        c.drawImage(m, 95, 560, m.width * scale, m.height * scale);
      } catch (error) {
        /* mascot optional */
        console.error("[StatePostcardScreen] Failed to load mascot:", error);
      }

      // badge chip
      c.fillStyle = readTokenAsHex("--accent-6-soft");
      roundRect(c, 120, 830, W - 240, 110, 40);
      c.fill();
      c.fillStyle = readTokenAsHex("--text-primary");
      c.font = `bold ${badgeLabelFont}px system-ui, sans-serif`;
      c.fillText(`${BADGE_EMOJI[badge.id]}  ${badge.name} Badge Earned`, W / 2, 900);

      // fun fact
      c.fillStyle = readTokenAsHex("--text-secondary");
      c.font = `${funFactFont}px system-ui, sans-serif`;
      const words = state.funFact.split(" ");
      let line = "";
      let y = 1010;
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (c.measureText(test).width > W - 220) {
          c.fillText(line, W / 2, y);
          line = w;
          y += Math.round(funFactFont * 1.47); // ~44px line height
        } else {
          line = test;
        }
      }
      if (line) c.fillText(line, W / 2, y);

      c.fillStyle = readTokenAsHex("--text-muted");
      c.font = `bold ${footerFont}px system-ui, sans-serif`;
      c.fillText("India Explorer", W / 2, H - 100);

      return await new Promise<Blob | null>((resolve, reject) =>
        canvas.toBlob((b) => {
          if (!b) {
            console.error("[StatePostcardScreen] toBlob failed");
            reject(new Error("Canvas toBlob failed"));
          } else {
            resolve(b);
          }
        }, "image/png"),
      );
    } catch (err) {
      console.error("[StatePostcardScreen] Canvas rendering error:", err);
      return null;
    }
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

    setBusy(true);

    try {
      // Generate postcard preview
      const blob = await generatePostcardPreview();
      if (!blob) {
        toast.error("Couldn't prepare postcard", {
          subtitle: "Please try again",
        });
        setBusy(false);
        return;
      }

      // Share directly (no PIN gate required)
      const filename = `${state.name}-postcard`;
      const result = await sharePostcard(blob, filename);

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
      <div className="flex-1 px-6 pt-(--padding-base) pb-1 relative z-10 overflow-y-auto">
        {/* Hidden description for screen readers */}
        <div id={postcardDescriptionId} className="sr-only">
          Your postcard for {state.name}. Shows your achievement with the {badge.name} badge earned. This postcard can be saved to your Explorer Passport.
        </div>

        <div 
          className="w-full rounded-[28px] ui-card ui-accent-1-soft border-4 border-text-on-header overflow-hidden animate-in zoom-in-95"
          role="img"
          aria-describedby={postcardDescriptionId}
          aria-label={`${state.name} postcard`}
        >
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
            className="flex-1 h-12 rounded-2xl ui-button ui-accent-1-soft text-sm font-bold disabled:opacity-60 active:scale-95 transition-transform"
            aria-label="Save postcard to passport"
          >
            {busy ? "Saving..." : `${EMOJI.action.save} Save`}
          </button>

          {/* Secondary: Share (Parent-gated) */}
          <button
            onClick={handleSharePostcard}
            disabled={busy || !previewUrl}
            className="flex-1 h-12 rounded-2xl ui-button ui-accent-2 text-sm font-bold disabled:opacity-60 active:scale-95 transition-transform"
            aria-label="Share postcard with others"
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
          className="w-full h-12 rounded-2xl ui-button ui-accent-1 text-display font-extrabold active:scale-95 transition-transform"
          aria-label="Return to home screen"
        >
          {EMOJI.nav.home} Home
        </button>

        <button
          onClick={() => {
            fxTap();
            onNextState?.();
          }}
          className="w-full h-12 rounded-xl ui-button ui-accent-1-soft text-display font-bold active:scale-95 transition-transform"
          aria-label="Go to next state"
        >
          Next State {EMOJI.action.arrow}
        </button>
      </div>


    </div>
  );
}
