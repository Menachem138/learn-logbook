declare module 'react-native' {
  export interface ViewProps {
    children?: React.ReactNode;
    style?: any;
  }

  export interface TextProps {
    children?: React.ReactNode;
    style?: any;
  }

  export interface TouchableOpacityProps {
    children?: React.ReactNode;
    style?: any;
    onPress?: () => void;
  }
}

declare module '@expo/vector-icons/Ionicons' {
  import { Component } from 'react';
  export default class Ionicons extends Component<{
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }> {}
}
