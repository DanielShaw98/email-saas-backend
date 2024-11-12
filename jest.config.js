/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      isolatedModules: true,
    }],
  },
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  preset: 'ts-jest',
};
