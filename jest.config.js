module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './.babelrc.jest.js' }]
  },
  collectCoverageFrom: [
    'lib/**/*.js',
    'pages/api/**/*.js',
    '!pages/api/_*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};
