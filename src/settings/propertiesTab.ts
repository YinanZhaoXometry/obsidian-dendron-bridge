import { Notice, Setting, ToggleComponent } from "obsidian";
import type { DendronBridgeSettingTab } from "./settingTab";
import { DEFAULT_SETTINGS } from "./defaults";
import { ConfirmationModal } from "../modal/confirmationModal";

export function renderPropertiesTab(tab: DendronBridgeSettingTab, containerEl: HTMLElement) {
  let generateIdToggle: ToggleComponent;
  let generateTitleToggle: ToggleComponent;
  let generateDescToggle: ToggleComponent;
  let generateTagsToggle: ToggleComponent;
  let generateCreatedToggle: ToggleComponent;

  new Setting(containerEl)
    .setName("Auto-generate Properties")
    .setHeading()
    .setDesc("Generate properties for new files")
    .addToggle((toggle) => {
      toggle.setValue(tab.plugin.settings.autoGenerateFrontmatter).onChange(async (value) => {
        tab.plugin.settings.autoGenerateFrontmatter = value;
        if (!value) {
          tab.plugin.settings.generateId = false;
          tab.plugin.settings.generateTags = false;
          generateIdToggle.setValue(false);
          generateTitleToggle.setValue(false);
          generateDescToggle.setValue(false);
          generateTagsToggle.setValue(false);
          generateCreatedToggle.setValue(false);
          generateCreatedToggle.setValue(false);
        }
        generateIdToggle.setDisabled(!value);
        generateTitleToggle.setDisabled(!value);
        generateTagsToggle.setDisabled(!value);
        generateTagsToggle.setDisabled(!value);
        generateDescToggle.setDisabled(!value);
        generateCreatedToggle.setDisabled(!value);
        await tab.plugin.saveSettings();
      });
    });

  const handleDisabledToggleClick = (toggle: ToggleComponent, settingName: string) => {
    if (toggle.disabled) {
      new Notice(`Enable "Auto-generate Properties" to use ${settingName}`);
    }
  };

  new Setting(containerEl)
    .setName("ID Property")
    .setDesc("Generate a 23 character long, unique alphanumeric ID for new files")
    .addToggle((toggle) => {
      generateIdToggle = toggle;
      toggle
        .setValue(tab.plugin.settings.generateId)
        .setDisabled(!tab.plugin.settings.autoGenerateFrontmatter)
        .onChange(async (value) => {
          tab.plugin.settings.generateId = value;
          await tab.plugin.saveSettings();
        });

      toggle.toggleEl.addEventListener("click", () =>
        handleDisabledToggleClick(toggle, "ID Property")
      );
    });

  new Setting(containerEl)
    .setName("Title Property")
    .setDesc("Generate a title property for new files")
    .addToggle((toggle) => {
      generateTitleToggle = toggle;
      toggle
        .setValue(tab.plugin.settings.generateTitle)
        .setDisabled(!tab.plugin.settings.autoGenerateFrontmatter)
        .onChange(async (value) => {
          tab.plugin.settings.generateTitle = value;
          await tab.plugin.saveSettings();
        });

      toggle.toggleEl.addEventListener("click", () =>
        handleDisabledToggleClick(toggle, "Title Property")
      );
    });

  new Setting(containerEl)
    .setName("Description Property")
    .setDesc("Generate a description property for new files")
    .addToggle((toggle) => {
      generateDescToggle = toggle;
      toggle
        .setValue(tab.plugin.settings.generateDesc)
        .setDisabled(!tab.plugin.settings.autoGenerateFrontmatter)
        .onChange(async (value) => {
          tab.plugin.settings.generateDesc = value;
          await tab.plugin.saveSettings();
        });

      toggle.toggleEl.addEventListener("click", () =>
        handleDisabledToggleClick(toggle, "Description Property")
      );
    });

  new Setting(containerEl)
    .setName("Created Date Property")
    .setDesc("Generate a property that stores the created date of the new file")
    .addToggle((toggle) => {
      generateCreatedToggle = toggle;
      toggle
        .setValue(tab.plugin.settings.generateCreated)
        .setDisabled(!tab.plugin.settings.autoGenerateFrontmatter)
        .onChange(async (value) => {
          tab.plugin.settings.generateCreated = value;
          await tab.plugin.saveSettings();
        });

      toggle.toggleEl.addEventListener("click", () =>
        handleDisabledToggleClick(toggle, "Created Date Property")
      );
    });

  new Setting(containerEl)
    .setName("Tag Property")
    .setDesc("Generate tag property for native Obsidian tags")
    .addToggle((toggle) => {
      generateTagsToggle = toggle;
      toggle
        .setValue(tab.plugin.settings.generateTags)
        .setDisabled(!tab.plugin.settings.autoGenerateFrontmatter)
        .onChange(async (value) => {
          tab.plugin.settings.generateTags = value;
          await tab.plugin.saveSettings();
        });

      toggle.toggleEl.addEventListener("click", () =>
        handleDisabledToggleClick(toggle, "Tags Property")
      );
    });

  containerEl.createEl("h4", { text: "Property Keys" });

  new Setting(containerEl)
    .setName("ID Key")
    .setDesc("Property to use for the note ID")
    .addText((text) =>
      text
        .setPlaceholder("id")
        .setValue(tab.plugin.settings.idKey)
        .onChange(async (value) => {
          tab.plugin.settings.idKey = value.trim() || DEFAULT_SETTINGS.idKey;
          await tab.plugin.saveSettings();
        })
    );

  new Setting(containerEl)
    .setName("Title Key")
    .setDesc("Property to use for the note title in the Tree and Lookup")
    .addText((text) =>
      text
        .setPlaceholder("title")
        .setValue(tab.plugin.settings.titleKey)
        .onChange(async (value) => {
          tab.plugin.settings.titleKey = value.trim() || DEFAULT_SETTINGS.titleKey;
          await tab.plugin.saveSettings();
        })
    );

  new Setting(containerEl)
    .setName("Description Key")
    .setDesc("Property to use for note description in Lookup")
    .addText((text) =>
      text
        .setPlaceholder("desc")
        .setValue(tab.plugin.settings.descKey)
        .onChange(async (value) => {
          tab.plugin.settings.descKey = value.trim() || DEFAULT_SETTINGS.descKey;
          await tab.plugin.saveSettings();
        })
    );

  new Setting(containerEl)
    .setName("Created Key")
    .setDesc("Property to use for note creation date")
    .addText((text) =>
      text
        .setPlaceholder("created")
        .setValue(tab.plugin.settings.createdKey)
        .onChange(async (value) => {
          tab.plugin.settings.createdKey = value.trim() || DEFAULT_SETTINGS.createdKey;
          await tab.plugin.saveSettings();
        })
    );

  new Setting(containerEl)
    .setName("Created Date Format")
    .setDesc("Choose the format for the created date")
    .addDropdown((dropdown) => {
      dropdown
        .addOption("yyyy-mm-dd", "YYYY-MM-DD")
        .addOption("unix", "Unix (Milliseconds)")
        .setValue(tab.plugin.settings.createdFormat)
        .onChange(async (value: "unix" | "yyyy-mm-dd") => {
          tab.plugin.settings.createdFormat = value;
          await tab.plugin.saveSettings();
        });
    });

  new Setting(containerEl).addButton((btn) =>
    btn.setButtonText("Reset Property Keys").onClick(async () => {
      const confirmed = await new Promise<boolean>((resolve) => {
        const modal = new ConfirmationModal(
          tab.app,
          "Reset Property Keys",
          "This will reset all property keys to their default values. Are you sure you want to continue?",
          "Reset",
          "Cancel",
          (result) => resolve(result)
        );
        modal.open();
      });

      if (confirmed) {
        tab.plugin.settings.idKey = DEFAULT_SETTINGS.idKey;
        tab.plugin.settings.titleKey = DEFAULT_SETTINGS.titleKey;
        tab.plugin.settings.descKey = DEFAULT_SETTINGS.descKey;
        tab.plugin.settings.createdKey = DEFAULT_SETTINGS.createdKey;
        tab.plugin.settings.createdFormat = DEFAULT_SETTINGS.createdFormat;
        await tab.plugin.saveSettings();
        tab.display();
        new Notice("Property keys have been reset to default values.");
      }
    })
  );
}
