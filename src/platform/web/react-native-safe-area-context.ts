import React from 'react';

export const SafeAreaProvider = ({ children }) => React.createElement('div', { style: { height: '100%' } }, children);
export const SafeAreaView = ({ children, style }) => React.createElement('div', { style: { ...style, height: '100%' } }, children);
export const useSafeAreaInsets = () => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const SafeAreaInsetsContext = {
  Consumer: ({ children }) => children({ top: 0, right: 0, bottom: 0, left: 0 }),
};

export const initialWindowMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  SafeAreaInsetsContext,
  initialWindowMetrics,
};
