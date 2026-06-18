import { isPathExcluded } from "./pathExclusion";

describe("isPathExcluded", () => {
  it("returns false when there are no patterns", () => {
    expect(isPathExcluded("project.notes", [])).toBe(false);
  });

  it("matches a prefix wildcard pattern", () => {
    expect(isPathExcluded("archive.old-note", ["archive.*"])).toBe(true);
    expect(isPathExcluded("project.note", ["archive.*"])).toBe(false);
  });

  it("anchors patterns at the start of the path", () => {
    expect(isPathExcluded("notes.archive.x", ["archive.*"])).toBe(false);
    expect(isPathExcluded("notes", ["notes"])).toBe(true);
    expect(isPathExcluded("notes.sub", ["notes"])).toBe(true);
  });

  it("treats '.' literally and '*' as wildcard", () => {
    expect(isPathExcluded("foo.x.bar", ["foo.*.bar"])).toBe(true);
    expect(isPathExcluded("foo.bar", ["foo.*.bar"])).toBe(false);
    // '.' must not act as a regex any-char
    expect(isPathExcluded("fooXbar", ["foo.bar"])).toBe(false);
  });

  it("matches if any pattern matches", () => {
    expect(isPathExcluded("old/file", ["archive.*", "old/*"])).toBe(true);
  });
});
