import { useMemo } from 'react';

interface StreakDotRowProps {
  streakCount: number; // 0-7
  todayIndex?: number; // which day is today (0=Sun, 1=Mon, etc.)
}

export function StreakDotRow({ 
  streakCount = 0, 
  todayIndex = new Date().getDay() 
}: StreakDotRowProps) {
  const daysOfWeek = useMemo(() => 
    Array.from({ length: 7 }).map((_, idx) => ({
      dayIndex: idx,
      isToday: idx === todayIndex,
      isCompleted: idx < streakCount,
      label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][idx],
    })), 
    [streakCount, todayIndex]
  );

  return (
    <div className="flex items-center justify-center gap-1.5 px-3 py-2 ui-chip ui-accent-2-soft rounded-lg">
      {daysOfWeek.map((day, idx) => (
        <div
          key={day.dayIndex}
          className={`
            w-3 h-3 rounded-full transition-all duration-300
            ${
              day.isToday
                ? 'bg-accent-1 ring-2 ring-offset-1 ring-accent-1 animate-streak-current-pulse'
                : day.isCompleted
                ? 'bg-accent-3'
                : 'bg-surface-muted'
            }
          `}
          style={{
            animation: `popIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 50}ms both`,
          }}
          title={`${day.label}: ${day.isToday ? 'today' : day.isCompleted ? 'completed' : 'pending'}`}
          aria-label={`Day ${day.dayIndex + 1}: ${day.isCompleted ? 'completed' : 'pending'}`}
        />
      ))}
    </div>
  );
}
