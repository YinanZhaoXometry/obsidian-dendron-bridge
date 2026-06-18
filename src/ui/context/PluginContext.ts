import { createContext, useContext } from "react";
import type DendronBridgePlugin from "../../main";

// Follows Obsidian's "App context" guidance: make the plugin (and through it
// `app`/`workspace`) available to every component without prop drilling.
export const PluginContext = createContext<DendronBridgePlugin | null>(null);

export function usePlugin(): DendronBridgePlugin {
  const plugin = useContext(PluginContext);
  if (!plugin) {
    throw new Error("usePlugin must be used within a PluginContext.Provider");
  }
  return plugin;
}
