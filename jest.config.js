/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  roots: [
      "./test"
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [
    './test/__mocks__/client.js'
  ],
  transform: {
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
  },
  moduleNameMapper: {
    "^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
  },
  verbose: true,
  coverageThreshold: {
    "global": {
      "branches": 94,
      "functions": 94,
      "lines": 98,
      "statements": 98
    }
  }
};