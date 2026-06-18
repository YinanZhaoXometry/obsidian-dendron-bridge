import type { TFile } from "obsidian";
import type { DendronBridgeVault } from "../engine/dendronBridgeVault";
import type { Note } from "../engine/note";

export type Unsubscribe = () => void;

/**
 * Minimal framework-agnostic observable value. Replaces the previous
 * `svelte/store` writables so the engine/plugin layer can push state updates
 * without any UI-framework dependency. React subscribes to these via the
 * StoreProvider (see src/ui/context/StoreContext.tsx).
 */
export class Observable<T> {
  private listeners = new Set<(value: T) => void>();

  constructor(private value: T) {}

  get(): T {
    return this.value;
  }

  set(value: T): void {
    this.value = value;
    for (const listener of this.listeners) listener(value);
  }

  subscribe(listener: (value: T) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const activeFile = new Observable<TFile | null>(null);
export const dendronBridgeVaultList = new Observable<DendronBridgeVault[]>([]);
export const selectedNotes = new Observable<Note[]>([]);
