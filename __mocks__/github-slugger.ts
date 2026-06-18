// github-slugger ships as ESM, which jest does not transform by default.
// The tests that import ref.ts only exercise the pure anchor/subpath parsers,
// so a minimal slug implementation is sufficient.
export default class GithubSlugger {
  slug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
  }

  reset(): void {
    // no-op
  }
}
