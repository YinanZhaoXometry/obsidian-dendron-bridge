import { ItemView, WorkspaceLeaf } from "obsidian";

import Component from "./components/MainComponent.svelte";
import DendronBridgePlugin from "./main";
import * as store from "./store";
import { dendronBridgeActivityBarName } from "./icons";

export const VIEW_TYPE_DENDRON_BRIDGE = "dendron-bridge-view";

export class DendronBridgeView extends ItemView {
  component: Component;
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
    store.plugin.set(this.plugin);
    this.component = new Component({
      target: this.contentEl,
    });
  }

  async onClose() {
    this.component.$destroy();
  }

  collapseAllButTop() {
    if (this.component) {
      this.component.collapseAllButTop();
    }
  }
}
