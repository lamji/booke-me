import nextJest from 'next/jest.js';

const createNextJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.test.tsx"],
};

export default createNextJestConfig(customJestConfig);
