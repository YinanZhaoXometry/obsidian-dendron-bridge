// Framework-agnostic settings + vault type definitions.
// Kept free of Obsidian UI / plugin imports so the engine can depend on these
// types without pulling in the settings tab or the plugin entry (breaks the
// engine -> settings -> main dependency cycle).

export interface VaultPropertySettings {
  autoGenerateFrontmatter?: boolean;
  generateId?: boolean;
  generateTitle?: boolean;
  generateDesc?: boolean;
  generateCreated?: boolean;
  generateTags?: boolean;
  idKey?: string;
  titleKey?: string;
  descKey?: string;
  createdKey?: string;
  createdFormat?: "yyyy-mm-dd" | "unix";
}

export interface VaultConfig {
  path: string;
  name: string;
  isSecret?: boolean;
  properties?: VaultPropertySettings;
}

export interface DendronBridgePluginSettings {
  vaultPath?: string;
  vaultList: VaultConfig[];
  autoReveal: boolean;
  customResolver: boolean;
  customGraph: boolean;
  enableCanvasSupport: boolean;
  hierarchySeparator: string;
  autoGenerateFrontmatter: boolean;
  idKey: string;
  titleKey: string;
  descKey: string;
  createdKey: string;
  createdFormat: "yyyy-mm-dd" | "unix";
  generateTags: boolean;
  generateId: boolean;
  generateTitle: boolean;
  generateDesc: boolean;
  generateCreated: boolean;
  fuzzySearchFileNameWeight: number;
  fuzzySearchThreshold: number;
  excludedPaths: string[];
  pluginIcon: string;
  previewTabs: boolean;
  previewTabsAutoPromote: boolean;
}
