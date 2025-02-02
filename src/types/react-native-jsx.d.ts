/// <reference types="react" />
/// <reference types="react-native" />

import type { 
  ViewProps, 
  TextProps, 
  TextInputProps, 
  TouchableOpacityProps, 
  SafeAreaViewProps, 
  FlatListProps, 
  RefreshControlProps 
} from 'react-native';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      view: ViewProps;
      text: TextProps;
      textInput: TextInputProps;
      touchableOpacity: TouchableOpacityProps;
      safeAreaView: SafeAreaViewProps;
      flatList: FlatListProps<any>;
      refreshControl: RefreshControlProps;
      [elemName: string]: any;
    }
  }
}
