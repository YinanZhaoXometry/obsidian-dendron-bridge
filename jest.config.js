/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  projects: [
    {
      displayName: "engine",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/*.test.ts"],
      testPathIgnorePatterns: ["/node_modules/", "/temp/"],
    },
    {
      displayName: "ui",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: ["**/*.test.tsx"],
      testPathIgnorePatterns: ["/node_modules/", "/temp/"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    },
  ],
};
