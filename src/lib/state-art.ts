import rajasthan from "@/assets/rajasthan.png";
import gujarat from "@/assets/gujarat.png";
import maharashtra from "@/assets/maharashtra.png";
import mp from "@/assets/mp.png";

/** Illustration art for the states that ship with custom artwork. */
export const STATE_ART: Record<string, string> = {
  Rajasthan: rajasthan,
  Gujarat: gujarat,
  "Madhya Pradesh": mp,
  Maharashtra: maharashtra,
};

export const TONE_GRADIENT: Record<string, string> = {
  orange: "gradient-saffron",
  blue: "gradient-explorer",
  green: "gradient-success",
  gold: "gradient-gold",
};

/** Flat hex pairs matching the gradient utilities, for canvas rendering. */
export const TONE_HEX: Record<string, [string, string]> = {
  orange: ["#FFA766", "#EF6C1A"],
  blue: ["#5FA8F5", "#2E4FE0"],
  green: ["#6FE0A0", "#17A75C"],
  gold: ["#FFD86B", "#E0A21C"],
};
