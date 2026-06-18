<script lang="ts">
  import NoteComponent from "./NoteComponent.svelte";
  import { dendronBridgeVaultList } from "../store";
  import { DendronBridgeVault } from "../engine/dendronBridgeVault";
  import { Note } from "../engine/note";

  const children: Record<string, NoteComponent> = {};

  let pendingOpenNote: Note | null = null;

  export function focusTo(vault: DendronBridgeVault, note: Note) {
    if (pendingOpenNote === note) {
      pendingOpenNote = null;
      return;
    }
    const vaultComponent = children[vault.config.name];
    if (!vaultComponent) return;

    const pathNotes = note.getPathNotes();
    pathNotes.shift();
    vaultComponent.focusNotes(pathNotes);
  }

  function onOpenNote(e: CustomEvent<Note>) {
    pendingOpenNote = e.detail;
  }

  export function collapseAllButTop() {
    Object.values(children).forEach((child) => child.collapseAllButTop());
  }
</script>

<div>
  {#each $dendronBridgeVaultList as vault (vault.config.name)}
    <NoteComponent
      note={vault.tree.root}
      isRoot
      {vault}
      bind:this={children[vault.config.name]}
      on:openNote={onOpenNote}
    />
  {/each}
</div>
