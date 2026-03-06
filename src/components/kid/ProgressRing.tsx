"use client";

interface ProgressRingProps {
  /** Progress percentage 0–100 */
  value: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Ring stroke width in pixels */
  strokeWidth?: number;
  /** Custom colour for the progress arc (Tailwind text-color class or CSS colour) */
  color?: string;
  /** Show the numeric percentage in the center */
  showPercent?: boolean;
  /** Optional label below the ring */
  label?: string;
  /** Content to render inside the ring (overrides showPercent) */
  children?: React.ReactNode;
}

/**
 * Circular SVG progress ring.
 * Used in study dashboards, subject cards, and parent progress views.
 * Fully accessible with ARIA progressbar role.
 */
export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  color,
  showPercent = false,
  label,
  children,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative inline-flex items-center justify-center"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}% complete`}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color ?? "hsl(var(--primary))"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children ?? (
            showPercent && (
              <span className="text-sm font-bold text-foreground">
                {clamped}%
              </span>
            )
          )}
        </div>
      </div>

      {label && (
        <span className="text-xs font-semibold text-muted-foreground text-center">
          {label}
        </span>
      )}
    </div>
  );
}
