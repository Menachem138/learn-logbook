import React from 'react';
import { View, Text } from 'react-native';
import renderer from 'react-test-renderer';

const BasicComponent = () => (
  <View>
    <Text>Basic Text</Text>
  </View>
);

describe('BasicComponent', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<BasicComponent />).toJSON();
    expect(tree).toBeTruthy();
  });
});
