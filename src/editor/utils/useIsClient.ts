import { useSyncExternalStore } from "react";

const subscribe = () => () => void 0;

// false on the server and while the page hydrates, true after that: what renders into document.body (a portal)
// waits for it, so a server render needs no document and the hydration sees the same markup as the server
export const useIsClient = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
