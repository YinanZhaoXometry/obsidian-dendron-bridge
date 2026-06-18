import { App, PluginSettingTab } from "obsidian";
import DendronBridgePlugin from "../main";
import { renderGeneralTab } from "./generalTab";
import { renderPropertiesTab } from "./propertiesTab";
import { renderLookupTab } from "./lookupTab";
import { renderVaultsTab } from "./vaultsTab";
import { renderExperimentalTab } from "./experimentalTab";

export enum SettingTab {
  General = "General",
  Properties = "Properties",
  Lookup = "Lookup",
  Vaults = "Vaults",
  Experimental = "Experimental",
}

/**
 * Thin shell: renders the tab navigation and delegates each tab's content to a
 * dedicated module in this folder. Each tab module receives `this` so it can
 * read/write settings and trigger a re-render via `display()`.
 */
export class DendronBridgeSettingTab extends PluginSettingTab {
  plugin: DendronBridgePlugin;
  private activeTab: SettingTab = SettingTab.General;

  constructor(app: App, plugin: DendronBridgePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const tabContainer = containerEl.createDiv("settings-tab-container");
    Object.values(SettingTab).forEach((tab) => {
      const tabButton = tabContainer.createDiv("settings-tab");
      tabButton.textContent = tab;
      if (this.activeTab === tab) {
        tabButton.addClass("active");
      }
      tabButton.addEventListener("click", () => {
        this.activeTab = tab;
        this.display();
      });
    });

    const contentContainer = containerEl.createDiv("settings-tab-content");

    switch (this.activeTab) {
      case SettingTab.General:
        renderGeneralTab(this, contentContainer);
        break;
      case SettingTab.Properties:
        renderPropertiesTab(this, contentContainer);
        break;
      case SettingTab.Lookup:
        renderLookupTab(this, contentContainer);
        break;
      case SettingTab.Vaults:
        renderVaultsTab(this, contentContainer);
        break;
      case SettingTab.Experimental:
        renderExperimentalTab(this, contentContainer);
        break;
    }
  }

  hide() {
    super.hide();
    this.plugin.onRootFolderChanged();
    this.plugin.configureCustomResolver();
    this.plugin.configureCustomGraph();
  }
}
