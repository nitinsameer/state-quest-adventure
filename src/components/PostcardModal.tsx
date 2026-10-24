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
  const state = getState(postcard.state);
  const art = STATE_ART[state.name];
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

  c.fillStyle = readTokenAsHex("--text-on-header");
  c.globalAlpha = 0.92;
  c.font = "bold 30px system-ui, sans-serif";
  c.textAlign = "center";
  c.fillText("EXPLORER PASSPORT", W / 2, 120);

  c.globalAlpha = 0.78;
  c.font = "22px system-ui, sans-serif";
  c.fillText("State Completed", W / 2, 165);

  // state name
  c.globalAlpha = 1;
  c.fillStyle = from;
  c.font = "bold 48px system-ui, sans-serif";
  c.fillText(state.name, W / 2, 280);

  // date
  c.fillStyle = from;
  c.font = "18px system-ui, sans-serif";
  c.fillText(postcard.stampDate, W / 2, 330);

  // state image
  if (art) {
    try {
      const img = await loadImage(art);
      const imgW = 160;
      const imgH = 160;
      c.drawImage(img, W / 2 - imgW / 2, 420, imgW, imgH);
    } catch {
      // fallback to emoji
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
  c.font = "bold 18px system-ui, sans-serif";
  c.textAlign = "center";
  c.fillText("Badge Earned", W / 2, 735);

  const badgeEmoji = BADGE_EMOJI[postcard.badge] || EMOJI.achievement.explorer;
  c.font = "60px system-ui";
  c.fillText(badgeEmoji, W / 2, 800);

  // footer
  c.globalAlpha = 0.3;
  c.fillStyle = readTokenAsHex("--text-primary");
  c.font = "14px system-ui, sans-serif";
  c.textAlign = "center";
  c.fillText("India Explorer", W / 2, 1080);
  c.fillText(`Completed on ${postcard.stampDate}`, W / 2, 1110);
  c.globalAlpha = 1;

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
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
        toast.error("Couldn't generate postcard", {
          subtitle: "Please try again",
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
      toast.error("Couldn't save postcard", {
        subtitle: "Please try again later",
      });
      console.error("Save failed:", error);
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
        className="relative z-10 flex flex-col items-center max-w-[360px] w-full"
        style={{ padding: "24px", gap: "16px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* State Name Label (outside postcard) */}
        <div className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">
          {state.name}
        </div>

        {/* Postcard Card */}
        <div
          className="relative w-[328px] h-[420px] rounded-[20px] overflow-hidden animate-postcard-enter"
          style={
            {
              backgroundColor: "white",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.18), 0 0 0 0 transparent",
              "--glow-color": `${fromHex}59`,
            } as React.CSSProperties
          }
        >
          {/* Hero Image Section (top 60% = 252px) */}
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

          {/* Content Area (bottom 40% = 168px) */}
          <div
            className="absolute inset-0 top-3/5 flex flex-col items-center justify-center"
            style={{
              backgroundColor: "white",
              padding: "16px 20px",
              gap: "8px",
            }}
          >
            {/* Badge Type Label */}
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary">
              {postcard.badge} Badge
            </div>

            {/* Badge Emoji */}
            <div className="text-[56px] animate-badge-float" style={{ lineHeight: 1 }}>
              {badgeEmoji}
            </div>

            {/* State Name */}
            <div className="text-[20px] font-bold text-text-primary text-center">{state.name}</div>

            {/* Capital City */}
            {state.capital && (
              <div className="text-[13px] text-text-secondary">⊕ {state.capital}</div>
            )}

            {/* Date */}
            <div className="text-[12px] text-text-secondary">{postcard.stampDate}</div>
          </div>
        </div>

        {/* Fun Fact Box */}
        <div
          className="rounded-xl"
          style={{
            maxWidth: "360px",
            padding: "12px 16px",
            backgroundColor: "var(--accent-4-soft)",
          }}
        >
          <div className="text-[11px] font-bold uppercase tracking-widest text-text-primary">
            ✨ Did You Know?
          </div>
          <p
            className="text-[13px] text-text-primary leading-relaxed"
            style={{
              marginTop: "8px",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {state.funFact}
          </p>
        </div>

        {/* Save to Passport Button */}
        <button
          onClick={handleSaveToPassport}
          disabled={isSaving}
          className="w-full h-12 rounded-2xl font-bold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all animate-cta-breathe"
          style={{
            maxWidth: "360px",
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
        <p className="text-xs text-center text-text-secondary">Tap anywhere to close</p>
      </div>
    </div>
  );
}
