import { App, SuggestModal, setIcon, getIconIds, ButtonComponent } from "obsidian";

export class IconSuggestModal extends SuggestModal<string> {
  private onSelectCallback: (iconId: string | null) => void;

  constructor(app: App, onSelect: (iconId: string | null) => void) {
    super(app);
    this.onSelectCallback = onSelect;
  }

  getSuggestions(query: string): string[] | Promise<string[]> {
    const allIcons = getIconIds();
    if (!query) return allIcons;
    return allIcons.filter((icon) => icon.toLowerCase().includes(query.toLowerCase()));
  }

  renderSuggestion(value: string, el: HTMLElement): void {
    setIcon(el, value);
    el.style.width = "fit-content";
    el.style.height = "fit-content";
    el.style.display = "flex";
    el.style.alignItems = "center";
    this.resultContainerEl.style.display = "flex";
    this.resultContainerEl.style.flexFlow = "row wrap";
  }

  onChooseSuggestion(iconId: string, evt: MouseEvent | KeyboardEvent): void {
    this.onSelectCallback(iconId);
  }
}

export function attachIconModal(
  button: ButtonComponent,
  onSelect: (iconId: string | null) => void
) {
  const modal = new IconSuggestModal(this.app, onSelect);
  const modalEl = modal.modalEl;
  const buttonRect = button.buttonEl.getBoundingClientRect();
  const width = 248;

  modalEl.style.width = `${248}px`;
  modalEl.style.height = "240px";
  modalEl.style.position = "absolute";
  modalEl.style.top = `${buttonRect.bottom}px`;
  modalEl.style.left = `${buttonRect.right - width}px`;
  modalEl.style.transform = "none";
  modal.open();
}
