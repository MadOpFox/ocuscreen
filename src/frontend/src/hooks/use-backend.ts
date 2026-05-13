import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";

export interface BackendState {
  actor: backendInterface | null;
  isFetching: boolean;
}

export function useBackend(): BackendState {
  const { actor, isFetching } = useActor(createActor);
  return { actor: actor as backendInterface | null, isFetching };
}
