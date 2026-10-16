/**
 * Theme Music Player
 * Plays looping background music per theme.
 * Opt-in: disabled by default, user must enable via settings.
 * Respects: reduced-motion preference, parental audio consent if set.
 */

const STORAGE_KEY = "theme-music-enabled";
const VOLUME_KEY = "theme-music-volume";

let currentAudio: HTMLAudioElement | null = null;
let currentThemeId: string | null = null;
let isMuted = false;

function isEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getVolume(): number {
  try {
    const v = parseFloat(localStorage.getItem(VOLUME_KEY) ?? "0.25");
    return isNaN(v) ? 0.25 : Math.max(0, Math.min(1, v));
  } catch {
    return 0.25;
  }
}

export function playThemeMusic(themeId: string, musicUrl?: string): void {
  // Respect reduced-motion preference
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  if (!isEnabled()) return;
  if (!musicUrl) return;
  if (currentThemeId === themeId && currentAudio && !currentAudio.paused) return;
  stopThemeMusic();
  try {
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = isMuted ? 0 : getVolume();
    audio.preload = "none";
    currentAudio = audio;
    currentThemeId = themeId;
    audio.play().catch(() => {
      /* autoplay blocked — silent fail */
    });
  } catch {
    // Audio not supported
  }
}

export function stopThemeMusic(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  currentThemeId = null;
}

export function toggleThemeMusic(): boolean {
  isMuted = !isMuted;
  if (currentAudio) {
    currentAudio.volume = isMuted ? 0 : getVolume();
  }
  return !isMuted;
}

export function isMusicPlaying(): boolean {
  return !!(currentAudio && !currentAudio.paused);
}

export function setMusicEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    /* storage unavailable */
  }
  if (!enabled) {
    stopThemeMusic();
  }
}

export function isMusicEnabled(): boolean {
  return isEnabled();
}

export function setVolume(volume: number): void {
  const v = Math.max(0, Math.min(1, volume));
  try {
    localStorage.setItem(VOLUME_KEY, String(v));
  } catch {
    /* storage unavailable */
  }
  if (currentAudio) {
    currentAudio.volume = v;
  }
}
