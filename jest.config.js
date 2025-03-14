module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  transformIgnorePatterns: [],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    "^md-cms$": "<rootDir>/md-cms.ts"
  },
  modulePathIgnorePatterns: [
    "<rootDir>/md-cms",
    "<rootDir>/md-cms-linux",
    "<rootDir>/md-cms-macos",
    "<rootDir>/md-cms-win.exe"
  ]
};
