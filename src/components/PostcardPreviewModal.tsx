/**
 * PostcardPreviewModal - Uses StandardModal for consistent design
 * 
 * Auto-shows postcard preview after quiz completion with three CTAs:
 * 1. "Save to Photos" - triggers FilePermissionDialog (kid-friendly), then saves
 * 2. "Keep in App Only" - stores postcard data locally, no file export
 * 3. "Later" - dismisses modal, user can access from Passport tab anytime
 * 
 * Kid-friendly UX: Clear preview of what's being saved, simple language
 * 
 * Integration: Uses FilePermissionDialog (StandardModal-based) for granular permission request
 */

import { useEffect, useRef, useState } from "react";
import { getState } from "@/lib/states";
import { STATE_ART, TONE_GRADIENT, TONE_HEX, preloadStateArt } from "@/lib/state-art";
import { useProgress, badgesFor, STATE_BADGES, type BadgeId } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { requestStoragePermission, saveFileToDownloads } from "@/lib/permissions";
import { useToast } from "@/hooks/useToast";
import { FilePermissionDialog } from "@/components/FilePermissionDialog";
import { hasFeatureConsent } from "@/lib/parental-consent";
import { usePostcardLibrary } from "@/store/postcard-library-store";
import { markPostcardAsExported } from "@/lib/postcard-library";
import { StandardModal } from "@/components/StandardModal";

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

  // badge chip
  const earned = badgesFor(
    { stamps: {}, postcards: {}, achievements: {} } as any,
    state.name,
  );
  const badge = STATE_BADGES.find((b) => b.id === earned[0]) ?? STATE_BADGES[0];
  
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
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
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
  }, [isOpen, stateName]);

  const handleSaveToPhotos = async () => {
    if (isSaving) return;
    
    // Check if user has granted file permission
    if (!hasFeatureConsent('file')) {
      console.log("[POSTCARD] File permission not granted, showing permission dialog");
      setIsSaving(true);
      fxTap();
      setShowPermissionDialog(true);
      return;
    }
    
    // Permission already granted, proceed directly to save
    console.log("[POSTCARD] File permission already granted, proceeding to save");
    setIsSaving(true);
    fxTap();
    await handlePermissionAccepted();
  };

  const handlePermissionAccepted = async () => {
    try {
      // Request actual Android storage permission first
      console.log("[POSTCARD] Requesting storage permission before saving");
      const permissionGranted = await requestStoragePermission();
      console.log("[POSTCARD] Storage permission result:", { permissionGranted });
      
      if (!permissionGranted) {
        toast.error("Storage permission needed", {
          subtitle: "Please enable storage access in settings",
        });
        setIsSaving(false);
        return;
      }
      
      // Generate full postcard blob
      const blob = await generatePostcardPreview(stateName);
      if (!blob) {
        toast.error("Couldn't generate postcard", {
          subtitle: "Please try again",
        });
        setIsSaving(false);
        return;
      }

      // Save to device
      const filename = `${stateName}-postcard.png`;
      const success = await saveFileToDownloads(blob, filename);

      if (success) {
        // Mark postcard as exported in library
        const library = usePostcardLibrary.getState();
        const postcard = library.postcards.find((p) => p.state === stateName);
        if (postcard) {
          const updatedPostcard = markPostcardAsExported(postcard, filename);
          library.updatePostcard(postcard.id, updatedPostcard);
          console.log("[POSTCARD] Export tracking updated for", stateName);
        }
        
        toast.success("Postcard saved!", {
          subtitle: "Check your photos folder",
        });
        onSave?.();
        handleClose();
      } else {
        toast.error("Couldn't save postcard", {
          subtitle: "Please try again",
        });
      }
    } catch (err) {
      console.error("[PostcardPreviewModal] Save failed", err);
      toast.error("Something went wrong", {
        subtitle: "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePermissionRejected = () => {
    toast.info("No problem!", {
      subtitle: "You can try again anytime",
    });
    setIsSaving(false);
  };

  const handleKeepInApp = () => {
    fxTap();
    toast.success("Postcard saved in app!", {
      subtitle: "View anytime from your Passport",
    });
    onSave?.();
    handleClose();
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
          icon: "✨",
          title: "Your Postcard's Ready!",
          subtitle: "What would you like to do?",
        }}
        headerGradient={["from-purple-400", "to-pink-400"]}
        content={[
          {
            type: "custom",
            className: "relative clay-card clay-white aspect-[3/4] overflow-hidden rounded-xl -mx-6 -mt-6 mb-[--space-2]",
            children: (
              <div className="relative w-full h-full">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Your postcard"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="text-center">
                      <div className="text-5xl mb-2">✨</div>
                      <div className="text-sm font-semibold text-muted">Creating your postcard...</div>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
        buttons={[
          {
            label: isSaving ? "Saving..." : "📸 Save to Photos",
            onClick: handleSaveToPhotos,
            variant: "primary",
          },
          {
            label: "📱 Keep in App",
            onClick: handleKeepInApp,
            variant: "secondary",
          },
          {
            label: "⏰ Later",
            onClick: handleLater,
            variant: "tertiary",
          },
        ]}
        maxWidth="max-w-md"
        contentClassName="!space-y-0"
      />

      {/* Kid-friendly permission dialog shown on-demand */}
      <FilePermissionDialog
        open={showPermissionDialog}
        onAccept={handlePermissionAccepted}
        onReject={handlePermissionRejected}
      />
    </>
  );
}

