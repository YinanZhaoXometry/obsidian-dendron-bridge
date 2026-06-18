import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { Note } from "../../engine/note";
import { DendronBridgeVault } from "../../engine/dendronBridgeVault";
import { useStore } from "../context/StoreContext";
import { usePlugin } from "../context/PluginContext";
import { activeFile } from "../../state/store";
import { NoteItem, NoteItemHandle } from "./NoteItem";

export interface AppHandle {
  focusTo: (vault: DendronBridgeVault, note: Note) => void;
  collapseAllButTop: () => void;
}

export const App = forwardRef<AppHandle>(function App(_props, ref) {
  const plugin = usePlugin();
  const { vaultList, selectedNotes, setSelectedNotes } = useStore();
  const rootRefs = useRef<Record<string, NoteItemHandle | null>>({});

  // Guards against re-focusing a note that was just opened from a click
  // (the click already scrolls/opens it), matching the old MainComponent.
  const pendingOpenNote = useRef<Note | null>(null);

  // Ensures the startup reveal of the active note runs only once.
  const initialRevealDone = useRef(false);

  const onOpenNote = useCallback((note: Note) => {
    pendingOpenNote.current = note;
  }, []);

  const revealNote = useCallback((vault: DendronBridgeVault, note: Note) => {
    const handle = rootRefs.current[vault.config.name];
    if (!handle) return;

    const pathNotes = note.getPathNotes();
    pathNotes.shift();
    handle.focusNotes(pathNotes);
  }, []);

  useImperativeHandle(
    ref,
    (): AppHandle => ({
      focusTo: (vault, note) => {
        if (pendingOpenNote.current === note) {
          pendingOpenNote.current = null;
          return;
        }
        revealNote(vault, note);
      },
      collapseAllButTop: () => {
        Object.values(rootRefs.current).forEach((handle) => handle?.collapseAllButTop());
      },
    })
  );

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedNotes.length > 0) {
        setSelectedNotes([]);
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [selectedNotes, setSelectedNotes]);

  // On startup the `file-open` event has already fired before this view mounts,
  // so reveal the currently active note once the tree is rendered (vaultList
  // non-empty means rootRefs are mounted).
  useEffect(() => {
    if (initialRevealDone.current || vaultList.length === 0) return;
    const currentFile = plugin.app.workspace.getActiveFile();
    if (!currentFile) return;
    initialRevealDone.current = true;
    // The `file-open` event already fired before this view mounted, so the
    // activeFile store is still null and the row won't highlight. Seed it here.
    if (!activeFile.get()) activeFile.set(currentFile);
    for (const vault of vaultList) {
      const note = vault.tree.getFromFileName(currentFile.basename, plugin.settings);
      if (note) {
        revealNote(vault, note);
        break;
      }
    }
  }, [vaultList, plugin, revealNote]);

  return (
    <div>
      {vaultList.map((vault) => (
        <NoteItem
          key={vault.config.name}
          ref={(handle) => {
            rootRefs.current[vault.config.name] = handle;
          }}
          note={vault.tree.root}
          isRoot
          vault={vault}
          onOpenNote={onOpenNote}
        />
      ))}
    </div>
  );
});
