/// <reference types="react" />
/// <reference types="react-native" />

declare namespace JSX {
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
    View: import('react-native').ViewProps;
    Text: import('react-native').TextProps;
    TextInput: import('react-native').TextInputProps;
    TouchableOpacity: import('react-native').TouchableOpacityProps;
    SafeAreaView: import('react-native').SafeAreaViewProps;
    FlatList: import('react-native').FlatListProps<any>;
    RefreshControl: import('react-native').RefreshControlProps;
    [elemName: string]: any;
  }
}
