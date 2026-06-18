import { Notice, Setting } from "obsidian";
import type { DendronBridgeSettingTab } from "./settingTab";
import { DEFAULT_SETTINGS } from "./defaults";
import { ConfirmationModal } from "../modal/confirmationModal";

export function renderLookupTab(tab: DendronBridgeSettingTab, containerEl: HTMLElement) {
  new Setting(containerEl)
    .setName("Excluded Paths")
    .setDesc(
      "Paths that match these patterns will be less noticeable in lookup results. Use * as a wildcard."
    )
    .addTextArea((text) =>
      text
        .setPlaceholder("archive.*\nold/*")
        .setValue(tab.plugin.settings.excludedPaths.join("\n"))
        .onChange(async (value) => {
          tab.plugin.settings.excludedPaths = value
            .split("\n")
            .filter((line) => line.trim() !== "");
          await tab.plugin.saveSettings();
        })
    );

  new Setting(containerEl)
    .setName("File Name Weight")
    .setDesc("How important is the file name when searching (0-1)")
    .addSlider((slider) =>
      slider
        .setLimits(0, 1, 0.1)
        .setValue(tab.plugin.settings.fuzzySearchFileNameWeight)
        .setDynamicTooltip()
        .onChange(async (value) => {
          tab.plugin.settings.fuzzySearchFileNameWeight = value;
          await tab.plugin.saveSettings();
        })
    );

  new Setting(containerEl)
    .setName("Search Threshold")
    .setDesc("How exact the match needs to be (0-1). Lower values require more exact matches")
    .addSlider((slider) =>
      slider
        .setLimits(0, 1, 0.1)
        .setValue(tab.plugin.settings.fuzzySearchThreshold)
        .setDynamicTooltip()
        .onChange(async (value) => {
          tab.plugin.settings.fuzzySearchThreshold = value;
          await tab.plugin.saveSettings();
        })
    );

  new Setting(containerEl).addButton((btn) =>
    btn.setButtonText("Reset Lookup Settings").onClick(async () => {
      const confirmed = await new Promise<boolean>((resolve) => {
        const modal = new ConfirmationModal(
          tab.app,
          "Reset Lookup Settings",
          "This will reset file name weight and search threshold to their default values. Are you sure you want to continue?",
          "Reset",
          "Cancel",
          (result) => resolve(result)
        );
        modal.open();
      });

      if (confirmed) {
        tab.plugin.settings.fuzzySearchFileNameWeight = DEFAULT_SETTINGS.fuzzySearchFileNameWeight;
        tab.plugin.settings.fuzzySearchThreshold = DEFAULT_SETTINGS.fuzzySearchThreshold;
        await tab.plugin.saveSettings();
        tab.display();
        new Notice("Lookup settings have been reset.");
      }
    })
  );
}
