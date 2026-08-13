import { useEffect, useState } from "react";

const COLORS = ["#FF7A1A", "#2E7DFF", "#22C55E", "#F5B301", "#ffffff"];

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
};

function makePieces(seed: number, count: number): Piece[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: seed * 1000 + i,
    left: (i * 37 + seed * 13) % 100,
    delay: ((i * 17) % 8) / 20,
    duration: 1.1 + ((i * 7) % 10) / 10,
    color: COLORS[(i + seed) % COLORS.length],
    size: 5 + (i % 4) * 2,
    rotate: (i * 31) % 360,
  }));
}

/**
 * Confetti burst scoped to its positioned parent (so it stays inside the
 * phone frame). Re-fires whenever `trigger` changes to a new truthy value.
 */
export function ConfettiBurst({
  trigger,
  size = "small",
}: {
  trigger: number;
  size?: "small" | "big";
}) {
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  useEffect(() => {
    if (!trigger) return;
    setPieces(makePieces(trigger, size === "big" ? 70 : 26));
    const t = setTimeout(() => setPieces(null), size === "big" ? 2800 : 1800);
    return () => clearTimeout(t);
  }, [trigger, size]);

  if (!pieces) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-6%] rounded-[2px] confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 2,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--confetti-rotate" as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
