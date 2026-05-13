import AnalysisLib "../lib/analysis";
import AnalysisTypes "../types/analysis";
import Debug "mo:core/Debug";
import Storage "mo:caffeineai-object-storage/Storage";
import Time "mo:core/Time";

mixin () {
  /// Analyzes an eye image blob with optional white-patch calibration.
  /// imageBlob is the raw eye image; whitePatchRegion defines the reference patch coordinates.
  /// Returns a full AnalysisResult with region scores, condition evaluations, and detected regions.
  public shared func analyzeEyeImage(
    imageBlob : Storage.ExternalBlob,
    whitePatchRegion : AnalysisTypes.WhitePatchInput,
  ) : async AnalysisTypes.AnalysisResult {
    let timestamp : Int = Time.now();
    let imageId = AnalysisLib.generateImageId(timestamp);

    // Validate: image must not be empty
    if (imageBlob.size() == 0) {
      Debug.print("analyzeEyeImage [" # imageId # "]: error — image blob is empty");
      // Return a minimal error result with zero scores
      let emptyRegion = AnalysisLib.extractWhitePatch(imageBlob, whitePatchRegion);
      let emptyBox : AnalysisTypes.RegionBox = { x = 0.0; y = 0.0; w = 1.0; h = 1.0 };
      let emptyRegionScore : AnalysisTypes.RegionScore = {
        region = "unknown";
        avgR = 0.5; avgG = 0.5; avgB = 0.5;
        brightness = 0.5; contrast = 0.0;
        textureFeatures = null; edgeFeatures = null;
      };
      let emptyCondition : AnalysisTypes.ConditionResult = {
        condition = "unknown"; score = 0.0; riskLevel = "low";
        explanation = "Image too small or empty — analysis could not be performed.";
        conditionConfidence = 0.0;
        featureConfidences = { color = 0.0; texture = 0.0; edge = 0.0; segmentation = 0.0 };
      };
      let emptyDetected : AnalysisTypes.DetectedRegions = {
        sclera = emptyBox; conjunctiva = emptyBox; cornea = emptyBox;
        pupilCenter = (0.5, 0.5);
        irisRadius = 0.18;
      };
      return {
        imageId;
        regionScores = [emptyRegionScore, emptyRegionScore, emptyRegionScore];
        conditions = [emptyCondition, emptyCondition, emptyCondition, emptyCondition, emptyCondition, emptyCondition];
        whitePatchUsed = emptyRegion;
        detectedRegions = ?emptyDetected;
        segmentationResult = null;
        detectionQuality = "poor";
        timestamp;
      };
    };

    Debug.print("analyzeEyeImage [" # imageId # "]: starting analysis, blob size=" # imageBlob.size().toText());

    // 1. Extract white patch stats from the image bytes
    let whitePatch = AnalysisLib.extractWhitePatch(imageBlob, whitePatchRegion);
    Debug.print("analyzeEyeImage [" # imageId # "]: white patch R=" # whitePatch.avgR.format(#fix 3) # " G=" # whitePatch.avgG.format(#fix 3) # " B=" # whitePatch.avgB.format(#fix 3));

    // 2. Compute raw per-region scores with dynamic pupil-anchored regions,
    //    texture features, edge features, and segmentation
    let { regionScores = rawRegionScores; detectedRegions; segmentation; detectionQuality } = AnalysisLib.computeRegionScores(imageBlob);
    let (pcx, pcy) = detectedRegions.pupilCenter;
    Debug.print("analyzeEyeImage [" # imageId # "]: pupil center=(" # pcx.format(#fix 3) # "," # pcy.format(#fix 3) # ")");

    // 3. Apply white patch calibration (skipped automatically if patch is invalid)
    let regionScores = AnalysisLib.calibrateRegionScores(rawRegionScores, whitePatch);

    // 4. Extract per-region calibrated scores for condition evaluation
    // computeRegionScores always returns [sclera, conjunctiva, cornea] in that order
    let defaultSclera : AnalysisTypes.RegionScore = {
      region = "sclera";
      avgR = 0.5; avgG = 0.5; avgB = 0.5;
      brightness = 0.5; contrast = 0.0;
      textureFeatures = null; edgeFeatures = null;
    };
    let defaultConjunctiva : AnalysisTypes.RegionScore = {
      region = "conjunctiva";
      avgR = 0.5; avgG = 0.5; avgB = 0.5;
      brightness = 0.5; contrast = 0.0;
      textureFeatures = null; edgeFeatures = null;
    };
    let defaultCornea : AnalysisTypes.RegionScore = {
      region = "cornea";
      avgR = 0.3; avgG = 0.3; avgB = 0.3;
      brightness = 0.3; contrast = 0.0;
      textureFeatures = null; edgeFeatures = null;
    };

    let scleraScore = switch (regionScores.find(func(rs : AnalysisTypes.RegionScore) : Bool { rs.region == "sclera" })) {
      case (?s) s;
      case null {
        Debug.print("analyzeEyeImage [" # imageId # "]: sclera region not found, using default");
        defaultSclera;
      };
    };
    let conjunctivaScore = switch (regionScores.find(func(rs : AnalysisTypes.RegionScore) : Bool { rs.region == "conjunctiva" })) {
      case (?s) s;
      case null {
        Debug.print("analyzeEyeImage [" # imageId # "]: conjunctiva region not found, using default");
        defaultConjunctiva;
      };
    };
    let corneaScore = switch (regionScores.find(func(rs : AnalysisTypes.RegionScore) : Bool { rs.region == "cornea" })) {
      case (?s) s;
      case null {
        Debug.print("analyzeEyeImage [" # imageId # "]: cornea region not found, using default");
        defaultCornea;
      };
    };

    Debug.print("analyzeEyeImage [" # imageId # "]: sclera brightness=" # scleraScore.brightness.format(#fix 3) # " conjunctiva brightness=" # conjunctivaScore.brightness.format(#fix 3));

    // 5. Evaluate all 6 conditions — each always returns a result
    // If detection quality is poor, conditions are still evaluated but with low confidence
    let jaundice = AnalysisLib.evaluateJaundice(scleraScore);
    let anemia = AnalysisLib.evaluateAnemia(conjunctivaScore);
    let cornealArcus = AnalysisLib.evaluateCornealArcus(corneaScore);
    let eyeRedness = AnalysisLib.evaluateEyeRedness(scleraScore, conjunctivaScore);
    let pupilIrregularity = AnalysisLib.evaluatePupilIrregularity(corneaScore, detectedRegions);
    let dryness = AnalysisLib.evaluateDryness(scleraScore, conjunctivaScore);
    Debug.print("analyzeEyeImage [" # imageId # "]: detectionQuality=" # detectionQuality);

    Debug.print("analyzeEyeImage [" # imageId # "]: conditions evaluated — jaundice=" # jaundice.riskLevel # " anemia=" # anemia.riskLevel # " redness=" # eyeRedness.riskLevel # " dryness=" # dryness.riskLevel);

    {
      imageId;
      regionScores;
      conditions = [jaundice, anemia, cornealArcus, eyeRedness, pupilIrregularity, dryness];
      whitePatchUsed = whitePatch;
      detectedRegions = ?detectedRegions;
      segmentationResult = ?segmentation;
      detectionQuality;
      timestamp;
    };
  };
};
