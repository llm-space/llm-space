"use client";

import type * as pi from "@earendil-works/pi-ai";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ModelProviderGroup } from "@/lib/model-types";

export type { ModelProviderGroup };

interface ModelContextValue {
  providers: ModelProviderGroup[];
  // eslint-disable-next-line no-unused-vars
  getModel: (ref: { id: string; provider: string }) => pi.Model<pi.Api> | null;
}

const ModelContext = createContext<ModelContextValue | null>(null);

function buildModelIndex(providers: ModelProviderGroup[]) {
  const map = new Map<string, pi.Model<pi.Api>>();
  for (const group of providers) {
    for (const model of group.models) {
      map.set(`${model.provider}:${model.id}`, model);
    }
  }
  return map;
}

export function ModelProvider({
  models,
  children,
  fallback = null,
}: {
  models: ModelProviderGroup[] | null;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [fetched, setFetched] = useState<ModelProviderGroup[] | null>(null);

  useEffect(() => {
    if (models !== null) {
      return;
    }

    let cancelled = false;
    void fetch("/api/models")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch models: ${res.statusText}`);
        }
        return res.json() as Promise<ModelProviderGroup[]>;
      })
      .then((data) => {
        if (!cancelled) {
          setFetched(data);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch models", error);
      });

    return () => {
      cancelled = true;
    };
  }, [models]);

  const resolved = models ?? fetched;

  const contextValue = useMemo((): ModelContextValue | null => {
    if (!resolved) {
      return null;
    }
    const index = buildModelIndex(resolved);
    return {
      providers: resolved,
      getModel: (ref) => index.get(`${ref.provider}:${ref.id}`) ?? null,
    };
  }, [resolved]);

  if (!contextValue) {
    return fallback;
  }

  return (
    <ModelContext.Provider value={contextValue}>{children}</ModelContext.Provider>
  );
}

function useModelProvider() {
  const ctx = useContext(ModelContext);
  if (!ctx) {
    throw new Error("hooks must be used within <ModelProvider>");
  }
  return ctx;
}

export function useModels(): ModelProviderGroup[] {
  return useModelProvider().providers;
}

export function useModel(ref: {
  id: string;
  provider: string;
}): pi.Model<pi.Api> | null {
  const ctx = useModelProvider();
  return useMemo(
    () => ctx.getModel(ref),
    [ctx, ref.id, ref.provider]
  );
}
