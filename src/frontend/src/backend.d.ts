import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface RegionBox {
    h: number;
    w: number;
    x: number;
    y: number;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ConditionResult {
    explanation: string;
    score: number;
    conditionConfidence: number;
    riskLevel: string;
    featureConfidences: FeatureConfidences;
    condition: string;
}
export interface ScreeningRecord {
    id: ScreeningId;
    result: AnalysisResult;
    imageStorageId: string;
    userId: Principal;
    timestamp: Timestamp;
}
export interface SegmentationResult {
    irisFraction: number;
    irisRadiusEstimate: number;
    scleraFraction: number;
}
export interface WhitePatchInput {
    x: number;
    y: number;
    height: number;
    width: number;
}
export interface RegionScore {
    region: string;
    contrast: number;
    avgB: number;
    avgG: number;
    avgR: number;
    brightness: number;
    textureFeatures?: TextureFeatures;
    edgeFeatures?: EdgeFeatures;
}
export type ScreeningId = string;
export interface FeatureConfidences {
    edge: number;
    color: number;
    segmentation: number;
    texture: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type ImageId = string;
export interface WhitePatchRegion {
    x: number;
    y: number;
    height: number;
    avgB: number;
    avgG: number;
    avgR: number;
    width: number;
}
export interface EdgeFeatures {
    edgeStrength: number;
    edgeDensity: number;
    arcusRingScore: number;
}
export interface DetectedRegions {
    sclera: RegionBox;
    pupilCenter: [number, number];
    cornea: RegionBox;
    conjunctiva: RegionBox;
    irisRadius: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface TextureFeatures {
    homogeneity: number;
    contrast: number;
    energy: number;
}
export interface AnalysisResult {
    detectionQuality: string;
    regionScores: Array<RegionScore>;
    whitePatchUsed: WhitePatchRegion;
    detectedRegions?: DetectedRegions;
    segmentationResult?: SegmentationResult;
    timestamp: Timestamp;
    conditions: Array<ConditionResult>;
    imageId: ImageId;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    analyzeEyeImage(imageBlob: ExternalBlob, whitePatchRegion: WhitePatchInput): Promise<AnalysisResult>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearHistory(): Promise<boolean>;
    deleteScreening(screeningId: string): Promise<boolean>;
    generateSummary(conditions: Array<ConditionResult>): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getScreening(screeningId: string): Promise<ScreeningRecord | null>;
    getScreeningHistory(): Promise<Array<ScreeningRecord>>;
    isCallerAdmin(): Promise<boolean>;
    saveScreening(result: AnalysisResult, imageStorageId: string): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
