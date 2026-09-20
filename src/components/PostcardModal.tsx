import { useState } from "react";
import { getState } from "@/lib/states";
import { STATE_ART, TONE_GRADIENT, TONE_HEX } from "@/lib/state-art";
import { type PostcardData } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { requestStoragePermission, saveFileToDownloads } from "@/lib/permissions";
import { useCelebration } from "@/hooks/useCelebration";
import { useToast } from "@/hooks/useToast";

const BADGE_EMOJI: Record<string, string> = {
  monument: "🏛️",
  animal: "🐾",
  explorer: "🎖️",
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
  c.fillText("EXPLORER PASSPORT", W / 2, 120);

  c.fillStyle = "rgba(255,255,255,0.78)";
  c.font = "22px system-ui, sans-serif";
  c.fillText("State Completed", W / 2, 165);

  // state name
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
  c.fillStyle = "#f5e6c8";
  roundRect(c, 100, 700, W - 200, 140, 16);
  c.fill();

  c.fillStyle = "#333";
  c.font = "bold 18px system-ui, sans-serif";
  c.textAlign = "center";
  c.fillText("Badge Earned", W / 2, 735);

  const badgeEmoji = BADGE_EMOJI[postcard.badge] || "🎖️";
  c.font = "60px system-ui";
  c.fillText(badgeEmoji, W / 2, 800);

  // footer
  c.fillStyle = "rgba(0,0,0,0.3)";
  c.font = "14px system-ui, sans-serif";
  c.textAlign = "center";
  c.fillText("India Explorer", W / 2, 1080);
  c.fillText(`Completed on ${postcard.stampDate}`, W / 2, 1110);

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
  const celebration = useCelebration();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleShare = async () => {
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

      const hasPermission = await requestStoragePermission();
      if (hasPermission) {
        await saveFileToDownloads(blob, `${postcard.state}-explorer-passport.png`);
        celebration.success("Passport saved!", {
          subtitle: "Check your photos",
          confetti: true,
          duration: 3500,
        });
      } else {
        toast.error("Permission denied", {
          subtitle: "Enable storage in settings",
        });
      }
    } catch (error) {
      toast.error("Couldn't save passport", {
        subtitle: "Please try again later",
      });
      console.error("Share failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const badgeEmoji = BADGE_EMOJI[postcard.badge] || "🎖️";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center pt-2">
          <h2 className="text-display font-extrabold text-2xl text-ink">
            Achievement Unlocked!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You completed {state.name}
          </p>
        </div>

        {/* Badge Display */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">{badgeEmoji}</div>
          <div className="text-center">
            <div className="text-sm font-extrabold text-muted-foreground">
              {postcard.badge.toUpperCase()} BADGE
            </div>
            <div className="text-display font-extrabold text-lg text-ink mt-1">
              {state.name} Explorer
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {postcard.stampDate}
            </div>
          </div>
        </div>

        {/* Fun Fact Section */}
        <div className="bg-saffron-soft rounded-2xl p-4 my-2">
          <div className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
            💡 Did You Know?
          </div>
          <p className="text-sm text-ink mt-2 leading-relaxed">
            {state.funFact}
          </p>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={isSaving}
          className="w-full h-12 rounded-2xl gradient-saffron text-white font-extrabold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
              Saving...
            </>
          ) : (
            <>
              📸 Save to Photos
            </>
          )}
        </button>

        {/* Info Text */}
        <p className="text-xs text-center text-muted-foreground">
          Share your achievement or keep it in your explorer passport! 🎉
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-2xl bg-white border-2 border-ink text-ink font-extrabold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
