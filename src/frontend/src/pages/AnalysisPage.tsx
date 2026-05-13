import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  FlipHorizontal,
  Loader2,
  RefreshCw,
  ScanEye,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalBlob } from "../backend";
import { CameraFeedbackOverlay } from "../components/CameraFeedbackOverlay";
import { useBackend } from "../hooks/use-backend";
import { useCameraFeedback } from "../hooks/use-camera-feedback";
import { useScreening } from "../hooks/use-screening";
import type { WhitePatchSelection } from "../types/screening";

// ─── Native camera hook ───────────────────────────────────────────────────────

type FacingMode = "user" | "environment";

interface UseBrowserCameraReturn {
  isActive: boolean;
  isSupported: boolean | null;
  isLoading: boolean;
  error: string | null;
  currentFacingMode: FacingMode;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startCamera: (facing?: FacingMode) => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<File | null>;
  switchCamera: () => Promise<void>;
}

function useBrowserCamera(
  defaultFacing: FacingMode = "environment",
): UseBrowserCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFacingMode, setCurrentFacingMode] =
    useState<FacingMode>(defaultFacing);

  useEffect(() => {
    setIsSupported(!!navigator.mediaDevices?.getUserMedia);
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  }, []);

  const startCamera = useCallback(
    async (facing: FacingMode = defaultFacing) => {
      setIsLoading(true);
      setError(null);
      try {
        if (streamRef.current) {
          for (const t of streamRef.current.getTracks()) t.stop();
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCurrentFacingMode(facing);
        setIsActive(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Camera access denied or not available.",
        );
        setIsActive(false);
      } finally {
        setIsLoading(false);
      }
    },
    [defaultFacing],
  );

  const switchCamera = useCallback(async () => {
    const next: FacingMode =
      currentFacingMode === "user" ? "environment" : "user";
    await startCamera(next);
  }, [currentFacingMode, startCamera]);

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isActive) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(
            new File([blob], `capture-${Date.now()}.jpg`, {
              type: "image/jpeg",
            }),
          );
        },
        "image/jpeg",
        0.92,
      );
    });
  }, [isActive]);

  return {
    isActive,
    isSupported,
    isLoading,
    error,
    currentFacingMode,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  };
}

// ─── White-Patch Canvas ──────────────────────────────────────────────────────

interface PatchCanvasProps {
  imageDataUrl: string;
  selection: WhitePatchSelection | null;
  onSelectionChange: (sel: WhitePatchSelection | null) => void;
  patchError: string | null;
}

function PatchCanvas({
  imageDataUrl,
  selection,
  onSelectionChange,
  patchError,
}: PatchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragging = useRef<{ startX: number; startY: number } | null>(null);

  // Draw image + selection overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      if (selection) {
        const px = (selection.x / 100) * img.naturalWidth;
        const py = (selection.y / 100) * img.naturalHeight;
        const pw = (selection.width / 100) * img.naturalWidth;
        const ph = (selection.height / 100) * img.naturalHeight;
        ctx.strokeStyle = "oklch(0.72 0.13 195)";
        ctx.lineWidth = Math.max(2, img.naturalWidth / 250);
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(px, py, pw, ph);
        ctx.fillStyle = "oklch(0.72 0.13 195 / 0.12)";
        ctx.fillRect(px, py, pw, ph);
        ctx.setLineDash([]);
      }
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, selection]);

  const getRelativeCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      };
    },
    [],
  );

  const getRelativeCoordsFromTouch = useCallback((touch: React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((touch.clientX - rect.left) / rect.width) * 100,
      y: ((touch.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getRelativeCoords(e);
    dragging.current = { startX: x, startY: y };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    const { x, y } = getRelativeCoords(e);
    const { startX, startY } = dragging.current;
    const sel: WhitePatchSelection = {
      x: Math.min(startX, x),
      y: Math.min(startY, y),
      width: Math.abs(x - startX),
      height: Math.abs(y - startY),
    };
    onSelectionChange(sel);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    const { x, y } = getRelativeCoords(e);
    const { startX, startY } = dragging.current;
    dragging.current = null;
    const sel: WhitePatchSelection = {
      x: Math.min(startX, x),
      y: Math.min(startY, y),
      width: Math.abs(x - startX),
      height: Math.abs(y - startY),
    };
    onSelectionChange(sel.width < 0.5 && sel.height < 0.5 ? null : sel);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const { x, y } = getRelativeCoordsFromTouch(touch);
    dragging.current = { startX: x, startY: y };
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!dragging.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const { x, y } = getRelativeCoordsFromTouch(touch);
    const { startX, startY } = dragging.current;
    const sel: WhitePatchSelection = {
      x: Math.min(startX, x),
      y: Math.min(startY, y),
      width: Math.abs(x - startX),
      height: Math.abs(y - startY),
    };
    onSelectionChange(sel);
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!dragging.current) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const { x, y } = getRelativeCoordsFromTouch(touch);
    const { startX, startY } = dragging.current;
    dragging.current = null;
    const sel: WhitePatchSelection = {
      x: Math.min(startX, x),
      y: Math.min(startY, y),
      width: Math.abs(x - startX),
      height: Math.abs(y - startY),
    };
    onSelectionChange(sel.width < 0.5 && sel.height < 0.5 ? null : sel);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className={`w-full rounded-lg border-2 cursor-crosshair transition-colors ${
          patchError
            ? "border-destructive/60"
            : selection
              ? "border-primary/60"
              : "border-border"
        }`}
        style={{ maxHeight: "420px", objectFit: "contain" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        data-ocid="analysis.patch_canvas"
      />
    </div>
  );
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────

interface UploadTabProps {
  onImageReady: (file: File, dataUrl: string) => void;
}

function UploadTab({ onImageReady }: UploadTabProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png)/)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        onImageReady(file, e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors ${
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-muted/40"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
      data-ocid="analysis.upload_dropzone"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Upload className="h-7 w-7 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-foreground">
          Drop your eye image here
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Supports JPEG and PNG — clear, well-lit close-up preferred
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="gap-2"
        data-ocid="analysis.upload_button"
      >
        <Upload className="h-4 w-4" />
        Browse files
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={onInputChange}
        data-ocid="analysis.file_input"
      />
    </div>
  );
}

// ─── Camera Tab ───────────────────────────────────────────────────────────────

interface CameraTabProps {
  onImageReady: (file: File, dataUrl: string) => void;
}

function CameraTab({ onImageReady }: CameraTabProps) {
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    currentFacingMode,
    videoRef,
    canvasRef,
  } = useBrowserCamera("environment");

  const { feedbackMessages } = useCameraFeedback(
    videoRef,
    isActive && !isLoading,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount; startCamera/stopCamera are stable
  useEffect(() => {
    void startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        onImageReady(file, e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isSupported === false) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-10 text-center">
        <CameraOff className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium text-foreground">Camera not supported</p>
        <p className="text-sm text-muted-foreground">
          Your browser does not support camera access. Please use file upload
          instead.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-medium text-foreground">Camera error</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          onClick={() => startCamera()}
          className="gap-2"
          data-ocid="analysis.camera_retry_button"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-card"
        style={{ minHeight: "320px" }}
      >
        {isLoading && !isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
          style={{ minHeight: "320px", objectFit: "cover" }}
          data-ocid="analysis.camera_preview"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Oval alignment guide — shown only when camera is actively streaming */}
        {isActive && !isLoading && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <mask id="oval-mask">
                <rect width="100" height="100" fill="white" />
                <ellipse cx="50" cy="50" rx="30" ry="37.5" fill="black" />
              </mask>
            </defs>
            {/* Dark vignette outside the oval */}
            <rect
              width="100"
              height="100"
              fill="rgba(0,0,0,0.35)"
              mask="url(#oval-mask)"
            />
            {/* Outer dark ring for contrast against any background */}
            <ellipse
              cx="50"
              cy="50"
              rx="30.8"
              ry="38.4"
              fill="none"
              stroke="rgba(0,0,0,0.55)"
              strokeWidth="1.2"
            />
            {/* Main dashed oval guide */}
            <ellipse
              cx="50"
              cy="50"
              rx="30"
              ry="37.5"
              fill="none"
              stroke="rgba(180,240,255,0.92)"
              strokeWidth="0.8"
              strokeDasharray="4 2.5"
            />
          </svg>
        )}

        {/* Real-time camera feedback pills */}
        {isActive && !isLoading && (
          <CameraFeedbackOverlay messages={feedbackMessages} />
        )}

        {/* Instruction label — pinned to bottom */}
        {isActive && !isLoading && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white/90 tracking-wide backdrop-blur-sm">
              Align your eye within the oval
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => switchCamera()}
          disabled={isLoading || !isActive}
          aria-label={`Switch to ${currentFacingMode === "user" ? "back" : "front"} camera`}
          className="h-10 w-10"
          data-ocid="analysis.camera_switch_button"
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>

        <Button
          size="lg"
          onClick={handleCapture}
          disabled={!isActive || isLoading}
          className="gap-2 px-8"
          data-ocid="analysis.capture_button"
        >
          <Camera className="h-5 w-5" />
          Capture photo
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useBackend();
  const {
    imageFile,
    imageDataUrl,
    whitePatch,
    isAnalyzing,
    setImageFile,
    setWhitePatch,
    setAnalysisResult,
    setIsAnalyzing,
    resetScreening,
  } = useScreening();

  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [patchError, setPatchError] = useState<string | null>(null);

  const handleImageReady = (file: File, dataUrl: string) => {
    setImageFile(file, dataUrl);
    setWhitePatch(null);
    setAnalysisError(null);
    setPatchError(null);
  };

  const handleReset = () => {
    resetScreening();
    setAnalysisError(null);
    setPatchError(null);
  };

  const handleSelectionChange = (sel: WhitePatchSelection | null) => {
    if (sel && (sel.width < 2 || sel.height < 2)) {
      setPatchError(
        "Selection is too small. Draw a region at least 2% of the image dimensions.",
      );
      setWhitePatch(sel);
      return;
    }
    setPatchError(null);
    setWhitePatch(sel);
  };

  const canAnalyze =
    !!imageFile &&
    !!whitePatch &&
    !patchError &&
    whitePatch.width >= 2 &&
    whitePatch.height >= 2 &&
    !isAnalyzing &&
    !!actor &&
    !isFetching;

  const handleAnalyze = async () => {
    if (!actor || !imageFile || !whitePatch) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8);

      const result = await actor.analyzeEyeImage(blob, {
        x: whitePatch.x,
        y: whitePatch.y,
        width: whitePatch.width,
        height: whitePatch.height,
      });

      // Store result and clear analyzing flag BEFORE navigating so ResultsPage
      // mounts with isAnalyzing=false and analysisResult already set.
      setAnalysisResult(result);
      setIsAnalyzing(false);
      navigate({ to: "/results" });
    } catch (err) {
      setIsAnalyzing(false);
      setAnalysisError(
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.",
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <ScanEye className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-widest">
            New Screening
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Eye Image Analysis
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Upload a close-up photo of your eye or use your camera. Then calibrate
          the white balance by selecting a reference area, and run the analysis.
        </p>
      </div>

      {/* ── STEP 1: Image Input ── */}
      <section
        className="rounded-2xl border border-border bg-card p-6 space-y-4"
        data-ocid="analysis.step1_section"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            1
          </span>
          <h2 className="font-display font-semibold text-foreground">
            Select Image
          </h2>
        </div>

        {!imageDataUrl ? (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList
              className="grid w-full grid-cols-2 mb-4"
              data-ocid="analysis.input_tabs"
            >
              <TabsTrigger value="upload" data-ocid="analysis.upload_tab">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </TabsTrigger>
              <TabsTrigger value="camera" data-ocid="analysis.camera_tab">
                <Camera className="h-4 w-4 mr-2" />
                Use Camera
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <UploadTab onImageReady={handleImageReady} />
            </TabsContent>
            <TabsContent value="camera">
              <CameraTab onImageReady={handleImageReady} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
              <img
                src={imageDataUrl}
                alt="Selected eye — ready for calibration and analysis"
                className="w-full max-h-64 object-contain"
                data-ocid="analysis.image_preview"
              />
              <div className="absolute top-2 right-2">
                <span className="flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-medium text-foreground shadow">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  Image loaded
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2 text-muted-foreground"
              data-ocid="analysis.reset_button"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset / Choose different image
            </Button>
          </div>
        )}
      </section>

      {/* ── STEP 2: White Patch Calibration ── */}
      {imageDataUrl && (
        <section
          className="rounded-2xl border border-border bg-card p-6 space-y-4"
          data-ocid="analysis.step2_section"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              2
            </span>
            <h2 className="font-display font-semibold text-foreground">
              White Patch Calibration
            </h2>
          </div>

          <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Why calibrate?</p>
            <p>
              Select a white or near-white reference area in the image — ideally
              the white of the eye (sclera). This corrects for ambient lighting
              variation and improves color accuracy across different devices and
              environments.
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              Click and drag on the image below to draw a rectangle over the
              reference area.
            </p>
          </div>

          <PatchCanvas
            imageDataUrl={imageDataUrl}
            selection={whitePatch}
            onSelectionChange={handleSelectionChange}
            patchError={patchError}
          />

          {/* Region info + validation */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              {whitePatch ? (
                <div
                  className="font-mono text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2 border border-border"
                  data-ocid="analysis.patch_coords"
                >
                  x: {whitePatch.x.toFixed(1)}% &nbsp;|&nbsp; y:{" "}
                  {whitePatch.y.toFixed(1)}% &nbsp;|&nbsp; w:{" "}
                  {whitePatch.width.toFixed(1)}% &nbsp;|&nbsp; h:{" "}
                  {whitePatch.height.toFixed(1)}%
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No region selected — draw a rectangle on the image above
                </p>
              )}
              {patchError && (
                <p
                  className="flex items-center gap-1.5 text-xs text-destructive"
                  data-ocid="analysis.patch_error"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {patchError}
                </p>
              )}
              {whitePatch && !patchError && (
                <p className="flex items-center gap-1.5 text-xs text-accent">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Reference region selected
                </p>
              )}
            </div>

            {whitePatch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleSelectionChange(null);
                }}
                className="gap-1.5 text-muted-foreground shrink-0"
                data-ocid="analysis.clear_patch_button"
              >
                <X className="h-3.5 w-3.5" />
                Clear selection
              </Button>
            )}
          </div>
        </section>
      )}

      {/* ── STEP 3: Analyze ── */}
      {imageDataUrl && (
        <section
          className="rounded-2xl border border-border bg-card p-6 space-y-4"
          data-ocid="analysis.step3_section"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              3
            </span>
            <h2 className="font-display font-semibold text-foreground">
              Run Analysis
            </h2>
          </div>

          {!whitePatch && (
            <p className="text-sm text-muted-foreground">
              Complete Step 2 — select a white reference region — to enable
              analysis.
            </p>
          )}

          {analysisError && (
            <div
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
              data-ocid="analysis.error_state"
            >
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Analysis failed
                </p>
                <p className="text-sm text-muted-foreground">{analysisError}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="gap-2 px-8"
              data-ocid="analysis.run_button"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing eye regions…
                </>
              ) : (
                <>
                  <ScanEye className="h-5 w-5" />
                  Run Analysis
                </>
              )}
            </Button>

            {analysisError && (
              <Button
                variant="outline"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="gap-2"
                data-ocid="analysis.retry_button"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            )}
          </div>

          {isAnalyzing && (
            <div
              className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-center gap-3"
              data-ocid="analysis.loading_state"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Analyzing eye regions…
                </p>
                <p className="text-xs text-muted-foreground">
                  Evaluating sclera, conjunctiva, and cornea using texture,
                  edge, and color analysis. This may take a few seconds.
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            ⚠️ OcuScreen+ is a research tool only. Results are not a medical
            diagnosis. Always consult a qualified healthcare professional.
          </p>
        </section>
      )}
    </div>
  );
}
