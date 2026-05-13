import { cn } from "@/lib/utils";
import type { ConditionResult } from "../backend";
import {
  getConditionDisplayName,
  getConfidenceColorClass,
  getConfidenceTextClass,
  parseRiskLevel,
} from "../types/screening";
import RiskBadge from "./RiskBadge";

interface ConditionSummaryGridProps {
  conditions: ConditionResult[];
  className?: string;
}

// ── Single summary card ────────────────────────────────────────────────────

function SummaryCard({
  condition,
  index,
}: {
  condition: ConditionResult;
  index: number;
}) {
  const risk = parseRiskLevel(condition.riskLevel);
  const displayName = getConditionDisplayName(condition.condition);
  const pct = Math.min(100, Math.max(0, condition.conditionConfidence));
  const confColor = getConfidenceColorClass(pct);
  const confText = getConfidenceTextClass(pct);
  const confLabel = pct >= 70 ? "High" : pct >= 40 ? "Moderate" : "Low";

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-smooth"
      data-ocid={`condition_grid.item.${index + 1}`}
    >
      {/* Condition name */}
      <p className="font-display font-semibold text-sm text-foreground leading-snug min-w-0 break-words">
        {displayName}
      </p>

      {/* Confidence percentage with color */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn("font-mono text-2xl font-bold tabular-nums", confText)}
        >
          {pct.toFixed(0)}%
        </span>
        <span
          className={cn(
            "text-[10px] font-medium border rounded-full px-2 py-0.5",
            pct >= 70
              ? "bg-accent/10 text-accent border-accent/30"
              : pct >= 40
                ? "bg-secondary/10 text-secondary border-secondary/30"
                : "bg-destructive/10 text-destructive border-destructive/30",
          )}
        >
          {confLabel} confidence
        </span>
      </div>

      {/* Risk badge */}
      <RiskBadge level={risk} size="sm" />

      {/* Color-coded confidence bar */}
      <div className="space-y-0.5">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              confColor,
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
          <span>0%</span>
          <span>Confidence</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────

export default function ConditionSummaryGrid({
  conditions,
  className,
}: ConditionSummaryGridProps) {
  if (conditions.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
      data-ocid="condition_grid.list"
      aria-label="Condition summary"
    >
      {conditions.map((c, i) => (
        <SummaryCard key={c.condition} condition={c} index={i} />
      ))}
    </div>
  );
}
