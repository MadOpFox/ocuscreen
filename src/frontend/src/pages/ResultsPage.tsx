import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  Eye,
  FileJson,
  FileText,
  Loader2,
  MapPin,
  PlusCircle,
  Save,
  ScanEye,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AnalysisResult, ConditionResult, RegionScore } from "../backend";
import ConditionSummaryGrid from "../components/ConditionSummaryGrid";
import RegionOverlay from "../components/RegionOverlay";
import type { RegionBox } from "../components/RegionOverlay";
import ScoreCard from "../components/ScoreCard";
import { useAuth } from "../hooks/use-auth";
import { useBackend } from "../hooks/use-backend";
import { useScreening } from "../hooks/use-screening";
import {
  getConditionDisplayName,
  getConditionMeaning,
  getConfidenceColorClass,
  getConfidenceTextClass,
  getEvidenceStrength,
  getOverallImpression,
  getRecommendedActions,
  getTopConditionsForSummary,
  parseRiskLevel,
} from "../types/screening";
import type {
  DetectedRegions,
  EvidenceStrength,
  RiskLevel,
} from "../types/screening";

// ── Region overlay helpers ─────────────────────────────────────────────────

function toOverlayRegions(detected: DetectedRegions): RegionBox[] {
  return [
    {
      region: "conjunctiva",
      label: "Conjunctiva",
      x: detected.conjunctiva.x,
      y: detected.conjunctiva.y,
      width: detected.conjunctiva.w,
      height: detected.conjunctiva.h,
    },
    {
      region: "cornea",
      label: "Cornea",
      x: detected.cornea.x,
      y: detected.cornea.y,
      width: detected.cornea.w,
      height: detected.cornea.h,
    },
  ];
}

// ── Risk border colors ─────────────────────────────────────────────────────

const RISK_CARD_BORDER: Record<RiskLevel, string> = {
  low: "border-accent/50",
  moderate: "border-secondary/50",
  elevated: "border-chart-4/50",
  high: "border-destructive/50",
};

// ── Dashboard summary header ───────────────────────────────────────────────

type ScanStatus =
  | "all_clear"
  | "review_recommended"
  | "consult_advised"
  | "urgent_review";

function getScanStatus(conditions: ConditionResult[]): ScanStatus {
  const levels = conditions.map((c) => parseRiskLevel(c.riskLevel));
  if (levels.some((l) => l === "high")) return "urgent_review";
  if (levels.some((l) => l === "elevated")) return "consult_advised";
  if (levels.some((l) => l === "moderate")) return "review_recommended";
  return "all_clear";
}

const STATUS_CONFIG: Record<
  ScanStatus,
  {
    label: string;
    description: string;
    bg: string;
    text: string;
    border: string;
    icon: typeof CheckCircle;
  }
> = {
  all_clear: {
    label: "All Clear",
    description:
      "All screened conditions are within normal range. No immediate concern detected.",
    bg: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/30",
    icon: CheckCircle,
  },
  review_recommended: {
    label: "Review Recommended",
    description:
      "One or more conditions show moderate signals. Consider consulting an eye care professional.",
    bg: "bg-secondary/10",
    text: "text-secondary",
    border: "border-secondary/30",
    icon: Eye,
  },
  consult_advised: {
    label: "Consult Advised",
    description:
      "Elevated indicators detected. Schedule an ophthalmology appointment soon.",
    bg: "bg-chart-4/10",
    text: "text-chart-4",
    border: "border-chart-4/30",
    icon: AlertTriangle,
  },
  urgent_review: {
    label: "Urgent Review",
    description: "High-risk indicators present. Seek prompt medical attention.",
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/30",
    icon: AlertOctagon,
  },
};

function DashboardSummaryHeader({
  conditions,
}: { conditions: ConditionResult[] }) {
  const status = getScanStatus(conditions);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 flex items-start gap-4",
        config.bg,
        config.border,
      )}
      data-ocid="dashboard_summary.panel"
    >
      <div className={cn("p-2 rounded-lg", config.bg, "border", config.border)}>
        <Icon className={cn("h-5 w-5", config.text)} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className={cn("font-display font-bold text-base", config.text)}>
          {config.label}
        </p>
        <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">
          {config.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1 italic">
          OcuScreen+ is a research tool. This is not a medical diagnosis.
        </p>
      </div>
    </div>
  );
}

// ── Segmentation info ──────────────────────────────────────────────────────

function SegmentationInfo({
  seg,
}: { seg: AnalysisResult["segmentationResult"] }) {
  if (!seg) return null;
  return (
    <div
      className="bg-card border border-border rounded-xl px-5 py-4"
      data-ocid="segmentation_info.panel"
    >
      <p className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Region Segmentation
      </p>
      <div className="flex flex-wrap gap-6">
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-foreground tabular-nums">
            {seg.irisRadiusEstimate.toFixed(1)}px
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Iris Radius Est.
          </p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-foreground tabular-nums">
            {(seg.scleraFraction * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sclera Fraction
          </p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-foreground tabular-nums">
            {(seg.irisFraction * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Iris Fraction</p>
        </div>
      </div>
    </div>
  );
}

// ── Region stats table ─────────────────────────────────────────────────────

function RegionStatsTable({
  regionScores,
  whitePatch,
}: {
  regionScores: RegionScore[];
  whitePatch: AnalysisResult["whitePatchUsed"];
}) {
  const fmt = (v: number) => v.toFixed(1);

  return (
    <div
      className="overflow-x-auto rounded-xl border border-border"
      data-ocid="region_stats.table"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            {[
              "Region",
              "Avg R",
              "Avg G",
              "Avg B",
              "Brightness",
              "Contrast",
            ].map((h) => (
              <th
                key={h}
                className={cn(
                  "px-4 py-3 font-display font-semibold text-foreground text-xs uppercase tracking-wide",
                  h === "Region" ? "text-left" : "text-right",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regionScores.map((row, i) => (
            <tr
              key={row.region}
              className={cn(
                "border-b border-border transition-colors hover:bg-muted/30",
                i % 2 === 0 ? "bg-card" : "bg-background",
              )}
              data-ocid={`region_stats.item.${i + 1}`}
            >
              <td className="px-4 py-3 font-medium text-foreground capitalize">
                {row.region}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                {fmt(row.avgR)}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                {fmt(row.avgG)}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                {fmt(row.avgB)}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                {fmt(row.brightness)}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                {fmt(row.contrast)}
              </td>
            </tr>
          ))}
          <tr className="bg-muted/40 border-t-2 border-border/60">
            <td className="px-4 py-3 font-medium text-muted-foreground text-xs italic">
              White Patch Ref.
            </td>
            <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground text-xs">
              {fmt(whitePatch.avgR)}
            </td>
            <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground text-xs">
              {fmt(whitePatch.avgG)}
            </td>
            <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground text-xs">
              {fmt(whitePatch.avgB)}
            </td>
            <td
              className="px-4 py-3 text-right text-muted-foreground text-xs"
              colSpan={2}
            >
              calibration reference
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── AI Summary section ─────────────────────────────────────────────────────

function AISummarySection({
  conditions,
  existingSummary,
  onSummaryGenerated,
}: {
  conditions: ConditionResult[];
  existingSummary: string | null;
  onSummaryGenerated: (s: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { actor } = useBackend();

  const handleGenerate = async () => {
    if (!actor) {
      toast.error("Backend not available. Please try again.");
      return;
    }
    setIsGenerating(true);
    try {
      const summary = await actor.generateSummary(conditions);
      onSummaryGenerated(summary);
      toast.success("AI summary generated.");
    } catch {
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section
      className="bg-card border border-border rounded-xl overflow-hidden"
      data-ocid="ai_summary.section"
    >
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors group"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
        data-ocid="ai_summary.toggle"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display font-semibold text-foreground">
            AI Plain-Language Summary
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Optional
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border">
          <div className="flex items-center gap-2 mt-4 mb-3 px-3 py-2 rounded-md bg-secondary/10 border border-secondary/20">
            <AlertTriangle
              className="h-3.5 w-3.5 text-secondary shrink-0"
              aria-hidden
            />
            <p className="text-xs text-muted-foreground">
              AI-generated summary — not a medical diagnosis.
            </p>
          </div>

          {existingSummary ? (
            <div
              className="p-4 rounded-lg bg-muted/40 border border-border text-sm text-foreground leading-relaxed"
              data-ocid="ai_summary.content"
            >
              {existingSummary}
            </div>
          ) : isGenerating ? (
            <div className="space-y-2" data-ocid="ai_summary.loading_state">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[75%]" />
              <p className="text-xs text-muted-foreground mt-2">
                Generating summary…
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">
                Generate a plain-language explanation of these findings to help
                you understand what the numeric scores may indicate.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                className="gap-2"
                data-ocid="ai_summary.generate_button"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate AI Summary
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Export modal ──────────────────────────────────────────────────────────

function ExportModal({
  open,
  onClose,
  result,
  imageDataUrl,
}: {
  open: boolean;
  onClose: () => void;
  result: AnalysisResult;
  imageDataUrl: string | null;
}) {
  const exportTimestamp = new Date().toISOString();
  const fileName = `ocuscreen-report-${new Date().toISOString().slice(0, 10)}`;

  const handleJsonDownload = () => {
    const data = {
      exportedAt: exportTimestamp,
      analysisResult: { ...result, timestamp: result.timestamp.toString() },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON report downloaded.");
  };

  const handlePdfDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Pop-up blocked. Allow pop-ups and try again.");
      return;
    }

    const conditionRows = result.conditions
      .map(
        (c) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${getConditionDisplayName(c.condition)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace">${c.score.toFixed(1)}/100</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${c.riskLevel}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace">${c.conditionConfidence.toFixed(0)}%</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px">${c.explanation}</td>
      </tr>`,
      )
      .join("");

    const regionRows = result.regionScores
      .map(
        (r) => `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-transform:capitalize">${r.region}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace">${r.avgR.toFixed(1)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace">${r.avgG.toFixed(1)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace">${r.avgB.toFixed(1)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace">${r.brightness.toFixed(1)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace">${r.contrast.toFixed(1)}</td>
      </tr>`,
      )
      .join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><title>OcuScreen+ Screening Report</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;color:#111;padding:32px;max-width:900px;margin:auto}h1{font-size:22px;margin-bottom:4px}.meta{color:#555;font-size:13px;margin-bottom:24px}.disclaimer{background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px 16px;font-size:12px;color:#92400e;margin-bottom:24px}h2{font-size:15px;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:28px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#f3f4f6;text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.05em}img{max-width:340px;border-radius:8px;border:1px solid #e5e7eb;margin-top:8px}</style>
      </head><body>
      <h1>OcuScreen+ Screening Report</h1>
      <p class="meta">Generated: ${new Date(exportTimestamp).toLocaleString()} · File: ${fileName}.pdf</p>
      <div class="disclaimer">⚠ <strong>Research Tool Only.</strong> This report is generated by OcuScreen+, a non-diagnostic research prototype. Results do not constitute medical advice. Always consult a qualified healthcare professional.</div>
      ${imageDataUrl ? `<h2>Eye Image</h2><img src="${imageDataUrl}" alt="Screened eye image" />` : ""}
      <h2>Risk Assessment</h2>
      <table><thead><tr><th>Condition</th><th>Score</th><th>Risk Level</th><th>Confidence</th><th>Explanation</th></tr></thead><tbody>${conditionRows}</tbody></table>
      <h2>Region Analysis</h2>
      <table><thead><tr><th>Region</th><th>Avg R</th><th>Avg G</th><th>Avg B</th><th>Brightness</th><th>Contrast</th></tr></thead><tbody>${regionRows}</tbody></table>
      <h2>White Patch Calibration</h2>
      <p style="font-size:13px;color:#555">Reference — Avg R: ${result.whitePatchUsed.avgR.toFixed(1)}, Avg G: ${result.whitePatchUsed.avgG.toFixed(1)}, Avg B: ${result.whitePatchUsed.avgB.toFixed(1)}</p>
      <p style="margin-top:40px;font-size:11px;color:#aaa">Exported from OcuScreen+ · caffeine.ai</p>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast.success("PDF report ready to save.");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="export.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Export Report</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Download a copy of this screening report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="bg-muted/40 rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">File name preview</p>
            <p className="text-sm font-mono text-foreground truncate">
              {fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              Exported: {new Date(exportTimestamp).toLocaleString()}
            </p>
          </div>
          <Button
            className="w-full gap-2 justify-start"
            onClick={handlePdfDownload}
            data-ocid="export.pdf_button"
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 justify-start"
            onClick={handleJsonDownload}
            data-ocid="export.json_button"
          >
            <FileJson className="h-4 w-4" />
            Download JSON
          </Button>
        </div>
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-ocid="export.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Loading / no-result states ─────────────────────────────────────────────

function AnalyzingState() {
  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center"
      data-ocid="results.loading_state"
    >
      <div className="max-w-md w-full mx-auto px-4 text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
              <ScanEye className="h-8 w-8 text-primary" />
            </div>
            <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-foreground">
            Analyzing Eye Regions…
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Evaluating sclera, conjunctiva, and cornea using texture, edge
            detection, and color analysis. This may take a few seconds.
          </p>
        </div>
        <div className="space-y-1.5">
          {[
            "Detecting eye regions",
            "Scoring conditions",
            "Finalizing results",
          ].map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <Loader2 className="h-3.5 w-3.5 text-primary/60 animate-spin shrink-0" />
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoResultState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center"
      data-ocid="results.empty_state"
    >
      <div className="max-w-sm w-full mx-auto px-4 text-center space-y-5">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full border-4 border-border bg-muted/30 flex items-center justify-center">
            <ScanEye className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-foreground">
            No Analysis Result
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No eye analysis result was found. Please capture or upload an eye
            image and run the analysis first.
          </p>
        </div>
        <Button
          onClick={onNavigate}
          className="gap-2"
          data-ocid="results.go_analyze_button"
        >
          <ScanEye className="h-4 w-4" />
          Start New Screening
        </Button>
      </div>
    </div>
  );
}

// ── All-Clear banner ─────────────────────────────────────────────────────────

function AllClearBanner() {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-accent/40 bg-accent/5 px-5 py-4"
      data-ocid="all_clear.banner"
    >
      <div className="flex-shrink-0 p-2.5 rounded-full bg-accent/15">
        <CheckCircle className="h-6 w-6 text-accent" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="font-display font-bold text-accent text-sm">
          No Major Indicators Found
        </p>
        <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">
          All screened conditions are within normal range. No elevated risk
          indicators were detected in this screening.
        </p>
      </div>
    </div>
  );
}

// ── Report Summary section ────────────────────────────────────────────────────

function ReportSummarySection({
  conditions,
}: {
  conditions: ConditionResult[];
}) {
  const impression = getOverallImpression(conditions);
  const topConditions = getTopConditionsForSummary(conditions);
  const actions = getRecommendedActions(conditions);

  return (
    <section
      id="report-summary"
      className="rounded-xl border-2 border-primary/30 bg-card shadow-md overflow-hidden"
      data-ocid="report_summary.section"
    >
      {/* Header bar */}
      <div className="bg-primary/10 border-b border-primary/20 px-5 py-3.5 flex items-center gap-2.5">
        <ClipboardList className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="font-display font-bold text-sm text-primary uppercase tracking-wide">
          Report Summary
        </h2>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground">
          Non-diagnostic · Research use only
        </span>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Overall health impression */}
        <div>
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Overall Impression
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed font-medium",
              impression.elevated ? "text-chart-4" : "text-accent",
            )}
          >
            {impression.text}
          </p>
        </div>

        {/* Key findings */}
        <div>
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2.5">
            Key Findings
          </h3>
          <ul className="space-y-2">
            {topConditions.map((c, i) => {
              const risk = parseRiskLevel(c.riskLevel);
              const riskLabel =
                risk === "low"
                  ? "Low Risk"
                  : risk === "moderate"
                    ? "Moderate Risk"
                    : risk === "elevated"
                      ? "Elevated Risk"
                      : "High Risk";
              const riskBg =
                risk === "low"
                  ? "bg-accent/10 text-accent border-accent/30"
                  : risk === "moderate"
                    ? "bg-secondary/10 text-secondary border-secondary/30"
                    : risk === "elevated"
                      ? "bg-chart-4/10 text-chart-4 border-chart-4/30"
                      : "bg-destructive/10 text-destructive border-destructive/30";
              const confText = getConfidenceTextClass(c.conditionConfidence);
              return (
                <li
                  key={c.condition}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                  data-ocid={`report_summary.finding.${i + 1}`}
                >
                  <TrendingUp
                    className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                    aria-hidden
                  />
                  <span className="text-sm text-foreground font-medium min-w-0 flex-1">
                    {getConditionDisplayName(c.condition)}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono tabular-nums font-bold",
                      confText,
                    )}
                  >
                    {c.conditionConfidence.toFixed(0)}% confidence
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium border rounded-full px-2 py-0.5 shrink-0",
                      riskBg,
                    )}
                  >
                    {riskLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Recommended actions */}
        <div>
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2.5">
            Recommended Next Steps
          </h3>
          <ul className="space-y-1.5">
            {actions.map((action, i) => (
              <li
                key={action}
                className="flex items-start gap-2 text-sm text-foreground leading-relaxed"
                data-ocid={`report_summary.action.${i + 1}`}
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                  aria-hidden
                />
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle
            className="h-4 w-4 text-secondary shrink-0 mt-0.5"
            aria-hidden
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Disclaimer: </span>
            This screening is not a medical diagnosis. Results are generated by
            an automated research tool and are for awareness purposes only.
            Always consult a qualified healthcare provider for medical advice,
            diagnosis, or treatment.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const navigate = useNavigate();
  const {
    analysisResult,
    imageDataUrl,
    llmSummary,
    setLlmSummary,
    resetScreening,
    isAnalyzing,
  } = useScreening();
  const { isAuthenticated } = useAuth();
  const { actor } = useBackend();
  const [isSaving, setIsSaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // ── Guard: show loader while analysis is in progress ──────────────────
  if (isAnalyzing) {
    return <AnalyzingState />;
  }

  // ── Guard: if no result exists, show a clear prompt (NOT a redirect) ──
  // Using useEffect for navigation keeps this compatible with React rendering rules.
  // The NoResultState renders immediately, giving the user context.
  if (!analysisResult) {
    return <NoResultState onNavigate={() => navigate({ to: "/analyze" })} />;
  }

  const result = analysisResult;
  const detectedRegions = result.detectedRegions as DetectedRegions | undefined;
  const usingDetectedRegions = !!detectedRegions;
  const overlayRegions = detectedRegions
    ? toOverlayRegions(detectedRegions)
    : null;
  const pupilCenter = detectedRegions?.pupilCenter ?? null;

  const handleNewScreening = () => {
    resetScreening();
    navigate({ to: "/analyze" });
  };

  const handleSave = async () => {
    if (!actor) {
      toast.error("Backend not available. Please try again.");
      return;
    }
    setIsSaving(true);
    try {
      await actor.saveScreening(result, result.imageId);
      toast.success("Screening saved to your history.");
    } catch {
      toast.error("Failed to save screening. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const analysisDate = new Date(Number(result.timestamp / 1_000_000n));
  const formattedDate = analysisDate.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="min-h-screen bg-background" data-ocid="results.page">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── Page header ──────────────────────────────────────────── */}
        <section className="bg-card border border-border rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Screening Report
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analysis completed{" "}
              <time dateTime={analysisDate.toISOString()} className="font-mono">
                {formattedDate}
              </time>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleSave}
                disabled={isSaving}
                data-ocid="results.save_button"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving…" : "Save to History"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setExportOpen(true)}
              data-ocid="results.export_button"
            >
              <Download className="h-3.5 w-3.5" />
              Export Report
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={handleNewScreening}
              data-ocid="results.new_screening_button"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              New Screening
            </Button>
          </div>
        </section>

        {/* ── Eye image + region overlay ───────────────────────────── */}
        <section className="space-y-4" data-ocid="results.image_section">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Eye Image &amp; Region Map
            </h2>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                usingDetectedRegions
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-muted border-border text-muted-foreground",
              )}
              data-ocid="results.detected_regions_badge"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  usingDetectedRegions ? "bg-accent" : "bg-muted-foreground",
                )}
              />
              {usingDetectedRegions
                ? "Eye regions detected"
                : "Regions not detected"}
            </span>
          </div>

          {imageDataUrl ? (
            <div className="rounded-xl overflow-hidden border border-border bg-card">
              <div className="relative w-full" style={{ paddingBottom: "56%" }}>
                <img
                  src={imageDataUrl}
                  alt="Analyzed eye — labeled with region overlays"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {overlayRegions ? (
                  <RegionOverlay
                    regions={overlayRegions}
                    className="absolute inset-0 w-full h-full"
                    showLegend={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-end justify-start p-3 pointer-events-none">
                    <span className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs text-white/80">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      Region detection was not available for this image
                    </span>
                  </div>
                )}
                {pupilCenter && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    data-ocid="results.pupil_marker"
                  >
                    <circle
                      cx={pupilCenter[0] * 100}
                      cy={pupilCenter[1] * 100}
                      r="2.2"
                      fill="none"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="0.8"
                    />
                    <circle
                      cx={pupilCenter[0] * 100}
                      cy={pupilCenter[1] * 100}
                      r="1.2"
                      fill="rgba(255,255,255,0.9)"
                    />
                    <line
                      x1={pupilCenter[0] * 100 - 3}
                      y1={pupilCenter[1] * 100}
                      x2={pupilCenter[0] * 100 + 3}
                      y2={pupilCenter[1] * 100}
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="0.3"
                    />
                    <line
                      x1={pupilCenter[0] * 100}
                      y1={pupilCenter[1] * 100 - 3}
                      x2={pupilCenter[0] * 100}
                      y2={pupilCenter[1] * 100 + 3}
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="0.3"
                    />
                  </svg>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 flex items-center justify-center h-48 text-muted-foreground text-sm">
              Image not available
            </div>
          )}

          {overlayRegions && (
            <div
              className="flex flex-wrap gap-4 px-1"
              aria-label="Region color legend"
            >
              {[
                {
                  region: "sclera",
                  label: "Sclera",
                  color: "bg-primary",
                  note: "Teal outline",
                },
                {
                  region: "conjunctiva",
                  label: "Conjunctiva",
                  color: "bg-secondary",
                  note: "Amber outline",
                },
                {
                  region: "cornea",
                  label: "Cornea",
                  color: "bg-accent",
                  note: "Emerald outline",
                },
              ].map((item) => (
                <div key={item.region} className="flex items-center gap-2">
                  <span
                    className={cn("h-3 w-3 rounded-sm shrink-0", item.color)}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({item.note})
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Dashboard summary header ─────────────────────────────── */}
        <DashboardSummaryHeader conditions={result.conditions} />

        {/* ── All-clear indicator ──────────────────────────────────── */}
        {result.conditions.length > 0 &&
          result.conditions.every(
            (c) => parseRiskLevel(c.riskLevel) === "low",
          ) && <AllClearBanner />}

        {/* ── Jump-to-summary link ─────────────────────────────────── */}
        {result.conditions.length > 0 && (
          <div className="flex justify-end">
            <a
              href="#report-summary"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              data-ocid="results.jump_to_summary_link"
            >
              <ArrowDown className="h-3 w-3" aria-hidden />
              Jump to Report Summary
            </a>
          </div>
        )}

        {/* ── Condition summary grid ───────────────────────────────── */}
        <section className="space-y-4" data-ocid="results.summary_section">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Condition Overview
          </h2>
          {result.conditions.length > 0 ? (
            <ConditionSummaryGrid conditions={result.conditions} />
          ) : (
            <div
              className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border"
              data-ocid="results.summary.empty_state"
            >
              <AlertTriangle className="h-8 w-8 mb-3 opacity-40" />
              <p className="font-medium">No condition data available</p>
              <p className="text-sm mt-1">
                The analysis did not return any condition assessments. Try
                re-running with a clearer image.
              </p>
            </div>
          )}
        </section>

        {/* ── Segmentation info ────────────────────────────────────── */}
        {result.segmentationResult && (
          <SegmentationInfo seg={result.segmentationResult} />
        )}

        {/* ── AI Summary ───────────────────────────────────────────── */}
        <AISummarySection
          conditions={result.conditions}
          existingSummary={llmSummary}
          onSummaryGenerated={setLlmSummary}
        />

        {/* ── Detailed score cards ─────────────────────────────────── */}
        <section className="space-y-4" data-ocid="results.scores_section">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Detailed Risk Assessment
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Expand each condition to view feature confidences, explanations,
              and recommended next steps.
            </p>
          </div>
          {result.conditions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.conditions.map((condition, i) => {
                const risk = parseRiskLevel(condition.riskLevel);
                return (
                  <ScoreCard
                    key={condition.condition}
                    condition={condition}
                    index={i}
                    className={cn("border-2", RISK_CARD_BORDER[risk])}
                  />
                );
              })}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-border"
              data-ocid="results.scores.empty_state"
            >
              <AlertTriangle className="h-8 w-8 mb-3 opacity-40" />
              <p className="font-medium">No condition scores available</p>
              <p className="text-sm mt-1">
                The analysis did not return any risk assessments.
              </p>
            </div>
          )}
        </section>

        {/* ── Region analysis table ────────────────────────────────── */}
        <section className="space-y-4" data-ocid="results.region_table_section">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Region Numeric Analysis
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Per-region color channel statistics with white-patch calibration
              reference.
            </p>
          </div>
          {result.regionScores.length > 0 ? (
            <RegionStatsTable
              regionScores={result.regionScores}
              whitePatch={result.whitePatchUsed}
            />
          ) : (
            <div
              className="flex items-center justify-center py-10 text-muted-foreground bg-muted/30 rounded-xl border border-border"
              data-ocid="results.region_table.empty_state"
            >
              <p className="text-sm">No region data available.</p>
            </div>
          )}
        </section>

        {/* ── Report Summary ───────────────────────────────────────── */}
        {result.conditions.length > 0 && (
          <ReportSummarySection conditions={result.conditions} />
        )}

        {/* ── Footer actions ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-end pt-2 pb-8 border-t border-border">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setExportOpen(true)}
            data-ocid="results.footer_export_button"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            className="gap-2"
            onClick={handleNewScreening}
            data-ocid="results.footer_new_button"
          >
            <PlusCircle className="h-4 w-4" />
            Start New Screening
          </Button>
        </div>
      </div>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        result={result}
        imageDataUrl={imageDataUrl}
      />
    </div>
  );
}
