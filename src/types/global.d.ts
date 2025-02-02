/// <reference types="react" />
/// <reference types="react-native" />

import type { ReactNode } from 'react';
import type { ViewProps, TextProps, TouchableOpacityProps, TextInputProps } from 'react-native';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase.generated';
import type { JournalEntry, JournalEntryUpdate } from '@/types/supabase';

declare module '@/components/theme/ThemeProvider' {
  export interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
  }
  export function useTheme(): ThemeContextType;
  export function ThemeProvider(props: { children: ReactNode }): JSX.Element;
}

declare module '@/integrations/supabase/client' {
  export const supabase: SupabaseClient<Database>;
}

declare module '@/types/journal' {
  export interface JournalEntryFormProps {
    onEntryAdded: () => void;
  }

  export interface JournalEntryCardProps {
    entry: JournalEntry;
    onEdit: (entry: JournalEntry) => void;
    onDelete: (id: string) => void;
  }

  export interface EditEntryModalProps {
    visible: boolean;
    entry: JournalEntry | null;
    onClose: () => void;
    onSave: (data: JournalEntryUpdate) => Promise<void>;
  }

  export interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
  }
}

declare module 'react-native' {
  export interface ViewStyle {
    [key: string]: any;
  }
  
  export interface TextStyle {
    [key: string]: any;
  }

  export interface ViewProps {
    style?: ViewStyle;
    children?: React.ReactNode;
  }

  export interface TextProps {
    style?: TextStyle;
    children?: React.ReactNode;
  }

  export interface TextInputProps {
    style?: TextStyle;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    multiline?: boolean;
    numberOfLines?: number;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    textAlign?: 'left' | 'center' | 'right';
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  }

  export interface TouchableOpacityProps {
    style?: ViewStyle;
    onPress?: () => void;
    children?: React.ReactNode;
    activeOpacity?: number;
    disabled?: boolean;
  }

  export interface ViewProps {
    style?: ViewStyle;
    children?: React.ReactNode;
    onLayout?: (event: { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }) => void;
  }

  export interface FlatListProps<T> {
    data: ReadonlyArray<T>;
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement | null;
    keyExtractor?: (item: T, index: number) => string;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    refreshControl?: React.ReactElement;
    ListEmptyComponent?: React.ReactElement | (() => React.ReactElement);
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
  }
}
