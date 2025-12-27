/**
 * Home Screen
 * Displays Pimcore data objects tree view
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { Text, Paragraph, ActivityIndicator, Chip, Divider, Surface, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      <Surface style={[styles.itemSurface, { marginLeft: depth * 16 }]} elevation={1}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemContent}>
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={isFolder ? ['#FFB300', '#FF6F00'] : ['#2196F3', '#1565C0']}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons
                  name={isFolder ? 'folder' : 'file-document-outline'}
                  size={28}
                  color="#fff"
                />
              </LinearGradient>
              {isFolder && item.hasChildren && (
                <Badge style={styles.childBadge} size={18}>
                  {item.childCount || '•'}
                </Badge>
              )}
            </View>

            <View style={styles.itemInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.key}
                </Text>
                {item.published !== undefined && (
                  <View
                    style={[
                      styles.statusIndicator,
                      item.published ? styles.publishedIndicator : styles.draftIndicator,
                    ]}
                  />
                )}
              </View>
              
              <Text style={styles.itemSubtitle} numberOfLines={1}>
                <MaterialCommunityIcons name="folder-outline" size={12} color="#999" />
                {' '}{item.fullPath || item.path}
              </Text>
              
              <View style={styles.metaRow}>
                {item.className && (
                  <View style={styles.infoChip}>
                    <MaterialCommunityIcons name="label-outline" size={12} color="#6200ee" />
                    <Text style={styles.infoChipText}>{item.className}</Text>
                  </View>
                )}
                {item.id && (
                  <View style={styles.infoChip}>
                    <MaterialCommunityIcons name="pound" size={12} color="#666" />
                    <Text style={styles.infoChipText}>{item.id}</Text>
                  </View>
                )}
                {item.modificationDate && (
                  <View style={styles.infoChip}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color="#666" />
                    <Text style={styles.infoChipText}>
                      {new Date(item.modificationDate * 1000).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {isFolder && (
              <View style={styles.chevronContainer}>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#6200ee" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Surface>
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
        <Surface style={styles.breadcrumbBar} elevation={2}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <View style={styles.backButtonInner}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
            </View>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.breadcrumbContent}>
            <MaterialCommunityIcons name="folder-open-outline" size={16} color="#666" />
            <Text style={styles.breadcrumbText} numberOfLines={1}>
              {breadcrumb}
            </Text>
          </View>
        </Surface>
      )}

      {error ? (
        <Surface style={styles.errorContainer} elevation={1}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#d32f2f" />
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        </Surface>
      ) : null}

      <FlatList
        data={objects}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id || index}`}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={loadObjects}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="folder-open-outline" size={80} color="#e0e0e0" />
            </View>
            <Text style={styles.emptyTitle}>No Data Objects</Text>
            <Paragraph style={styles.emptyText}>
              Pull down to refresh or check your connection
            </Paragraph>
          </View>
        }
        contentContainerStyle={objects.length === 0 ? styles.emptyList : styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#6200ee',
    fontSize: 16,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backButtonText: {
    color: '#6200ee',
    fontWeight: '700',
    fontSize: 16,
  },
  breadcrumbContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  breadcrumbText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  itemSurface: {
    marginBottom: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  item: {
    padding: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  childBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6F00',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  publishedIndicator: {
    backgroundColor: '#4caf50',
  },
  draftIndicator: {
    backgroundColor: '#ff9800',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  infoChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#d32f2f',
    flex: 1,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
});
