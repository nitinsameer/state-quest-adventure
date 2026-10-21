import { StepBadge } from "./StepBadge";

export interface PremiumHeaderProps {
  firstPart: string;
  secondPart: string;
  subtitle: string;
  step: 1 | 2;
}

export function PremiumHeader({
  firstPart,
  secondPart,
  subtitle,
  step,
}: PremiumHeaderProps) {
  return (
    <div className="px-5 pt-safe pb-2 bg-accent-1 flex-shrink-0">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1
          className="flex-1 text-4xl font-black leading-tight"
          style={{
            fontFamily: '"Baloo 2", sans-serif',
            WebkitTextStroke: "2px white",
            textShadow: `
              -2px -2px 0 #001f3f,
              2px -2px 0 #001f3f,
              -2px 2px 0 #001f3f,
              2px 2px 0 #001f3f,
              -2px 0 0 #001f3f,
              2px 0 0 #001f3f,
              0 -2px 0 #001f3f,
              0 2px 0 #001f3f,
              0 0 8px rgba(0, 31, 63, 0.5)
            `,
            color: "#001f3f",
          }}
        >
          <span style={{ color: "#001f3f" }}>{firstPart} </span>
          <span style={{ color: "#FFD700" }}>{secondPart}</span>
        </h1>
        <div className="flex-shrink-0 pt-2">
          <StepBadge step={step} />
        </div>
      </div>
      <p className="text-sm font-semibold text-text-on-primary opacity-90">
        {subtitle}
      </p>
    </div>
  );
}
