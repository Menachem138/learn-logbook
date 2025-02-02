import 'react-native';

declare module 'react-native' {
  namespace ReactNative {
    interface ViewProps {
      children?: React.ReactNode;
      style?: any;
      testID?: string;
    }

    interface TextProps {
      children?: React.ReactNode;
      style?: any;
      numberOfLines?: number;
    }

    interface TouchableOpacityProps {
      children?: React.ReactNode;
      style?: any;
      onPress?: () => void;
      disabled?: boolean;
      activeOpacity?: number;
    }

    interface TextInputProps {
      value?: string;
      onChangeText?: (text: string) => void;
      placeholder?: string;
      placeholderTextColor?: string;
      style?: any;
      multiline?: boolean;
      numberOfLines?: number;
      textAlign?: 'left' | 'center' | 'right';
      textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
      onSubmitEditing?: () => void;
      returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    }
  }
}
