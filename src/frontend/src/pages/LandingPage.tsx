import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  FileDown,
  FlaskConical,
  LogIn,
  ScanEye,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/use-auth";

// Clinical eye schematic — SVG, no external images
function EyeSchematic() {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Outer eye outline dashes */}
      <ellipse
        cx="160"
        cy="100"
        rx="148"
        ry="80"
        stroke="oklch(0.55 0.11 195 / 0.25)"
        strokeWidth="1.5"
        strokeDasharray="6 3"
      />
      {/* Sclera fill */}
      <ellipse
        cx="160"
        cy="100"
        rx="140"
        ry="70"
        fill="oklch(0.55 0.11 195 / 0.05)"
        stroke="oklch(0.55 0.11 195 / 0.18)"
        strokeWidth="1"
      />
      {/* Conjunctiva overlay */}
      <ellipse
        cx="160"
        cy="100"
        rx="105"
        ry="55"
        fill="oklch(0.72 0.15 80 / 0.07)"
        stroke="oklch(0.72 0.15 80 / 0.22)"
        strokeWidth="1"
      />
      {/* Iris */}
      <circle
        cx="160"
        cy="100"
        r="52"
        fill="oklch(0.55 0.11 195 / 0.10)"
        stroke="oklch(0.55 0.11 195 / 0.35)"
        strokeWidth="1.5"
      />
      {/* Pupil */}
      <circle cx="160" cy="100" r="22" fill="oklch(0.22 0 0 / 0.15)" />
      {/* Cornea arc highlight */}
      <circle
        cx="160"
        cy="100"
        r="22"
        stroke="oklch(0.62 0.15 140 / 0.50)"
        strokeWidth="2"
        fill="none"
      />
      {/* Scan reticle marks */}
      <rect
        x="135"
        y="75"
        width="8"
        height="8"
        fill="none"
        stroke="oklch(0.55 0.11 195 / 0.35)"
        strokeWidth="1"
      />
      <rect
        x="177"
        y="75"
        width="8"
        height="8"
        fill="none"
        stroke="oklch(0.55 0.11 195 / 0.35)"
        strokeWidth="1"
      />
      <rect
        x="135"
        y="117"
        width="8"
        height="8"
        fill="none"
        stroke="oklch(0.55 0.11 195 / 0.35)"
        strokeWidth="1"
      />
      <rect
        x="177"
        y="117"
        width="8"
        height="8"
        fill="none"
        stroke="oklch(0.55 0.11 195 / 0.35)"
        strokeWidth="1"
      />
      {/* Center crosshair */}
      <line
        x1="155"
        y1="100"
        x2="165"
        y2="100"
        stroke="oklch(0.62 0.15 140 / 0.60)"
        strokeWidth="1.5"
      />
      <line
        x1="160"
        y1="95"
        x2="160"
        y2="105"
        stroke="oklch(0.62 0.15 140 / 0.60)"
        strokeWidth="1.5"
      />
      {/* Label lines */}
      <line
        x1="40"
        y1="65"
        x2="90"
        y2="90"
        stroke="oklch(0.55 0.11 195 / 0.25)"
        strokeWidth="0.75"
      />
      <text
        x="12"
        y="62"
        fontSize="8"
        fill="oklch(0.55 0.11 195 / 0.65)"
        fontFamily="monospace"
        fontWeight="600"
      >
        SCLERA
      </text>
      <line
        x1="240"
        y1="140"
        x2="210"
        y2="118"
        stroke="oklch(0.72 0.15 80 / 0.25)"
        strokeWidth="0.75"
      />
      <text
        x="243"
        y="144"
        fontSize="8"
        fill="oklch(0.72 0.15 80 / 0.65)"
        fontFamily="monospace"
        fontWeight="600"
      >
        CONJUNCTIVA
      </text>
      <line
        x1="175"
        y1="58"
        x2="170"
        y2="79"
        stroke="oklch(0.62 0.15 140 / 0.25)"
        strokeWidth="0.75"
      />
      <text
        x="176"
        y="55"
        fontSize="8"
        fill="oklch(0.62 0.15 140 / 0.65)"
        fontFamily="monospace"
        fontWeight="600"
      >
        CORNEA
      </text>
    </svg>
  );
}

const FEATURES = [
  {
    icon: Camera,
    title: "Camera & File Upload",
    description:
      "Capture a live eye photo via device camera or upload an existing image — both workflows equally supported.",
    colorClass: "text-primary",
    bgClass: "bg-primary/8",
  },
  {
    icon: ScanEye,
    title: "Region Analysis",
    description:
      "Isolates sclera, conjunctiva, and cornea to evaluate color, brightness, and contrast in each zone.",
    colorClass: "text-secondary",
    bgClass: "bg-secondary/8",
  },
  {
    icon: FlaskConical,
    title: "Explainable Scores",
    description:
      "Numeric confidence scores with plain-language reasoning — no black-box results, full transparency.",
    colorClass: "text-accent",
    bgClass: "bg-accent/8",
  },
  {
    icon: FileDown,
    title: "PDF / JSON Export",
    description:
      "Download a complete screening report in PDF for review or JSON for research and data analysis.",
    colorClass: "text-primary",
    bgClass: "bg-primary/8",
  },
];

const INDICATORS = [
  {
    region: "Sclera",
    colorClass: "text-primary",
    borderClass: "border-primary/20",
    bgClass: "bg-primary/5",
    indicator: "Jaundice",
    detail: "Yellowing detected via chroma shift in the white scleral region",
  },
  {
    region: "Conjunctiva",
    colorClass: "text-secondary",
    borderClass: "border-secondary/20",
    bgClass: "bg-secondary/5",
    indicator: "Anemia",
    detail: "Pallor measured through brightness and saturation drop",
  },
  {
    region: "Cornea",
    colorClass: "text-accent",
    borderClass: "border-accent/20",
    bgClass: "bg-accent/5",
    indicator: "Corneal Arcus",
    detail: "Lipid ring formation scored by peripheral contrast analysis",
  },
];

export default function LandingPage() {
  const { isAuthenticated, isLoggingIn, principal, login } = useAuth();
  const navigate = useNavigate();

  const handleStartScreening = () => {
    navigate({ to: "/analyze" });
  };

  return (
    <div className="flex flex-col min-h-full" data-ocid="landing.page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-background">
        {/* Soft radial backdrop */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_56%_at_50%_42%,var(--color-primary-glow,oklch(0.55_0.11_195_/_0.07))_0%,transparent_70%),radial-gradient(ellipse_50%_40%_at_80%_72%,oklch(0.62_0.15_140_/_0.055)_0%,transparent_60%)]"
          aria-hidden="true"
        />
        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div>
              <Badge
                variant="outline"
                className="text-primary border-primary/30 bg-primary/5 font-mono text-xs tracking-wider"
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                RESEARCH PROTOTYPE
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-foreground">
                OcuScreen<span className="text-primary">+</span>
              </h1>
              <p className="font-display text-xl sm:text-2xl font-medium text-muted-foreground leading-snug">
                Research-oriented eye health screening for early visual
                indicators
              </p>
            </div>

            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              Analyze sclera, conjunctiva, and cornea regions to identify visual
              patterns associated with jaundice, anemia, and corneal arcus —
              with explainability at every step.
            </p>

            {/* Entry CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-3 pt-2"
              data-ocid="landing.cta_section"
            >
              <Button
                size="lg"
                onClick={handleStartScreening}
                className="gap-2 font-semibold"
                data-ocid="landing.start_screening_button"
              >
                <Zap className="w-4 h-4" />
                Start Screening
              </Button>

              {isAuthenticated ? (
                <p className="flex items-center text-sm text-muted-foreground gap-2 self-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent" />
                  Welcome back — your history is saved automatically
                </p>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="gap-2 font-semibold"
                  data-ocid="landing.signin_button"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoggingIn ? "Signing in…" : "Sign In to Save Results"}
                </Button>
              )}
            </div>

            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground">
                Anonymous screening is fully supported — no account required.
              </p>
            )}

            {isAuthenticated && principal && (
              <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                Signed in:{" "}
                <span className="text-foreground">
                  {principal.slice(0, 14)}…
                </span>
              </p>
            )}
          </motion.div>

          {/* Right — eye schematic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-[340px] h-[220px] rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-lg p-6 overflow-hidden">
              {/* Corner scan brackets */}
              <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary/35 rounded-tl" />
              <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary/35 rounded-tr" />
              <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary/35 rounded-bl" />
              <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary/35 rounded-br" />

              <EyeSchematic />

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 whitespace-nowrap">
                {[
                  { label: "Sclera", dotClass: "bg-primary" },
                  { label: "Conjunctiva", dotClass: "bg-secondary" },
                  { label: "Cornea", dotClass: "bg-accent" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${r.dotClass}`} />
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Disclaimer Banner ────────────────────────────────── */}
      <section
        className="border-y border-secondary/25 bg-secondary/8 px-4 py-5"
        data-ocid="landing.disclaimer_section"
        aria-label="Non-diagnostic disclaimer"
        role="note"
      >
        <div className="max-w-5xl mx-auto flex gap-3 items-start">
          <AlertTriangle
            className="w-5 h-5 mt-0.5 shrink-0 text-secondary"
            aria-hidden="true"
          />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              Non-Diagnostic Research Tool
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This tool is for research and educational purposes only. It is{" "}
              <strong className="text-foreground font-semibold">
                NOT a medical diagnostic device
              </strong>
              . Results are experimental and must not be used for clinical
              decision-making. Always consult a qualified healthcare
              professional for any health concerns.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section
        className="bg-muted/30 px-4 py-16"
        data-ocid="landing.features_section"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-10 space-y-2"
          >
            <h2 className="font-display text-2xl font-bold text-foreground">
              Key Capabilities
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Purpose-built image processing pipeline targeting medically
              relevant eye regions with full numeric explainability.
            </p>
          </motion.div>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            data-ocid="landing.features_list"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card
                  className="h-full border-border/70 bg-card hover:shadow-md transition-smooth"
                  data-ocid={`landing.feature_card.${i + 1}`}
                >
                  <CardContent className="pt-5 pb-5 flex flex-col gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg ${f.bgClass} flex items-center justify-center`}
                    >
                      <f.icon className={`w-4 h-4 ${f.colorClass}`} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-sm font-semibold text-foreground">
                        {f.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Indicators ───────────────────────────────────────── */}
      <section
        className="bg-background px-4 py-16"
        data-ocid="landing.indicators_section"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-10 space-y-2"
          >
            <h2 className="font-display text-2xl font-bold text-foreground">
              What We Screen For
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Each eye region maps to a specific visual health indicator,
              evaluated with transparent scoring logic.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {INDICATORS.map((item, i) => (
              <motion.div
                key={item.region}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`rounded-xl border ${item.borderClass} ${item.bgClass} p-6 space-y-2 text-center`}
                data-ocid={`landing.indicator_card.${i + 1}`}
              >
                <p
                  className={`text-xs font-mono font-semibold uppercase tracking-widest ${item.colorClass}`}
                >
                  {item.region}
                </p>
                <p className="font-display text-lg font-bold text-foreground">
                  {item.indicator}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section
        className="bg-card border-t border-border px-4 py-14"
        data-ocid="landing.bottom_cta_section"
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <h2 className="font-display text-2xl font-bold text-foreground">
              Ready to begin a screening?
            </h2>
            <p className="text-sm text-muted-foreground">
              No account needed. Upload or capture an eye photo and receive
              explainable analysis in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              size="lg"
              onClick={handleStartScreening}
              className="gap-2 font-semibold"
              data-ocid="landing.bottom_start_button"
            >
              <Zap className="w-4 h-4" />
              Start Screening
            </Button>

            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                onClick={login}
                disabled={isLoggingIn}
                className="gap-2 font-semibold"
                data-ocid="landing.bottom_signin_button"
              >
                <LogIn className="w-4 h-4" />
                {isLoggingIn ? "Signing in…" : "Sign In to Save Results"}
              </Button>
            )}
          </motion.div>

          {isAuthenticated && (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-accent" />
              Welcome back — your history is saved automatically
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
