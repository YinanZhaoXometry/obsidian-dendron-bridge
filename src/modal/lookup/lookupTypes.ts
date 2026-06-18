import { FuseResultMatch } from "fuse.js";
import { Note } from "../../engine/note";
import { DendronBridgeVault } from "../../engine/dendronBridgeVault";

export interface LookupItem {
  note: Note;
  vault: DendronBridgeVault;
  matches?: readonly FuseResultMatch[];
  excluded: boolean;
  exists: boolean;
}

export type LookupResult = LookupItem | { type: "create_new" };
