export interface StepBadgeProps {
  step: 1 | 2;
}

export function StepBadge({ step }: StepBadgeProps) {
  return (
    <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white shadow-sm">
      <span
        className="font-semibold text-sm"
        style={{ color: "#001f3f" }}
      >
        Step {step}/2
      </span>
    </div>
  );
}
