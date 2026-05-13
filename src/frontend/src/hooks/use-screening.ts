import { createContext, useCallback, useContext, useState } from "react";
import type { AnalysisResult } from "../backend";
import type { WhitePatchSelection } from "../types/screening";

// ── Session storage helpers ────────────────────────────────────────────────
// Persist the analysis result in sessionStorage so it survives accidental
// re-renders and Suspense-boundary remounts during navigation.

const SESSION_KEY = "ocuscreen_analysis_result";

function saveResultToSession(result: AnalysisResult | null): void {
  try {
    if (result === null) {
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(result, (_k, v) =>
          typeof v === "bigint" ? `__bigint__${v.toString()}` : v,
        ),
      );
    }
  } catch {
    // sessionStorage may be unavailable (private mode, quota exceeded)
  }
}

function loadResultFromSession(): AnalysisResult | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw, (_k, v) => {
      if (typeof v === "string" && v.startsWith("__bigint__")) {
        return BigInt(v.slice(10));
      }
      return v;
    }) as AnalysisResult;
    return parsed;
  } catch {
    return null;
  }
}

// ── State types ────────────────────────────────────────────────────────────

export interface ScreeningState {
  imageFile: File | null;
  imageDataUrl: string | null;
  whitePatch: WhitePatchSelection | null;
  analysisResult: AnalysisResult | null;
  llmSummary: string | null;
  isAnalyzing: boolean;
}

export interface ScreeningActions {
  setImageFile: (file: File | null, dataUrl: string | null) => void;
  setWhitePatch: (patch: WhitePatchSelection | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setLlmSummary: (summary: string | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  resetScreening: () => void;
}

export type ScreeningContextValue = ScreeningState & ScreeningActions;

const initialState: ScreeningState = {
  imageFile: null,
  imageDataUrl: null,
  whitePatch: null,
  // Restore result from session on first load so a page refresh doesn't lose it
  analysisResult: loadResultFromSession(),
  llmSummary: null,
  isAnalyzing: false,
};

export const ScreeningContext = createContext<ScreeningContextValue | null>(
  null,
);

export function useScreeningState(): ScreeningContextValue {
  const [state, setState] = useState<ScreeningState>(initialState);

  const setImageFile = useCallback(
    (file: File | null, dataUrl: string | null) => {
      // Changing image clears prior result — also clear session
      saveResultToSession(null);
      setState((prev) => ({
        ...prev,
        imageFile: file,
        imageDataUrl: dataUrl,
        analysisResult: null,
        llmSummary: null,
      }));
    },
    [],
  );

  const setWhitePatch = useCallback((patch: WhitePatchSelection | null) => {
    setState((prev) => ({ ...prev, whitePatch: patch }));
  }, []);

  const setAnalysisResult = useCallback((result: AnalysisResult | null) => {
    saveResultToSession(result);
    setState((prev) => ({ ...prev, analysisResult: result }));
  }, []);

  const setLlmSummary = useCallback((summary: string | null) => {
    setState((prev) => ({ ...prev, llmSummary: summary }));
  }, []);

  const setIsAnalyzing = useCallback((analyzing: boolean) => {
    setState((prev) => ({ ...prev, isAnalyzing: analyzing }));
  }, []);

  const resetScreening = useCallback(() => {
    saveResultToSession(null);
    setState(initialState);
  }, []);

  return {
    ...state,
    setImageFile,
    setWhitePatch,
    setAnalysisResult,
    setLlmSummary,
    setIsAnalyzing,
    resetScreening,
  };
}

export function useScreening(): ScreeningContextValue {
  const ctx = useContext(ScreeningContext);
  if (!ctx)
    throw new Error("useScreening must be used within ScreeningProvider");
  return ctx;
}
