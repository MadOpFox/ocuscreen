import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import type { ConditionResult } from "../backend";
import {
  NEXT_STEPS,
  RESEARCH_DISCLAIMER,
  getConditionDisplayName,
  getConditionMeaning,
  getConfidenceColorClass,
  getConfidenceTextClass,
  getEvidenceStrength,
  parseRiskLevel,
} from "../types/screening";
import type { EvidenceStrength, RiskLevel } from "../types/screening";
import RiskBadge from "./RiskBadge";

interface ScoreCardProps {
  condition: ConditionResult;
  index?: number;
  className?: string;
}

// ── Feature confidence mini-bars ───────────────────────────────────────────

interface FeatureBarProps {
  label: string;
  value: number;
  colorClass?: string;
  textClass?: string;
}

function FeatureBar({
  label,
  value,
  colorClass,
  textClass,
}: FeatureBarProps & { textClass?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const autoColor = colorClass ?? getConfidenceColorClass(pct);
  const autoText = textClass ?? getConfidenceTextClass(pct);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span
          className={cn(
            "text-[10px] font-mono tabular-nums font-bold",
            autoText,
          )}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            autoColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FeatureConfidenceBars({
  featureConfidences,
}: {
  featureConfidences: ConditionResult["featureConfidences"];
}) {
  return (
    <div className="space-y-2 pt-1">
      <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">
        Feature Confidence
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <FeatureBar label="Color" value={featureConfidences.color} />
        <FeatureBar label="Texture" value={featureConfidences.texture} />
        <FeatureBar label="Edge" value={featureConfidences.edge} />
        <FeatureBar label="Segment" value={featureConfidences.segmentation} />
      </div>
    </div>
  );
}

// ── Risk bar color ─────────────────────────────────────────────────────────

const RISK_BAR_COLORS: Record<RiskLevel, string> = {
  low: "bg-accent",
  moderate: "bg-secondary",
  elevated: "bg-chart-4",
  high: "bg-destructive",
};

const EVIDENCE_STYLES: Record<
  EvidenceStrength,
  { badge: string; icon: typeof ShieldCheck }
> = {
  Strong: {
    badge: "bg-accent/10 text-accent border-accent/30",
    icon: ShieldCheck,
  },
  Moderate: {
    badge: "bg-secondary/10 text-secondary border-secondary/30",
    icon: AlertTriangle,
  },
  Weak: { badge: "bg-muted text-muted-foreground border-border", icon: Info },
};

// ── Main ScoreCard ─────────────────────────────────────────────────────────

export default function ScoreCard({
  condition,
  index,
  className,
}: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const riskLevel = parseRiskLevel(condition.riskLevel);
  const barColor = RISK_BAR_COLORS[riskLevel];
  const scorePercent = Math.min(100, Math.max(0, condition.score));
  const displayName = getConditionDisplayName(condition.condition);
  const nextSteps = NEXT_STEPS[riskLevel];
  const meaning = getConditionMeaning(condition.condition);
  const evidenceStrength = getEvidenceStrength(condition.featureConfidences);
  const evidenceStyle = EVIDENCE_STYLES[evidenceStrength];
  const EvidenceIcon = evidenceStyle.icon;
  const confColor = getConfidenceColorClass(condition.conditionConfidence);
  const confText = getConfidenceTextClass(condition.conditionConfidence);

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-smooth",
        className,
      )}
      data-ocid={
        index !== undefined ? `score_card.item.${index + 1}` : "score_card"
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <h3 className="font-display font-semibold text-sm text-foreground leading-snug min-w-0 break-words">
          {displayName}
        </h3>
        <RiskBadge level={riskLevel} size="sm" className="shrink-0" />
      </div>

      {/* Score + confidence */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-bold text-foreground tabular-nums">
            {scorePercent.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground font-mono">/100</span>
        </div>
        <span
          className={cn(
            "text-xs font-mono tabular-nums border rounded-full px-2 py-0.5 font-bold",
            confText,
            condition.conditionConfidence >= 70
              ? "bg-accent/10 border-accent/25"
              : condition.conditionConfidence >= 40
                ? "bg-secondary/10 border-secondary/25"
                : "bg-destructive/10 border-destructive/25",
          )}
          title="Overall condition confidence"
        >
          {condition.conditionConfidence.toFixed(0)}% conf.
        </span>
      </div>

      {/* Risk progress bar colored by confidence */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            barColor,
          )}
          style={{ width: `${scorePercent}%` }}
        />
      </div>

      {/* Confidence bar with label */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Condition Confidence
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              confColor,
            )}
            style={{
              width: `${Math.min(100, condition.conditionConfidence)}%`,
            }}
          />
        </div>
      </div>

      {/* Evidence strength badge */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-[10px] font-medium",
            evidenceStyle.badge,
          )}
        >
          <EvidenceIcon className="h-2.5 w-2.5" aria-hidden />
          {evidenceStrength} Evidence
        </span>
      </div>

      {/* Feature confidence bars */}
      <FeatureConfidenceBars
        featureConfidences={condition.featureConfidences}
      />

      {/* Expandable: meaning + explanation + next steps */}
      <div className="border-t border-border pt-2">
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          onClick={() => setExpanded(!expanded)}
          data-ocid={
            index !== undefined
              ? `score_card.explain_toggle.${index + 1}`
              : "score_card.explain_toggle"
          }
          aria-expanded={expanded}
        >
          <FlaskConical className="h-3 w-3 shrink-0" aria-hidden />
          <span className="font-medium uppercase tracking-wide">
            What This Means &amp; Next Steps
          </span>
          {expanded ? (
            <ChevronUp className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-auto" />
          )}
        </button>

        {expanded && (
          <div className="mt-2 space-y-2.5">
            {/* Plain-English meaning */}
            <div className="p-3 rounded-md bg-primary/5 border border-primary/15">
              <p className="text-[10px] font-display font-semibold uppercase tracking-wider text-primary mb-1">
                What this may indicate
              </p>
              <p className="text-xs text-foreground leading-relaxed">
                {meaning}
              </p>
            </div>

            {/* Technical explanation */}
            {condition.explanation && (
              <p className="p-3 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">
                  Analysis:{" "}
                </span>
                {condition.explanation}
              </p>
            )}

            {/* Next steps */}
            <div className="p-3 rounded-md bg-accent/5 border border-accent/20 space-y-1.5">
              <p className="text-[10px] font-display font-semibold uppercase tracking-wider text-accent">
                Recommended Next Steps
              </p>
              <p className="text-xs text-foreground leading-relaxed">
                {nextSteps}
              </p>
            </div>

            {/* Research disclaimer */}
            <div className="flex items-start gap-1.5 px-1">
              <Info
                className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5"
                aria-hidden
              />
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                {RESEARCH_DISCLAIMER}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
