import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase/client';
import { Database } from '../../lib/supabase/types';
import type { Json } from '../../lib/supabase/types';
import { handleImageUpload } from '../../utils/upload/fileUpload';

type LibraryItem = Database['public']['Tables']['library_items']['Row'];

export const LibraryScreen: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'video' | 'note'>('all');

  useEffect(() => {
    loadLibraryItems();
  }, []);

  const loadLibraryItems = async () => {
    try {
      setIsLoading(true);
      const { data: libraryData, error } = await supabase
        .from('library_items')
        .select()
        .order('created_at', { ascending: false })
        .returns<LibraryItem[]>();

      if (error) throw error;
      if (libraryData) {
        setItems(libraryData);
      }
    } catch (error) {
      console.error('Error loading library items:', error);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const addItem = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      setIsUploading(true);
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      let fileDetails = null;
      let uploadedContent = content;
      
      // Handle image upload if content is empty (assuming image upload)
      if (!content.trim()) {
        const uploadResult = await handleImageUpload();
        if (uploadResult) {
          fileDetails = uploadResult.fileDetails;
          uploadedContent = uploadResult.url;
        } else {
          setIsUploading(false);
          return; // User cancelled upload
        }
      }

      // Determine content type
      const isYouTubeUrl = uploadedContent.includes('youtube.com') || uploadedContent.includes('youtu.be');
      const type = fileDetails ? 'image' : isYouTubeUrl ? 'video' : 'note';

      // Prepare file details in the correct format
      const formattedFileDetails = fileDetails ? {
        ...fileDetails,
        cloudinary: {
          ...fileDetails.cloudinary,
          url: uploadedContent
        }
      } : null;

      const insertData = {
        title: title.trim(),
        content: uploadedContent,
        type,
        user_id: userId,
        file_details: formattedFileDetails as Json,
      } satisfies Database['public']['Tables']['library_items']['Insert'];

      const { data: item, error } = await supabase
        .from('library_items')
        .insert(insertData)
        .select()
        .returns<LibraryItem>()
        .single();

      if (error) throw error;
      if (item) {
        setItems([item, ...items]);
        setTitle('');
        setContent('');
      }
    } catch (error) {
      console.error('Error adding library item:', error);
      Alert.alert('Error', 'Failed to add item to library');
    }
  };

  const toggleStar = async (item: LibraryItem) => {
    try {
      const { data: updatedItem, error } = await supabase
        .from('library_items')
        .update({ is_starred: !item.is_starred })
        .eq('id', item.id)
        .select()
        .returns<LibraryItem>()
        .single();

      if (error) throw error;
      if (updatedItem) {
        setItems(currentItems => 
          currentItems.map(i => i.id === updatedItem.id ? updatedItem : i)
        );
      }
    } catch (error) {
      console.error('Error updating library item:', error);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const renderItem = ({ item }: { item: LibraryItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={[styles.starButton, item.is_starred && styles.starButtonActive]}
        onPress={() => toggleStar(item)}
      >
        <Text style={styles.starButtonText}>★</Text>
      </TouchableOpacity>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemText} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.itemType}>
          {item.type === 'video' ? '📹 Video' : '📝 Note'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'video' && styles.filterButtonActive]}
            onPress={() => setFilter('video')}
          >
            <Text style={styles.filterButtonText}>Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'note' && styles.filterButtonActive]}
            onPress={() => setFilter('note')}
          >
            <Text style={styles.filterButtonText}>Notes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        refreshing={isLoading}
        onRefresh={loadLibraryItems}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
        />
        <TextInput
          style={[styles.input, styles.contentInput]}
          value={content}
          onChangeText={setContent}
          placeholder="Content or YouTube URL"
          multiline
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.imageButton]}
            onPress={() => {
              setContent('');
              addItem();
            }}
            disabled={!title.trim() || isUploading}
          >
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={addItem}
            disabled={!title.trim() || (!content.trim() && isUploading)}
          >
            <Text style={styles.buttonText}>
              {isUploading ? 'Uploading...' : 'Add to Library'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#0284c7',
  },
  filterButtonText: {
    color: '#64748b',
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  starButton: {
    padding: 8,
    marginRight: 8,
  },
  starButtonActive: {
    opacity: 1,
  },
  starButtonText: {
    fontSize: 20,
    color: '#eab308',
    opacity: 0.3,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#64748b',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contentInput: {
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButton: {
    backgroundColor: '#64748b',
  },
  addButton: {
    backgroundColor: '#0284c7',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LibraryScreen;
