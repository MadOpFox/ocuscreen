import Common "common";

module {
  public type WhitePatchRegion = {
    x : Float;
    y : Float;
    width : Float;
    height : Float;
    avgR : Float;
    avgG : Float;
    avgB : Float;
  };

  public type WhitePatchInput = {
    x : Float;
    y : Float;
    width : Float;
    height : Float;
  };

  /// GLCM-inspired texture metrics computed per region.
  public type TextureFeatures = {
    contrast : Float;
    energy : Float;
    homogeneity : Float;
  };

  /// Edge features used for corneal arcus detection.
  public type EdgeFeatures = {
    edgeStrength : Float;
    edgeDensity : Float;
    arcusRingScore : Float;
  };

  /// Sclera vs. iris segmentation estimates for a region.
  public type SegmentationResult = {
    irisRadiusEstimate : Float;
    scleraFraction : Float;
    irisFraction : Float;
  };

  /// Per-feature confidence scores (0–100) contributing to a condition prediction.
  /// Keys: "color", "texture", "edge", "segmentation"
  public type FeatureConfidences = {
    color : Float;
    texture : Float;
    edge : Float;
    segmentation : Float;
  };

  public type RegionScore = {
    region : Text;
    avgR : Float;
    avgG : Float;
    avgB : Float;
    brightness : Float;
    contrast : Float;
    /// Optional richer texture metrics for this region.
    textureFeatures : ?TextureFeatures;
    /// Optional edge metrics for this region (primarily cornea).
    edgeFeatures : ?EdgeFeatures;
  };

  /// Condition identifiers (all six supported conditions).
  /// Values: "jaundice" | "anemia" | "cornealArcus" | "eyeRedness" | "pupilIrregularity" | "dryness"
  public type ConditionResult = {
    condition : Text;
    score : Float;
    riskLevel : Text;
    explanation : Text;
    /// Overall prediction confidence (0–100).
    conditionConfidence : Float;
    /// Per-feature breakdown of confidence scores.
    featureConfidences : FeatureConfidences;
  };

  /// Normalized [0,1] bounding box for a detected eye region.
  public type RegionBox = {
    x : Float;
    y : Float;
    w : Float;
    h : Float;
  };

  /// Detected region bounding boxes anchored to the estimated pupil center.
  public type DetectedRegions = {
    sclera : RegionBox;
    conjunctiva : RegionBox;
    cornea : RegionBox;
    pupilCenter : (Float, Float);
    /// Estimated iris radius as normalized [0,1] fraction of image width.
    irisRadius : Float;
  };

  public type AnalysisResult = {
    imageId : Common.ImageId;
    regionScores : [RegionScore];
    conditions : [ConditionResult];
    whitePatchUsed : WhitePatchRegion;
    detectedRegions : ?DetectedRegions;
    timestamp : Common.Timestamp;
    /// Optional segmentation result for sclera vs. iris separation.
    segmentationResult : ?SegmentationResult;
    /// Detection quality indicator based on pupil/iris detection confidence.
    /// "good": pupil within center 35%, iris radius in [0.14, 0.30], all regions valid.
    /// "fair": pupil within center 50%, iris radius in [0.10, 0.35], most regions valid.
    /// "poor": fallback to center used, or iris radius out of expected range.
    detectionQuality : Text;
  };
};
