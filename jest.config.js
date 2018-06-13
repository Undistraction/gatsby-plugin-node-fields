module.exports = {
  bail: true,
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [`src/**/*.js`],
  coveragePathIgnorePatterns: [`src/index.js`],
  coverageReporters: [`lcov`, `html`],
  setupFiles: [],
  modulePathIgnorePatterns: [`testHelpers/`],
}
