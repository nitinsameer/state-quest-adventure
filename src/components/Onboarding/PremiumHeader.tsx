import { StepBadge } from "./StepBadge";

export interface PremiumHeaderProps {
  firstPart: string;
  secondPart: string;
  subtitle: string;
  step: 1 | 2;
  secondPartColor?: string;
}

export function PremiumHeader({
  firstPart,
  secondPart,
  subtitle,
  step,
  secondPartColor = "var(--accent-4)",
}: PremiumHeaderProps) {
  return (
    <div className="px-5 pt-safe pb-3 bg-transparent flex-shrink-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1
          className="flex-1 text-4xl font-black leading-tight"
          style={{
            fontFamily: '"Baloo 2", sans-serif',
            WebkitTextStroke: "2px white",
            textShadow: `
              -2px -2px 0 var(--text-primary),
              2px -2px 0 var(--text-primary),
              -2px 2px 0 var(--text-primary),
              2px 2px 0 var(--text-primary),
              -2px 0 0 var(--text-primary),
              2px 0 0 var(--text-primary),
              0 -2px 0 var(--text-primary),
              0 2px 0 var(--text-primary),
              0 0 8px rgba(0, 0, 0, 0.2)
            `,
            color: "var(--text-primary)",
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>{firstPart} </span>
          <span style={{ color: secondPartColor }}>{secondPart}</span>
        </h1>
        <div className="flex-shrink-0 pt-1">
          <StepBadge step={step} />
        </div>
      </div>
      <p className="text-sm font-semibold text-text-primary opacity-95 drop-shadow-md">
        {subtitle}
      </p>
    </div>
  );
}
