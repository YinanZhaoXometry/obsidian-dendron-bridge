import {
  forwardRef,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
  ForwardRefExoticComponent,
  RefAttributes,
  MouseEvent as ReactMouseEvent,
} from "react";
import { Note } from "../../engine/note";
import { DendronBridgeVault } from "../../engine/dendronBridgeVault";
import { useStore } from "../context/StoreContext";
import { usePlugin } from "../context/PluginContext";
import { useNoteActions } from "../hooks/useNoteActions";
import { promotePreviewLeaf } from "../../utils";
import { Icon } from "../icon";

export interface NoteItemHandle {
  focusNotes: (pathNotes: Note[]) => void;
  collapseAllButTop: () => void;
}

interface NoteItemProps {
  note: Note;
  vault: DendronBridgeVault;
  isRoot?: boolean;
  onOpenNote: (note: Note) => void;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export const NoteItem: ForwardRefExoticComponent<NoteItemProps & RefAttributes<NoteItemHandle>> =
  forwardRef<NoteItemHandle, NoteItemProps>(function NoteItemComponent(
    { note, vault, isRoot = false, onOpenNote },
    ref
  ) {
    const { activeFile, selectedNotes, setSelectedNotes } = useStore();
    const plugin = usePlugin();
    const actions = useNoteActions(note, vault);

    const [isCollapsed, setIsCollapsed] = useState(true);
    const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

    const headerRef = useRef<HTMLDivElement>(null);
    const childRefs = useRef<Record<string, NoteItemHandle | null>>({});

    // Waiter that resolves when the children container finishes its expand
    // animation, mirroring the Svelte `introend` await used by focusNotes.
    const expandWaiterRef = useRef<Promise<void>>(Promise.resolve());
    const expandResolveRef = useRef<(() => void) | null>(null);

    function startExpandWaiter() {
      expandWaiterRef.current = new Promise<void>((resolve) => {
        expandResolveRef.current = resolve;
      });
    }

    function endExpandWaiter() {
      expandResolveRef.current?.();
      expandResolveRef.current = null;
    }

    function waitForExpand(): Promise<void> {
      return Promise.race([
        expandWaiterRef.current,
        new Promise<void>((resolve) => setTimeout(resolve, 150)),
      ]);
    }

    const isActive = !!note.file && activeFile === note.file;
    const isSelected = selectedNotes.includes(note);

    useImperativeHandle(
      ref,
      (): NoteItemHandle => ({
        focusNotes: async (pathNotes: Note[]) => {
          const path = [...pathNotes];
          const nextNote = path.shift();

          if (nextNote) {
            startExpandWaiter();
            setIsCollapsed(false);
            await nextFrame();

            const childHandle = childRefs.current[nextNote.name];
            if (!childHandle) return;

            if (path.length === 0) await waitForExpand();

            childHandle.focusNotes(path);
          } else {
            headerRef.current?.scrollIntoView({ block: "center" });
          }
        },
        collapseAllButTop: () => {
          if (!isRoot) setIsCollapsed(true);
          Object.values(childRefs.current).forEach((child) => {
            try {
              child?.collapseAllButTop();
            } catch (e) {
              console.warn("Failed to collapse child component", e);
            }
          });
        },
      })
    );

    function handleClick(event: ReactMouseEvent) {
      if (event.ctrlKey || event.shiftKey) {
        if (!note.file) return;

        if (event.ctrlKey) {
          let current = selectedNotes;
          if (current.length === 0 && activeFile) {
            const activeNote = vault.tree.flatten().find((n) => n.file === activeFile);
            if (activeNote) current = [activeNote];
          }

          if (current.includes(note)) {
            setSelectedNotes(current.filter((n) => n !== note));
          } else {
            setSelectedNotes([...current, note]);
          }
        } else if (event.shiftKey) {
          if (selectedNotes.length === 0 && activeFile) {
            const activeNote = vault.tree.flatten().find((n) => n.file === activeFile);
            if (activeNote) {
              const notes = vault.tree.flatten().filter((n) => n.file);
              const start = notes.indexOf(activeNote);
              const end = notes.indexOf(note);
              setSelectedNotes(notes.slice(Math.min(start, end), Math.max(start, end) + 1));
              return;
            }
          }

          const lastSelected = selectedNotes[selectedNotes.length - 1];
          const notes = vault.tree.flatten().filter((n) => n.file);
          const start = notes.indexOf(lastSelected);
          const end = notes.indexOf(note);
          const range = notes.slice(Math.min(start, end), Math.max(start, end) + 1);
          setSelectedNotes([...new Set([...selectedNotes, ...range])]);
        }
      } else {
        setSelectedNotes([]);
        onOpenNote(note);
        if (note.file) {
          const leaf = actions.openNoteFilePreview();
          plugin.previewLeaf = leaf;
          plugin.promotedLeaf = null;
        }
      }
      setIsCollapsed(false);
    }

    async function handleDoubleClick() {
      if (plugin.previewLeaf) {
        // Promote the existing preview tab to permanent.
        promotePreviewLeaf(plugin.previewLeaf);
        plugin.promotedLeaf = plugin.previewLeaf;
        plugin.previewLeaf = null;
      } else if (note.file) {
        // No preview leaf — open the file as a permanent tab directly.
        const { workspace } = plugin.app;
        const leaf = workspace.getLeaf(false);
        await leaf.openFile(note.file);
      }
    }

    const headerClassName = [
      "tree-item-self is-clickable mod-collapsible",
      isActive ? "is-active" : "",
      isSelected ? "is-selected" : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (isRoot) {
      return (
        <div>
          {note.children.map((child) => (
            <NoteItem
              key={child.name}
              ref={(handle) => {
                childRefs.current[child.name] = handle;
              }}
              note={child}
              vault={vault}
              onOpenNote={onOpenNote}
            />
          ))}
        </div>
      );
    }

    return (
      <div className={`tree-item is-clickable${isCollapsed ? " is-collapsed" : ""}`}>
        <div
          ref={headerRef}
          className={headerClassName}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => {
            e.preventDefault();
            actions.showContextMenu(e.nativeEvent, isSelected);
          }}
        >
          {note.children.length > 0 && (
            <Icon
              name="right-triangle"
              className={`tree-item-icon collapse-icon${isCollapsed ? " is-collapsed" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed((c) => !c);
              }}
            />
          )}
          <div className="tree-item-inner">{note.title}</div>
          {!note.file && <div className="dendron-bridge-not-found" />}
        </div>

        {note.children.length > 0 && !isCollapsed && (
          <div
            className="tree-item-children dendron-bridge-children"
            onAnimationEnd={endExpandWaiter}
          >
            {note.children.map((child) => (
              <NoteItem
                key={child.name}
                ref={(handle) => {
                  childRefs.current[child.name] = handle;
                }}
                note={child}
                vault={vault}
                onOpenNote={onOpenNote}
              />
            ))}
          </div>
        )}
      </div>
    );
  });
