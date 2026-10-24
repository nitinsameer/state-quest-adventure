/**
 * PostcardPreviewModal - Uses StandardModal for consistent design
 *
 * Auto-shows postcard preview after quiz completion with two CTAs:
 * 1. "Save to Passport" - stores postcard data locally in app
 * 2. "Later" - dismisses modal, user can access from Passport tab anytime
 *
 * Kid-friendly UX: Clear preview of what's being saved, simple language
 * No storage permission prompts (COPPA-compliant)
 */

import { useEffect, useRef, useState } from "react";
import { getState } from "@/lib/states";
import { STATE_ART, TONE_GRADIENT, TONE_HEX, preloadStateArt } from "@/lib/state-art";
import { useProgress, badgesFor, STATE_BADGES, type BadgeId, type Progress } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { useToast } from "@/hooks/useToast";
import { usePostcardLibrary } from "@/store/postcard-library-store";
import { StandardModal } from "@/components/StandardModal";
import { readTokenAsHex } from "@/lib/theme-tokens";
import { EMOJI } from "@/constants/emoji";

const BADGE_EMOJI: Record<"monument" | "animal" | "explorer", string> = {
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

async function generatePostcardPreview(stateName?: string): Promise<Blob | null> {
  const state = getState(stateName);
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
      // Canvas shadow: var(--shadow-raised) maps to --shadow-raised concept
      // Note: Canvas 2D doesn't support CSS variables, so shadow colors are hardcoded
      // The rgba value is consistent across postcard shadow rendering
      c.shadowColor = "var(--shadow-raised)";
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

  // badge chip
  const emptyProgress: Progress = {
    name: "",
    avatar: "",
    ageBand: "",
    onboarded: false,
    xp: 0,
    streak: 0,
    lastActive: new Date().toISOString().split("T")[0],
    completed: [],
    stamps: {},
    postcards: {},
    answered: [],
    badges: {},
    cards: {},
  };
  const earned = badgesFor(emptyProgress, state.name);
  const badge = STATE_BADGES.find((b) => b.id === earned[0]) ?? STATE_BADGES[0];

  c.fillStyle = readTokenAsHex("--accent-6-soft");
  roundRect(c, 120, 830, W - 240, 110, 40);
  c.fill();
  c.fillStyle = readTokenAsHex("--text-primary");
  c.font = "bold 40px system-ui, sans-serif";
  const badgeEmoji = BADGE_EMOJI[badge.id as "monument" | "animal" | "explorer"];
  c.fillText(`${badgeEmoji}  ${badge.name} Badge Earned`, W / 2, 900);

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

  return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export interface PostcardPreviewModalProps {
  stateName?: string;
  open?: boolean;
  onClose?: () => void;
  onSave?: () => void;
}

export function PostcardPreviewModal({
  stateName,
  open = false,
  onClose,
  onSave,
}: PostcardPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  // Generate preview on mount or when stateName changes
  useEffect(() => {
    if (!isOpen || !stateName) return;

    async function generatePreview() {
      try {
        preloadStateArt(stateName);
        const blob = await generatePostcardPreview(stateName);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch (err) {
        console.error("[PostcardPreviewModal] Failed to generate preview", err);
      }
    }

    generatePreview();

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [isOpen, stateName, previewUrl]);

  const handleSaveToPassport = async () => {
    if (isSaving) return;

    setIsSaving(true);
    fxTap();

    try {
      // Generate full postcard blob
      const blob = await generatePostcardPreview(stateName);
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
        const now = new Date().toISOString();

        // Generate a stamp date like "12 � MAR"
        const date = new Date();
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
        const stampDate = `${day} � ${month}`;

        // Determine badge earned
        const emptyProgress2: Progress = {
          name: "",
          avatar: "",
          ageBand: "",
          onboarded: false,
          xp: 0,
          streak: 0,
          lastActive: new Date().toISOString().split("T")[0],
          completed: [],
          stamps: {},
          postcards: {},
          answered: [],
          badges: {},
          cards: {},
        };
        const earned = badgesFor(emptyProgress2, stateName || "");
        let badgeId: "monument" | "animal" | "explorer" = "explorer";
        if (
          earned.length > 0 &&
          (earned[0] === "monument" || earned[0] === "animal" || earned[0] === "explorer")
        ) {
          badgeId = earned[0];
        }

        // Add to postcard library with image data
        library.addPostcard(stateName || "", badgeId, stampDate, now, base64);

        toast.success(`${EMOJI.action.sparkle} Saved to your Passport!`, {
          subtitle: "View anytime from Explorer",
        });
        setIsSaving(false);
        onSave?.();
        handleClose();
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("[PostcardPreviewModal] Save failed", err);
      toast.error("Something went wrong", {
        subtitle: "Please try again",
      });
      setIsSaving(false);
    }
  };

  const handleLater = () => {
    fxTap();
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <StandardModal
        open={isOpen}
        onClose={handleClose}
        header={{
          icon: EMOJI.action.sparkle,
          title: "Your Postcard's Ready!",
          subtitle: "What would you like to do?",
        }}
        content={[
          {
            type: "custom",
            className:
              "relative ui-card ui-accent-1-soft aspect-[3/4] overflow-hidden rounded-xl -mx-6 -mt-6 mb-(--space-2)",
            children: (
              <div className="relative w-full h-full">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Your postcard"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent-1-soft">
                    <div className="text-center">
                      <div className="text-5xl mb-2">{EMOJI.action.sparkle}</div>
                      <div className="text-sm font-semibold text-muted-foreground">
                        Creating your postcard...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
        buttons={[
          {
            label: isSaving ? "Saving..." : `${EMOJI.action.save} Save to Passport`,
            onClick: handleSaveToPassport,
            variant: "primary",
          },
          {
            label: "? Later",
            onClick: handleLater,
            variant: "tertiary",
          },
        ]}
        maxWidth="max-w-md"
        contentClassName="!space-y-0"
      />
    </>
  );
}
