import { parseRefAnchor, parseRefSubpath } from "./ref";

describe("parseRefAnchor", () => {
  it("parses the wildcard anchor", () => {
    expect(parseRefAnchor("*")).toEqual({ type: "wildcard" });
  });

  it("parses begin and end anchors", () => {
    expect(parseRefAnchor("^begin")).toEqual({ type: "begin" });
    expect(parseRefAnchor("^end")).toEqual({ type: "end" });
  });

  it("parses block anchors", () => {
    expect(parseRefAnchor("^block-id")).toEqual({ type: "block", name: "block-id" });
  });

  it("parses header anchors with an optional line offset", () => {
    expect(parseRefAnchor("My Heading")).toEqual({
      type: "header",
      name: "My Heading",
      lineOffset: 0,
    });
    expect(parseRefAnchor("My Heading,2")).toEqual({
      type: "header",
      name: "My Heading",
      lineOffset: 2,
    });
  });
});

describe("parseRefSubpath", () => {
  it("returns undefined for an empty string", () => {
    expect(parseRefSubpath("")).toBeUndefined();
  });

  it("parses a single block anchor", () => {
    expect(parseRefSubpath("^abc")).toEqual({
      text: "^abc",
      start: { type: "block", name: "abc" },
      end: undefined,
    });
  });

  it("parses a start:#end header range", () => {
    expect(parseRefSubpath("Intro:#Summary")).toEqual({
      text: "Intro:#Summary",
      start: { type: "header", name: "Intro", lineOffset: 0 },
      end: { type: "header", name: "Summary", lineOffset: 0 },
    });
  });
});
