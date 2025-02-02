declare module 'react-native' {
  import * as React from 'react';
  
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

  export interface TextInputProps {
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

  export interface TouchableOpacityProps {
    children?: React.ReactNode;
    style?: any;
    onPress?: () => void;
    disabled?: boolean;
    activeOpacity?: number;
  }

  export interface FlatListProps<T> {
    data: ReadonlyArray<T>;
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement | null;
    keyExtractor?: (item: T, index: number) => string;
    refreshControl?: React.ReactElement;
    ListEmptyComponent?: React.ReactElement | null;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
  }

  export interface SafeAreaViewProps extends ViewProps {}
  export interface RefreshControlProps {
    refreshing: boolean;
    onRefresh: () => void;
    tintColor?: string;
  }

  export class View extends React.Component<ViewProps> {}
  export class Text extends React.Component<TextProps> {}
  export class TextInput extends React.Component<TextInputProps> {}
  export class TouchableOpacity extends React.Component<TouchableOpacityProps> {}
  export class SafeAreaView extends React.Component<SafeAreaViewProps> {}
  export class RefreshControl extends React.Component<RefreshControlProps> {}
  export class FlatList<T> extends React.Component<FlatListProps<T>> {}
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

declare module 'react-native-toast-message' {
  import { ComponentType } from 'react';

  interface ToastProps {
    type?: 'success' | 'error' | 'info';
    position?: 'top' | 'bottom';
    text1?: string;
    text2?: string;
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
    onShow?: () => void;
    onHide?: () => void;
  }

  const Toast: {
    show: (options: ToastProps) => void;
    hide: () => void;
  };

  export default Toast;
}
