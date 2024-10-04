export default {
    collectCoverage: false,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '\\.int\\.test\\.ts$',
    testTimeout: 8 * 1000,
    maxWorkers: 1,
    rootDir: 'src',
    globalSetup: './tests/setup/global-setup.ts',
    globalTeardown: './tests/setup/global-teardown.ts',
};
    