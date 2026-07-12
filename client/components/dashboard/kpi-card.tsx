import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Optional % change vs previous period */
  trend?: number;
  /** Prefix for value e.g. "₹" */
  prefix?: string;
  /** Suffix for value e.g. "%" */
  suffix?: string;
  /** Accent colour variant */
  variant?: "default" | "primary" | "accent" | "destructive";
}

const VARIANT_STYLES: Record<string, string> = {
  default:     "bg-card border-border",
  primary:     "bg-primary/10 border-primary/20",
  accent:      "bg-accent/10 border-accent/20",
  destructive: "bg-destructive/10 border-destructive/20",
};

const ICON_STYLES: Record<string, string> = {
  default:     "bg-muted text-muted-foreground",
  primary:     "bg-primary text-primary-foreground",
  accent:      "bg-accent text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  prefix = "",
  suffix = "",
  variant = "default",
}: KpiCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md ${VARIANT_STYLES[variant]}`}
    >
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${ICON_STYLES[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isPositiveTrend
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {prefix}
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          {suffix}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
