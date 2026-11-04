import { useState, useEffect } from "react";
import { getState } from "@/lib/states";
import { STATE_ART, TONE_HEX } from "@/lib/state-art";
import { type PostcardData } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { useToast } from "@/hooks/useToast";
import { usePostcardLibrary } from "@/store/postcard-library-store";
import { readTokenAsHex } from "@/lib/theme-tokens";
import { EMOJI } from "@/constants/emoji";
import { ConfettiBurst } from "@/components/ConfettiBurst";

const BADGE_EMOJI: Record<string, string> = {
  monument: EMOJI.achievement.monument,
  animal: EMOJI.achievement.animal,
  explorer: EMOJI.achievement.explorer,
};

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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generatePostcardBlob(postcard: PostcardData): Promise<Blob | null> {
  try {
    const state = getState(postcard.state);
    const art = STATE_ART[state.name];
    const W = 900;
    const H = 1200;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext("2d");
    if (!c) {
      console.error("[PostcardModal] Failed to get canvas context");
      return null;
    }

    // Calculate responsive font sizes based on canvas dimensions
    const baseSize = Math.min(W, H);
    const headerLabelFont = Math.round(baseSize * 0.033); // ~30px
    const headerStateCompletedFont = Math.round(baseSize * 0.024); // ~22px
    const stateNameFont = Math.round(baseSize * 0.053); // ~48px
    const dateFont = Math.round(baseSize * 0.02); // ~18px
    const badgeLabelFont = Math.round(baseSize * 0.02); // ~18px
    const badgeEmojiSize = 60;
    const footerFont = Math.round(baseSize * 0.016); // ~14px

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

    c.fillStyle = readTokenAsHex("--text-on-header");
    c.globalAlpha = 0.92;
    c.font = `bold ${headerLabelFont}px system-ui, sans-serif`;
    c.textAlign = "center";
    c.fillText("EXPLORER PASSPORT", W / 2, 120);

    c.globalAlpha = 0.78;
    c.font = `${headerStateCompletedFont}px system-ui, sans-serif`;
    c.fillText("State Completed", W / 2, 165);

    // state name
    c.globalAlpha = 1;
    c.fillStyle = from;
    c.font = `bold ${stateNameFont}px system-ui, sans-serif`;
    c.fillText(state.name, W / 2, 280);

    // date
    c.fillStyle = from;
    c.font = `${dateFont}px system-ui, sans-serif`;
    c.fillText(postcard.stampDate, W / 2, 330);

    // state image
    if (art) {
      try {
        const img = await loadImageWithTimeout(art, 5000);
        const imgW = 160;
        const imgH = 160;
        c.drawImage(img, W / 2 - imgW / 2, 420, imgW, imgH);
      } catch (err) {
        // Image load timeout or failed - fallback to emoji
        if (err instanceof Error && err.message === "Image load timeout") {
          console.warn("[PostcardModal] Image load timeout, using emoji");
        } else {
          console.warn("[PostcardModal] Image load failed, using emoji");
        }
        c.font = "80px system-ui";
        c.textAlign = "center";
        c.fillText(state.emoji, W / 2, 520);
      }
    }

    // badge section
    c.fillStyle = readTokenAsHex("--accent-6-soft");
    roundRect(c, 100, 700, W - 200, 140, 16);
    c.fill();

    c.fillStyle = readTokenAsHex("--text-primary");
    c.font = `bold ${badgeLabelFont}px system-ui, sans-serif`;
    c.textAlign = "center";
    c.fillText("Badge Earned", W / 2, 735);

    const badgeEmoji = BADGE_EMOJI[postcard.badge] || EMOJI.achievement.explorer;
    c.font = `${badgeEmojiSize}px system-ui`;
    c.fillText(badgeEmoji, W / 2, 800);

    // footer
    c.globalAlpha = 0.3;
    c.fillStyle = readTokenAsHex("--text-primary");
    c.font = `${footerFont}px system-ui, sans-serif`;
    c.textAlign = "center";
    c.fillText("India Explorer", W / 2, 1080);
    c.fillText(`Completed on ${postcard.stampDate}`, W / 2, 1110);
    c.globalAlpha = 1;

    return new Promise<Blob | null>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("[PostcardModal] toBlob failed");
          reject(new Error("Canvas rendering failed - could not generate image blob"));
        } else {
          resolve(blob);
        }
      }, "image/png");
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("[PostcardModal] Canvas rendering error:", error.message);
    } else {
      console.error("[PostcardModal] Canvas rendering error:", error);
    }
    return null;
  }
}

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

export function PostcardModal({
  postcard,
  onClose,
}: {
  postcard: PostcardData;
  onClose: () => void;
}) {
  const state = getState(postcard.state);
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [factExpanded, setFactExpanded] = useState(false);
  const postcardDescriptionId = `postcard-description-${postcard.state}`;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setConfettiKey((k) => k + 1);
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  const handleSaveToPassport = async () => {
    setIsSaving(true);
    try {
      fxTap();
      const blob = await generatePostcardBlob(postcard);
      if (!blob) {
        toast.error("Couldn't render postcard", {
          subtitle: "Canvas rendering failed. Try again",
        });
        setIsSaving(false);
        return;
      }

      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        const library = usePostcardLibrary.getState();

        // Add to postcard library with image data
        library.addPostcard(
          postcard.state,
          postcard.badge,
          postcard.stampDate,
          new Date().toISOString(),
          base64,
        );

        toast.success(`${EMOJI.postcard.saved} Saved to your Passport!`, {
          subtitle: "View anytime from Explorer",
        });
        setIsSaving(false);
        onClose();
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Save failed:", error.message);
      }
      toast.error("Couldn't save postcard", {
        subtitle: "Storage failed. Check your device",
      });
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const badgeEmoji = BADGE_EMOJI[postcard.badge] || EMOJI.achievement.explorer;
  const heroImageUrl = STATE_ART[state.name];
  const [fromHex, toHex] = TONE_HEX[state.tone] ?? TONE_HEX.orange;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
      style={{ backgroundColor: "var(--scrim)" }}
      onClick={handleDismiss}
    >
      {/* Confetti Burst */}
      <ConfettiBurst trigger={confettiKey} size="big" />

      {/* Modal Content Container */}
      <div
        className="relative z-10 flex flex-col items-center max-w-full w-full px-4 sm:max-w-[360px]"
        style={{ gap: "16px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* State Name Label (outside postcard) */}
        <div className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">
          {state.name}
        </div>

        {/* Hidden description for screen readers */}
        <div id={postcardDescriptionId} className="sr-only">
          Postcard for {state.name} state. Badge earned: {postcard.badge}. Completed on {postcard.stampDate}. This is your Explorer Passport stamp showing you've completed this state.
        </div>

        {/* Postcard Card - Responsive width for 320px screens */}
        <div
          className="relative w-full h-auto rounded-[20px] overflow-hidden animate-postcard-enter"
          role="img"
          aria-describedby={postcardDescriptionId}
          aria-label={`Explorer Passport postcard for ${state.name}`}
          style={{
            maxWidth: "320px",
            aspectRatio: "328 / 420",
            backgroundColor: "white",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.18), 0 0 0 0 transparent",
            "--glow-color": `${fromHex}59`,
          } as React.CSSProperties}
        >
          {/* Hero Image Section (top 60%) */}
          <div
            className="absolute inset-0"
            style={{
              height: "60%",
              backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: fromHex,
            }}
          >
            {/* Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(to bottom, transparent 30%, ${fromHex}60 100%)`,
              }}
            />
          </div>

          {/* Content Area (bottom 40%) */}
          <div
            className="absolute inset-0 top-3/5 flex flex-col items-center justify-center"
            style={{
              backgroundColor: "white",
              padding: "12px 16px",
              gap: "6px",
            }}
          >
            {/* Badge Type Label */}
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">
              {postcard.badge} Badge
            </div>

            {/* Badge Emoji */}
            <div
              className="text-[48px] animate-badge-float"
              style={{ lineHeight: 1 }}
            >
              {badgeEmoji}
            </div>

            {/* State Name */}
            <div className="text-[18px] font-bold text-text-primary text-center leading-tight">
              {state.name}
            </div>

            {/* Capital City */}
            {state.capital && (
              <div className="text-[12px] text-text-secondary">
                ⊕ {state.capital}
              </div>
            )}

            {/* Date */}
            <div className="text-[11px] text-text-secondary">
              {postcard.stampDate}
            </div>
          </div>
        </div>

        {/* Fun Fact Box */}
        <div
          className="rounded-xl w-full"
          style={{
            maxWidth: "320px",
            padding: "12px 16px",
            backgroundColor: "var(--accent-4-soft)",
          }}
        >
          <div className="text-[11px] font-bold uppercase tracking-widest text-text-primary">
            ✨ Did You Know?
          </div>
          <p
            className="text-[12px] text-text-primary leading-relaxed"
            style={{
              marginTop: "8px",
              display: "-webkit-box",
              WebkitLineClamp: factExpanded ? undefined : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {state.funFact}
          </p>
          {/* Show more button - appears when text is truncated */}
          {state.funFact.length > 150 && (
            <button
              onClick={() => setFactExpanded(!factExpanded)}
              className="mt-2 text-[11px] font-bold text-text-link transition-all"
              aria-expanded={factExpanded}
              aria-label={factExpanded ? "Show less fun fact" : "Show more fun fact"}
            >
              {factExpanded ? "Show less ▲" : "Show more ▼"}
            </button>
          )}
        </div>

        {/* Save to Passport Button */}
        <button
          onClick={handleSaveToPassport}
          disabled={isSaving}
          className="w-full h-12 rounded-2xl font-bold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all animate-cta-breathe"
          style={{
            maxWidth: "320px",
            backgroundColor: "var(--accent-1)",
            color: "var(--text-primary)",
            gap: "8px",
          }}
        >
          {isSaving ? (
            <>
              <span className="animate-spin">{EMOJI.ui.pending}</span>
              Saving...
            </>
          ) : (
            <>✨ Save to Passport</>
          )}
        </button>

        {/* Dismiss Hint */}
        <p className="text-xs text-center text-text-secondary">
          Tap anywhere to close
        </p>
      </div>
    </div>
  );
}
