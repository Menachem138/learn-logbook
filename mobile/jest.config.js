module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.afterEnv.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  testEnvironment: 'jsdom',
  testTimeout: 60000,
  verbose: true,
  bail: false,
  detectOpenHandles: true,
  forceExit: false,
  maxWorkers: 1,
  watch: false,
  watchAll: false,
  testPathIgnorePatterns: ['/node_modules/'],
  fakeTimers: {
    enableGlobally: true,
    now: 1000000,
    timerLimit: 1000,
    advanceTimers: true
  },
  globals: {
    __DEV__: true
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
