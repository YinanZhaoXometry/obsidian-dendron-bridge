import { ButtonComponent, Setting } from "obsidian";
import type { DendronBridgeSettingTab } from "./settingTab";
import { DEFAULT_SETTINGS } from "./defaults";
import { attachIconModal } from "../iconModal";

export function renderGeneralTab(tab: DendronBridgeSettingTab, containerEl: HTMLElement) {
  containerEl.empty();

  new Setting(containerEl)
    .setName("Plugin Icon")
    .setDesc("Choose an icon for the plugin.")
    .addExtraButton((button) =>
      button
        .setDisabled(false)
        .setIcon(tab.plugin.settings.pluginIcon)
        .setTooltip(tab.plugin.settings.pluginIcon)
    )
    .addButton((button) =>
      button
        .setButtonText("Set Icon")
        .onClick(() => {
          attachIconModal(button, (iconId) => {
            if (!iconId) return;
            tab.plugin.settings.pluginIcon = iconId;
            tab.plugin.saveSettings().then(() => {
              tab.plugin.updateRibbonIcon();
              tab.plugin.updateViewLeafIcon();
              tab.display();
              updateIconSetButton(tab, button);
            });
          });
        })
        .then(() => updateIconSetButton(tab, button))
    );

  new Setting(containerEl)
    .setName("Auto Reveal")
    .setDesc("Automatically reveal active file in Dendron Bridge")
    .addToggle((toggle) => {
      toggle.setValue(tab.plugin.settings.autoReveal).onChange(async (value) => {
        tab.plugin.settings.autoReveal = value;
        await tab.plugin.saveSettings();
      });
    });

  new Setting(containerEl)
    .setName("Custom Resolver")
    .setDesc(
      "Use custom resolver to resolve ref/embed and link. (Please reopen or reload editor after changing)"
    )
    .addToggle((toggle) => {
      toggle.setValue(tab.plugin.settings.customResolver).onChange(async (value) => {
        tab.plugin.settings.customResolver = value;
        await tab.plugin.saveSettings();
      });
    });

  new Setting(containerEl)
    .setName("Hierarchy Separator")
    .setDesc("Characters used to separate hierarchy levels. Max 2 characters.")
    .addText((text) => {
      text
        .setPlaceholder(".")
        .setValue(tab.plugin.settings.hierarchySeparator)
        .onChange(async (value) => {
          const separator = value.slice(0, 2);
          tab.plugin.settings.hierarchySeparator = separator;
          text.setValue(separator);
          await tab.plugin.saveSettings();
        });
    });
}

export function updateIconSetButton(tab: DendronBridgeSettingTab, button: ButtonComponent) {
  if (tab.plugin.settings.pluginIcon == DEFAULT_SETTINGS.pluginIcon) {
    return;
  }

  button.setButtonText("Reset Icon").onClick(() => {
    tab.plugin.settings.pluginIcon = DEFAULT_SETTINGS.pluginIcon;
    tab.plugin.saveSettings().then(() => {
      tab.plugin.updateRibbonIcon();
      tab.plugin.updateViewLeafIcon();
      tab.display();
    });
  });
}
