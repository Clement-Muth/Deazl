import type { Config } from 'jest'
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./"
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.ts"],
  setupFiles: ["jest-canvas-mock"],
  // testSequencer: "<rootDir>/jestTestSequencer.ts",
  resetMocks: true,
  modulePaths: ["<rootDir>/src"],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/MediaStub.ts",
    "\\.(css)$": "<rootDir>/__mocks__/emptyFileStub.ts",
    "^@lingui\\/loader!(.+.po)$": "<rootDir>/src/translations/$1",
    "^~/(.*)$": "<rootDir>/src/$1"
  },
  transformIgnorePatterns: ["node_modules/(?!(ky|@react-hook/throttle|@react-hook/latest)/)"],
  transform: {
    "^.+\\.po$": "<rootDir>/__mocks__/gettextFileTransformer.js",
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: {
              runtime: "automatic"
            }
          }
        }
      }
    ]
  }
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(customJestConfig);

module.exports = customJestConfig;
