import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.integration\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  moduleNameMapper: { '^@src/(.*)$': '<rootDir>/$1' },
  globalSetup: '<rootDir>/test-utils/jest-global-setup.ts',
  globalTeardown: '<rootDir>/test-utils/jest-global-teardown.ts',
  testTimeout: 60000,
  maxWorkers: 1,
};

export default config;
