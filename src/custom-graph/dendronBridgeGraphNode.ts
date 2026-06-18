import { TFile } from "obsidian";
import { Note } from "src/engine/note";
import { DendronBridgeVault } from "src/engine/dendronBridgeVault";

export type ConnectionType = {
  type: "backlink" | "hierarchy";
  sourceNode: string;
  targetNode: string;
  weight: number;
};

export type DendronBridgeGraphNode = {
  file: TFile;
  connections: ConnectionType[];
} & (
  | {
      type: "note";
      vault: DendronBridgeVault;
      note: Note;
    }
  | {
      type: "file";
    }
);
