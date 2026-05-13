// Re-export and extend backend types with frontend-specific additions

export type {
  AnalysisResult,
  RegionScore,
  ConditionResult,
  WhitePatchRegion,
  WhitePatchInput,
  ScreeningRecord,
  TextureFeatures,
  EdgeFeatures,
  SegmentationResult,
  FeatureConfidences,
  DetectedRegions,
} from "../backend";

export type RiskLevel = "low" | "moderate" | "elevated" | "high";

export function parseRiskLevel(raw: string): RiskLevel {
  const normalized = raw.toLowerCase().trim();
  if (normalized === "low") return "low";
  if (normalized === "moderate" || normalized === "medium") return "moderate";
  if (normalized === "elevated") return "elevated";
  return "high";
}

export interface ScreeningSession {
  imageFile: File | null;
  imageDataUrl: string | null;
  whitePatch: WhitePatchSelection | null;
  analysisResult: import("../backend").AnalysisResult | null;
  llmSummary: string | null;
  isAnalyzing: boolean;
}

export interface WhitePatchSelection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type EyeRegion = "sclera" | "conjunctiva" | "cornea";

export interface RegionOverlayConfig {
  region: EyeRegion;
  label: string;
  color: string;
  points: Array<{ x: number; y: number }>;
}

// ── Detected regions from backend analysis ───────────────────────────────────

/** A bounding box in normalized [0,1] image coordinates */
export interface RegionBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ── Condition display name mapping ───────────────────────────────────────────

export const CONDITION_DISPLAY_NAMES: Record<string, string> = {
  jaundice: "Jaundice (Yellowing)",
  anemia: "Anemia (Pallor)",
  cornealArcus: "Corneal Arcus",
  eyeRedness: "Eye Redness",
  pupilIrregularity: "Pupil Irregularity",
  drynessIndicator: "Dryness / Dehydration",
  // Backend may return "dryness" as the key
  dryness: "Dryness / Dehydration",
};

export function getConditionDisplayName(conditionKey: string): string {
  return CONDITION_DISPLAY_NAMES[conditionKey] ?? conditionKey;
}

// ── Next-steps text per risk level ───────────────────────────────────────────

export const NEXT_STEPS: Record<RiskLevel, string> = {
  low: "No action needed — results are within normal range. Consider re-screening in 6 months as part of routine eye care.",
  moderate:
    "Monitor for any worsening symptoms. Consider consulting an eye care professional within the next few weeks.",
  elevated:
    "Schedule an appointment with an ophthalmologist soon. Avoid self-diagnosing and seek professional evaluation.",
  high: "Seek prompt medical attention. These indicators may reflect a condition requiring urgent evaluation by a qualified professional.",
};

export const RESEARCH_DISCLAIMER =
  "OcuScreen+ is a research tool and not a medical diagnostic device.";

// ── Condition explanation/meaning per condition ──────────────────────────────

export const CONDITION_MEANINGS: Record<string, string> = {
  jaundice:
    "Yellowing of the sclera (whites of the eye) may suggest elevated bilirubin, which can indicate liver, gallbladder, or blood conditions.",
  anemia:
    "Paleness of the conjunctiva (inner eyelid lining) may indicate reduced haemoglobin levels, commonly associated with nutritional deficiencies or chronic illness.",
  cornealArcus:
    "A whitish or greyish ring forming around the cornea edge may indicate lipid deposits, sometimes associated with elevated cholesterol, particularly in younger individuals.",
  eyeRedness:
    "Visible redness of the sclera or conjunctiva may indicate infection, allergy, inflammation, or dryness. Often benign but persistent redness warrants evaluation.",
  pupilIrregularity:
    "Asymmetry or irregular pupil shape can, in rare cases, reflect neurological or structural eye conditions. Should be evaluated if persistent.",
  drynessIndicator:
    "Surface dryness signs may indicate reduced tear production or meibomian gland dysfunction, often linked to dehydration, screen exposure, or systemic conditions.",
  dryness:
    "Surface dryness signs may indicate reduced tear production or meibomian gland dysfunction, often linked to dehydration, screen exposure, or systemic conditions.",
};

export function getConditionMeaning(conditionKey: string): string {
  return (
    CONDITION_MEANINGS[conditionKey] ??
    "This indicator was evaluated as part of the multi-feature screening analysis."
  );
}

// ── Strength of evidence ──────────────────────────────────────────────────────

export type EvidenceStrength = "Strong" | "Moderate" | "Weak";

export function getEvidenceStrength(
  featureConfidences: import("../backend").FeatureConfidences,
): EvidenceStrength {
  const values = [
    featureConfidences.color,
    featureConfidences.texture,
    featureConfidences.edge,
    featureConfidences.segmentation,
  ];
  const above50 = values.filter((v) => v >= 50).length;
  const above70 = values.filter((v) => v >= 70).length;
  if (above70 >= 3) return "Strong";
  if (above50 >= 2) return "Moderate";
  return "Weak";
}

// ── Confidence bar color ──────────────────────────────────────────────────────

export function getConfidenceColorClass(value: number): string {
  if (value >= 70) return "bg-accent"; // green
  if (value >= 40) return "bg-secondary"; // amber
  return "bg-destructive"; // red
}

export function getConfidenceTextClass(value: number): string {
  if (value >= 70) return "text-accent";
  if (value >= 40) return "text-secondary";
  return "text-destructive";
}

// ── Top conditions for summary (sorted by confidence, elevated+) ──────────────

export function getTopConditionsForSummary(
  conditions: import("../backend").ConditionResult[],
): import("../backend").ConditionResult[] {
  return [...conditions]
    .sort((a, b) => b.conditionConfidence - a.conditionConfidence)
    .slice(0, 4);
}

// ── Overall health impression text ───────────────────────────────────────────

export function getOverallImpression(
  conditions: import("../backend").ConditionResult[],
): { text: string; elevated: boolean } {
  const elevated = conditions.filter((c) => {
    const lvl = parseRiskLevel(c.riskLevel);
    return lvl === "elevated" || lvl === "high";
  });
  const moderate = conditions.filter(
    (c) => parseRiskLevel(c.riskLevel) === "moderate",
  );

  if (elevated.length === 0 && moderate.length === 0) {
    return {
      text: "No significant indicators of concern detected. All screened conditions appear within normal range.",
      elevated: false,
    };
  }

  const names = elevated.map((c) => getConditionDisplayName(c.condition));
  if (names.length === 0) {
    const modNames = moderate
      .map((c) => getConditionDisplayName(c.condition))
      .slice(0, 2);
    return {
      text: `Mild indicators detected for ${modNames.join(" and ")}. Consider consulting an eye care professional if symptoms persist.`,
      elevated: false,
    };
  }

  return {
    text: `Moderate-to-elevated indicators detected for ${names.slice(0, 2).join(" and ")}${names.length > 2 ? " and others" : ""}. Consider consulting a specialist.`,
    elevated: true,
  };
}

// ── Recommended actions based on conditions ───────────────────────────────────

export function getRecommendedActions(
  conditions: import("../backend").ConditionResult[],
): string[] {
  const levels = conditions.map((c) => parseRiskLevel(c.riskLevel));
  const hasHigh = levels.some((l) => l === "high");
  const hasElevated = levels.some((l) => l === "elevated");
  const hasModerate = levels.some((l) => l === "moderate");
  const allLow = levels.every((l) => l === "low");

  if (allLow)
    return [
      "No immediate action required based on current screening.",
      "Maintain regular eye care check-ups (annually or as advised by your doctor).",
      "Re-screen in 3–6 months or sooner if you notice any visual changes.",
    ];

  const actions: string[] = [];
  if (hasHigh)
    actions.push(
      "Seek prompt medical attention from a qualified healthcare provider.",
    );
  if (hasElevated)
    actions.push(
      "Schedule an appointment with an ophthalmologist within the next 1–2 weeks.",
    );
  if (hasModerate && !hasHigh && !hasElevated)
    actions.push(
      "Consider consulting an eye care professional within the next few weeks.",
    );
  actions.push(
    "Do not rely solely on this screening — it is a research-grade awareness tool.",
  );
  actions.push(
    "Re-screen after any recommended treatment or if symptoms change.",
  );
  return actions;
}
