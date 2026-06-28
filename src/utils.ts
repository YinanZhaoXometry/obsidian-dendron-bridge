import {
  App,
  OpenViewState,
  TAbstractFile,
  TFile,
  Vault,
  Platform,
  WorkspaceLeaf,
  WorkspaceRoot,
  WorkspaceFloating,
} from "obsidian";
import { customAlphabet as nanoid } from "nanoid";
import { exec } from "child_process";

export function getFolderFile(vault: Vault, path: string) {
  return path.length === 0 ? vault.getRoot() : vault.getAbstractFileByPath(path);
}

export type OpenFileTarget = "new-tab" | "new-leaf" | "new-window";

export function openFile(
  app: App,
  file: TAbstractFile | undefined | null,
  props: {
    openState?: OpenViewState;
    openTarget?: OpenFileTarget;
  } = {}
) {
  if (!file || !(file instanceof TFile)) return;
  const leaf =
    props.openTarget === "new-window"
      ? app.workspace.openPopoutLeaf()
      : props.openTarget === "new-leaf"
        ? app.workspace.createLeafBySplit(app.workspace.getLeaf())
        : app.workspace.getLeaf(props.openTarget === "new-tab");
  return leaf.openFile(file, props.openState);
}

/**
 * Find a leaf that is already showing the given file (excluding the preview leaf).
 * Returns the first permanent (non-preview) match found, or null.
 */
function findExistingLeaf(
  app: App,
  file: TFile,
  previewLeaf: WorkspaceLeaf | null
): WorkspaceLeaf | null {
  let result: WorkspaceLeaf | null = null;
  app.workspace.iterateAllLeaves((leaf) => {
    if (result) return;
    if (leaf === previewLeaf) return;
    const view = leaf.view;
    if (view && "file" in view && (view as unknown as { file: TFile }).file === file) {
      result = leaf;
    }
  });
  return result;
}

/**
 * Open a file in a preview (reusable) tab.
 *
 * 1. If the file is already open in a permanent (non-preview) tab, activate
 *    that tab instead of opening a duplicate.
 * 2. If an existing preview leaf is still valid and unpromoted, reuse it.
 * 3. Otherwise obtain a fresh unpinned leaf, skipping any promoted leaf.
 *
 * Returns the leaf that was used, or null if an existing tab was activated.
 */
export function openFilePreview(
  app: App,
  file: TAbstractFile | undefined | null,
  previewLeaf: WorkspaceLeaf | null,
  promotedLeaf: WorkspaceLeaf | null = null
): WorkspaceLeaf | null {
  if (!(file instanceof TFile)) return null;

  // --- Deduplication: if the file is already open in a permanent tab, just
  //     activate it.  This prevents duplicate tabs at any stage.
  //     Return the existing leaf so the caller can still track it (e.g. for
  //     promotion on double-click).
  const existing = findExistingLeaf(app, file, previewLeaf);
  if (existing) {
    app.workspace.setActiveLeaf(existing);
    return existing;
  }

  // --- Reuse or create a preview leaf.
  let leaf: WorkspaceLeaf;
  if (previewLeaf) {
    const root = previewLeaf.getRoot();
    // Reuse the existing preview leaf only if it is still in the main area
    // and has not been promoted.
    if (
      (root instanceof WorkspaceRoot || root instanceof WorkspaceFloating) &&
      previewLeaf !== promotedLeaf
    ) {
      leaf = previewLeaf;
      app.workspace.setActiveLeaf(leaf);
    } else {
      leaf = getNewPreviewLeaf(app, promotedLeaf);
    }
  } else {
    leaf = getNewPreviewLeaf(app, promotedLeaf);
  }

  leaf.openFile(file);

  // Apply preview style after the tab header DOM is created.
  // Store the frame ID so promotePreviewLeaf can cancel it if promotion
  // happens before the frame fires.
  pendingPreviewFrame = requestAnimationFrame(() => {
    pendingPreviewFrame = null;
    const tabHeaderEl = (leaf as unknown as { tabHeaderEl?: HTMLElement }).tabHeaderEl;
    if (tabHeaderEl) {
      tabHeaderEl.classList.add("is-preview-tab");
    }
  });

  return leaf;
}

/**
 * Get a fresh leaf suitable for preview, skipping the promoted leaf.
 */
function getNewPreviewLeaf(app: App, promotedLeaf: WorkspaceLeaf | null): WorkspaceLeaf {
  const leaf = app.workspace.getLeaf(false);
  // If the active leaf is the one we just promoted, we need a different leaf
  // so we don't overwrite the promoted tab's content.
  if (promotedLeaf && leaf === promotedLeaf) {
    return app.workspace.getLeaf(true);
  }
  return leaf;
}

/**
 * Promote a preview leaf to a permanent tab: remove the preview CSS class.
 */
export function promotePreviewLeaf(leaf: WorkspaceLeaf | null): void {
  if (!leaf) return;
  // Cancel any pending preview-style frame so it doesn't re-add the class.
  if (pendingPreviewFrame !== null) {
    cancelAnimationFrame(pendingPreviewFrame);
    pendingPreviewFrame = null;
  }
  const tabHeaderEl = (leaf as unknown as { tabHeaderEl?: HTMLElement }).tabHeaderEl;
  if (tabHeaderEl) {
    tabHeaderEl.classList.remove("is-preview-tab");
  }
}

// Track the pending requestAnimationFrame so promote can cancel it.
// Without this, a quick promote-then-RAF would re-add the preview class.
let pendingPreviewFrame: number | null = null;

const alphanumericLowercase = "0123456789abcdefghijklmnopqrstuvwxyz";
export const generateUUID = nanoid(alphanumericLowercase, 23);

// Check the current platform
export function isDesktopApp(): boolean {
  return Platform.isDesktop;
}

export function showInSystemExplorer(app: App, relativePath: string): void {
  if (!isDesktopApp()) return;

  // Get vault path using correct API method
  const vaultPath = (app.vault.adapter as any).getBasePath?.();
  if (!vaultPath) {
    console.error("Unable to get vault path");
    return;
  }

  const absolutePath = `${vaultPath}/${relativePath}`;

  if (Platform.isWin) {
    // Normalize path for Windows
    const windowsPath = absolutePath.replace(/\//g, "\\");
    exec(`explorer.exe /select,"${windowsPath}"`, (error) => {
      if (error) console.error("Failed to open explorer:", error);
    });
  } else if (Platform.isMacOS) {
    exec(`open -R "${absolutePath}"`, (error) => {
      if (error) console.error("Failed to open finder:", error);
    });
  } else if (Platform.isLinux) {
    const dirPath = absolutePath.substring(0, absolutePath.lastIndexOf("/"));
    exec(`xdg-open "${dirPath}"`, (error) => {
      if (error) console.error("Failed to open file manager:", error);
    });
  }
}
