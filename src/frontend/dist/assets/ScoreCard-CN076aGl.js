import { c as createLucideIcon, r as reactExports, T as TriangleAlert, j as jsxRuntimeExports, a as cn } from "./index-Ce0Yvw1c.js";
import { p as parseRiskLevel, g as getConditionDisplayName, i as getConditionMeaning, j as getEvidenceStrength, d as getConfidenceColorClass, c as getConfidenceTextClass, b as RiskBadge, N as NEXT_STEPS, k as RESEARCH_DISCLAIMER } from "./RiskBadge-ClmprxIA.js";
import { F as FlaskConical } from "./flask-conical-_ZMb8t_S.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = createLucideIcon("chevron-up", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  [
    "path",
    { d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1", key: "1oajmo" }
  ],
  [
    "path",
    { d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1", key: "mpwhp6" }
  ]
];
const FileJson = createLucideIcon("file-json", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode);
function FeatureBar({
  label,
  value,
  colorClass,
  textClass
}) {
  const pct = Math.min(100, Math.max(0, value));
  const autoColor = colorClass ?? getConfidenceColorClass(pct);
  const autoText = textClass ?? getConfidenceTextClass(pct);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wide", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: cn(
            "text-[10px] font-mono tabular-nums font-bold",
            autoText
          ),
          children: [
            pct.toFixed(0),
            "%"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "h-full rounded-full transition-all duration-700",
          autoColor
        ),
        style: { width: `${pct}%` }
      }
    ) })
  ] });
}
function FeatureConfidenceBars({
  featureConfidences
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider", children: "Feature Confidence" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureBar, { label: "Color", value: featureConfidences.color }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureBar, { label: "Texture", value: featureConfidences.texture }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureBar, { label: "Edge", value: featureConfidences.edge }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureBar, { label: "Segment", value: featureConfidences.segmentation })
    ] })
  ] });
}
const RISK_BAR_COLORS = {
  low: "bg-accent",
  moderate: "bg-secondary",
  elevated: "bg-chart-4",
  high: "bg-destructive"
};
const EVIDENCE_STYLES = {
  Strong: {
    badge: "bg-accent/10 text-accent border-accent/30",
    icon: ShieldCheck
  },
  Moderate: {
    badge: "bg-secondary/10 text-secondary border-secondary/30",
    icon: TriangleAlert
  },
  Weak: { badge: "bg-muted text-muted-foreground border-border", icon: Info }
};
function ScoreCard({
  condition,
  index,
  className
}) {
  const [expanded, setExpanded] = reactExports.useState(false);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-smooth",
        className
      ),
      "data-ocid": index !== void 0 ? `score_card.item.${index + 1}` : "score_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-sm text-foreground leading-snug min-w-0 break-words", children: displayName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RiskBadge, { level: riskLevel, size: "sm", className: "shrink-0" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-2xl font-bold text-foreground tabular-nums", children: scorePercent.toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-mono", children: "/100" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: cn(
                "text-xs font-mono tabular-nums border rounded-full px-2 py-0.5 font-bold",
                confText,
                condition.conditionConfidence >= 70 ? "bg-accent/10 border-accent/25" : condition.conditionConfidence >= 40 ? "bg-secondary/10 border-secondary/25" : "bg-destructive/10 border-destructive/25"
              ),
              title: "Overall condition confidence",
              children: [
                condition.conditionConfidence.toFixed(0),
                "% conf."
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "h-full rounded-full transition-all duration-700",
              barColor
            ),
            style: { width: `${scorePercent}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-muted-foreground uppercase tracking-wide", children: "Condition Confidence" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "h-full rounded-full transition-all duration-700",
                confColor
              ),
              style: {
                width: `${Math.min(100, condition.conditionConfidence)}%`
              }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: cn(
              "inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-[10px] font-medium",
              evidenceStyle.badge
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EvidenceIcon, { className: "h-2.5 w-2.5", "aria-hidden": true }),
              evidenceStrength,
              " Evidence"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FeatureConfidenceBars,
          {
            featureConfidences: condition.featureConfidences
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full",
              onClick: () => setExpanded(!expanded),
              "data-ocid": index !== void 0 ? `score_card.explain_toggle.${index + 1}` : "score_card.explain_toggle",
              "aria-expanded": expanded,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3 w-3 shrink-0", "aria-hidden": true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium uppercase tracking-wide", children: "What This Means & Next Steps" }),
                expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3 w-3 ml-auto" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3 ml-auto" })
              ]
            }
          ),
          expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-md bg-primary/5 border border-primary/15", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-display font-semibold uppercase tracking-wider text-primary mb-1", children: "What this may indicate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground leading-relaxed", children: meaning })
            ] }),
            condition.explanation && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "p-3 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
                "Analysis:",
                " "
              ] }),
              condition.explanation
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-md bg-accent/5 border border-accent/20 space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-display font-semibold uppercase tracking-wider text-accent", children: "Recommended Next Steps" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground leading-relaxed", children: nextSteps })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5 px-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Info,
                {
                  className: "h-3 w-3 text-muted-foreground shrink-0 mt-0.5",
                  "aria-hidden": true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground italic leading-relaxed", children: RESEARCH_DISCLAIMER })
            ] })
          ] })
        ] })
      ]
    }
  );
}
export {
  ChevronUp as C,
  Download as D,
  FileText as F,
  ScoreCard as S,
  ChevronDown as a,
  FileJson as b
};
