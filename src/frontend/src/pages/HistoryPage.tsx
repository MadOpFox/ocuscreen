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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronRight,
  Eye,
  History,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import RiskBadge from "../components/RiskBadge";
import { useAuth } from "../hooks/use-auth";
import { useBackend } from "../hooks/use-backend";
import type { ScreeningRecord } from "../types/screening";
import { parseRiskLevel } from "../types/screening";

const PAGE_SIZE = 20;

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getConditionRisk(record: ScreeningRecord, name: string) {
  const cond = record.result.conditions.find((c) =>
    c.condition.toLowerCase().includes(name.toLowerCase()),
  );
  return cond ? parseRiskLevel(cond.riskLevel) : ("low" as const);
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"] as const;

function HistoryCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  );
}

interface HistoryCardProps {
  record: ScreeningRecord;
  index: number;
}

function HistoryCard({ record, index }: HistoryCardProps) {
  const jaundiceRisk = getConditionRisk(record, "jaundice");
  const anemiaRisk = getConditionRisk(record, "anemia");
  const arcusRisk = getConditionRisk(record, "arcus");

  return (
    <div
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200"
      data-ocid={`history.item.${index + 1}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Screening #{index + 1}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">
              {formatDate(record.timestamp)} · {formatTime(record.timestamp)}
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 text-xs font-mono text-muted-foreground border-border"
        >
          {record.result.conditions.length} metrics
        </Badge>
      </div>

      {/* Risk badges */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-muted-foreground w-16 shrink-0">
            Jaundice:
          </span>
          <RiskBadge level={jaundiceRisk} size="sm" />
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-muted-foreground w-16 shrink-0">
            Anemia:
          </span>
          <RiskBadge level={anemiaRisk} size="sm" />
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-muted-foreground w-16 shrink-0">
            Arcus:
          </span>
          <RiskBadge level={arcusRisk} size="sm" />
        </div>
      </div>

      {/* CTA */}
      <Link to="/history/$screeningId" params={{ screeningId: record.id }}>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 font-medium"
          data-ocid={`history.view_button.${index + 1}`}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
          <ChevronRight className="h-3.5 w-3.5 ml-auto" />
        </Button>
      </Link>
    </div>
  );
}

export default function HistoryPage() {
  const { actor, isFetching } = useBackend();
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const {
    data: allRecords,
    isLoading,
    isError,
    refetch,
  } = useQuery<ScreeningRecord[]>({
    queryKey: ["screeningHistory"],
    queryFn: async () => {
      if (!actor) return [];
      const records = await actor.getScreeningHistory();
      return [...records].sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screeningHistory"] });
      toast.success("Screening history cleared.");
    },
    onError: () => {
      toast.error("Failed to clear history. Please try again.");
    },
  });

  const records = allRecords ?? [];
  const visibleRecords = records.slice(0, visibleCount);
  const hasMore = records.length > visibleCount;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1
              className="font-display text-2xl font-bold text-foreground"
              data-ocid="history.page"
            >
              Screening History
            </h1>
            {!isLoading && records.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {records.length} screening{records.length !== 1 ? "s" : ""}{" "}
                saved
              </p>
            )}
          </div>
        </div>
        <Link to="/analyze">
          <Button
            className="gap-2 font-medium"
            data-ocid="history.new_screening_button"
          >
            <Plus className="h-4 w-4" />
            Start New Screening
          </Button>
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="history.loading_state"
        >
          {SKELETON_KEYS.map((k) => (
            <HistoryCardSkeleton key={k} />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          className="flex flex-col items-center gap-4 py-16 text-center"
          data-ocid="history.error_state"
        >
          <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
            <RefreshCw className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Failed to load history
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Something went wrong while fetching your screenings.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-2"
            data-ocid="history.retry_button"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && records.length === 0 && (
        <div
          className="flex flex-col items-center gap-5 py-20 text-center"
          data-ocid="history.empty_state"
        >
          <div className="p-5 rounded-full bg-muted/60 border border-border">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="max-w-sm">
            <p className="font-display font-semibold text-foreground text-lg">
              No screenings saved yet
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Start your first screening to see results here. Your analysis
              history will be securely stored for future reference.
            </p>
          </div>
          <Link to="/analyze">
            <Button className="gap-2" data-ocid="history.empty_cta_button">
              <Plus className="h-4 w-4" />
              Start First Screening
            </Button>
          </Link>
        </div>
      )}

      {/* Screening grid */}
      {!isLoading && !isError && records.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleRecords.map((record, i) => (
              <HistoryCard key={record.id} record={record} index={i} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="gap-2"
                data-ocid="history.load_more_button"
              >
                Load More
              </Button>
            </div>
          )}

          {/* Clear all */}
          <div className="flex justify-end pt-4 border-t border-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  data-ocid="history.clear_all_button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="history.clear_dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Clear all screening history?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {records.length} screening
                    {records.length !== 1 ? "s" : ""} from your history. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="history.clear_cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => clearMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="history.clear_confirm_button"
                  >
                    {clearMutation.isPending ? "Clearing…" : "Clear All"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
