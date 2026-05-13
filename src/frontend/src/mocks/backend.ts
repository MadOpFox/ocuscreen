import type { backendInterface, AnalysisResult, ScreeningRecord, UserRole } from "../backend";

const sampleTimestamp = BigInt(Date.now()) * BigInt(1_000_000);

const sampleAnalysisResult: AnalysisResult = {
  imageId: "img-001",
  detectionQuality: "good",
  timestamp: sampleTimestamp,
  whitePatchUsed: {
    x: 10,
    y: 10,
    width: 50,
    height: 50,
    avgR: 240,
    avgG: 238,
    avgB: 235,
  },

  regionScores: [
    {
      region: "sclera",
      avgR: 220,
      avgG: 215,
      avgB: 180,
      brightness: 0.82,
      contrast: 0.15,
    },
    {
      region: "conjunctiva",
      avgR: 200,
      avgG: 160,
      avgB: 150,
      brightness: 0.65,
      contrast: 0.22,
    },
    {
      region: "cornea",
      avgR: 180,
      avgG: 178,
      avgB: 175,
      brightness: 0.72,
      contrast: 0.08,
    },
  ],
  conditions: [
    {
      condition: "Jaundice",
      riskLevel: "low",
      score: 0.18,
      explanation:
        "Scleral yellowing index is within normal range. The yellow-to-white ratio is low, suggesting no significant bilirubin elevation.",
      conditionConfidence: 72.0,
      featureConfidences: { color: 80.0, texture: 64.0, edge: 0.0, segmentation: 0.0 },
    },
    {
      condition: "Anemia",
      riskLevel: "medium",
      score: 0.52,
      explanation:
        "Conjunctival pallor detected. Lower-than-average red channel brightness in the conjunctival region may indicate reduced hemoglobin levels.",
      conditionConfidence: 58.0,
      featureConfidences: { color: 60.0, texture: 56.0, edge: 0.0, segmentation: 0.0 },
    },
    {
      condition: "Corneal Arcus",
      riskLevel: "low",
      score: 0.12,
      explanation:
        "No significant arcus ring detected. Limbal contrast is within normal bounds for the subject's apparent age group.",
      conditionConfidence: 65.0,
      featureConfidences: { color: 70.0, texture: 0.0, edge: 60.0, segmentation: 0.0 },
    },
  ],
};

const sampleRecord1: ScreeningRecord = {
  id: "scr-001",
  imageStorageId: "img-001",
  timestamp: sampleTimestamp,
  userId: { _arr: new Uint8Array(29), _isPrincipal: true } as any,
  result: sampleAnalysisResult,
};

const sampleRecord2: ScreeningRecord = {
  id: "scr-002",
  imageStorageId: "img-002",
  timestamp: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
  userId: { _arr: new Uint8Array(29), _isPrincipal: true } as any,
  result: {
    ...sampleAnalysisResult,
    imageId: "img-002",
    timestamp: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    conditions: [
      {
        condition: "Jaundice",
        riskLevel: "medium",
        score: 0.45,
        explanation:
          "Moderate scleral yellowing detected. Elevated yellow-to-white ratio warrants monitoring.",
        conditionConfidence: 61.0,
        featureConfidences: { color: 65.0, texture: 57.0, edge: 0.0, segmentation: 0.0 },
      },
      {
        condition: "Anemia",
        riskLevel: "high",
        score: 0.78,
        explanation:
          "Significant conjunctival pallor observed. Strongly reduced red-channel brightness suggests possible anemia.",
        conditionConfidence: 82.0,
        featureConfidences: { color: 88.0, texture: 76.0, edge: 0.0, segmentation: 0.0 },
      },
      {
        condition: "Corneal Arcus",
        riskLevel: "low",
        score: 0.09,
        explanation: "No arcus ring detected. Limbal contrast normal.",
        conditionConfidence: 55.0,
        featureConfidences: { color: 60.0, texture: 0.0, edge: 50.0, segmentation: 0.0 },
      },
    ],
  },
};

export const mockBackend: backendInterface = {
  analyzeEyeImage: async (_imageBlob, _whitePatchRegion) => sampleAnalysisResult,
  assignCallerUserRole: async (_user, _role) => undefined,
  clearHistory: async () => true,
  deleteScreening: async (_id) => true,
  generateSummary: async (_conditions) =>
    "Based on the analysis, the eye image shows low risk for jaundice and corneal arcus, with a moderate indicator for potential anemia. The conjunctival pallor detected warrants a follow-up consultation with a healthcare professional. This is a research-only screening and not a medical diagnosis.",
  getCallerUserRole: async () => "user" as unknown as UserRole,
  getScreening: async (id) => (id === "scr-001" ? sampleRecord1 : sampleRecord2),
  getScreeningHistory: async () => [sampleRecord1, sampleRecord2],
  isCallerAdmin: async () => false,
  saveScreening: async (_result, _imageStorageId) => "scr-003",
  transform: async (_input) => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),
  _immutableObjectStorageBlobsAreLive: async (_hashes) => [],
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async (_blobs) => undefined,
  _immutableObjectStorageCreateCertificate: async (_blobHash) => ({ __kind__: "Err", value: "mock" } as never),
  _immutableObjectStorageRefillCashier: async (_info) => ({ __kind__: "Err", value: "mock" } as never),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initializeAccessControl: async () => undefined,
};
