"use client";

import {
  LOCAL_STORAGE_KEYS,
  readLocalStorage,
  writeLocalStorage,
} from "@llm-space/ui/lib/local-storage";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ExperimentalContextValue {
  /** Whether the tracing (beta) experiment is enabled. */
  tracingEnabled: boolean;
  setTracingEnabled: (enabled: boolean) => void;
  /** Whether the react-scan render overlay is enabled (applies on reload). */
  reactScanEnabled: boolean;
  setReactScanEnabled: (enabled: boolean) => void;
}

const ExperimentalContext = createContext<ExperimentalContextValue | null>(
  null
);

function _readStoredTracingEnabled(): boolean {
  return readLocalStorage(LOCAL_STORAGE_KEYS.experimentalTracing) === "true";
}

function _readStoredReactScanEnabled(): boolean {
  return readLocalStorage(LOCAL_STORAGE_KEYS.experimentalReactScan) === "true";
}

export function ExperimentalProvider({ children }: { children: ReactNode }) {
  const [tracingEnabled, setTracingEnabledState] = useState<boolean>(
    _readStoredTracingEnabled
  );
  const [reactScanEnabled, setReactScanEnabledState] = useState<boolean>(
    _readStoredReactScanEnabled
  );

  const setTracingEnabled = useCallback((next: boolean) => {
    writeLocalStorage(LOCAL_STORAGE_KEYS.experimentalTracing, String(next));
    setTracingEnabledState(next);
  }, []);

  const setReactScanEnabled = useCallback((next: boolean) => {
    writeLocalStorage(LOCAL_STORAGE_KEYS.experimentalReactScan, String(next));
    setReactScanEnabledState(next);
  }, []);

  const value = useMemo(
    (): ExperimentalContextValue => ({
      tracingEnabled,
      setTracingEnabled,
      reactScanEnabled,
      setReactScanEnabled,
    }),
    [tracingEnabled, setTracingEnabled, reactScanEnabled, setReactScanEnabled]
  );

  return (
    <ExperimentalContext.Provider value={value}>
      {children}
    </ExperimentalContext.Provider>
  );
}

export function useExperimental(): ExperimentalContextValue {
  const ctx = useContext(ExperimentalContext);
  if (!ctx) {
    throw new Error(
      "useExperimental must be used within <ExperimentalProvider>"
    );
  }
  return ctx;
}
