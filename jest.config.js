const aliases = require("./build/aliases");

const moduleNameMapper = Object.keys(aliases).reduce((acc, alias) => {
  acc[`^${alias}/(.*)$`] = `<rootDir>${aliases[alias].slice(1)}/$1`;
  return acc;
}, {});

moduleNameMapper["common/(.*)$"] = "<rootDir>/src/common/$1";

module.exports = {
  testRegex: "(/__tests__/.*|\\.spec|\\.test)\\.(ts|js)$",
  // All imported modules in your tests should be mocked automatically
  automock: false,

  clearMocks: true,
  resetMocks: true,
  resetModules: true,
  restoreMocks: true,

  collectCoverage: true,
  // collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  coverageDirectory: "dist/coverage",
  coverageReporters: ["html"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/bundled"],

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: ["dotenv/config"],

  setupFilesAfterEnv: ["jest-extended/all"],

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  preset: "ts-jest",

  testPathIgnorePatterns: ["/dist/", "/node_modules/", "/bundled/"],

  moduleNameMapper,
};
