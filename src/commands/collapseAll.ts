import { App } from "obsidian";
import { DendronBridgeView, VIEW_TYPE_DENDRON_BRIDGE } from "../view";

export function collapseAllCommand(app: App) {
  return {
    id: "dendron-bridge-collapse-all",
    name: "Collapse all",
    callback: () => collapseAllButTop(app),
  };
}

function collapseAllButTop(app: App) {
  app.workspace.getLeavesOfType(VIEW_TYPE_DENDRON_BRIDGE).forEach((leaf) => {
    if (leaf.view instanceof DendronBridgeView) {
      leaf.view.collapseAllButTop();
    }
  });
}
