const { expect } = require('@jest/globals');
global.expect = expect;

// Global test timeout
jest.setTimeout(10000);

// Mock requestAnimationFrame and cancelAnimationFrame
const now = Date.now();
let rafTime = now;

global.requestAnimationFrame = function(callback) {
  rafTime += 16; // Simulate 60fps (1000ms / 60 ≈ 16ms)
  return setTimeout(() => {
    callback(rafTime);
  }, 0);
};

global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// Configure fake timers for all tests
beforeAll(() => {
  jest.useFakeTimers({
    enableGlobally: true,
    now: now,
    timerLimit: 10000,
    advanceTimers: true,
    doNotFake: ['setImmediate'] // Allow setImmediate to work normally
  });
});

afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  rafTime = now;
  jest.setSystemTime(now);
  jest.clearAllMocks();
  jest.clearAllTimers();
});
