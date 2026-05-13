import { cn } from "@/lib/utils";
import type { RiskLevel } from "../types/screening";
import { parseRiskLevel } from "../types/screening";

interface RiskBadgeProps {
  level: RiskLevel | string;
  className?: string;
  size?: "sm" | "md";
}

const RISK_STYLES: Record<RiskLevel, string> = {
  low: "bg-accent/15 text-accent border-accent/30",
  moderate: "bg-secondary/15 text-secondary border-secondary/30",
  elevated: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low Risk",
  moderate: "Moderate Risk",
  elevated: "Elevated Risk",
  high: "High Risk",
};

const RISK_DOTS: Record<RiskLevel, string> = {
  low: "bg-accent",
  moderate: "bg-secondary",
  elevated: "bg-chart-4",
  high: "bg-destructive",
};

export default function RiskBadge({
  level,
  className,
  size = "md",
}: RiskBadgeProps) {
  const normalized = typeof level === "string" ? parseRiskLevel(level) : level;
  const styles = RISK_STYLES[normalized];
  const dotStyle = RISK_DOTS[normalized];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        styles,
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          dotStyle,
        )}
      />
      {RISK_LABELS[normalized]}
    </span>
  );
}
