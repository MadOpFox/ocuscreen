import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  FileJson,
  FileText,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import RiskBadge from "../components/RiskBadge";
import ScoreCard from "../components/ScoreCard";
import { useAuth } from "../hooks/use-auth";
import { useBackend } from "../hooks/use-backend";
import type { ScreeningRecord } from "../types/screening";
import { parseRiskLevel } from "../types/screening";

function formatDateTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  const datePart = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} at ${timePart}`;
}

function EyePlaceholder() {
  return (
    <div className="w-full aspect-video max-w-2xl mx-auto rounded-xl bg-muted/60 border border-border flex flex-col items-center justify-center gap-3">
      <div className="p-4 rounded-full bg-muted border border-border">
        <Eye className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        Image not available
      </p>
      <p className="text-xs text-muted-foreground">
        Original image was not stored with this screening
      </p>
    </div>
  );
}

function exportJSON(record: ScreeningRecord) {
  const data = {
    screeningId: record.id,
    timestamp: formatDateTime(record.timestamp),
    conditions: record.result.conditions,
    regionScores: record.result.regionScores,
    whitePatchUsed: record.result.whitePatchUsed,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ocuscreen-${record.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportReport(record: ScreeningRecord) {
  const lines: string[] = [
    "OcuScreen+ Screening Report",
    "================================",
    `Screening ID: ${record.id}`,
    `Date: ${formatDateTime(record.timestamp)}`,
    "",
    "DISCLAIMER: This is a non-diagnostic research tool. Results are for",
    "informational purposes only and do not constitute medical advice.",
    "",
    "CONDITION RESULTS",
    "=================",
  ];
  for (const c of record.result.conditions) {
    lines.push(`${c.condition}: ${c.score.toFixed(1)}/100 (${c.riskLevel})`);
    if (c.explanation) lines.push(`  → ${c.explanation}`);
    lines.push("");
  }
  lines.push("REGION SCORES", "=============");
  for (const r of record.result.regionScores) {
    lines.push(
      `${r.region}: R=${r.avgR.toFixed(1)} G=${r.avgG.toFixed(1)} B=${r.avgB.toFixed(1)} Brightness=${r.brightness.toFixed(1)} Contrast=${r.contrast.toFixed(1)}`,
    );
  }
  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ocuscreen-${record.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.info("Report exported as text file.");
}

function SummaryConditions({ record }: { record: ScreeningRecord }) {
  const pills = [
    { label: "Jaundice", key: "jaundice" },
    { label: "Anemia", key: "anemia" },
    { label: "Corneal Arcus", key: "arcus" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {pills.map(({ label, key }) => {
        const cond = record.result.conditions.find((c) =>
          c.condition.toLowerCase().includes(key),
        );
        const risk = cond ? parseRiskLevel(cond.riskLevel) : ("low" as const);
        return (
          <div
            key={label}
            className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            <RiskBadge level={risk} size="sm" />
          </div>
        );
      })}
    </div>
  );
}

export default function HistoryDetailPage() {
  const { screeningId } = useParams({ from: "/history/$screeningId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor, isFetching } = useBackend();
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const { data: record, isLoading } = useQuery<ScreeningRecord | null>({
    queryKey: ["screening", screeningId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getScreening(screeningId);
    },
    enabled: !!actor && !isFetching,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteScreening(screeningId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screeningHistory"] });
      queryClient.removeQueries({ queryKey: ["screening", screeningId] });
      toast.success("Screening deleted successfully.");
      navigate({ to: "/history" });
    },
    onError: () => {
      toast.error("Failed to delete screening. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-10 space-y-6"
        data-ocid="history_detail.loading_state"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <Skeleton key={k} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5"
        data-ocid="history_detail.error_state"
      >
        <div className="p-4 rounded-full bg-muted/60 border border-border inline-flex mx-auto">
          <Eye className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Screening not found
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            This screening may have been deleted or doesn&apos;t belong to your
            account.
          </p>
        </div>
        <Link to="/history">
          <Button
            variant="outline"
            className="gap-2"
            data-ocid="history_detail.back_link"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto px-4 py-8 space-y-8"
      data-ocid="history_detail.page"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link to="/history">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 mb-2"
              data-ocid="history_detail.back_button"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Button>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Screening Detail
          </h1>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm">{formatDateTime(record.timestamp)}</span>
          </div>
        </div>

        {/* Export actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportJSON(record)}
            data-ocid="history_detail.export_json_button"
          >
            <FileJson className="h-3.5 w-3.5" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportReport(record)}
            data-ocid="history_detail.export_pdf_button"
          >
            <FileText className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportJSON(record)}
            data-ocid="history_detail.download_button"
            aria-label="Download JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Eye image placeholder */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Eye Image
        </h2>
        <EyePlaceholder />
      </section>

      <Separator />

      {/* Summary condition badges */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Condition Summary
        </h2>
        <SummaryConditions record={record} />
      </section>

      <Separator />

      {/* Condition score cards */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Analysis Results &amp; Risk Scores
        </h2>
        {record.result.conditions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No condition data available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {record.result.conditions.map((cond, i) => (
              <ScoreCard key={cond.condition} condition={cond} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Region scores */}
      {record.result.regionScores.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Region Color Analysis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {record.result.regionScores.map((rs) => (
                <div
                  key={rs.region}
                  className="bg-card border border-border rounded-xl p-4 space-y-3"
                >
                  <p className="font-semibold text-sm text-foreground capitalize">
                    {rs.region}
                  </p>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    {(["avgR", "avgG", "avgB"] as const).map((ch) => (
                      <div key={ch} className="space-y-0.5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {ch.replace("avg", "")}
                        </p>
                        <p className="font-mono text-sm font-semibold text-foreground">
                          {rs[ch].toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Bright</p>
                      <p className="font-mono text-xs text-foreground">
                        {rs.brightness.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contrast</p>
                      <p className="font-mono text-xs text-foreground">
                        {rs.contrast.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <Separator />

      {/* Delete */}
      <div className="flex justify-end pb-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              data-ocid="history_detail.delete_button"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete This Screening
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="history_detail.delete_dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this screening?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the screening from your history.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="history_detail.delete_cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="history_detail.delete_confirm_button"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
