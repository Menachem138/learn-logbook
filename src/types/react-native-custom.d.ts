declare module 'react-native' {
  export * from 'react-native/types';
  
  export interface ViewProps {
    children?: React.ReactNode;
    style?: any;
    testID?: string;
  }

  export interface TextProps {
    children?: React.ReactNode;
    style?: any;
    numberOfLines?: number;
  }

  export interface TouchableOpacityProps {
    children?: React.ReactNode;
    style?: any;
    onPress?: () => void;
    disabled?: boolean;
    activeOpacity?: number;
  }
}

declare module '@expo/vector-icons/Ionicons' {
  import { ComponentType } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  const Ionicons: ComponentType<IconProps>;
  export default Ionicons;
}
