import { c as createLucideIcon, u as useAuth, b as useNavigate, g as useQueryClient, r as reactExports, j as jsxRuntimeExports, H as History, h as Link, B as Button, E as Eye, f as Skeleton } from "./index-Ce0Yvw1c.js";
import { u as useMutation, A as AlertDialog, a as AlertDialogTrigger, T as Trash2, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction, C as CalendarDays } from "./alert-dialog-D4GzxLfC.js";
import { B as Badge } from "./badge-GKv5KtvZ.js";
import { g as useBackend, h as useQuery } from "./use-backend-h-MyA2la.js";
import { b as RiskBadge, u as ue, p as parseRiskLevel } from "./RiskBadge-ClmprxIA.js";
import { R as RefreshCw } from "./refresh-cw-Cdnj29fQ.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode);
const PAGE_SIZE = 20;
function formatDate(timestamp) {
  const ms = Number(timestamp / 1000000n);
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function formatTime(timestamp) {
  const ms = Number(timestamp / 1000000n);
  const d = new Date(ms);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function getConditionRisk(record, name) {
  const cond = record.result.conditions.find(
    (c) => c.condition.toLowerCase().includes(name.toLowerCase())
  );
  return cond ? parseRiskLevel(cond.riskLevel) : "low";
}
const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];
function HistoryCardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-5 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-28" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-20 rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full rounded-md" })
  ] });
}
function HistoryCard({ record, index }) {
  const jaundiceRisk = getConditionRisk(record, "jaundice");
  const anemiaRisk = getConditionRisk(record, "anemia");
  const arcusRisk = getConditionRisk(record, "arcus");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-primary/30 transition-all duration-200",
      "data-ocid": `history.item.${index + 1}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: [
              "Screening #",
              index + 1
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
                formatDate(record.timestamp),
                " · ",
                formatTime(record.timestamp)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: "outline",
              className: "shrink-0 text-xs font-mono text-muted-foreground border-border",
              children: [
                record.result.conditions.length,
                " metrics"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-16 shrink-0", children: "Jaundice:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { level: jaundiceRisk, size: "sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-16 shrink-0", children: "Anemia:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { level: anemiaRisk, size: "sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-16 shrink-0", children: "Arcus:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { level: arcusRisk, size: "sm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/history/$screeningId", params: { screeningId: record.id }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "w-full gap-1.5 font-medium",
            "data-ocid": `history.view_button.${index + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
              "View Details",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 ml-auto" })
            ]
          }
        ) })
      ]
    }
  );
}
function HistoryPage() {
  const { actor, isFetching } = useBackend();
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [visibleCount, setVisibleCount] = reactExports.useState(PAGE_SIZE);
  reactExports.useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);
  const {
    data: allRecords,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["screeningHistory"],
    queryFn: async () => {
      if (!actor) return [];
      const records2 = await actor.getScreeningHistory();
      return [...records2].sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching
  });
  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screeningHistory"] });
      ue.success("Screening history cleared.");
    },
    onError: () => {
      ue.error("Failed to clear history. Please try again.");
    }
  });
  const records = allRecords ?? [];
  const visibleRecords = records.slice(0, visibleCount);
  const hasMore = records.length > visibleCount;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10 border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h1",
            {
              className: "font-display text-2xl font-bold text-foreground",
              "data-ocid": "history.page",
              children: "Screening History"
            }
          ),
          !isLoading && records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            records.length,
            " screening",
            records.length !== 1 ? "s" : "",
            " ",
            "saved"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/analyze", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "gap-2 font-medium",
          "data-ocid": "history.new_screening_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Start New Screening"
          ]
        }
      ) })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        "data-ocid": "history.loading_state",
        children: SKELETON_KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryCardSkeleton, {}, k))
      }
    ),
    isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center gap-4 py-16 text-center",
        "data-ocid": "history.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-full bg-destructive/10 border border-destructive/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-6 w-6 text-destructive" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Failed to load history" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Something went wrong while fetching your screenings." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => refetch(),
              className: "gap-2",
              "data-ocid": "history.retry_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
                "Retry"
              ]
            }
          )
        ]
      }
    ),
    !isLoading && !isError && records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center gap-5 py-20 text-center",
        "data-ocid": "history.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 rounded-full bg-muted/60 border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-8 w-8 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground text-lg", children: "No screenings saved yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2 leading-relaxed", children: "Start your first screening to see results here. Your analysis history will be securely stored for future reference." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/analyze", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-2", "data-ocid": "history.empty_cta_button", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Start First Screening"
          ] }) })
        ]
      }
    ),
    !isLoading && !isError && records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: visibleRecords.map((record, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryCard, { record, index: i }, record.id)) }),
      hasMore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          onClick: () => setVisibleCount((c) => c + PAGE_SIZE),
          className: "gap-2",
          "data-ocid": "history.load_more_button",
          children: "Load More"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-4 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
            "data-ocid": "history.clear_all_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
              "Clear All History"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "history.clear_dialog", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Clear all screening history?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "This will permanently delete all ",
              records.length,
              " screening",
              records.length !== 1 ? "s" : "",
              " from your history. This action cannot be undone."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "history.clear_cancel_button", children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: () => clearMutation.mutate(),
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                "data-ocid": "history.clear_confirm_button",
                children: clearMutation.isPending ? "Clearing…" : "Clear All"
              }
            )
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  HistoryPage as default
};
