import { App } from "obsidian";
import { LookupModal } from "../modal/lookup/lookupModal";
import { DendronBridgeWorkspace } from "../engine/dendronBridgeWorkspace";
import { DendronBridgePluginSettings } from "../types/settings";

export function lookupNoteCommand(
  app: App,
  workspace: DendronBridgeWorkspace,
  settings: DendronBridgePluginSettings
) {
  return {
    id: "dendron-bridge-lookup",
    name: "Lookup note",
    callback: () => {
      new LookupModal(
        app,
        workspace,
        "", // initialQuery
        undefined, // onCreateInVault
        settings.excludedPaths
      ).open();
    },
  };
}
