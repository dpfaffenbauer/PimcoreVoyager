/**
 * Home Screen
 * Displays Pimcore data objects tree view
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Paragraph, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { PimcoreService } from '../apis/pimcoreService';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<string>('Root');

  useEffect(() => {
    loadObjects();
  }, [parentId]);

  const loadObjects = async () => {
    setLoading(true);
    setError('');
    try {
      // Get all objects from tree endpoint (no class filter at root level)
      const result = await PimcoreService.getDataObjects(
        undefined, // No class filter - show everything
        1,
        100,
        parentId || undefined
      );
      setObjects(result.data || []);
    } catch (error: any) {
      console.error('Error loading objects:', error);
      setError('Failed to load data objects');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: any) => {
    if (item.type === 'folder') {
      // Navigate into folder
      setParentId(item.id);
      setBreadcrumb(item.fullPath || item.key);
    } else {
      // Navigate to detail view for data objects
      navigation.navigate('ObjectDetail', { 
        object: item,
        classDefinition: { id: item.className, name: item.className }
      });
    }
  };

  const handleBackPress = () => {
    if (parentId) {
      // Navigate back up
      setParentId(null);
      setBreadcrumb('Root');
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFolder = item.type === 'folder';
    const depth = (item.fullPath?.split('/').filter((p: string) => p).length || 1) - 1;

    return (
      <TouchableOpacity
        style={[styles.item, { paddingLeft: 16 + depth * 16 }]}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.itemContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isFolder ? '#ff9800' : '#2196f3' },
            ]}
          >
            <MaterialCommunityIcons
              name={isFolder ? 'folder' : 'file-document'}
              size={24}
              color="#fff"
            />
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.key}</Text>
            <Text style={styles.itemSubtitle}>
              {item.fullPath || item.path}
            </Text>
            <View style={styles.metaRow}>
              {item.className && (
                <Chip
                  icon="label"
                  style={styles.metaChip}
                  textStyle={styles.metaChipText}
                  compact
                >
                  {item.className}
                </Chip>
              )}
              {item.published !== undefined && (
                <Chip
                  icon={item.published ? 'check-circle' : 'circle-outline'}
                  style={[
                    styles.metaChip,
                    item.published ? styles.publishedChip : styles.draftChip,
                  ]}
                  textStyle={[styles.metaChipText, { color: '#fff' }]}
                  compact
                >
                  {item.published ? 'Published' : 'Draft'}
                </Chip>
              )}
              {item.id && (
                <Chip
                  icon="identifier"
                  style={styles.metaChip}
                  textStyle={styles.metaChipText}
                  compact
                >
                  ID: {item.id}
                </Chip>
              )}
            </View>
          </View>

          {isFolder && (
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && objects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Loading data objects...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {parentId && (
        <View style={styles.breadcrumbBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#6200ee" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbText} numberOfLines={1}>
            {breadcrumb}
          </Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        </View>
      ) : null}

      <FlatList
        data={objects}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id || index}`}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadObjects} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="folder-open" size={64} color="#ccc" />
            <Paragraph style={styles.emptyText}>No data objects found</Paragraph>
          </View>
        }
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    marginLeft: 4,
    color: '#6200ee',
    fontWeight: '600',
  },
  breadcrumbText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    height: 24,
    backgroundColor: '#e0e0e0',
  },
  metaChipText: {
    fontSize: 10,
    marginVertical: 0,
  },
  publishedChip: {
    backgroundColor: '#4caf50',
  },
  draftChip: {
    backgroundColor: '#ff9800',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
  },
});
