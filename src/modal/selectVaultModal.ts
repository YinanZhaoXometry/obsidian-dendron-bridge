import { App, SuggestModal } from "obsidian";
import { DendronBridgeVault } from "../engine/dendronBridgeVault";
import { DendronBridgeWorkspace } from "../engine/dendronBridgeWorkspace";

export class SelectVaultModal extends SuggestModal<DendronBridgeVault> {
  constructor(
    app: App,
    private workspace: DendronBridgeWorkspace,
    private onSelected: (item: DendronBridgeVault) => void
  ) {
    super(app);
  }

  getSuggestions(query: string): DendronBridgeVault[] | Promise<DendronBridgeVault[]> {
    const queryLowercase = query.toLowerCase();
    const activeFile = this.app.workspace.getActiveFile();

    return this.workspace.vaultList.filter((vault) => {
      const matchesQuery =
        vault.config.path.toLowerCase().contains(queryLowercase) ||
        vault.config.name.toLowerCase().contains(queryLowercase);
      const isAccessible = vault.isAccessibleFrom(activeFile);
      return matchesQuery && isAccessible;
    });
  }
  renderSuggestion(value: DendronBridgeVault, el: HTMLElement) {
    el.createEl("div", { text: value.config.name });
    el.createEl("small", {
      text: value.config.path,
    });
  }
  onChooseSuggestion(item: DendronBridgeVault, evt: MouseEvent | KeyboardEvent) {
    this.onSelected(item);
  }
}
