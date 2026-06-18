import { Notice, Setting } from "obsidian";
import type { DendronBridgeSettingTab } from "./settingTab";
import { AddVaultModal } from "../modal/addVaultModal";

export function renderVaultsTab(tab: DendronBridgeSettingTab, containerEl: HTMLElement) {
  const vaultList = containerEl.createDiv("vault-list");

  for (const vault of tab.plugin.settings.vaultList) {
    const vaultContainer = vaultList.createDiv("vault-container");

    new Setting(vaultContainer)
      .setName(vault.name)
      .setDesc(
        createFragment((el) => {
          el.createSpan({ text: vault.path });
          if (vault.properties) {
            el.createSpan({
              cls: "vault-custom-properties",
              attr: { "aria-label": "Has custom property settings" },
            }).createSpan({ text: "⚙️" });
          }
        })
      )
      .addExtraButton((btn) => {
        btn
          .setIcon("pencil")
          .setTooltip("Edit vault")
          .onClick(() => {
            new AddVaultModal(
              tab.app,
              (newConfig) => {
                const index = tab.plugin.settings.vaultList.indexOf(vault);
                tab.plugin.settings.vaultList[index] = newConfig;
                tab.plugin.saveSettings();
                tab.display();
                return true;
              },
              vault
            ).open();
          });
      })
      .addExtraButton((btn) => {
        btn
          .setIcon("trash")
          .setTooltip("Delete vault")
          .onClick(() => {
            const index = tab.plugin.settings.vaultList.indexOf(vault);
            tab.plugin.settings.vaultList.splice(index, 1);
            tab.plugin.saveSettings();
            tab.display();
          });
      });
  }
  new Setting(containerEl).addButton((btn) => {
    btn.setButtonText("Add Vault").onClick(() => {
      new AddVaultModal(tab.app, (config) => {
        const list = tab.plugin.settings.vaultList;
        const nameLowecase = config.name.toLowerCase();
        if (list.find(({ name }) => name.toLowerCase() === nameLowecase)) {
          new Notice("Vault with same name already exist");
          return false;
        }
        if (list.find(({ path }) => path === config.path)) {
          new Notice("Vault with same path already exist");
          return false;
        }

        list.push(config);
        tab.plugin.saveSettings().then(() => tab.display());
        return true;
      }).open();
    });
  });
}
