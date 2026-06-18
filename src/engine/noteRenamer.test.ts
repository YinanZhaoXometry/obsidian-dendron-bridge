import { App, TFile } from "obsidian";
import { NoteRenamer } from "./noteRenamer";
import { NoteFinder } from "./noteFinder";
import { NoteTree } from "./noteTree";
import { DendronBridgePluginSettings } from "../types/settings";

function makeFile(path: string): TFile {
  const segments = path.split("/");
  const name = segments[segments.length - 1];
  const dir = segments.slice(0, -1).join("/");
  const dotIndex = name.lastIndexOf(".");
  const basename = dotIndex >= 0 ? name.slice(0, dotIndex) : name;
  const extension = dotIndex >= 0 ? name.slice(dotIndex + 1) : "";
  return {
    path,
    name,
    basename,
    extension,
    parent: { path: dir },
  } as unknown as TFile;
}

function setup(children: TFile[]) {
  const renameFile = jest.fn().mockResolvedValue(undefined);
  const app = {
    fileManager: { renameFile },
    vault: { getAbstractFileByPath: jest.fn(() => undefined) },
  } as unknown as App;

  const finder = { findChildren: jest.fn(() => children) } as unknown as NoteFinder;
  const tree = {
    getFromFileName: jest.fn(() => undefined),
    updateNoteFile: jest.fn(),
  } as unknown as NoteTree;

  const renamer = new NoteRenamer(app, finder, tree, {} as DendronBridgePluginSettings);
  return { renamer, renameFile, finder };
}

describe("NoteRenamer", () => {
  it("renames a note to a new path in the same folder", async () => {
    const file = makeFile("vault/abc.def.md");
    const { renamer, renameFile } = setup([]);

    await renamer.renameNote(file, "abc.xyz");

    expect(renameFile).toHaveBeenCalledTimes(1);
    expect(renameFile).toHaveBeenCalledWith(file, "vault/abc.xyz.md");
  });

  it("renames descendant notes before the note itself", async () => {
    const file = makeFile("vault/abc.def.md");
    const child = makeFile("vault/abc.def.child.md");
    const { renamer, renameFile } = setup([child]);

    await renamer.renameNote(file, "abc.xyz");

    expect(renameFile).toHaveBeenCalledTimes(2);
    expect(renameFile).toHaveBeenNthCalledWith(1, child, "vault/abc.xyz.child.md");
    expect(renameFile).toHaveBeenNthCalledWith(2, file, "vault/abc.xyz.md");
  });
});
