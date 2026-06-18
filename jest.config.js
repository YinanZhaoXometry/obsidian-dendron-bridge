/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  projects: [
    {
      displayName: "engine",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/*.test.ts"],
    },
    {
      displayName: "ui",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: ["**/*.test.tsx"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    },
  ],
};
