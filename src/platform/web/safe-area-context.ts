import React from 'react';

export const SafeAreaProvider = ({ children }) => children;
export const SafeAreaView = ({ children, style }) => React.createElement('div', { style }, children);

export const useSafeAreaInsets = () => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export default { SafeAreaProvider, SafeAreaView, useSafeAreaInsets };
