import { Setting } from "obsidian";
import type { DendronBridgeSettingTab } from "./settingTab";

export function renderExperimentalTab(tab: DendronBridgeSettingTab, containerEl: HTMLElement) {
  const disclaimer = containerEl.createEl("div", {
    cls: "dendron-experimental-disclaimer",
  });

  disclaimer.createSpan({ text: "⚠️ ", cls: "dendron-experimental-icon" });

  disclaimer.createSpan({
    text: "These features are experimental and not completed yet. Expect bugs if you use them.",
    cls: "dendron-experimental-text",
  });

  new Setting(containerEl)
    .setName("Enable Canvas Support")
    .setDesc("Enable support for displaying .canvas files in the tree")
    .addToggle((toggle) => {
      toggle.setValue(tab.plugin.settings.enableCanvasSupport).onChange(async (value) => {
        tab.plugin.settings.enableCanvasSupport = value;
        await tab.plugin.saveSettings();
      });
    });

  new Setting(containerEl)
    .setName("Custom Graph Engine")
    .setDesc(
      "Use custom graph engine to render graph. (Please reopen or reload editor after changing)"
    )
    .addToggle((toggle) => {
      toggle.setValue(tab.plugin.settings.customGraph).onChange(async (value) => {
        tab.plugin.settings.customGraph = value;
        await tab.plugin.saveSettings();
      });
    });
}
