// This file is required to exclude obsidian package dependency from jest unit tests
import moment from "moment";

export { moment as moment };

// Minimal stubs used by UI components under test.
export function getIcon(): SVGElement | null {
  return null;
}
