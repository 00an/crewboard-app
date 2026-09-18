// jest.config.js
//
// Standard Next.js Jest setup (via next/jest, which wires up SWC transforms
// and env/module resolution to match the app's own Next.js config) plus
// jsdom so component tests can render into a fake DOM.
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

module.exports = createJestConfig(customJestConfig);
