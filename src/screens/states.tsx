import airplane from "@/assets/airplane.png";
import mascot from "@/assets/mascot.png";
import { Cloud, HeaderBar } from "./shared";

export function LoadingScreen() {
  return (
    <div className="h-full w-full gradient-sky relative overflow-hidden flex flex-col items-center justify-center">
      <Cloud className="absolute top-14 left-2 w-24 opacity-90 animate-pulse" />
      <Cloud className="absolute top-32 right-4 w-20 opacity-80" />
      <Cloud className="absolute bottom-40 left-6 w-28 opacity-85 animate-pulse" />
      <Cloud className="absolute bottom-56 right-2 w-16 opacity-70" />

      <div className="relative">
        <div className="absolute -inset-6 rounded-full border-2 border-dashed border-explorer/30 animate-spin" />
        <img
          src={airplane}
          alt=""
          className="relative w-40 h-40 object-contain drop-shadow-2xl"
          style={{ transform: "rotate(-10deg)" }}
        />
      </div>
      <div className="mt-8 text-center">
        <div className="text-display text-2xl font-extrabold">Flying to Gujarat…</div>
        <div className="text-sm font-bold text-muted-foreground mt-1">
          Packing camel snacks 🐪
        </div>
      </div>
      <div className="mt-6 w-56 h-2 rounded-full bg-white/70 overflow-hidden">
        <div className="h-full w-2/3 gradient-explorer animate-pulse" />
      </div>
    </div>
  );
}

export function EmptyStateScreen() {
  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title="Friends" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-saffron/25 rounded-full" />
          <img src={mascot} alt="" className="relative w-52 h-52 object-contain" />
        </div>
        <h2 className="text-display text-2xl font-extrabold mt-4">
          No explorer friends yet!
        </h2>
        <p className="mt-2 text-sm font-bold text-muted-foreground max-w-[260px]">
          Invite a friend to join your adventure and travel across India
          together.
        </p>
        <button className="mt-6 h-14 px-6 rounded-2xl gradient-saffron text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)]">
          Invite a Friend ⭐
        </button>
        <button className="mt-2 h-12 px-6 rounded-2xl bg-muted text-ink text-display font-extrabold">
          Maybe later
        </button>
      </div>
    </div>
  );
}
