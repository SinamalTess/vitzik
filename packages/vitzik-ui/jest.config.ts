import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testEnvironment: "jsdom",
  coveragePathIgnorePatterns: [
    "/src/stories",
    "/src/types",
    "/src/reportWebVitals.js",
    "/index.js",
    "/index.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  testPathIgnorePatterns: ["/node_modules/", "lib"],
  displayName: "vitzik-ui",
  moduleNameMapper: {
    "^.+\\.(css|less|scss|sass)$": "babel-jest",
  },
};
export default config;
