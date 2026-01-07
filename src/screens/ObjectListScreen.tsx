/**
 * Object List Screen
 * Displays tree structure of Pimcore data objects and folders for a specific class
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';
import { PimcoreService } from '../apis/pimcoreService';
import { PimcoreDataObject, PimcoreClassDefinition } from '../types/pimcore';

interface ObjectListScreenProps {
  route: {
    params: {
      classDefinition: PimcoreClassDefinition;
      parentId?: number;
      parentPath?: string;
      depth?: number;
    };
  };
  navigation: any;
}

export default function ObjectListScreen({ route, navigation }: ObjectListScreenProps) {
  const { classDefinition, parentId, parentPath, depth = 0 } = route.params;
  const [objects, setObjects] = useState<PimcoreDataObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(parentPath || '/');

  useEffect(() => {
    loadObjects();
    
    // Update navigation title to show current path
    navigation.setOptions({
      title: currentPath === '/' ? classDefinition.name : currentPath.split('/').pop() || currentPath,
    });
  }, [parentId]);

  const loadObjects = async () => {
    setLoading(true);
    try {
      const response = await PimcoreService.getDataObjects(
        classDefinition.id,
        1,
        100,
        parentId
      );
      setObjects(response.data);
    } catch (error) {
      console.error('Error loading objects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: PimcoreDataObject) => {
    // Check if it's a folder (type = 'folder')
    if (item.type === 'folder') {
      // Navigate to folder contents
      navigation.push('ObjectList', {
        classDefinition,
        parentId: item.id,
        parentPath: item.path,
        depth: depth + 1,
      });
    } else {
      // Navigate to object detail view
      navigation.navigate('ObjectDetail', { object: item, classDefinition });
    }
  };

  const renderObjectItem = ({ item }: { item: PimcoreDataObject }) => {
    const isFolder = item.type === 'folder';
    const indentation = depth * 16; // 16px per level
    
    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        style={[styles.itemContainer, { paddingLeft: 16 + indentation }]}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          {/* Icon and Title Row */}
          <View style={styles.mainRow}>
            <View style={styles.iconTitleContainer}>
              {/* Tree Connection Lines */}
              {depth > 0 && (
                <View style={styles.treeLineContainer}>
                  <View style={styles.treeLine} />
                </View>
              )}
              
              {/* Icon */}
              <View style={[
                styles.iconWrapper,
                isFolder ? styles.folderIconWrapper : styles.objectIconWrapper
              ]}>
                <MaterialCommunityIcons
                  name={isFolder ? 'folder' : 'file-document-outline'}
                  size={20}
                  color={isFolder ? '#FFA726' : '#42A5F5'}
                />
              </View>
              
              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={[styles.title, isFolder && styles.folderTitle]}>
                  {item.key}
                </Text>
                {!isFolder && item.className && (
                  <Text style={styles.className}>
                    {item.className}
                  </Text>
                )}
              </View>
            </View>
            
            {/* Status Chip */}
            {!isFolder && (
              <View style={[
                styles.chip,
                item.published ? styles.publishedChip : styles.draftChip
              ]}>
                <Text style={styles.chipText}>
                  {item.published ? 'Published' : 'Draft'}
                </Text>
              </View>
            )}
          </View>
          
          {/* Metadata Row */}
          <View style={[styles.metaRow, { paddingLeft: 40 + (depth > 0 ? 20 : 0) }]}>
            <Text style={styles.path}>{item.path}</Text>
            <Text style={styles.meta}>
              {item.key || item.id}
              {item.modificationDate && (
                <> • {new Date(item.modificationDate * 1000).toLocaleDateString()}</>
              )}
            </Text>
          </View>
          
          {/* Folder Hint */}
          {isFolder && (
            <View style={[styles.folderHintContainer, { paddingLeft: 40 + (depth > 0 ? 20 : 0) }]}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color="#2196F3"
                style={styles.chevronIcon}
              />
              <Text style={styles.folderHint}>
                Tap to explore contents
              </Text>
            </View>
          )}
        </View>
        
        {/* Bottom Border */}
        <View style={styles.itemBorder} />
      </TouchableOpacity>
    );
  };

  if (loading && objects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.PRIMARY_COLOR} />
        <Text style={styles.loadingText}>
          Loading {classDefinition.name} objects...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {depth > 0 && (
        <View style={styles.breadcrumbContainer}>
          <MaterialCommunityIcons
            name="folder-open"
            size={16}
            color="#666"
            style={styles.breadcrumbIcon}
          />
          <Text style={styles.breadcrumb}>{currentPath}</Text>
        </View>
      )}
      <FlatList
        data={objects}
        renderItem={renderObjectItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="folder-open-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No items found in this location</Text>
          </View>
        }
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
  listContent: {
    flexGrow: 1,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  breadcrumb: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 8,
  },
  breadcrumbIcon: {
    marginLeft: 8,
  },
  itemContainer: {
    backgroundColor: '#fff',
  },
  itemContent: {
    paddingVertical: 12,
    paddingRight: 16,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  treeLineContainer: {
    width: 20,
    height: '100%',
    position: 'absolute',
    left: -16,
  },
  treeLine: {
    width: 1,
    height: '50%',
    backgroundColor: '#e0e0e0',
    marginLeft: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  folderIconWrapper: {
    backgroundColor: '#FFF3E0',
  },
  objectIconWrapper: {
    backgroundColor: '#E3F2FD',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  folderTitle: {
    fontWeight: '600',
    color: '#F57C00',
  },
  className: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  chip: {
    height: 24,
    marginLeft: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishedChip: {
    backgroundColor: '#E8F5E9',
  },
  draftChip: {
    backgroundColor: '#FFF9C4',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
  metaRow: {
    marginTop: 6,
  },
  path: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 2,
  },
  meta: {
    fontSize: 10,
    color: '#9E9E9E',
  },
  folderHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chevronIcon: {
    marginRight: 4,
  },
  folderHint: {
    fontSize: 11,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  itemBorder: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 56,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#999',
  },
});
