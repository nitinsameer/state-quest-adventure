import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import mascot from "@/assets/mascot.png";
import { getState } from "@/lib/states";
import { STATE_ART, TONE_GRADIENT, TONE_HEX, preloadStateArt } from "@/lib/state-art";
import { useProgress, badgesFor, STATE_BADGES, type BadgeId } from "@/lib/progress";
import { fxTap, fxStamp } from "@/lib/fx";
import { requestStoragePermission, saveFileToDownloads } from "@/lib/permissions";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { useCelebration } from "@/hooks/useCelebration";
import { useToast } from "@/hooks/useToast";

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
  const [showPostcardChoice, setShowPostcardChoice] = useState(true);
  const [showFilePermissionPrompt, setShowFilePermissionPrompt] = useState(false);
  const cheer = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setBurst((n) => n + 1);
    preloadStateArt(state.name);
  }, [state.name]);

  async function makeBlob(): Promise<Blob | null> {
    const W = 900;
    const H = 1200;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext("2d");
    // FIX #14: Handle null context case
    if (!c) {
      return null;
    }

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

    // artwork — fitted inside a fixed band, centred, never upscaled past 1:1
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

  const [showShareConfirm, setShowShareConfirm] = useState(false);

  async function onShare() {
    if (busy) return;
    
    // Show parent confirmation dialog for sharing
    setShowShareConfirm(true);
  }

  async function confirmAndShare() {
    setShowShareConfirm(false);
    
    if (busy) return;
    
    // FIX #15: Default to false (opt-in) not true - require explicit acceptance
    const fileEnabled = localStorage.getItem("india-explorer:file-enabled:v1") === "1";
    
    if (!fileEnabled) {
      toast.warning("Enable 'Save & Share'", {
        subtitle: "Turn on in settings to save your postcard",
      });
      return;
    }
    
    setBusy(true);
    fxStamp();
    try {
      // Request actual Android permissions
      const permissionGranted = await requestStoragePermission();

      // FIX #14: Handle null blob case safely
      const blob = await makeBlob();
      if (!blob) {
        toast.error("Couldn't generate postcard", {
          subtitle: "Please try again",
        });
        return;
      }

      // FIX #12: Validate blob size - reject if too large
      const MAX_BLOB_SIZE = 50 * 1024 * 1024; // 50MB max
      if (blob.size > MAX_BLOB_SIZE) {
        toast.warning("Postcard is too large", {
          subtitle: "Try a lower resolution",
        });
        return;
      }

      const filename = `${state.name}-postcard.png`;
      const file = new File([blob], filename, { type: "image/png" });

      // Try native share first
      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean;
        share?: (d: ShareData) => Promise<void>;
      };

      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: `${state.name} postcard`,
            text: `I just explored ${state.name} on India Explorer!`,
          });
          celebration.success("Postcard shared!", {
            subtitle: "Your friends will love it",
            confetti: true,
            duration: 3500,
          });
        } catch (shareErr) {
          // Share cancelled or failed, try saving instead
          const saved = await saveFileToDownloads(blob, filename);
          if (saved) {
            celebration.success("Postcard saved!", {
              subtitle: "Check your photos",
              confetti: true,
              duration: 3500,
            });
          } else {
            toast.error("Couldn't save postcard", {
              subtitle: "Check your storage",
            });
          }
        }
      } else {
        // No native share, save to downloads/cache
        const saved = await saveFileToDownloads(blob, filename);
        if (saved) {
          celebration.success("Postcard saved!", {
            subtitle: "Check your photos",
            confetti: true,
            duration: 3500,
          });
        } else {
          toast.error("Couldn't save postcard", {
            subtitle: "Check your storage",
          });
        }
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        toast.error("Couldn't save postcard", {
          subtitle: "Please try again later",
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`h-full w-full ${grad} relative overflow-hidden flex flex-col`}>
      <ConfettiBurst trigger={burst} size="big" />

      {/* Pre-confirmation: Want to save postcard? */}
      {showPostcardChoice && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">📮</div>
              <h2 className="text-display text-2xl font-bold text-ink">
                Save Your Explorer Postcard?
              </h2>
            </div>
            
            <p className="text-sm font-semibold text-ink/80 text-center mb-6">
              Show your friends you beat {state.name}! You can save it or skip right to the next adventure.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  fxTap();
                  // FIX #15: Check if file saving is explicitly enabled (default off)
                  const fileEnabled = localStorage.getItem("india-explorer:file-enabled:v1") === "1";
                  if (!fileEnabled) {
                    setShowFilePermissionPrompt(true);
                    return;
                  }
                  setShowPostcardChoice(false);
                }}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-500 text-white text-display text-lg font-bold shadow-lg"
              >
                ✨ Yes, Save It!
              </button>
              <button
                onClick={() => {
                  fxTap();
                  onContinue?.();
                }}
                className="w-full h-14 rounded-2xl bg-gray-200 text-ink text-display text-lg font-bold"
              >
                Skip → Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full postcard screen (only shown if user chose "Yes") */}
      {!showPostcardChoice && (
        <>
          <div className="pt-5 text-center px-6 relative z-10">
            <div className="text-white/90 text-xs font-bold tracking-wide">
              Your Explorer Postcard
            </div>
            <div className="text-white text-xs font-semibold mt-1">
              Show your friends you beat {state.name}! 📮
            </div>
          </div>

          <div className="flex-1 px-5 pt-3 pb-1 relative z-10 overflow-y-auto">
            <button
              type="button"
              onClick={(e) => {
                fxTap();
                onShare();
              }}
              disabled={busy}
              className="w-full rounded-[28px] bg-white shadow-2xl border-4 border-white overflow-hidden animate-scale-in cursor-pointer hover:shadow-3xl active:scale-95 transition-all disabled:opacity-60 text-left"
            >
              <div className={`${grad} px-4 pt-4 pb-3 text-center text-white`}>
                <div className="text-xs font-bold tracking-wide opacity-90">
                  Greetings from
                </div>
                <div className="text-display text-3xl font-extrabold leading-tight">
                  {state.name}
                </div>
                <div className="text-[11px] font-bold opacity-90">{state.nickname}</div>
              </div>

              <div className="relative px-4 pt-3 pb-2 flex items-end justify-center bg-sky/60 min-h-[150px]">
                {art ? (
                  <img
                    src={art}
                    alt={`${state.name} illustration`}
                    decoding="async"
                    className="h-32 object-contain drop-shadow-lg"
                  />
                ) : (
                  <div className="text-[80px] leading-none">{state.emoji}</div>
                )}
                <img
                  ref={cheer}
                  src={mascot}
                  alt=""
                  className="absolute left-2 bottom-1 w-20 h-20 object-contain mascot-cheer"
                />
              </div>

              <div className="px-4 py-3">
                <div className="flex items-center gap-2 rounded-2xl bg-accent px-3 py-2">
                  <span className="text-2xl">{BADGE_EMOJI[badge.id]}</span>
                  <div>
                    <div className="text-xs font-bold text-accent-foreground/70">
                      Badge Earned
                    </div>
                    <div className="text-display font-extrabold text-sm text-ink">
                      {badge.name}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border-2 border-dashed border-border p-3">
                  <div className="text-xs font-bold text-muted-foreground">
                    Fun fact
                  </div>
                  <p className="text-sm font-bold text-ink mt-0.5">{state.funFact}</p>
                </div>
              </div>
            </button>
          </div>

          <div className="p-5 pt-2 relative z-10 space-y-2">
            <button
              onClick={onShare}
              disabled={busy || showShareConfirm}
              className="w-full h-14 rounded-2xl bg-white text-ink text-display text-lg font-bold shadow-xl disabled:opacity-60"
            >
              {busy ? "Making postcard…" : "📤 Save / Share Postcard"}
            </button>
            <button
              onClick={() => {
                fxTap();
                onContinue?.();
              }}
              className="w-full h-12 rounded-2xl bg-white/25 backdrop-blur text-white text-display font-extrabold"
            >
              Skip → Continue
            </button>
          </div>
        </>
      )}

      {/* Parent Gate Dialog for Sharing */}
      {showShareConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">👨‍👩‍👧</div>
              <h3 className="text-display text-lg font-extrabold text-ink">
                Ask a Parent First!
              </h3>
            </div>
            <p className="text-sm font-semibold text-ink/80 text-center mb-6">
              Before sharing your postcard online, ask a parent or guardian for permission. They can help you share safely! 🛡️
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareConfirm(false)}
                className="flex-1 h-12 rounded-xl bg-gray-200 text-ink text-display font-extrabold"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndShare}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-white text-display font-extrabold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Save Permission Prompt */}
      {showFilePermissionPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="text-center">
              <div className="text-5xl mb-3">📁</div>
              <h3 className="text-display text-xl font-extrabold text-ink">Enable Save & Share?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Turn on save & share to keep your postcard memories! 📮
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <span>📁</span>
                <span className="font-semibold text-green-900">Save postcards to device</span>
              </div>
              <div className="flex gap-2">
                <span>👥</span>
                <span className="font-semibold text-green-900">Share with family & friends</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  fxTap();
                  setShowFilePermissionPrompt(false);
                }}
                className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-800 font-bold text-sm"
              >
                Maybe Later
              </button>
              <Link
                to="/me"
                onClick={() => {
                  fxTap();
                  setShowFilePermissionPrompt(false);
                }}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-sm flex items-center justify-center"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
