import { DendronBridgePluginSettings } from "../types/settings";
import { dendronBridgeActivityBarName } from "../icons";

export const DEFAULT_SETTINGS: DendronBridgePluginSettings = {
  vaultList: [
    {
      name: "root",
      path: "/",
    },
  ],
  autoReveal: true,
  customResolver: false,
  customGraph: false,
  enableCanvasSupport: false,
  hierarchySeparator: ".",
  autoGenerateFrontmatter: true,
  generateTags: false,
  generateId: false,
  generateTitle: true,
  generateDesc: true,
  generateCreated: false,
  idKey: "id",
  titleKey: "title",
  descKey: "desc",
  createdKey: "created",
  createdFormat: "yyyy-mm-dd",
  fuzzySearchFileNameWeight: 0.6,
  fuzzySearchThreshold: 0.2,
  excludedPaths: [],
  pluginIcon: dendronBridgeActivityBarName,
};
