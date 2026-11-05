module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  setupFilesAfterEnv: ['./setup.ts'],
  testTimeout: 120000,
  maxWorkers: 1
};
