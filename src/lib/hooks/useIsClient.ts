"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and the hydration render, true afterwards. Use to keep browser-only widgets out of server HTML. */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
