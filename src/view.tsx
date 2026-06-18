import { ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode, createRef } from "react";
import { Root, createRoot } from "react-dom/client";
import DendronBridgePlugin from "./main";
import { dendronBridgeActivityBarName } from "./icons";
import { PluginContext } from "./ui/context/PluginContext";
import { StoreProvider } from "./ui/context/StoreContext";
import { App, AppHandle } from "./ui/components/App";
import { DendronBridgeVault } from "./engine/dendronBridgeVault";
import { Note } from "./engine/note";

export const VIEW_TYPE_DENDRON_BRIDGE = "dendron-bridge-view";

export class DendronBridgeView extends ItemView {
  private root: Root | null = null;
  private appRef = createRef<AppHandle>();
  icon = dendronBridgeActivityBarName;

  constructor(
    leaf: WorkspaceLeaf,
    private plugin: DendronBridgePlugin
  ) {
    super(leaf);
    this.icon = this.plugin.settings.pluginIcon;
  }

  getViewType() {
    return VIEW_TYPE_DENDRON_BRIDGE;
  }

  getDisplayText() {
    return "Dendron Bridge";
  }

  async onOpen() {
    this.root = createRoot(this.contentEl);
    this.root.render(
      <StrictMode>
        <PluginContext.Provider value={this.plugin}>
          <StoreProvider>
            <App ref={this.appRef} />
          </StoreProvider>
        </PluginContext.Provider>
      </StrictMode>
    );
  }

  async onClose() {
    this.root?.unmount();
    this.root = null;
  }

  focusTo(vault: DendronBridgeVault, note: Note) {
    this.appRef.current?.focusTo(vault, note);
  }

  collapseAllButTop() {
    this.appRef.current?.collapseAllButTop();
  }
}
