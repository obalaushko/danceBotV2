module.exports = {
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/src/'],
    testEnvironment: 'node',
};
