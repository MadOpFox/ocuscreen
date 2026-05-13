# Design Brief: OcuScreen+

**Purpose:** Research-oriented medical screening tool for early visual health indicators. Users capture/analyze eye images to assess jaundice, anemia, corneal arcus risk. Non-diagnostic, designed to inspire confidence and clarity.

**Tone:** Refined minimalism with scientific precision. Trustworthy, purposeful, uncluttered. Every element serves analysis clarity.

---

## Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| Primary | `0.55 0.11 195` (teal) | `0.72 0.13 195` | Clinical authority, analysis highlights |
| Secondary | `0.72 0.15 80` (amber) | `0.62 0.12 80` | Warmth, humanizing factor |
| Accent | `0.62 0.15 140` (emerald) | `0.75 0.16 140` | Health positive, region overlays |
| Destructive | `0.55 0.24 22` (red) | `0.65 0.22 20` | Risk elevation, warnings |
| Neutral (bg) | `0.98 0 0` | `0.14 0 0` | Clean, medical backdrop |
| Text | `0.22 0 0` | `0.93 0 0` | High contrast, professional |

---

## Typography

| Layer | Font | Role |
|-------|------|------|
| Display | Space Grotesk | Geometric, modern, scientific precision |
| Body | Inter | Highly legible, data-focused, proven in health UIs |
| Mono | JetBrains Mono | Numeric scores, confidence intervals, code regions |

---

## Structural Zones

| Zone | Treatment | Notes |
|------|-----------|-------|
| Header | `bg-background border-b border-border` | Minimal, app logo + navigation |
| Main Content | `bg-background` | Image analysis region with color-coded overlays |
| Cards | `bg-card border border-border rounded-md` | Risk scores, explainability boxes |
| Sidebar (nav) | `bg-sidebar border-r border-border` | Optional; minimal accent styling |
| Footer | `bg-muted/20 border-t border-border` | Optional; links/meta only |

---

## Shape Language

| Element | Radius |
|---------|--------|
| Cards, inputs | `8px` (rounded-md) |
| Buttons | `8px` (rounded-md) |
| Input fields | `4px` (rounded-sm) |
| Tags/badges | `4px` (rounded-sm) |
| Full circle | `9999px` (rounded-full) — avatars only |

---

## Component Patterns

- **Buttons:** Primary (teal bg, white text) for actions; secondary (muted bg) for tertiary actions; danger (red) for destructive. No gradients.
- **Cards:** Bordered, subtle shadow (xs only). Padding `p-4`. Content-first layout.
- **Score badges:** Monospace font, color-coded by risk tier. Confidence intervals shown in small text.
- **Region overlays:** Sclera (accent/emerald ring), conjunctiva (secondary/amber ring), cornea (destructive/red ring). Stacked on image.
- **Explainability boxes:** Light muted background, border, readable serif body text. Max 2–3 lines per finding.

---

## Motion & Interaction

- Default transition: `.transition-smooth` (0.3s cubic-bezier).
- Score reveals: fade-in staggered. No bounce.
- Region highlights: subtle pulse on hover (optional).
- Modal overlays: fade-in, no scale.

---

## Elevation & Depth

- **Shadows:** xs only (0 1px 2px). No lifted effect; cards sit on flat background.
- **Layers:** Overlapping cards for depth; borders for clarity, not shadows.

---

## Spacing & Rhythm

- Base unit: 4px.
- Headings: `mb-4`, `text-lg`/`text-xl`.
- Cards: `p-4` (16px) internal, `gap-4` (16px) between.
- Inline: `space-x-2` for tight grouping; `space-x-4` for breathing room.

---

## Responsive

- Mobile-first breakpoints: `sm` (640px), `md` (768px), `lg` (1024px).
- Image analysis region: full-width on mobile, max-width card on `md+`.
- Score cards: stack on mobile, grid on `md+`.

---

## Dark Mode

- Intentional, not inverted. Cool grey backgrounds (`0.14 0 0`), higher contrast text.
- Primary teal brightened for legibility (lightness `0.72`).
- Accent emerald also brightened (lightness `0.75`).
- Borders tighten for clarity on dark.

---

## Differentiation

- **Analysis-first layout:** Image + region overlays + scores below.
- **Color-coded regions:** Each eye zone (sclera/conjunctiva/cornea) has distinct semantic color ring.
- **Explainability chain:** Every score links to reasoning. No black-box numbers.
- **Medical authenticity:** Clean typography, clinical palette, zero decoration. This is tools-first, not showcase.

---

## Signature Detail

**Region ring overlays:** Teal (sclera), amber (conjunctiva), red (cornea) — semantic colors that create visual hierarchy and clinical clarity simultaneously. Users instantly learn what's being analyzed.

