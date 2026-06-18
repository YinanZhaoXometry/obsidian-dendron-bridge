import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { Note } from "../../engine/note";
import { DendronBridgeVault } from "../../engine/dendronBridgeVault";
import { useStore } from "../context/StoreContext";
import { NoteItem, NoteItemHandle } from "./NoteItem";

export interface AppHandle {
  focusTo: (vault: DendronBridgeVault, note: Note) => void;
  collapseAllButTop: () => void;
}

export const App = forwardRef<AppHandle>(function App(_props, ref) {
  const { vaultList, selectedNotes, setSelectedNotes } = useStore();
  const rootRefs = useRef<Record<string, NoteItemHandle | null>>({});

  // Guards against re-focusing a note that was just opened from a click
  // (the click already scrolls/opens it), matching the old MainComponent.
  const pendingOpenNote = useRef<Note | null>(null);

  const onOpenNote = useCallback((note: Note) => {
    pendingOpenNote.current = note;
  }, []);

  useImperativeHandle(
    ref,
    (): AppHandle => ({
      focusTo: (vault, note) => {
        if (pendingOpenNote.current === note) {
          pendingOpenNote.current = null;
          return;
        }
        const handle = rootRefs.current[vault.config.name];
        if (!handle) return;

        const pathNotes = note.getPathNotes();
        pathNotes.shift();
        handle.focusNotes(pathNotes);
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
