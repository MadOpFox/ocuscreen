import { c as createLucideIcon, j as jsxRuntimeExports, a as cn, u as useAuth, b as useNavigate, B as Button, L as LogIn, T as TriangleAlert, S as ScanEye } from "./index-Ce0Yvw1c.js";
import { B as Badge } from "./badge-GKv5KtvZ.js";
import { m as motion, C as Camera } from "./proxy-B2diXMsN.js";
import { S as Sparkles } from "./sparkles-TesRRzCA.js";
import { F as FlaskConical } from "./flask-conical-_ZMb8t_S.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }],
  ["path", { d: "m9 15 3 3 3-3", key: "1npd3o" }]
];
const FileDown = createLucideIcon("file-down", __iconNode$1);
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
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
];
const Zap = createLucideIcon("zap", __iconNode);
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function EyeSchematic() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 320 200",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className: "w-full h-full",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "ellipse",
          {
            cx: "160",
            cy: "100",
            rx: "148",
            ry: "80",
            stroke: "oklch(0.55 0.11 195 / 0.25)",
            strokeWidth: "1.5",
            strokeDasharray: "6 3"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "ellipse",
          {
            cx: "160",
            cy: "100",
            rx: "140",
            ry: "70",
            fill: "oklch(0.55 0.11 195 / 0.05)",
            stroke: "oklch(0.55 0.11 195 / 0.18)",
            strokeWidth: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "ellipse",
          {
            cx: "160",
            cy: "100",
            rx: "105",
            ry: "55",
            fill: "oklch(0.72 0.15 80 / 0.07)",
            stroke: "oklch(0.72 0.15 80 / 0.22)",
            strokeWidth: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            cx: "160",
            cy: "100",
            r: "52",
            fill: "oklch(0.55 0.11 195 / 0.10)",
            stroke: "oklch(0.55 0.11 195 / 0.35)",
            strokeWidth: "1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "160", cy: "100", r: "22", fill: "oklch(0.22 0 0 / 0.15)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "circle",
          {
            cx: "160",
            cy: "100",
            r: "22",
            stroke: "oklch(0.62 0.15 140 / 0.50)",
            strokeWidth: "2",
            fill: "none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            x: "135",
            y: "75",
            width: "8",
            height: "8",
            fill: "none",
            stroke: "oklch(0.55 0.11 195 / 0.35)",
            strokeWidth: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            x: "177",
            y: "75",
            width: "8",
            height: "8",
            fill: "none",
            stroke: "oklch(0.55 0.11 195 / 0.35)",
            strokeWidth: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            x: "135",
            y: "117",
            width: "8",
            height: "8",
            fill: "none",
            stroke: "oklch(0.55 0.11 195 / 0.35)",
            strokeWidth: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            x: "177",
            y: "117",
            width: "8",
            height: "8",
            fill: "none",
            stroke: "oklch(0.55 0.11 195 / 0.35)",
            strokeWidth: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "line",
          {
            x1: "155",
            y1: "100",
            x2: "165",
            y2: "100",
            stroke: "oklch(0.62 0.15 140 / 0.60)",
            strokeWidth: "1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "line",
          {
            x1: "160",
            y1: "95",
            x2: "160",
            y2: "105",
            stroke: "oklch(0.62 0.15 140 / 0.60)",
            strokeWidth: "1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "line",
          {
            x1: "40",
            y1: "65",
            x2: "90",
            y2: "90",
            stroke: "oklch(0.55 0.11 195 / 0.25)",
            strokeWidth: "0.75"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "text",
          {
            x: "12",
            y: "62",
            fontSize: "8",
            fill: "oklch(0.55 0.11 195 / 0.65)",
            fontFamily: "monospace",
            fontWeight: "600",
            children: "SCLERA"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "line",
          {
            x1: "240",
            y1: "140",
            x2: "210",
            y2: "118",
            stroke: "oklch(0.72 0.15 80 / 0.25)",
            strokeWidth: "0.75"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "text",
          {
            x: "243",
            y: "144",
            fontSize: "8",
            fill: "oklch(0.72 0.15 80 / 0.65)",
            fontFamily: "monospace",
            fontWeight: "600",
            children: "CONJUNCTIVA"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "line",
          {
            x1: "175",
            y1: "58",
            x2: "170",
            y2: "79",
            stroke: "oklch(0.62 0.15 140 / 0.25)",
            strokeWidth: "0.75"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "text",
          {
            x: "176",
            y: "55",
            fontSize: "8",
            fill: "oklch(0.62 0.15 140 / 0.65)",
            fontFamily: "monospace",
            fontWeight: "600",
            children: "CORNEA"
          }
        )
      ]
    }
  );
}
const FEATURES = [
  {
    icon: Camera,
    title: "Camera & File Upload",
    description: "Capture a live eye photo via device camera or upload an existing image — both workflows equally supported.",
    colorClass: "text-primary",
    bgClass: "bg-primary/8"
  },
  {
    icon: ScanEye,
    title: "Region Analysis",
    description: "Isolates sclera, conjunctiva, and cornea to evaluate color, brightness, and contrast in each zone.",
    colorClass: "text-secondary",
    bgClass: "bg-secondary/8"
  },
  {
    icon: FlaskConical,
    title: "Explainable Scores",
    description: "Numeric confidence scores with plain-language reasoning — no black-box results, full transparency.",
    colorClass: "text-accent",
    bgClass: "bg-accent/8"
  },
  {
    icon: FileDown,
    title: "PDF / JSON Export",
    description: "Download a complete screening report in PDF for review or JSON for research and data analysis.",
    colorClass: "text-primary",
    bgClass: "bg-primary/8"
  }
];
const INDICATORS = [
  {
    region: "Sclera",
    colorClass: "text-primary",
    borderClass: "border-primary/20",
    bgClass: "bg-primary/5",
    indicator: "Jaundice",
    detail: "Yellowing detected via chroma shift in the white scleral region"
  },
  {
    region: "Conjunctiva",
    colorClass: "text-secondary",
    borderClass: "border-secondary/20",
    bgClass: "bg-secondary/5",
    indicator: "Anemia",
    detail: "Pallor measured through brightness and saturation drop"
  },
  {
    region: "Cornea",
    colorClass: "text-accent",
    borderClass: "border-accent/20",
    bgClass: "bg-accent/5",
    indicator: "Corneal Arcus",
    detail: "Lipid ring formation scored by peripheral contrast analysis"
  }
];
function LandingPage() {
  const { isAuthenticated, isLoggingIn, principal, login } = useAuth();
  const navigate = useNavigate();
  const handleStartScreening = () => {
    navigate({ to: "/analyze" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-h-full", "data-ocid": "landing.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative flex-1 flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_56%_at_50%_42%,var(--color-primary-glow,oklch(0.55_0.11_195_/_0.07))_0%,transparent_70%),radial-gradient(ellipse_50%_40%_at_80%_72%,oklch(0.62_0.15_140_/_0.055)_0%,transparent_60%)]",
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "pointer-events-none absolute inset-0 opacity-[0.03]",
          style: {
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          },
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-5xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: -24 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.5, ease: "easeOut" },
            className: "flex flex-col gap-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  variant: "outline",
                  className: "text-primary border-primary/30 bg-primary/5 font-mono text-xs tracking-wider",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3 mr-1.5" }),
                    "RESEARCH PROTOTYPE"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-foreground", children: [
                  "OcuScreen",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "+" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl sm:text-2xl font-medium text-muted-foreground leading-snug", children: "Research-oriented eye health screening for early visual indicators" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-muted-foreground leading-relaxed max-w-md", children: "Analyze sclera, conjunctiva, and cornea regions to identify visual patterns associated with jaundice, anemia, and corneal arcus — with explainability at every step." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col sm:flex-row gap-3 pt-2",
                  "data-ocid": "landing.cta_section",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        size: "lg",
                        onClick: handleStartScreening,
                        className: "gap-2 font-semibold",
                        "data-ocid": "landing.start_screening_button",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4" }),
                          "Start Screening"
                        ]
                      }
                    ),
                    isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center text-sm text-muted-foreground gap-2 self-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-accent" }),
                      "Welcome back — your history is saved automatically"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        size: "lg",
                        variant: "outline",
                        onClick: login,
                        disabled: isLoggingIn,
                        className: "gap-2 font-semibold",
                        "data-ocid": "landing.signin_button",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-4 h-4" }),
                          isLoggingIn ? "Signing in…" : "Sign In to Save Results"
                        ]
                      }
                    )
                  ]
                }
              ),
              !isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Anonymous screening is fully supported — no account required." }),
              isAuthenticated && principal && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-mono truncate max-w-xs", children: [
                "Signed in:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
                  principal.slice(0, 14),
                  "…"
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.94 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.6, ease: "easeOut", delay: 0.15 },
            className: "hidden lg:flex items-center justify-center",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-[340px] h-[220px] rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-lg p-6 overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary/35 rounded-tl" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary/35 rounded-tr" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary/35 rounded-bl" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary/35 rounded-br" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeSchematic, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 whitespace-nowrap", children: [
                { label: "Sclera", dotClass: "bg-primary" },
                { label: "Conjunctiva", dotClass: "bg-secondary" },
                { label: "Cornea", dotClass: "bg-accent" }
              ].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2 h-2 rounded-full ${r.dotClass}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: r.label })
              ] }, r.label)) })
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        className: "border-y border-secondary/25 bg-secondary/8 px-4 py-5",
        "data-ocid": "landing.disclaimer_section",
        "aria-label": "Non-diagnostic disclaimer",
        role: "note",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto flex gap-3 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TriangleAlert,
            {
              className: "w-5 h-5 mt-0.5 shrink-0 text-secondary",
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Non-Diagnostic Research Tool" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed", children: [
              "This tool is for research and educational purposes only. It is",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground font-semibold", children: "NOT a medical diagnostic device" }),
              ". Results are experimental and must not be used for clinical decision-making. Always consult a qualified healthcare professional for any health concerns."
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        className: "bg-muted/30 px-4 py-16",
        "data-ocid": "landing.features_section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.45 },
              className: "text-center mb-10 space-y-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Key Capabilities" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm max-w-xl mx-auto", children: "Purpose-built image processing pipeline targeting medically relevant eye regions with full numeric explainability." })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4",
              "data-ocid": "landing.features_list",
              children: FEATURES.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.4, delay: i * 0.08 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Card,
                    {
                      className: "h-full border-border/70 bg-card hover:shadow-md transition-smooth",
                      "data-ocid": `landing.feature_card.${i + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 pb-5 flex flex-col gap-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: `w-9 h-9 rounded-lg ${f.bgClass} flex items-center justify-center`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: `w-4 h-4 ${f.colorClass}` })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-sm font-semibold text-foreground", children: f.title }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: f.description })
                        ] })
                      ] })
                    }
                  )
                },
                f.title
              ))
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        className: "bg-background px-4 py-16",
        "data-ocid": "landing.indicators_section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.45 },
              className: "text-center mb-10 space-y-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "What We Screen For" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-xl mx-auto", children: "Each eye region maps to a specific visual health indicator, evaluated with transparent scoring logic." })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-3 gap-6", children: INDICATORS.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { delay: i * 0.1, duration: 0.4 },
              className: `rounded-xl border ${item.borderClass} ${item.bgClass} p-6 space-y-2 text-center`,
              "data-ocid": `landing.indicator_card.${i + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: `text-xs font-mono font-semibold uppercase tracking-widest ${item.colorClass}`,
                    children: item.region
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg font-bold text-foreground", children: item.indicator }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: item.detail })
              ]
            },
            item.region
          )) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        className: "bg-card border-t border-border px-4 py-14",
        "data-ocid": "landing.bottom_cta_section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto text-center space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 12 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.4 },
              className: "space-y-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Ready to begin a screening?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No account needed. Upload or capture an eye photo and receive explainable analysis in seconds." })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 8 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.4, delay: 0.1 },
              className: "flex flex-col sm:flex-row gap-3 justify-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "lg",
                    onClick: handleStartScreening,
                    className: "gap-2 font-semibold",
                    "data-ocid": "landing.bottom_start_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4" }),
                      "Start Screening"
                    ]
                  }
                ),
                !isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "lg",
                    variant: "outline",
                    onClick: login,
                    disabled: isLoggingIn,
                    className: "gap-2 font-semibold",
                    "data-ocid": "landing.bottom_signin_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-4 h-4" }),
                      isLoggingIn ? "Signing in…" : "Sign In to Save Results"
                    ]
                  }
                )
              ]
            }
          ),
          isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center justify-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-accent" }),
            "Welcome back — your history is saved automatically"
          ] })
        ] })
      }
    )
  ] });
}
export {
  LandingPage as default
};
