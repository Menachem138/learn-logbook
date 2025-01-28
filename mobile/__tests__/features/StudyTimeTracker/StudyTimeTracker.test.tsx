import React from 'react';
import renderer from 'react-test-renderer';
import StudyTimeTracker from '../../../src/features/StudyTimeTracker/index';

jest.mock('../../../src/features/StudyTimeTracker/useTimer', () => ({
  useTimer: () => ({
    time: 0,
    timerState: 'STOPPED',
    totalStudyTime: 0,
    totalBreakTime: 0,
    startTimer: jest.fn(),
    stopTimer: jest.fn(),
  }),
}));

describe('StudyTimeTracker', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<StudyTimeTracker />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<StudyTimeTracker />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
