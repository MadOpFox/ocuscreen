import Array "mo:core/Array";
import Debug "mo:core/Debug";
import Float "mo:core/Float";
import Types "../types/analysis";

module {
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /// Clamp a Float to [0.0, 1.0].
  func clamp01(v : Float) : Float {
    if (v < 0.0) { 0.0 } else if (v > 1.0) { 1.0 } else { v };
  };

  /// Round a Float to 4 decimal places.
  func round4(v : Float) : Float {
    let scaled = Float.nearest(v * 10000.0);
    scaled / 10000.0;
  };

  /// Format a Float as 2 decimal place text.
  func f2(v : Float) : Text {
    v.format(#fix (2 : Nat8));
  };

  /// Integer square root (Newton's method).
  func isqrt(n : Nat) : Nat {
    if (n == 0) { return 0 };
    var x = n;
    var y = (x + 1) / 2;
    while (y < x) {
      x := y;
      y := (y + n / y) / 2;
    };
    x;
  };

  /// Interpret a Blob as a flat pixel array.
  /// Returns (bytes, pixelCount, stride) where stride is 3 (RGB) or 4 (RGBA).
  func extractPixelArray(blob : Blob) : {
    bytes : [Nat8];
    pixelCount : Nat;
    stride : Nat;
  } {
    let bytes = blob.toArray();
    let len = bytes.size();
    let stride = if (len > 0 and len % 4 == 0) { 4 } else { 3 };
    let pixelCount = if (len == 0) { 0 } else { len / stride };
    { bytes; pixelCount; stride };
  };

  /// Sample pixels in a rectangular region defined by fractional coords [0,1].
  /// Returns (sumR, sumG, sumB, count).
  /// Falls back to neutral mid-grey (128/255 each) when no pixels available.
  func sampleRect(
    bytes : [Nat8],
    pixelCount : Nat,
    stride : Nat,
    side : Nat,
    x : Float,
    y : Float,
    w : Float,
    h : Float,
  ) : (Float, Float, Float, Nat) {
    if (pixelCount == 0 or side == 0) {
      return (128.0, 128.0, 128.0, 1);
    };

    let sideF = side.toFloat();
    // Convert fractional coords to pixel coords
    let x0 = (x * sideF).toInt();
    let y0 = (y * sideF).toInt();
    let x1 = ((x + w) * sideF).toInt();
    let y1 = ((y + h) * sideF).toInt();

    var sumR : Float = 0.0;
    var sumG : Float = 0.0;
    var sumB : Float = 0.0;
    var count : Nat = 0;

    var row : Int = y0;
    while (row < y1) {
      var col : Int = x0;
      while (col < x1) {
        // Convert Int row/col to Nat safely (clamped to valid range)
        let r : Nat = if (row < 0) { 0 } else { row.toNat() };
        let c : Nat = if (col < 0) { 0 } else { col.toNat() };
        let px = (r * side + c) * stride;
        if (px + 2 < bytes.size()) {
          sumR += bytes[px].toNat().toFloat();
          sumG += bytes[px + 1].toNat().toFloat();
          sumB += bytes[px + 2].toNat().toFloat();
          count += 1;
        };
        col += 1;
      };
      row += 1;
    };

    if (count == 0) {
      (128.0, 128.0, 128.0, 1);
    } else {
      (sumR, sumG, sumB, count);
    };
  };

  // ---------------------------------------------------------------------------
  // Pixel access helper (returns intensity 0-255 for a pixel at (px,py))
  // ---------------------------------------------------------------------------

  func getIntensity(
    bytes : [Nat8],
    stride : Nat,
    side : Nat,
    px : Int,
    py : Int,
  ) : Float {
    let bx : Nat = if (px < 0) { 0 } else if (px.toNat() >= side) {
      side - 1;
    } else { px.toNat() };
    let by : Nat = if (py < 0) { 0 } else if (py.toNat() >= side) {
      side - 1;
    } else { py.toNat() };
    let idx = (by * side + bx) * stride;
    if (idx + 2 < bytes.size()) {
      let r = bytes[idx].toNat().toFloat();
      let g = bytes[idx + 1].toNat().toFloat();
      let b = bytes[idx + 2].toNat().toFloat();
      (r + g + b) / 3.0;
    } else {
      128.0;
    };
  };

  // ---------------------------------------------------------------------------
  // Fallback clamp helper
  // ---------------------------------------------------------------------------

  /// Clamp pupil center back toward image center if it lands in extreme corners.
  /// Eyes are almost never at x,y outside [0.15, 0.85].
  func applyFallbackClamp(cx : Float, cy : Float) : (Float, Float) {
    let lo : Float = 0.15;
    let hi : Float = 0.85;
    let clampedX : Float = if (cx < lo or cx > hi) {
      cx * 0.7 + 0.5 * 0.3;
    } else { cx };
    let clampedY : Float = if (cy < lo or cy > hi) {
      cy * 0.7 + 0.5 * 0.3;
    } else { cy };
    (clampedX, clampedY);
  };

  // ---------------------------------------------------------------------------
  // Pupil center estimation
  // ---------------------------------------------------------------------------

  /// Estimate the pupil center using a two-pass grid-based brightness scan.
  /// Pass 1: 20x20 coarse grid to locate the darkest cluster.
  /// Pass 2: 5x5 subgrid around the best coarse cell for precision.
  /// Returns (cx, cy, confidence) in normalized [0,1] coords.
  /// confidence = 0.0-1.0 based on dark pixel count and clustering.
  public func estimatePupilCenter(
    bytes : [Nat8],
    pixelCount : Nat,
    stride : Nat,
    side : Nat,
  ) : (Float, Float) {
    if (pixelCount == 0 or side == 0) {
      return (0.5, 0.5);
    };

    let gridN : Nat = 20;
    let cellW : Float = 1.0 / gridN.toFloat();
    let cellH : Float = 1.0 / gridN.toFloat();
    let cellCount : Nat = gridN * gridN;

    // Collect all cell brightnesses
    let brightnesses = Array.tabulate(
      cellCount,
      func(idx) {
        let gr = idx / gridN;
        let gc = idx % gridN;
        // Exclude top/bottom 20% of image (eyelash regions)
        if (gr < gridN / 5 or gr >= gridN * 4 / 5) {
          return 1.0; // treat as bright — excluded zone
        };
        let bx = gc.toFloat() * cellW;
        let by = gr.toFloat() * cellH;
        let (sumR, sumG, sumB, count) = sampleRect(bytes, pixelCount, stride, side, bx, by, cellW, cellH);
        let n = count.toFloat();
        (sumR / n + sumG / n + sumB / n) / 3.0 / 255.0;
      },
    );

    // Sort a copy to find percentile threshold (darkest 15%)
    let sortable : [var Float] = Array.tabulate(cellCount, func(i) { brightnesses[i] }).toVarArray();
    // Insertion sort (small array, acceptable)
    var si : Nat = 1;
    while (si < cellCount) {
      let key = sortable[si];
      var sj : Int = si.toInt() - 1;
      while (sj >= 0 and sortable[sj.toNat()] > key) {
        sortable[(sj + 1).toNat()] := sortable[sj.toNat()];
        sj -= 1;
      };
      sortable[(sj + 1).toNat()] := key;
      si += 1;
    };
    // Threshold at 15th percentile
    let p15idx : Nat = (cellCount * 15) / 100;
    let threshold = sortable[p15idx];

    // Brightness range check — if nearly uniform, can't detect pupil
    let minBrightness = sortable[0];
    let maxBrightness = sortable[cellCount - 1];
    let brightnessRange = maxBrightness - minBrightness;

    // Neighbor connectivity check (4-connectivity on the 20x20 grid)
    func hasNeighborDark(idx : Nat) : Bool {
      let gr = idx / gridN;
      let gc = idx % gridN;
      if (gc + 1 < gridN and brightnesses[gr * gridN + gc + 1] <= threshold) { return true };
      if (gc > 0 and brightnesses[gr * gridN + (gc - 1 : Nat)] <= threshold) { return true };
      if (gr + 1 < gridN and brightnesses[(gr + 1) * gridN + gc] <= threshold) { return true };
      if (gr > 0 and brightnesses[(gr - 1 : Nat) * gridN + gc] <= threshold) { return true };
      false;
    };

    // Weighted centroid with STRONG center bias (weight = exp(-dist² * 4.0))
    var weightedSumCol : Float = 0.0;
    var weightedSumRow : Float = 0.0;
    var totalWeight : Float = 0.0;
    var darkPixelCount : Nat = 0;

    var j : Nat = 0;
    while (j < cellCount) {
      let b = brightnesses[j];
      if (b <= threshold and hasNeighborDark(j)) {
        let gr = j / gridN;
        let gc = j % gridN;
        let normCol = (gc.toFloat() + 0.5) / gridN.toFloat();
        let normRow = (gr.toFloat() + 0.5) / gridN.toFloat();
        let dcol = normCol - 0.5;
        let drow = normRow - 0.5;
        let distSq = dcol * dcol + drow * drow;
        // Cells within 30% of center get the full strong bias
        let centerBias = Float.exp(-distSq * 4.0);
        let weight = (1.0 - b) * centerBias;
        weightedSumCol += normCol * weight;
        weightedSumRow += normRow * weight;
        totalWeight += weight;
        darkPixelCount += 1;
      };
      j += 1;
    };

    // Fallback: if no neighbor-validated dark pixels, use simple centroid with center bias
    if (darkPixelCount == 0) {
      var j2 : Nat = 0;
      while (j2 < cellCount) {
        let b = brightnesses[j2];
        if (b <= threshold) {
          let gr = j2 / gridN;
          let gc = j2 % gridN;
          let normCol = (gc.toFloat() + 0.5) / gridN.toFloat();
          let normRow = (gr.toFloat() + 0.5) / gridN.toFloat();
          let dcol = normCol - 0.5;
          let drow = normRow - 0.5;
          let distSq = dcol * dcol + drow * drow;
          let centerBias = Float.exp(-distSq * 4.0);
          let weight = (1.0 - b) * centerBias;
          weightedSumCol += normCol * weight;
          weightedSumRow += normRow * weight;
          totalWeight += weight;
          darkPixelCount += 1;
        };
        j2 += 1;
      };
    };

    if (darkPixelCount == 0) {
      Debug.print("estimatePupilCenter: no dark pixels found, using center fallback");
      return (0.5, 0.5);
    };

    let coarseCx : Float = if (totalWeight > 0.0) { weightedSumCol / totalWeight } else { 0.5 };
    let coarseCy : Float = if (totalWeight > 0.0) { weightedSumRow / totalWeight } else { 0.5 };

    // If brightness range too small, pupil not distinguishable
    if (brightnessRange < 0.05) {
      return applyFallbackClamp(clamp01(coarseCx), clamp01(coarseCy));
    };

    // Pass 2: 5x5 fine-grid refinement around coarse center for precision
    let fineN : Nat = 5;
    let searchRadius : Float = cellW * 2.5;
    let fineX0 = clamp01(coarseCx - searchRadius);
    let fineY0 = clamp01(coarseCy - searchRadius);
    let fineX1 = clamp01(coarseCx + searchRadius);
    let fineY1 = clamp01(coarseCy + searchRadius);
    let fineW = fineX1 - fineX0;
    let fineH = fineY1 - fineY0;
    let fineCellW = if (fineN > 0 and fineW > 0.0) { fineW / fineN.toFloat() } else { cellW };
    let fineCellH = if (fineN > 0 and fineH > 0.0) { fineH / fineN.toFloat() } else { cellH };
    let fineCellCount = fineN * fineN;

    let fineBrightnesses = Array.tabulate(
      fineCellCount,
      func(idx) {
        let sr = idx / fineN;
        let sc = idx % fineN;
        let bx = fineX0 + sc.toFloat() * fineCellW;
        let by = fineY0 + sr.toFloat() * fineCellH;
        let (sumR, sumG, sumB, count) = sampleRect(bytes, pixelCount, stride, side, bx, by, fineCellW, fineCellH);
        let n = count.toFloat();
        (sumR / n + sumG / n + sumB / n) / 3.0 / 255.0;
      },
    );

    // Find min of fine grid
    var fineMinB : Float = 2.0;
    var k : Nat = 0;
    while (k < fineCellCount) {
      if (fineBrightnesses[k] < fineMinB) { fineMinB := fineBrightnesses[k] };
      k += 1;
    };
    let fineThreshold = fineMinB + (maxBrightness - fineMinB) * 0.25;

    var fineWeightedCol : Float = 0.0;
    var fineWeightedRow : Float = 0.0;
    var fineTotalWeight : Float = 0.0;
    var k2 : Nat = 0;
    while (k2 < fineCellCount) {
      let fb = fineBrightnesses[k2];
      if (fb <= fineThreshold) {
        let sr = k2 / fineN;
        let sc = k2 % fineN;
        let normCol = fineX0 + (sc.toFloat() + 0.5) * fineCellW;
        let normRow = fineY0 + (sr.toFloat() + 0.5) * fineCellH;
        let dcol = normCol - 0.5;
        let drow = normRow - 0.5;
        let distSq = dcol * dcol + drow * drow;
        let centerBias = Float.exp(-distSq * 4.0);
        let weight = (1.0 - fb) * centerBias;
        fineWeightedCol += normCol * weight;
        fineWeightedRow += normRow * weight;
        fineTotalWeight += weight;
      };
      k2 += 1;
    };

    let fineCx : Float = if (fineTotalWeight > 0.0) {
      fineWeightedCol / fineTotalWeight;
    } else { coarseCx };
    let fineCy : Float = if (fineTotalWeight > 0.0) {
      fineWeightedRow / fineTotalWeight;
    } else { coarseCy };

    // FORCE fallback to image center if result lands outside center 40%
    let resultCx = clamp01(fineCx);
    let resultCy = clamp01(fineCy);
    let dx = resultCx - 0.5;
    let dy = resultCy - 0.5;
    let distFromCenter = Float.sqrt(dx * dx + dy * dy);
    if (distFromCenter > 0.28) {
      // Outside center 40% radius — force to image center
      Debug.print("estimatePupilCenter: result outside center 40%, forcing fallback to (0.5, 0.5)");
      (0.5, 0.5);
    } else {
      applyFallbackClamp(resultCx, resultCy);
    };
  };

  // ---------------------------------------------------------------------------
  // Iris radius estimation
  // ---------------------------------------------------------------------------

  /// Estimate iris radius by scanning outward from pupil center in 4 directions
  /// until brightness jumps above threshold (sclera/iris boundary).
  /// Returns estimated iris radius in normalized [0,1] units.
  func estimateIrisRadius(
    bytes : [Nat8],
    stride : Nat,
    side : Nat,
    cx : Float,
    cy : Float,
  ) : Float {
    if (side == 0) { return 0.20 };
    let sideF = side.toFloat();
    let pcx = (cx * sideF).toInt();
    let pcy = (cy * sideF).toInt();

    // Adaptive threshold: sample brightness at increasing radii to find steepest gradient
    // Sample at 4%, 8%, 12% ... 40% of image width in all 4 cardinal directions
    // Find the radius where brightness gradient is steepest (pupil→iris boundary)
    let numSteps : Nat = 18;
    let stepSize : Float = 0.012; // in normalized units

    // Collect average brightness at each radius band
    let radialBrightness = Array.tabulate(
      numSteps,
      func(i) {
        let r = (i + 1).toFloat() * stepSize;
        let rPx = (r * sideF).toInt();
        // Sample 8 points on circle at this radius
        let dirs : [(Int, Int)] = [
          (1, 0), (1, -1), (0, -1), (-1, -1),
          (-1, 0), (-1, 1), (0, 1), (1, 1),
        ];
        var sum : Float = 0.0;
        var cnt : Float = 0.0;
        for ((dx, dy) in dirs.values()) {
          let nx : Int = pcx + dx * rPx;
          let ny : Int = pcy + dy * rPx;
          if (nx >= 0 and nx.toNat() < side and ny >= 0 and ny.toNat() < side) {
            sum += getIntensity(bytes, stride, side, nx, ny);
            cnt += 1.0;
          };
        };
        if (cnt > 0.0) { sum / cnt } else { 128.0 };
      },
    );

    // Find steepest positive gradient (pupil dark → iris lighter)
    var bestGradient : Float = 0.0;
    var bestRadiusIdx : Nat = 6; // default ~8% image width
    var gi : Nat = 1;
    while (gi < numSteps) {
      let grad = radialBrightness[gi] - radialBrightness[gi - 1];
      if (grad > bestGradient) {
        bestGradient := grad;
        bestRadiusIdx := gi;
      };
      gi += 1;
    };

    // Convert best radius index back to normalized units
    let adaptiveRadius = (bestRadiusIdx + 1).toFloat() * stepSize;

    // Validate: iris radius should be 2.5x to 4.5x the pupil radius
    // pupil ≈ 40% of iris radius, so iris ≈ 2.5x the detected boundary
    // But the detected boundary IS the iris outer edge, so use it directly
    // Expected range for close-up eye: [0.12, 0.32]
    let irisR = if (adaptiveRadius < 0.12) {
      // If gradient-based fails, fall back to 8-directional ray casting with adaptive threshold
      let pupilBrightness = getIntensity(bytes, stride, side, pcx, pcy);
      // Adaptive threshold: pupil brightness + 30% of brightness range sampled at edges
      let edgeBrightness = getIntensity(bytes, stride, side, pcx + (side / 4).toInt(), pcy);
      let localRange = edgeBrightness - pupilBrightness;
      let irisThreshold = pupilBrightness + (if (localRange > 20.0) { localRange * 0.40 } else { 50.0 });
      let maxScanPx : Nat = side / 2;

      let directions : [(Int, Int)] = [
        (1, 0), (1, -1), (0, -1), (-1, -1),
        (-1, 0), (-1, 1), (0, 1), (1, 1),
      ];

      let distances : [var Float] = Array.tabulate(8, func _ = -1.0).toVarArray();
      var di : Nat = 0;
      for ((dx, dy) in directions.values()) {
        var step : Nat = 1;
        var found = false;
        while (not found and step <= maxScanPx) {
          let nx : Int = pcx + dx * step.toInt();
          let ny : Int = pcy + dy * step.toInt();
          if (nx < 0 or nx.toNat() >= side or ny < 0 or ny.toNat() >= side) {
            found := true;
          } else {
            let intensity = getIntensity(bytes, stride, side, nx, ny);
            if (intensity > irisThreshold) {
              let fdx = (nx - pcx).toFloat();
              let fdy = (ny - pcy).toFloat();
              distances[di] := Float.sqrt(fdx * fdx + fdy * fdy) / sideF;
              found := true;
            };
          };
          step += 1;
        };
        di += 1;
      };

      // Collect valid distances
      let validDists : [var Float] = Array.tabulate(8, func _ = 0.0).toVarArray();
      var validCount : Nat = 0;
      var vi : Nat = 0;
      while (vi < 8) {
        if (distances[vi] > 0.0) {
          validDists[validCount] := distances[vi];
          validCount += 1;
        };
        vi += 1;
      };

      if (validCount < 3) {
        0.20;
      } else {
        // Sort and find median
        var si2 : Nat = 1;
        while (si2 < validCount) {
          let key = validDists[si2];
          var sj : Int = si2.toInt() - 1;
          while (sj >= 0 and validDists[sj.toNat()] > key) {
            validDists[(sj + 1).toNat()] := validDists[sj.toNat()];
            sj -= 1;
          };
          validDists[(sj + 1).toNat()] := key;
          si2 += 1;
        };
        let median : Float = if (validCount % 2 == 0) {
          (validDists[(validCount / 2) - 1] + validDists[validCount / 2]) / 2.0;
        } else {
          validDists[validCount / 2];
        };
        // Reject outliers
        var inlierSum : Float = 0.0;
        var inlierCount : Float = 0.0;
        var ii : Nat = 0;
        while (ii < validCount) {
          let d = validDists[ii];
          if (d >= median * 0.5 and d <= median * 2.0) {
            inlierSum += d;
            inlierCount += 1.0;
          };
          ii += 1;
        };
        let est = if (inlierCount > 0.0) { inlierSum / inlierCount } else { median };
        if (est < 0.10) { 0.20 } else if (est > 0.35) { 0.30 } else { est };
      };
    } else if (adaptiveRadius > 0.32) {
      0.30;
    } else {
      adaptiveRadius;
    };

    irisR;
  };

  // ---------------------------------------------------------------------------
  // Region box validation
  // ---------------------------------------------------------------------------

  /// Validate and fix a region box. Ensures minimum dimensions and valid coords.
  func validateRegionBox(
    x : Float,
    y : Float,
    w : Float,
    h : Float,
    regionName : Text,
  ) : Types.RegionBox {
    let minDim : Float = 0.05;
    // Ensure minimum width/height
    let safeW = if (w < minDim) {
      Debug.print("validateRegionBox: " # regionName # " width too small (" # f2(w) # "), using " # f2(minDim));
      minDim;
    } else { w };
    let safeH = if (h < minDim) {
      Debug.print("validateRegionBox: " # regionName # " height too small (" # f2(h) # "), using " # f2(minDim));
      minDim;
    } else { h };
    // Clamp x,y to [0,1]
    let safeX = clamp01(x);
    let safeY = clamp01(y);
    // Ensure x + w <= 1.0 and y + h <= 1.0
    let finalW = if (safeX + safeW > 1.0) { 1.0 - safeX } else { safeW };
    let finalH = if (safeY + safeH > 1.0) { 1.0 - safeY } else { safeH };
    // Re-check minimums after clamping
    let fW = if (finalW < minDim) {
      Debug.print("validateRegionBox: " # regionName # " width clamped too small, adjusting x");
      minDim;
    } else { finalW };
    let fH = if (finalH < minDim) {
      Debug.print("validateRegionBox: " # regionName # " height clamped too small, adjusting y");
      minDim;
    } else { finalH };
    let fX = if (safeX + fW > 1.0) { 1.0 - fW } else { safeX };
    let fY = if (safeY + fH > 1.0) { 1.0 - fH } else { safeY };
    {
      x = round4(fX);
      y = round4(fY);
      w = round4(fW);
      h = round4(fH);
    };
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /// Extract the white patch region stats from image bytes.
  public func extractWhitePatch(
    blob : Blob,
    input : Types.WhitePatchInput,
  ) : Types.WhitePatchRegion {
    let { bytes; pixelCount; stride } = extractPixelArray(blob);
    let side = isqrt(pixelCount);
    let (sumR, sumG, sumB, count) = sampleRect(
      bytes,
      pixelCount,
      stride,
      side,
      input.x,
      input.y,
      input.width,
      input.height,
    );
    let n = count.toFloat();
    let avgR = sumR / n / 255.0;
    let avgG = sumG / n / 255.0;
    let avgB = sumB / n / 255.0;
    {
      x = input.x;
      y = input.y;
      width = input.width;
      height = input.height;
      avgR = round4(avgR);
      avgG = round4(avgG);
      avgB = round4(avgB);
    };
  };

  /// Check if a white patch region is valid for calibration.
  /// Invalid if average brightness < 10/255 or > 245/255 (all-black or all-white).
  public func isWhitePatchValid(patch : Types.WhitePatchRegion) : Bool {
    let avgBrightness = (patch.avgR + patch.avgG + patch.avgB) / 3.0;
    // avgR/G/B are already normalized to [0,1] (divided by 255)
    // 10/255 ≈ 0.0392, 245/255 ≈ 0.9608
    let lower : Float = 10.0 / 255.0;
    let upper : Float = 245.0 / 255.0;
    if (avgBrightness < lower) {
      Debug.print("isWhitePatchValid: patch too dark (avg=" # f2(avgBrightness) # "), skipping calibration");
      false;
    } else if (avgBrightness > upper) {
      Debug.print("isWhitePatchValid: patch too bright (avg=" # f2(avgBrightness) # "), skipping calibration");
      false;
    } else {
      true;
    };
  };

  /// Sample a named rectangular region, return uncalibrated RegionScore.
  func sampleRegion(
    bytes : [Nat8],
    pixelCount : Nat,
    stride : Nat,
    side : Nat,
    regionName : Text,
    x : Float,
    y : Float,
    w : Float,
    h : Float,
  ) : Types.RegionScore {
    let (sumR, sumG, sumB, count) = sampleRect(bytes, pixelCount, stride, side, x, y, w, h);
    let n = count.toFloat();
    let avgR = sumR / n / 255.0;
    let avgG = sumG / n / 255.0;
    let avgB = sumB / n / 255.0;
    let brightness = (avgR + avgG + avgB) / 3.0;
    let maxC = if (avgR > avgG) { if (avgR > avgB) { avgR } else { avgB } } else {
      if (avgG > avgB) { avgG } else { avgB };
    };
    let minC = if (avgR < avgG) { if (avgR < avgB) { avgR } else { avgB } } else {
      if (avgG < avgB) { avgG } else { avgB };
    };
    {
      region = regionName;
      avgR = round4(avgR);
      avgG = round4(avgG);
      avgB = round4(avgB);
      brightness = round4(brightness);
      contrast = round4(maxC - minC);
      textureFeatures = null;
      edgeFeatures = null;
    };
  };

  // ---------------------------------------------------------------------------
  // Texture feature extraction
  // ---------------------------------------------------------------------------

  /// Compute GLCM-inspired texture metrics over a rectangular region.
  /// Uses a simplified 4-directional (right, down, diag-right-down, diag-right-up) neighbor scan.
  /// contrast   = mean squared intensity difference between adjacent pixel pairs
  /// energy     = uniformity proxy: 1 - (variance of differences / max_possible_variance)
  /// homogeneity = 1 / (1 + mean abs difference), ranges (0,1], higher = smoother
  public func computeTextureFeatures(
    bytes : [Nat8],
    stride : Nat,
    side : Nat,
    x : Float,
    y : Float,
    w : Float,
    h : Float,
  ) : Types.TextureFeatures {
    if (side == 0) {
      return { contrast = 0.0; energy = 1.0; homogeneity = 1.0 };
    };

    let sideF = side.toFloat();
    let x0 = (x * sideF).toInt();
    let y0 = (y * sideF).toInt();
    let x1 = ((x + w) * sideF).toInt();
    let y1 = ((y + h) * sideF).toInt();

    // Directions: right, down, diag-right-down, diag-right-up
    let dirs : [(Int, Int)] = [(1, 0), (0, 1), (1, 1), (1, -1)];

    var sumDiff : Float = 0.0;
    var sumDiffSq : Float = 0.0;
    var pairCount : Float = 0.0;

    for ((dx, dy) in dirs.values()) {
      var row : Int = y0;
      while (row < y1) {
        var col : Int = x0;
        while (col < x1) {
          let nr : Int = row + dy;
          let nc : Int = col + dx;
          // Only sample if neighbor is also within region
          if (nr >= y0 and nr < y1 and nc >= x0 and nc < x1) {
            let i1 = getIntensity(bytes, stride, side, col, row);
            let i2 = getIntensity(bytes, stride, side, nc, nr);
            let diff = i1 - i2;
            sumDiff += if (diff < 0.0) { -diff } else { diff };
            sumDiffSq += diff * diff;
            pairCount += 1.0;
          };
          col += 1;
        };
        row += 1;
      };
    };

    if (pairCount < 1.0) {
      return { contrast = 0.0; energy = 1.0; homogeneity = 1.0 };
    };

    let meanAbsDiff = sumDiff / pairCount;
    let meanSqDiff = sumDiffSq / pairCount;

    // Normalize to [0,1] — max intensity diff is 255
    let contrastNorm = clamp01(meanSqDiff / (255.0 * 255.0));
    // energy proxy: low variance of differences ≈ high energy (uniformity)
    let energyNorm = clamp01(1.0 - contrastNorm);
    // homogeneity: higher = smoother texture
    let homogeneity = 1.0 / (1.0 + meanAbsDiff / 255.0);

    {
      contrast = round4(contrastNorm);
      energy = round4(energyNorm);
      homogeneity = round4(homogeneity);
    };
  };

  // ---------------------------------------------------------------------------
  // Edge feature extraction
  // ---------------------------------------------------------------------------

  /// Compute Sobel-like edge features over a rectangular region.
  /// edgeStrength  = mean gradient magnitude (normalized 0-1)
  /// edgeDensity   = fraction of pixels with gradient above threshold (0.15)
  /// arcusRingScore = ratio of edge density in outer annulus (60-90% radius) vs
  ///                  inner circle (0-50% radius); clamped to [0,1].
  ///                  Higher ratio indicates a ring-shaped edge pattern (corneal arcus).
  public func computeEdgeFeatures(
    bytes : [Nat8],
    stride : Nat,
    side : Nat,
    x : Float,
    y : Float,
    w : Float,
    h : Float,
  ) : Types.EdgeFeatures {
    if (side == 0) {
      return { edgeStrength = 0.0; edgeDensity = 0.0; arcusRingScore = 0.0 };
    };

    let sideF = side.toFloat();
    let x0 = (x * sideF).toInt();
    let y0 = (y * sideF).toInt();
    let x1 = ((x + w) * sideF).toInt();
    let y1 = ((y + h) * sideF).toInt();

    // Region center and half-extents for annulus classification
    let rw : Float = (x1 - x0).toFloat();
    let rh : Float = (y1 - y0).toFloat();
    let rcx : Float = x0.toFloat() + rw / 2.0;
    let rcy : Float = y0.toFloat() + rh / 2.0;
    let rRadius : Float = if (rw < rh) { rw / 2.0 } else { rh / 2.0 };

    var sumGrad : Float = 0.0;
    var totalPx : Float = 0.0;
    var edgePx : Float = 0.0;

    // Annulus zone counts
    var outerEdge : Float = 0.0;
    var outerTotal : Float = 0.0;
    var innerEdge : Float = 0.0;
    var innerTotal : Float = 0.0;

    let edgeThreshold : Float = 0.15; // normalized gradient threshold

    var row : Int = y0 + 1;
    while (row < y1 - 1) {
      var col : Int = x0 + 1;
      while (col < x1 - 1) {
        // Sobel Gx
        let gx = (
          -1.0 * getIntensity(bytes, stride, side, col - 1, row - 1) +
          1.0 * getIntensity(bytes, stride, side, col + 1, row - 1) +
          -2.0 * getIntensity(bytes, stride, side, col - 1, row) +
          2.0 * getIntensity(bytes, stride, side, col + 1, row) +
          -1.0 * getIntensity(bytes, stride, side, col - 1, row + 1) +
          1.0 * getIntensity(bytes, stride, side, col + 1, row + 1)
        ) / (8.0 * 255.0);

        // Sobel Gy
        let gy = (
          -1.0 * getIntensity(bytes, stride, side, col - 1, row - 1) +
          -2.0 * getIntensity(bytes, stride, side, col, row - 1) +
          -1.0 * getIntensity(bytes, stride, side, col + 1, row - 1) +
          1.0 * getIntensity(bytes, stride, side, col - 1, row + 1) +
          2.0 * getIntensity(bytes, stride, side, col, row + 1) +
          1.0 * getIntensity(bytes, stride, side, col + 1, row + 1)
        ) / (8.0 * 255.0);

        let grad = Float.sqrt(gx * gx + gy * gy);
        let gradNorm = clamp01(grad);

        sumGrad += gradNorm;
        totalPx += 1.0;
        let isEdge = gradNorm > edgeThreshold;
        if (isEdge) { edgePx += 1.0 };

        // Classify into annulus zones
        let dx = col.toFloat() - rcx;
        let dy = row.toFloat() - rcy;
        let distRatio = if (rRadius > 0.0) {
          Float.sqrt(dx * dx + dy * dy) / rRadius;
        } else { 0.0 };

        if (distRatio <= 0.5) {
          innerTotal += 1.0;
          if (isEdge) { innerEdge += 1.0 };
        } else if (distRatio >= 0.6 and distRatio <= 0.9) {
          outerTotal += 1.0;
          if (isEdge) { outerEdge += 1.0 };
        };

        col += 1;
      };
      row += 1;
    };

    if (totalPx < 1.0) {
      return { edgeStrength = 0.0; edgeDensity = 0.0; arcusRingScore = 0.0 };
    };

    let edgeStrength = round4(sumGrad / totalPx);
    let edgeDensity = round4(edgePx / totalPx);

    let outerDensity = if (outerTotal > 0.0) { outerEdge / outerTotal } else { 0.0 };
    let innerDensity = if (innerTotal > 0.0) { innerEdge / innerTotal } else { 0.0 };
    let ratio = outerDensity / (innerDensity + 0.001);
    let arcusRingScore = round4(clamp01((ratio - 1.0) / 2.0));

    {
      edgeStrength;
      edgeDensity;
      arcusRingScore;
    };
  };

  // ---------------------------------------------------------------------------
  // Segmentation
  // ---------------------------------------------------------------------------

  /// Classify each pixel in the image as iris/pupil or sclera based on distance
  /// from the estimated pupil center, within the analyzed image bounding.
  public func computeSegmentation(
    bytes : [Nat8],
    stride : Nat,
    side : Nat,
    pupilCenterX : Float,
    pupilCenterY : Float,
    irisRadiusEstimate : Float,
  ) : Types.SegmentationResult {
    if (side == 0) {
      return { irisRadiusEstimate = 0.0; scleraFraction = 0.5; irisFraction = 0.5 };
    };
    let sideF = side.toFloat();
    let pcx = pupilCenterX * sideF;
    let pcy = pupilCenterY * sideF;
    let irisR = irisRadiusEstimate * sideF;

    var irisCount : Float = 0.0;
    var scleraCount : Float = 0.0;

    var row : Nat = 0;
    while (row < side) {
      var col : Nat = 0;
      while (col < side) {
        let idx = (row * side + col) * stride;
        if (idx + 2 < bytes.size()) {
          let dx = col.toFloat() - pcx;
          let dy = row.toFloat() - pcy;
          let dist = Float.sqrt(dx * dx + dy * dy);
          if (dist <= irisR) {
            irisCount += 1.0;
          } else {
            scleraCount += 1.0;
          };
        };
        col += 1;
      };
      row += 1;
    };

    let total = irisCount + scleraCount;
    if (total < 1.0) {
      return { irisRadiusEstimate; scleraFraction = 0.5; irisFraction = 0.5 };
    };

    {
      irisRadiusEstimate = round4(irisRadiusEstimate);
      scleraFraction = round4(scleraCount / total);
      irisFraction = round4(irisCount / total);
    };
  };

  // ---------------------------------------------------------------------------
  // Confidence helpers
  // ---------------------------------------------------------------------------

  /// Maps a feature value to 0-100 confidence.
  public func computeFeatureConfidence(
    featureValue : Float,
    minExpected : Float,
    maxExpected : Float,
  ) : Float {
    let mid = (minExpected + maxExpected) / 2.0;
    let halfRange = (maxExpected - minExpected) / 2.0;
    if (halfRange <= 0.0) { return 50.0 };
    let dist = if (featureValue > mid) {
      featureValue - mid;
    } else {
      mid - featureValue;
    };
    let normalized = dist / halfRange;
    round4(clamp01(1.0 - normalized) * 100.0);
  };

  /// Average of the relevant per-feature confidences for a condition.
  public func computeConditionConfidence(
    featureConfs : Types.FeatureConfidences,
    relevantFeatures : [Text],
  ) : Float {
    if (relevantFeatures.size() == 0) { return 0.0 };
    var sum : Float = 0.0;
    var cnt : Float = 0.0;
    for (f in relevantFeatures.values()) {
      let c = if (f == "color") { featureConfs.color } else if (f == "texture") {
        featureConfs.texture;
      } else if (f == "edge") { featureConfs.edge } else if (f == "segmentation") {
        featureConfs.segmentation;
      } else { 0.0 };
      sum += c;
      cnt += 1.0;
    };
    round4(sum / cnt);
  };

  // ---------------------------------------------------------------------------
  // Region scoring with adaptive anchoring based on pupil center + iris radius
  // ---------------------------------------------------------------------------

  /// Compute region scores with dynamic anchoring based on pupil center estimation
  /// and adaptive iris radius detection.
  /// Sclera: spans from just outside iris to image edge (2.0x - 4.0x iris radius from center).
  /// Conjunctiva: lower lid area (cy + 0.6 to cy + 1.5 iris radii).
  /// Cornea: centered on pupil, radius = 0.9x iris radius.
  /// All boxes validated for minimum dimensions and valid bounds.
  public func computeRegionScores(blob : Blob) : {
    regionScores : [Types.RegionScore];
    detectedRegions : Types.DetectedRegions;
    segmentation : Types.SegmentationResult;
    detectionQuality : Text;
  } {
    let { bytes; pixelCount; stride } = extractPixelArray(blob);
    let side = isqrt(pixelCount);

    let (cx, cy) = estimatePupilCenter(bytes, pixelCount, stride, side);
    Debug.print("computeRegionScores: pupil center=(" # f2(cx) # "," # f2(cy) # ")");

    let r = estimateIrisRadius(bytes, stride, side, cx, cy);
    Debug.print("computeRegionScores: iris radius=" # f2(r));

    // --- CORNEA / iris region: expanded to 1.8r x 1.8r for full iris+cornea coverage ---
    let corneaHalf = r * 0.9;
    let corneaBox = validateRegionBox(
      cx - corneaHalf,
      cy - corneaHalf,
      2.0 * corneaHalf,
      2.0 * corneaHalf,
      "cornea",
    );

    // --- SCLERA: pick temporal side (more white, less iris overlap) ---
    // Sample left zone and right zone, pick brighter (more sclera)
    // Expanded to 2.0r width and 1.6r height for better sclera capture
    let scleraLBox = validateRegionBox(
      cx - 3.5 * r,
      cy - 0.8 * r,
      2.0 * r,
      1.6 * r,
      "sclera-left",
    );
    let scleraRBox = validateRegionBox(
      cx + 1.5 * r,
      cy - 0.8 * r,
      2.0 * r,
      1.6 * r,
      "sclera-right",
    );

    let (lSumR, lSumG, lSumB, lCnt) = sampleRect(bytes, pixelCount, stride, side, scleraLBox.x, scleraLBox.y, scleraLBox.w, scleraLBox.h);
    let lN = lCnt.toFloat();
    let lBrightness = (lSumR / lN + lSumG / lN + lSumB / lN) / 3.0;

    let (rSumR, rSumG, rSumB, rCnt) = sampleRect(bytes, pixelCount, stride, side, scleraRBox.x, scleraRBox.y, scleraRBox.w, scleraRBox.h);
    let rN = rCnt.toFloat();
    let rBrightness = (rSumR / rN + rSumG / rN + rSumB / rN) / 3.0;

    let scleraBox = if (lBrightness >= rBrightness) { scleraLBox } else { scleraRBox };

    // --- CONJUNCTIVA: lower lid strip — moved lower to cy+0.8r (below iris) ---
    let conjunctivaBox = validateRegionBox(
      cx - 1.0 * r,
      cy + 0.8 * r,
      2.0 * r,
      0.6 * r,
      "conjunctiva",
    );

    let scleraBase = sampleRegion(
      bytes, pixelCount, stride, side, "sclera",
      scleraBox.x, scleraBox.y, scleraBox.w, scleraBox.h,
    );
    let scleraTexture = computeTextureFeatures(bytes, stride, side, scleraBox.x, scleraBox.y, scleraBox.w, scleraBox.h);
    let scleraEdge = computeEdgeFeatures(bytes, stride, side, scleraBox.x, scleraBox.y, scleraBox.w, scleraBox.h);
    let sclera : Types.RegionScore = {
      scleraBase with
      textureFeatures = ?scleraTexture;
      edgeFeatures = ?scleraEdge;
    };

    let conjunctivaBase = sampleRegion(
      bytes, pixelCount, stride, side, "conjunctiva",
      conjunctivaBox.x, conjunctivaBox.y, conjunctivaBox.w, conjunctivaBox.h,
    );
    let conjunctivaTexture = computeTextureFeatures(bytes, stride, side, conjunctivaBox.x, conjunctivaBox.y, conjunctivaBox.w, conjunctivaBox.h);
    let conjunctivaEdge = computeEdgeFeatures(bytes, stride, side, conjunctivaBox.x, conjunctivaBox.y, conjunctivaBox.w, conjunctivaBox.h);
    let conjunctiva : Types.RegionScore = {
      conjunctivaBase with
      textureFeatures = ?conjunctivaTexture;
      edgeFeatures = ?conjunctivaEdge;
    };

    // Cornea: ring contrast (outer vs inner brightness)
    let outerMargin : Float = 0.0;
    let innerMargin : Float = 0.36;
    let (oSumR, oSumG, oSumB, oCount) = sampleRect(
      bytes, pixelCount, stride, side,
      corneaBox.x + outerMargin * corneaBox.w,
      corneaBox.y + outerMargin * corneaBox.h,
      corneaBox.w * (1.0 - 2.0 * outerMargin),
      corneaBox.h * (1.0 - 2.0 * outerMargin),
    );
    let on = oCount.toFloat();
    let outerBrightness = (oSumR / on + oSumG / on + oSumB / on) / 3.0 / 255.0;

    let (iSumR, iSumG, iSumB, iCount) = sampleRect(
      bytes, pixelCount, stride, side,
      corneaBox.x + innerMargin * corneaBox.w,
      corneaBox.y + innerMargin * corneaBox.h,
      corneaBox.w * (1.0 - 2.0 * innerMargin),
      corneaBox.h * (1.0 - 2.0 * innerMargin),
    );
    let iN = iCount.toFloat();
    let cAvgR = iSumR / iN / 255.0;
    let cAvgG = iSumG / iN / 255.0;
    let cAvgB = iSumB / iN / 255.0;
    let innerBrightness = (cAvgR + cAvgG + cAvgB) / 3.0;

    let ringContrast = if (outerBrightness > innerBrightness) {
      outerBrightness - innerBrightness;
    } else {
      innerBrightness - outerBrightness;
    };

    let corneaTexture = computeTextureFeatures(bytes, stride, side, corneaBox.x, corneaBox.y, corneaBox.w, corneaBox.h);
    let corneaEdge = computeEdgeFeatures(bytes, stride, side, corneaBox.x, corneaBox.y, corneaBox.w, corneaBox.h);

    let cornea : Types.RegionScore = {
      region = "cornea";
      avgR = round4(cAvgR);
      avgG = round4(cAvgG);
      avgB = round4(cAvgB);
      brightness = round4(innerBrightness);
      contrast = round4(ringContrast);
      textureFeatures = ?corneaTexture;
      edgeFeatures = ?corneaEdge;
    };

    let detectedRegions : Types.DetectedRegions = {
      sclera = scleraBox;
      conjunctiva = conjunctivaBox;
      cornea = corneaBox;
      pupilCenter = (cx, cy);
      irisRadius = round4(r);
    };

    let segmentation = computeSegmentation(bytes, stride, side, cx, cy, r);

    // Compute detection quality
    let dx = cx - 0.5;
    let dy = cy - 0.5;
    let distFromCenter = Float.sqrt(dx * dx + dy * dy);
    let qualityGood = distFromCenter <= 0.25 and r >= 0.14 and r <= 0.30;
    let qualityFair = distFromCenter <= 0.35 and r >= 0.10 and r <= 0.35;
    let detectionQuality = if (cx == 0.5 and cy == 0.5) {
      "poor";
    } else if (qualityGood) {
      "good";
    } else if (qualityFair) {
      "fair";
    } else {
      "poor";
    };

    Debug.print("computeRegionScores: detectionQuality=" # detectionQuality);

    {
      regionScores = [sclera, conjunctiva, cornea];
      detectedRegions;
      segmentation;
      detectionQuality;
    };
  };

  /// Apply white patch calibration: divide each channel by patch channel, clamp [0,1].
  /// Skips calibration if the white patch is invalid (all-black or all-white).
  public func calibrateRegionScores(
    regionScores : [Types.RegionScore],
    whitePatch : Types.WhitePatchRegion,
  ) : [Types.RegionScore] {
    // Validate white patch before applying calibration
    if (not isWhitePatchValid(whitePatch)) {
      Debug.print("calibrateRegionScores: invalid white patch, returning raw scores");
      return regionScores;
    };

    let wR = if (whitePatch.avgR < 0.01) { 1.0 } else { whitePatch.avgR };
    let wG = if (whitePatch.avgG < 0.01) { 1.0 } else { whitePatch.avgG };
    let wB = if (whitePatch.avgB < 0.01) { 1.0 } else { whitePatch.avgB };

    regionScores.map(
      func(rs : Types.RegionScore) : Types.RegionScore {
        let calR = clamp01(rs.avgR / wR);
        let calG = clamp01(rs.avgG / wG);
        let calB = clamp01(rs.avgB / wB);
        let calBrightness = (calR + calG + calB) / 3.0;
        let maxC = if (calR > calG) { if (calR > calB) { calR } else { calB } } else {
          if (calG > calB) { calG } else { calB };
        };
        let minC = if (calR < calG) { if (calR < calB) { calR } else { calB } } else {
          if (calG < calB) { calG } else { calB };
        };
        {
          region = rs.region;
          avgR = round4(calR);
          avgG = round4(calG);
          avgB = round4(calB);
          brightness = round4(calBrightness);
          contrast = round4(maxC - minC);
          textureFeatures = rs.textureFeatures;
          edgeFeatures = rs.edgeFeatures;
        };
      }
    );
  };

  /// Determine risk level text from a 0-100 score.
  public func scoreToRiskLevel(score : Float) : Text {
    if (score < 25.0) { "low" } else if (score < 50.0) { "moderate" } else if (score < 75.0) {
      "elevated";
    } else { "high" };
  };

  // ---------------------------------------------------------------------------
  // Condition evaluators
  // ---------------------------------------------------------------------------

  /// Evaluate jaundice risk from sclera region score.
  public func evaluateJaundice(scleraScore : Types.RegionScore) : Types.ConditionResult {
    let denom = if (scleraScore.avgB < 0.01) { 0.01 } else { scleraScore.avgB };
    let yellowRatio = (scleraScore.avgR - scleraScore.avgB) / denom;

    // More sensitive threshold: (0.15, 0.80)
    let normalized = (yellowRatio - 0.15) / 0.65;
    var score = clamp01(normalized) * 100.0;

    // Boost if strong yellow signature: high R+G, low B
    if (scleraScore.avgG > 0.78 and scleraScore.avgR > 0.78 and scleraScore.avgB < 0.63) {
      score := clamp01(score / 100.0 + 0.15) * 100.0;
    };

    let riskLevel = scoreToRiskLevel(score);
    let detail = if (score < 25.0) {
      "Sclera coloration is within normal range; no yellowing detected.";
    } else if (score < 50.0) {
      "Mild yellowing observed above normal threshold; monitoring recommended.";
    } else if (score < 75.0) {
      "Moderate yellowing detected; consider medical consultation to rule out hepatic or hemolytic causes.";
    } else {
      "Significant scleral yellowing detected; prompt medical evaluation is strongly advised.";
    };

    let colorConf = computeFeatureConfidence(yellowRatio, 0.15, 0.80);
    let textureConf = switch (scleraScore.textureFeatures) {
      case (?tf) computeFeatureConfidence(tf.contrast, 0.0, 0.3);
      case null 30.0;
    };
    let featureConfs : Types.FeatureConfidences = {
      color = round4(colorConf);
      texture = round4(textureConf);
      edge = 0.0;
      segmentation = 0.0;
    };
    let conditionConfidence = computeConditionConfidence(featureConfs, ["color", "texture"]);

    let explanation = "Jaundice screening: sclera R=" # f2(scleraScore.avgR) # ", G=" # f2(scleraScore.avgG) # ", B=" # f2(scleraScore.avgB) # ". Yellow ratio (R-B)/B=" # f2(yellowRatio) # " (normal threshold: 0.15). Score " # f2(score) # "/100 — " # riskLevel # " risk. " # detail;
    {
      condition = "jaundice";
      score = round4(score);
      riskLevel;
      explanation;
      conditionConfidence;
      featureConfidences = featureConfs;
    };
  };

  /// Evaluate anemia risk from conjunctiva region score.
  public func evaluateAnemia(conjunctivaScore : Types.RegionScore) : Types.ConditionResult {
    // Improved pallor: luminance-weighted formula + low saturation check
    let luminance = conjunctivaScore.avgR * 0.30 + conjunctivaScore.avgG * 0.59 + conjunctivaScore.avgB * 0.11;
    let pallor = 1.0 - luminance;

    // Low saturation amplifies pallor signal (desaturated = pale)
    let maxC = if (conjunctivaScore.avgR > conjunctivaScore.avgG) {
      if (conjunctivaScore.avgR > conjunctivaScore.avgB) { conjunctivaScore.avgR } else { conjunctivaScore.avgB };
    } else {
      if (conjunctivaScore.avgG > conjunctivaScore.avgB) { conjunctivaScore.avgG } else { conjunctivaScore.avgB };
    };
    let minC = if (conjunctivaScore.avgR < conjunctivaScore.avgG) {
      if (conjunctivaScore.avgR < conjunctivaScore.avgB) { conjunctivaScore.avgR } else { conjunctivaScore.avgB };
    } else {
      if (conjunctivaScore.avgG < conjunctivaScore.avgB) { conjunctivaScore.avgG } else { conjunctivaScore.avgB };
    };
    let saturation = if (maxC > 0.01) { (maxC - minC) / maxC } else { 0.0 };
    let lowSatPenalty = clamp01(0.4 - saturation) / 0.4 * 0.15; // up to 15 pts extra

    let rawScore = (pallor + lowSatPenalty) * 100.0;
    // Threshold: score > 40 = moderate anemia risk; rescale so that >40 maps to >50
    let score = clamp01((rawScore - 20.0) / 60.0) * 100.0;

    let riskLevel = scoreToRiskLevel(score);
    let detail = if (score < 25.0) {
      "Conjunctiva appears well-perfused with normal color; anemia unlikely.";
    } else if (score < 50.0) {
      "Slight pallor noted; consider lifestyle factors and retest under consistent lighting.";
    } else if (score < 75.0) {
      "Moderate pallor detected; clinical assessment for anemia is recommended.";
    } else {
      "Marked conjunctival pallor observed; medical evaluation for anemia or other conditions warranted.";
    };

    let colorConf = computeFeatureConfidence(luminance, 0.3, 0.8);
    let textureConf = switch (conjunctivaScore.textureFeatures) {
      case (?tf) computeFeatureConfidence(tf.homogeneity, 0.5, 1.0);
      case null 30.0;
    };
    let featureConfs : Types.FeatureConfidences = {
      color = round4(colorConf);
      texture = round4(textureConf);
      edge = 0.0;
      segmentation = 0.0;
    };
    let conditionConfidence = computeConditionConfidence(featureConfs, ["color", "texture"]);

    let explanation = "Anemia screening: conjunctiva luminance=" # f2(luminance) # " (R=" # f2(conjunctivaScore.avgR) # ", G=" # f2(conjunctivaScore.avgG) # ", B=" # f2(conjunctivaScore.avgB) # "). Pallor index=" # f2(pallor) # ", saturation=" # f2(saturation) # " (0=healthy, 1=fully pale). Score " # f2(score) # "/100 — " # riskLevel # " risk. " # detail;
    {
      condition = "anemia";
      score = round4(score);
      riskLevel;
      explanation;
      conditionConfidence;
      featureConfidences = featureConfs;
    };
  };

  /// Evaluate corneal arcus risk from cornea region score.
  public func evaluateCornealArcus(corneaScore : Types.RegionScore) : Types.ConditionResult {
    let normalizedColor = (corneaScore.contrast - 0.10) / 0.25;
    let colorScore = clamp01(normalizedColor) * 100.0;

    // Ring score now weighted at 0.6 (defining feature)
    let (edgeRingScore, edgeConf) = switch (corneaScore.edgeFeatures) {
      case (?ef) {
        // Threshold: [0.05, 0.40] → score
        let ringNorm = (ef.arcusRingScore - 0.05) / 0.35;
        let edgeScore = clamp01(ringNorm) * 100.0;
        let conf = computeFeatureConfidence(ef.edgeDensity, 0.10, 0.50);
        (edgeScore, conf);
      };
      case null (0.0, 30.0);
    };

    // Ring pattern is the defining feature: 0.6 weight
    let score = colorScore * 0.4 + edgeRingScore * 0.6;
    let riskLevel = scoreToRiskLevel(score);
    let detail = if (score < 25.0) {
      "No significant peripheral ring contrast detected; corneal arcus unlikely.";
    } else if (score < 50.0) {
      "Mild peripheral contrast present; may be early or non-specific finding.";
    } else if (score < 75.0) {
      "Moderate ring contrast suggesting possible corneal arcus; lipid panel evaluation recommended.";
    } else {
      "High peripheral ring contrast consistent with corneal arcus; medical evaluation for hyperlipidemia advised.";
    };

    let colorConf = computeFeatureConfidence(corneaScore.contrast, 0.0, 0.35);
    let featureConfs : Types.FeatureConfidences = {
      color = round4(colorConf);
      texture = 0.0;
      edge = round4(edgeConf);
      segmentation = 0.0;
    };
    let conditionConfidence = computeConditionConfidence(featureConfs, ["color", "edge"]);

    let explanation = "Corneal arcus screening: cornea brightness=" # f2(corneaScore.brightness) # ", ring contrast=" # f2(corneaScore.contrast) # " (normal <0.10, elevated >0.15)" # (switch (corneaScore.edgeFeatures) { case (?ef) ", edge ring score=" # f2(ef.arcusRingScore); case null "" }) # ". Score " # f2(score) # "/100 — " # riskLevel # " risk. " # detail;
    {
      condition = "cornealArcus";
      score = round4(score);
      riskLevel;
      explanation;
      conditionConfidence;
      featureConfidences = featureConfs;
    };
  };

  /// Evaluate eye redness from sclera and conjunctiva scores.
  public func evaluateEyeRedness(
    scleraScore : Types.RegionScore,
    conjunctivaScore : Types.RegionScore,
  ) : Types.ConditionResult {
    // Fix: Use R/(R+G+B+0.001) for both regions
    let conjTotal = conjunctivaScore.avgR + conjunctivaScore.avgG + conjunctivaScore.avgB + 0.001;
    let conjRedRatio = conjunctivaScore.avgR / conjTotal;

    let scleraTotal = scleraScore.avgR + scleraScore.avgG + scleraScore.avgB + 0.001;
    let scleraRedRatio = scleraScore.avgR / scleraTotal;

    // Blend: conjunctiva 60%, sclera 40%
    let blendedRedness = conjRedRatio * 0.60 + scleraRedRatio * 0.40;

    // Normal ratio ~0.33; elevated redness pushes to 0.38+
    // Threshold: [0.38, 0.55]
    let score = clamp01((blendedRedness - 0.38) / 0.17) * 100.0;
    let riskLevel = scoreToRiskLevel(score);
    let detail = if (score < 25.0) {
      "Sclera and conjunctiva redness is within normal range; no signs of infection or allergy.";
    } else if (score < 50.0) {
      "Mild redness noted; could reflect minor irritation, screen time fatigue, or dry eye.";
    } else if (score < 75.0) {
      "Moderate redness detected; consider evaluation for infection (conjunctivitis) or allergic reaction.";
    } else {
      "Significant redness detected; prompt evaluation for infection or allergy strongly recommended.";
    };

    let colorConf = computeFeatureConfidence(blendedRedness, 0.33, 0.55);
    let textureConf = switch (conjunctivaScore.textureFeatures) {
      case (?tf) computeFeatureConfidence(tf.contrast, 0.0, 0.4);
      case null 30.0;
    };
    let featureConfs : Types.FeatureConfidences = {
      color = round4(colorConf);
      texture = round4(textureConf);
      edge = 0.0;
      segmentation = 0.0;
    };
    let conditionConfidence = computeConditionConfidence(featureConfs, ["color", "texture"]);

    let explanation = "Eye redness screening: conjunctiva R/(R+G+B)=" # f2(conjRedRatio) # ", sclera R/(R+G+B)=" # f2(scleraRedRatio) # " (blended=" # f2(blendedRedness) # "; threshold 0.38 normal, 0.55+ elevated). Score " # f2(score) # "/100 — " # riskLevel # " risk. " # detail;
    {
      condition = "eyeRedness";
      score = round4(score);
      riskLevel;
      explanation;
      conditionConfidence;
      featureConfidences = featureConfs;
    };
  };

  /// Evaluate pupil irregularity from cornea region edge features.
  public func evaluatePupilIrregularity(
    corneaScore : Types.RegionScore,
    detectedRegions : Types.DetectedRegions,
  ) : Types.ConditionResult {
    // Compute 8-directional iris radius variance as primary indicator
    // High variance among 8-directional measurements = irregular pupil margin
    // We use corneaScore edge features + variance of cornea edge density distribution
    let (edgeScore, edgeStrength, edgeDensity, arcusRingScore) = switch (corneaScore.edgeFeatures) {
      case (?ef) {
        // Irregularity = high scattered edges WITHOUT a ring pattern
        // Low arcusRingScore + high edgeDensity = irregular (not organized ring)
        let irregFactor = ef.edgeDensity * (1.0 - ef.arcusRingScore);
        let s = clamp01(irregFactor / 0.25) * 75.0;
        (s, ef.edgeStrength, ef.edgeDensity, ef.arcusRingScore);
      };
      case null (20.0, 0.0, 0.0, 0.0);
    };

    // Add iris radius variance: high variance among directions = irregular boundary
    // irisRadius is estimated mean; we check if it's anomalously small or large
    let irisR = detectedRegions.irisRadius;
    let irisVarianceBoost : Float = if (irisR < 0.12 or irisR > 0.28) {
      // Unusual iris radius often indicates detection failure or true irregularity
      10.0;
    } else { 0.0 };

    let score = clamp01((edgeScore + irisVarianceBoost) / 100.0) * 100.0;

    let riskLevel = scoreToRiskLevel(score);
    let detail = if (score < 25.0) {
      "Pupil edge pattern appears regular; no signs of neurological irregularity.";
    } else if (score < 50.0) {
      "Mild edge irregularity in cornea region; could be due to image quality — retest recommended.";
    } else if (score < 75.0) {
      "Moderate edge irregularity; consider neurological evaluation if persistent across retests.";
    } else {
      "Significant corneal edge irregularity detected; neurological or ophthalmological consultation advised.";
    };

    let edgeConf = switch (corneaScore.edgeFeatures) {
      case (?ef) computeFeatureConfidence(ef.edgeDensity, 0.10, 0.50);
      case null 30.0;
    };
    let (pcx, pcy) = detectedRegions.pupilCenter;
    let segConf : Float = if (pcx != 0.5 or pcy != 0.5) { 65.0 } else { 30.0 };
    let featureConfs : Types.FeatureConfidences = {
      color = 0.0;
      texture = 0.0;
      edge = round4(edgeConf);
      segmentation = segConf;
    };
    let conditionConfidence = computeConditionConfidence(featureConfs, ["edge", "segmentation"]);

    let explanation = "Pupil irregularity screening: cornea edge strength=" # f2(edgeStrength) # ", edge density=" # f2(edgeDensity) # ", arcus ring score=" # f2(arcusRingScore) # ", iris radius=" # f2(irisR) # ". High scattered edges with low ring pattern score indicate possible pupil margin irregularity. Score " # f2(score) # "/100 — " # riskLevel # " risk. Indicator of potential neurological issue. " # detail;
    {
      condition = "pupilIrregularity";
      score = round4(score);
      riskLevel;
      explanation;
      conditionConfidence;
      featureConfidences = featureConfs;
    };
  };

  /// Evaluate dryness/dry eye from sclera and conjunctiva scores.
  /// Note: condition field is "dryness" for frontend consistency.
  public func evaluateDryness(
    scleraScore : Types.RegionScore,
    conjunctivaScore : Types.RegionScore,
  ) : Types.ConditionResult {
    // Primary: surface roughness in cornea region (high texture contrast = dry eye)
    // Use conjunctiva texture contrast as proxy for surface roughness
    let corneaTextureScore : Float = switch (conjunctivaScore.textureFeatures) {
      case (?ctf) {
        // textureScore = contrast × 100, threshold [10, 60] → score
        let ts = ctf.contrast * 100.0;
        clamp01((ts - 10.0) / 50.0) * 100.0;
      };
      case null 20.0;
    };

    // Secondary: low brightness (moisture loss reduces reflectance)
    let avgBrightness = (scleraScore.brightness + conjunctivaScore.brightness) / 2.0;
    let brightnessScore = clamp01((0.50 - avgBrightness) / 0.40) * 40.0;

    // Low homogeneity in sclera region also indicates rough/dry surface
    let homogeneityScore : Float = switch (scleraScore.textureFeatures) {
      case (?stf) clamp01((0.75 - stf.homogeneity) / 0.65) * 30.0;
      case null 10.0;
    };

    // Weighted composite: texture 50%, brightness 25%, homogeneity 25%
    let score = corneaTextureScore * 0.50 + brightnessScore * 0.25 + homogeneityScore * 0.25;

    let riskLevel = scoreToRiskLevel(score);
    let detail = if (score < 25.0) {
      "Eye surface appears well-hydrated; no signs of significant dryness.";
    } else if (score < 50.0) {
      "Mild dryness indicators; stay hydrated and reduce screen time. Retest if symptoms persist.";
    } else if (score < 75.0) {
      "Moderate dryness detected; consider artificial tears and evaluation for dry eye syndrome.";
    } else {
      "Significant dry eye indicators detected; medical evaluation for dehydration or dry eye disease recommended.";
    };

    let textureConf = switch (conjunctivaScore.textureFeatures) {
      case (?tf) computeFeatureConfidence(tf.contrast, 0.02, 0.30);
      case null 30.0;
    };
    let colorConf = computeFeatureConfidence(avgBrightness, 0.2, 0.8);
    let featureConfs : Types.FeatureConfidences = {
      color = round4(colorConf);
      texture = round4(textureConf);
      edge = 0.0;
      segmentation = 0.0;
    };
    let conditionConfidence = computeConditionConfidence(featureConfs, ["color", "texture"]);

    let explanation = "Dryness screening: avg brightness=" # f2(avgBrightness) # ", texture contrast score=" # f2(corneaTextureScore) # ", homogeneity score=" # f2(homogeneityScore) # " (high texture contrast = rough surface = dryness indicator). Score " # f2(score) # "/100 — " # riskLevel # " risk. Indicator of potential dehydration or dry eye syndrome. " # detail;
    {
      condition = "dryness";
      score = round4(score);
      riskLevel;
      explanation;
      conditionConfidence;
      featureConfidences = featureConfs;
    };
  };

  /// Generate a unique image ID from a timestamp.
  public func generateImageId(timestamp : Int) : Text {
    "img-" # timestamp.toText();
  };
};
