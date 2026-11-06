export interface StepBadgeProps {
  step: 1 | 2;
}

export function StepBadge({ step }: StepBadgeProps) {
  return (
    <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-surface-card shadow-sm">
      <span
        className="font-semibold text-sm text-text-primary"
      >
        Step {step}/2
      </span>
    </div>
  );
}
