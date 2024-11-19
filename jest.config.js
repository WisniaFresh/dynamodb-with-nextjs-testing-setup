const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Tells Jest to use ts-jest for .ts/.tsx files
  },
  modulePathIgnorePatterns: ['<rootDir>/playwright/'],
};
