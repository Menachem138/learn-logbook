/// <reference types="react" />
/// <reference types="react-native" />

import type { ComponentType } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';

declare module '@expo/vector-icons/Ionicons' {
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: ViewStyle;
  }
  
  const Ionicons: ComponentType<IconProps>;
  export default Ionicons;
}

declare module 'react-native-toast-message' {
  interface ToastProps {
    type?: 'success' | 'error' | 'info';
    position?: 'top' | 'bottom';
    text1?: string;
    text2?: string;
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
  }

  const Toast: {
    show: (options: ToastProps) => void;
    hide: () => void;
  };

  export default Toast;
}
