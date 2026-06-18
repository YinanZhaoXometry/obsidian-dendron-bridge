import { render, screen, fireEvent } from "@testing-library/react";
import { Note } from "../../engine/note";
import { DendronBridgeVault } from "../../engine/dendronBridgeVault";
import type DendronBridgePlugin from "../../main";
import { PluginContext } from "../context/PluginContext";
import { StoreProvider } from "../context/StoreContext";
import { NoteItem } from "./NoteItem";

// Avoid pulling the Obsidian modal/command chain into the jsdom test.
jest.mock("../hooks/useNoteActions", () => ({
  useNoteActions: () => ({
    openNoteFile: jest.fn(),
    createCurrentNote: jest.fn(),
    deleteCurrentNote: jest.fn(),
    openLookup: jest.fn(),
    openRenameModal: jest.fn(),
    showContextMenu: jest.fn(),
  }),
}));

function makeNote(name: string, title: string, children: Note[] = []): Note {
  return { name, title, children, file: {} } as unknown as Note;
}

function renderTree(root: Note) {
  const vault = {
    config: { name: "root" },
    tree: { flatten: () => [] },
  } as unknown as DendronBridgeVault;

  return render(
    <PluginContext.Provider value={{} as unknown as DendronBridgePlugin}>
      <StoreProvider>
        <NoteItem note={root} vault={vault} isRoot onOpenNote={jest.fn()} />
      </StoreProvider>
    </PluginContext.Provider>
  );
}

describe("NoteItem", () => {
  it("renders the note title", () => {
    const root = makeNote("root", "Root Note");
    renderTree(root);
    expect(screen.getByText("Root Note")).toBeInTheDocument();
  });

  it("hides children until expanded, then reveals them on toggle", () => {
    const child = makeNote("child", "Child Note");
    const root = makeNote("root", "Root Note", [child]);
    const { container } = renderTree(root);

    // Collapsed by default.
    expect(screen.queryByText("Child Note")).not.toBeInTheDocument();

    const collapseIcon = container.querySelector(".collapse-icon");
    expect(collapseIcon).not.toBeNull();
    fireEvent.click(collapseIcon as Element);

    expect(screen.getByText("Child Note")).toBeInTheDocument();
  });
});
