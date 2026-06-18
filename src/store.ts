import { derived, get, writable } from "svelte/store";
import type DendronBridgePlugin from "./main";
import { TFile } from "obsidian";
import { DendronBridgeVault } from "./engine/dendronBridgeVault";
import { Note } from "./engine/note";

export const plugin = writable<DendronBridgePlugin>();
export const getPlugin = () => get(plugin);

export const activeFile = writable<TFile | null>();

export const dendronBridgeVaultList = writable<DendronBridgeVault[]>([]);
export const getDendronBridgeVaultList = () => get(dendronBridgeVaultList);

export const selectedNotes = writable<Note[]>([]);

export const showVaultPath = derived(dendronBridgeVaultList, ($list) => $list.length > 1);
