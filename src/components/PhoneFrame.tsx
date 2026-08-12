import type { ReactNode } from "react";

export function PhoneFrame({
  children,
  label,
  sublabel,
}: {
  children: ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center">
        <div className="text-display text-lg text-ink">{label}</div>
        {sublabel && (
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {sublabel}
          </div>
        )}
      </div>
      <div
        className="relative w-[360px] h-[760px] rounded-[52px] p-[10px] bg-neutral-900"
        style={{
          boxShadow:
            "0 40px 80px -30px rgba(15,23,42,0.35), 0 10px 25px -10px rgba(15,23,42,0.25), inset 0 0 0 2px #111",
        }}
      >
        <div className="relative w-full h-full rounded-[44px] overflow-hidden bg-white">
          {/* notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-32 h-7 bg-neutral-900 rounded-b-[18px]" />
          {/* status bar */}
          <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-7 pt-2 text-[11px] font-bold text-ink">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span>􀙇</span>
              <span>􀛨</span>
              <span>􀛪</span>
            </span>
          </div>
          <div className="absolute inset-0 pt-8 overflow-hidden">{children}</div>
          {/* home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-neutral-800/80" />
        </div>
      </div>
    </div>
  );
}
