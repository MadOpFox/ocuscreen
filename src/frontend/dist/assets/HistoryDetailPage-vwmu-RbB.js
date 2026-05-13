import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, l as createSlot, a as cn, m as useParams, b as useNavigate, g as useQueryClient, u as useAuth, f as Skeleton, E as Eye, h as Link, B as Button } from "./index-Ce0Yvw1c.js";
import { u as useMutation, C as CalendarDays, A as AlertDialog, a as AlertDialogTrigger, T as Trash2, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-D4GzxLfC.js";
import { g as useBackend, h as useQuery } from "./use-backend-h-MyA2la.js";
import { u as ue, p as parseRiskLevel, b as RiskBadge } from "./RiskBadge-ClmprxIA.js";
import { b as FileJson, F as FileText, D as Download, S as ScoreCard } from "./ScoreCard-CN076aGl.js";
import "./flask-conical-_ZMb8t_S.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode);
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot = createSlot(`Primitive.${node}`);
  const Node = reactExports.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});
var NAME = "Separator";
var DEFAULT_ORIENTATION = "horizontal";
var ORIENTATIONS = ["horizontal", "vertical"];
var Separator$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { decorative, orientation: orientationProp = DEFAULT_ORIENTATION, ...domProps } = props;
  const orientation = isValidOrientation(orientationProp) ? orientationProp : DEFAULT_ORIENTATION;
  const ariaOrientation = orientation === "vertical" ? orientation : void 0;
  const semanticProps = decorative ? { role: "none" } : { "aria-orientation": ariaOrientation, role: "separator" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-orientation": orientation,
      ...semanticProps,
      ...domProps,
      ref: forwardedRef
    }
  );
});
Separator$1.displayName = NAME;
function isValidOrientation(orientation) {
  return ORIENTATIONS.includes(orientation);
}
var Root = Separator$1;
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "separator",
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      ),
      ...props
    }
  );
}
function formatDateTime(timestamp) {
  const ms = Number(timestamp / 1000000n);
  const d = new Date(ms);
  const datePart = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${datePart} at ${timePart}`;
}
function EyePlaceholder() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full aspect-video max-w-2xl mx-auto rounded-xl bg-muted/60 border border-border flex flex-col items-center justify-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-full bg-muted border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-8 w-8 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "Image not available" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Original image was not stored with this screening" })
  ] });
}
function exportJSON(record) {
  const data = {
    screeningId: record.id,
    timestamp: formatDateTime(record.timestamp),
    conditions: record.result.conditions,
    regionScores: record.result.regionScores,
    whitePatchUsed: record.result.whitePatchUsed
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ocuscreen-${record.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function exportReport(record) {
  const lines = [
    "OcuScreen+ Screening Report",
    "================================",
    `Screening ID: ${record.id}`,
    `Date: ${formatDateTime(record.timestamp)}`,
    "",
    "DISCLAIMER: This is a non-diagnostic research tool. Results are for",
    "informational purposes only and do not constitute medical advice.",
    "",
    "CONDITION RESULTS",
    "================="
  ];
  for (const c of record.result.conditions) {
    lines.push(`${c.condition}: ${c.score.toFixed(1)}/100 (${c.riskLevel})`);
    if (c.explanation) lines.push(`  → ${c.explanation}`);
    lines.push("");
  }
  lines.push("REGION SCORES", "=============");
  for (const r of record.result.regionScores) {
    lines.push(
      `${r.region}: R=${r.avgR.toFixed(1)} G=${r.avgG.toFixed(1)} B=${r.avgB.toFixed(1)} Brightness=${r.brightness.toFixed(1)} Contrast=${r.contrast.toFixed(1)}`
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
  ue.info("Report exported as text file.");
}
function SummaryConditions({ record }) {
  const pills = [
    { label: "Jaundice", key: "jaundice" },
    { label: "Anemia", key: "anemia" },
    { label: "Corneal Arcus", key: "arcus" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-3", children: pills.map(({ label, key }) => {
    const cond = record.result.conditions.find(
      (c) => c.condition.toLowerCase().includes(key)
    );
    const risk = cond ? parseRiskLevel(cond.riskLevel) : "low";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { level: risk, size: "sm" })
        ]
      },
      label
    );
  }) });
}
function HistoryDetailPage() {
  const { screeningId } = useParams({ from: "/history/$screeningId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor, isFetching } = useBackend();
  const { isAuthenticated, isInitializing } = useAuth();
  reactExports.useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);
  const { data: record, isLoading } = useQuery({
    queryKey: ["screening", screeningId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getScreening(screeningId);
    },
    enabled: !!actor && !isFetching
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteScreening(screeningId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screeningHistory"] });
      queryClient.removeQueries({ queryKey: ["screening", screeningId] });
      ue.success("Screening deleted successfully.");
      navigate({ to: "/history" });
    },
    onError: () => {
      ue.error("Failed to delete screening. Please try again.");
    }
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-4xl mx-auto px-4 py-10 space-y-6",
        "data-ocid": "history_detail.loading_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full rounded-xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: ["a", "b", "c", "d"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 rounded-xl" }, k)) })
        ]
      }
    );
  }
  if (!record) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-4xl mx-auto px-4 py-20 text-center space-y-5",
        "data-ocid": "history_detail.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 rounded-full bg-muted/60 border border-border inline-flex mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-7 w-7 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground", children: "Screening not found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "This screening may have been deleted or doesn't belong to your account." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/history", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "gap-2",
              "data-ocid": "history_detail.back_link",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
                "Back to History"
              ]
            }
          ) })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "max-w-4xl mx-auto px-4 py-8 space-y-8",
      "data-ocid": "history_detail.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/history", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "gap-1.5 text-muted-foreground hover:text-foreground -ml-2 mb-2",
                "data-ocid": "history_detail.back_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
                  "Back to History"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Screening Detail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: formatDateTime(record.timestamp) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "gap-1.5",
                onClick: () => exportJSON(record),
                "data-ocid": "history_detail.export_json_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileJson, { className: "h-3.5 w-3.5" }),
                  "JSON"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "gap-1.5",
                onClick: () => exportReport(record),
                "data-ocid": "history_detail.export_pdf_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                  "Export"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => exportJSON(record),
                "data-ocid": "history_detail.download_button",
                "aria-label": "Download JSON",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "Eye Image" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EyePlaceholder, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "Condition Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryConditions, { record })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "Analysis Results & Risk Scores" }),
          record.result.conditions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No condition data available." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: record.result.conditions.map((cond, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { condition: cond, index: i }, cond.condition)) })
        ] }),
        record.result.regionScores.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "Region Color Analysis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: record.result.regionScores.map((rs) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "bg-card border border-border rounded-xl p-4 space-y-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground capitalize", children: rs.region }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1 text-center", children: ["avgR", "avgG", "avgB"].map((ch) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: ch.replace("avg", "") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-semibold text-foreground", children: rs[ch].toFixed(0) })
                  ] }, ch)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Bright" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-foreground", children: rs.brightness.toFixed(1) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Contrast" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-foreground", children: rs.contrast.toFixed(1) })
                    ] })
                  ] })
                ]
              },
              rs.region
            )) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
              "data-ocid": "history_detail.delete_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                "Delete This Screening"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "history_detail.delete_dialog", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this screening?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will permanently remove the screening from your history. This action cannot be undone." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "history_detail.delete_cancel_button", children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AlertDialogAction,
                {
                  onClick: () => deleteMutation.mutate(),
                  className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  "data-ocid": "history_detail.delete_confirm_button",
                  children: deleteMutation.isPending ? "Deleting…" : "Delete"
                }
              )
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
export {
  HistoryDetailPage as default
};
