import { Menu, TFile } from "obsidian";
import { Note } from "../../engine/note";
import { DendronBridgeVault } from "../../engine/dendronBridgeVault";
import { usePlugin } from "../context/PluginContext";
import { useStore } from "../context/StoreContext";
import {
  OpenFileTarget,
  openFile,
  openFilePreview,
  promotePreviewLeaf,
  isDesktopApp,
  showInSystemExplorer,
} from "../../utils";
import { openLookupWithCurrentPath } from "../../commands/createNewNote";
import { RenameNoteModal } from "../../modal/renameNoteModal";
import { moveNoteToVault, moveNotesToVault } from "../../commands/moveNote";

/**
 * Encapsulates all file/menu side effects for a single note row, keeping
 * NoteItem.tsx focused on presentation.
 */
export function useNoteActions(note: Note, vault: DendronBridgeVault) {
  const plugin = usePlugin();
  const { selectedNotes, setSelectedNotes } = useStore();

  function openNoteFile(target?: OpenFileTarget) {
    if (note.file) {
      // Promote preview when explicitly opening in a permanent tab
      if (plugin.previewLeaf) {
        promotePreviewLeaf(plugin.previewLeaf);
        plugin.previewLeaf = null;
      }
      openFile(plugin.app, note.file, { openTarget: target });
    }
  }

  function openNoteFilePreview() {
    if (!note.file) return null;
    return openFilePreview(plugin.app, note.file, plugin.previewLeaf, plugin.promotedLeaf);
  }

  async function createCurrentNote(): Promise<TFile> {
    const path = note.getPath(true);
    const file = await vault.createNote(path);
    openFile(plugin.app, file);
    return file;
  }

  function deleteCurrentNote() {
    if (!note.file) return;
    plugin.app.fileManager.trashFile(note.file);
  }

  function openLookup() {
    const initialPath = note.getPath(true) + ".";
    openLookupWithCurrentPath(plugin.app, plugin.workspace, initialPath, vault);
  }

  function openRenameModal() {
    if (!note.file) return;
    new RenameNoteModal(plugin.app, note.file, async (newName) => {
      await vault.noteRenamer.renameNote(note.file!, newName);
    }).open();
  }

  function showContextMenu(event: MouseEvent, isSelected: boolean) {
    const menu = new Menu();

    if (selectedNotes.length > 1 && isSelected) {
      const validSelectedNotes = selectedNotes.filter((n) => n.file);
      const validCount = validSelectedNotes.length;

      menu.addItem((item) =>
        item
          .setTitle(`Delete ${validCount} notes`)
          .setIcon("trash")
          .onClick(() => {
            validSelectedNotes.forEach((n) => {
              if (n.file) plugin.app.fileManager.trashFile(n.file);
            });
            setSelectedNotes([]);
          })
      );

      menu.addItem((item) =>
        item
          .setTitle(`Move ${validCount} notes to vault`)
          .setIcon("folder-input")
          .onClick(() => {
            const files = validSelectedNotes
              .map((n) => n.file)
              .filter((f): f is TFile => f != null);
            moveNotesToVault(plugin.app, plugin.workspace, files);
          })
      );

      menu.showAtMouseEvent(event);
      return;
    }

    if (note.file) {
      menu.addItem((item) =>
        item
          .setTitle("Open in new tab")
          .setIcon("lucide-file-plus")
          .onClick(() => openNoteFile("new-tab"))
      );

      menu.addItem((item) =>
        item
          .setTitle("Open to the right")
          .setIcon("lucide-separator-vertical")
          .onClick(() => openNoteFile("new-leaf"))
      );

      if (isDesktopApp()) {
        menu.addItem((item) =>
          item
            .setTitle("Open in new window")
            .setIcon("lucide-maximize")
            .onClick(() => openNoteFile("new-window"))
        );
      }
      menu.addSeparator();

      menu.addItem((item) =>
        item.setTitle("Rename note").setIcon("pencil").onClick(openRenameModal)
      );

      menu.addItem((item) =>
        item
          .setTitle("Move to Vault")
          .setIcon("folder-input")
          .onClick(() => moveNoteToVault(plugin.app, plugin.workspace, note.file!))
      );

      if (isDesktopApp()) {
        menu.addItem((item) =>
          item
            .setTitle("Show in system explorer")
            .setIcon("external-link")
            .onClick(() => showInSystemExplorer(plugin.app, note.file!.path))
        );
      }

      menu.addSeparator();
    }

    if (!note.file) {
      menu.addItem((item) =>
        item.setTitle("Create current note").setIcon("create-new").onClick(createCurrentNote)
      );
    }

    menu.addItem((item) => item.setTitle("Create new note").setIcon("plus").onClick(openLookup));

    menu.addSeparator();

    if (note.file) {
      menu.addItem((item) =>
        item.setTitle("Delete note").setIcon("trash").onClick(deleteCurrentNote)
      );
    }

    menu.showAtMouseEvent(event);
  }

  return {
    openNoteFile,
    openNoteFilePreview,
    createCurrentNote,
    deleteCurrentNote,
    openLookup,
    openRenameModal,
    showContextMenu,
  };
}
