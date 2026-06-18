import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { TFile } from "obsidian";
import type { DendronBridgeVault } from "../../engine/dendronBridgeVault";
import type { Note } from "../../engine/note";
import { activeFile, dendronBridgeVaultList, selectedNotes } from "../../state/store";

interface StoreContextValue {
  activeFile: TFile | null;
  vaultList: DendronBridgeVault[];
  selectedNotes: Note[];
  setSelectedNotes: (notes: Note[]) => void;
  // Derived: true when more than one vault is configured.
  showVaultPath: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [activeFileValue, setActiveFileValue] = useState<TFile | null>(activeFile.get());
  const [vaultList, setVaultList] = useState<DendronBridgeVault[]>(dendronBridgeVaultList.get());
  const [selected, setSelected] = useState<Note[]>(selectedNotes.get());

  useEffect(() => {
    setActiveFileValue(activeFile.get());
    return activeFile.subscribe(setActiveFileValue);
  }, []);

  useEffect(() => {
    setVaultList(dendronBridgeVaultList.get());
    return dendronBridgeVaultList.subscribe(setVaultList);
  }, []);

  useEffect(() => {
    setSelected(selectedNotes.get());
    return selectedNotes.subscribe(setSelected);
  }, []);

  const showVaultPath = useMemo(() => vaultList.length > 1, [vaultList]);

  const value = useMemo<StoreContextValue>(
    () => ({
      activeFile: activeFileValue,
      vaultList,
      selectedNotes: selected,
      setSelectedNotes: (notes: Note[]) => selectedNotes.set(notes),
      showVaultPath,
    }),
    [activeFileValue, vaultList, selected, showVaultPath]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
