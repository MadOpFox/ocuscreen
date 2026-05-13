import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type FeedbackType = "lighting" | "distance" | "alignment";
export type FeedbackSeverity = "warning" | "info";

export interface FeedbackMessage {
  type: FeedbackType;
  severity: FeedbackSeverity;
  message: string;
}

/** Compute average luminance (0–255) over a pixel array (RGBA) */
function avgLuminance(data: Uint8ClampedArray): number {
  let total = 0;
  const pixelCount = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return pixelCount > 0 ? total / pixelCount : 0;
}

/** Compute edge density over center 50% of frame.
 *  Counts pixels where luminance differs >20 from any horizontal/vertical neighbor. */
function edgeDensity(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): number {
  const x0 = Math.floor(width * 0.25);
  const x1 = Math.floor(width * 0.75);
  const y0 = Math.floor(height * 0.25);
  const y1 = Math.floor(height * 0.75);
  const regionW = x1 - x0;
  const regionH = y1 - y0;
  if (regionW <= 0 || regionH <= 0) return 0;

  const lum = (px: number, py: number): number => {
    const idx = (py * width + px) * 4;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  };

  let edgeCount = 0;
  const totalPixels = regionW * regionH;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const c = lum(x, y);
      const right = x + 1 < x1 ? Math.abs(c - lum(x + 1, y)) : 0;
      const down = y + 1 < y1 ? Math.abs(c - lum(x, y + 1)) : 0;
      if (right > 20 || down > 20) edgeCount++;
    }
  }

  return edgeCount / totalPixels;
}

/** Find centroid of darkest cluster in center 40% of frame.
 *  Returns normalized [cx, cy] where 0.5,0.5 = frame center. */
function darkestClusterCentroid(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { cx: number; cy: number } | null {
  const x0 = Math.floor(width * 0.3);
  const x1 = Math.floor(width * 0.7);
  const y0 = Math.floor(height * 0.3);
  const y1 = Math.floor(height * 0.7);

  // Find luminance threshold for "dark" pixels (bottom 15%)
  const lumValues: number[] = [];
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * width + x) * 4;
      lumValues.push(
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2],
      );
    }
  }
  if (lumValues.length === 0) return null;

  lumValues.sort((a, b) => a - b);
  const threshold = lumValues[Math.floor(lumValues.length * 0.15)];

  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * width + x) * 4;
      const lum =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum <= threshold) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  if (count === 0) return null;
  return { cx: sumX / count / width, cy: sumY / count / height };
}

interface UseCameraFeedbackReturn {
  feedbackMessages: FeedbackMessage[];
}

export function useCameraFeedback(
  videoRef: RefObject<HTMLVideoElement | null>,
  isActive: boolean,
): UseCameraFeedbackReturn {
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>(
    [],
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const analyze = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Create or reuse off-screen canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;

    // Sample at reduced resolution for performance
    const scale = Math.min(1, 200 / Math.max(vw, vh));
    const sw = Math.floor(vw * scale);
    const sh = Math.floor(vh * scale);
    canvas.width = sw;
    canvas.height = sh;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, sw, sh);

    // ── Lighting check (center 100x100 sample) ──────────────────────────────
    const cx = Math.floor(sw / 2);
    const cy = Math.floor(sh / 2);
    const patchSize = Math.min(50, Math.floor(Math.min(sw, sh) * 0.25));
    const px = Math.max(0, cx - patchSize);
    const py = Math.max(0, cy - patchSize);
    const pw = Math.min(patchSize * 2, sw - px);
    const ph = Math.min(patchSize * 2, sh - py);
    const patchData = ctx.getImageData(px, py, pw, ph).data;
    const lum = avgLuminance(patchData);

    const allData = ctx.getImageData(0, 0, sw, sh).data;

    // ── Edge density check ───────────────────────────────────────────────────
    const density = edgeDensity(allData, sw, sh);

    // ── Alignment check ──────────────────────────────────────────────────────
    const centroid = darkestClusterCentroid(allData, sw, sh);

    // ── Build messages (priority: lighting → distance → alignment) ──────────
    const messages: FeedbackMessage[] = [];

    if (lum < 60) {
      messages.push({
        type: "lighting",
        severity: "warning",
        message: "Better lighting needed",
      });
    } else if (lum > 220) {
      messages.push({
        type: "lighting",
        severity: "warning",
        message: "Too much light — find shade",
      });
    } else if (lum >= 60 && lum <= 100) {
      messages.push({
        type: "lighting",
        severity: "info",
        message: "Low light — improve if possible",
      });
    }

    if (messages.length < 2) {
      if (density < 0.02) {
        messages.push({
          type: "distance",
          severity: "warning",
          message: "Move closer — eye not in focus",
        });
      } else if (density > 0.35) {
        messages.push({
          type: "distance",
          severity: "info",
          message: "Move back slightly",
        });
      }
    }

    if (messages.length < 2 && centroid) {
      const offX = Math.abs(centroid.cx - 0.5);
      const offY = Math.abs(centroid.cy - 0.5);
      if (offX > 0.25 || offY > 0.25) {
        messages.push({
          type: "alignment",
          severity: "warning",
          message: "Center your eye in the oval guide",
        });
      }
    }

    // Max 2 messages
    setFeedbackMessages(messages.slice(0, 2));
  }, [videoRef]);

  useEffect(() => {
    if (!isActive) {
      setFeedbackMessages([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(analyze, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, analyze]);

  return { feedbackMessages };
}
