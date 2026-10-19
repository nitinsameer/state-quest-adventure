import rajasthan from "@/assets/rajasthan.webp";
import gujarat from "@/assets/gujarat.png";
import maharashtra from "@/assets/maharashtra.png";
import mp from "@/assets/mp.png";
import goa from "@/assets/goa.webp";
import karnataka from "@/assets/karnataka.png";
import kerala from "@/assets/kerala.webp";
import tamilNadu from "@/assets/tamil-nadu.webp";
import andhraPradesh from "@/assets/andhra-pradesh.webp";
import telangana from "@/assets/telangana.webp";
import odisha from "@/assets/odisha.webp";
import westBengal from "@/assets/west-bengal.png";
import bihar from "@/assets/bihar.png";
import jharkhand from "@/assets/jharkhand.webp";
import chhattisgarh from "@/assets/chhattisgarh.webp";
import uttarPradesh from "@/assets/uttar-pradesh.png";
import uttarakhand from "@/assets/uttarakhand.webp";
import haryana from "@/assets/haryana.png";
import punjab from "@/assets/punjab.png";
import himachalPradesh from "@/assets/himachal-pradesh.webp";
import assam from "@/assets/assam.png";
import arunachalPradesh from "@/assets/arunachal-pradesh.png";
import manipur from "@/assets/manipur.webp";
import meghalaya from "@/assets/meghalaya.png";
import mizoram from "@/assets/mizoram.webp";
import nagaland from "@/assets/nagaland.webp";
import sikkim from "@/assets/sikkim.png";
import tripura from "@/assets/tripura.webp";
import delhi from "@/assets/delhi.png";
import jammuKashmir from "@/assets/jammu-kashmir.png";
import ladakh from "@/assets/ladakh.webp";
import puducherry from "@/assets/puducherry.webp";
import chandigarh from "@/assets/chandigarh.png";
import andaman from "@/assets/andaman.png";
import lakshadweep from "@/assets/lakshadweep.png";
import dnhDd from "@/assets/dnh-dd.png";

/** Illustration art for every state and union territory. */
export const STATE_ART: Record<string, string> = {
  Rajasthan: rajasthan,
  Gujarat: gujarat,
  "Madhya Pradesh": mp,
  Maharashtra: maharashtra,
  Goa: goa,
  Karnataka: karnataka,
  Kerala: kerala,
  "Tamil Nadu": tamilNadu,
  "Andhra Pradesh": andhraPradesh,
  Telangana: telangana,
  Odisha: odisha,
  "West Bengal": westBengal,
  Bihar: bihar,
  Jharkhand: jharkhand,
  Chhattisgarh: chhattisgarh,
  "Uttar Pradesh": uttarPradesh,
  Uttarakhand: uttarakhand,
  Haryana: haryana,
  Punjab: punjab,
  "Himachal Pradesh": himachalPradesh,
  Assam: assam,
  "Arunachal Pradesh": arunachalPradesh,
  Manipur: manipur,
  Meghalaya: meghalaya,
  Mizoram: mizoram,
  Nagaland: nagaland,
  Sikkim: sikkim,
  Tripura: tripura,
  Delhi: delhi,
  "Jammu & Kashmir": jammuKashmir,
  Ladakh: ladakh,
  Puducherry: puducherry,
  Chandigarh: chandigarh,
  "Andaman & Nicobar Islands": andaman,
  Lakshadweep: lakshadweep,
  "Dadra & Nagar Haveli and Daman & Diu": dnhDd,
};

export const TONE_GRADIENT: Record<string, string> = {
  orange: "var(--accent-1)",
  blue: "var(--accent-5)",
  green: "var(--accent-3)",
  gold: "var(--accent-4)",
};

/** Flat hex pairs matching the gradient utilities, for canvas rendering. */
export const TONE_HEX: Record<string, [string, string]> = {
  orange: ["#FFA766", "#EF6C1A"],
  blue: ["#5FA8F5", "#2E4FE0"],
  green: ["#6FE0A0", "#17A75C"],
  gold: ["#FFD86B", "#E0A21C"],
};

const preloaded = new Set<string>();

/** Warm the browser cache for one or more state illustrations. */
export function preloadStateArt(...names: (string | undefined)[]) {
  if (typeof window === "undefined") return;
  for (const name of names) {
    if (!name) continue;
    const src = STATE_ART[name];
    if (!src || preloaded.has(src)) continue;
    preloaded.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }
}
