/**
 * Object List Screen
 * Displays tree structure of Pimcore data objects and folders for a specific class
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, Chip, IconButton } from 'react-native-paper';
import { PimcoreService } from '../apis/pimcoreService';
import { PimcoreDataObject, PimcoreClassDefinition } from '../types/pimcore';

interface ObjectListScreenProps {
  route: {
    params: {
      classDefinition: PimcoreClassDefinition;
      parentId?: number;
      parentPath?: string;
    };
  };
  navigation: any;
}

export default function ObjectListScreen({ route, navigation }: ObjectListScreenProps) {
  const { classDefinition, parentId, parentPath } = route.params;
  const [objects, setObjects] = useState<PimcoreDataObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(parentPath || '/');

  useEffect(() => {
    loadObjects();
    
    // Update navigation title to show current path
    navigation.setOptions({
      title: currentPath === '/' ? classDefinition.name : currentPath,
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
      });
    } else {
      // Navigate to object detail view
      navigation.navigate('ObjectDetail', { object: item, classDefinition });
    }
  };

  const renderObjectItem = ({ item }: { item: PimcoreDataObject }) => {
    const isFolder = item.type === 'folder';
    
    return (
      <Card
        style={styles.card}
        onPress={() => handleItemPress(item)}
      >
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <IconButton
                icon={isFolder ? 'folder' : 'file-document'}
                size={20}
                style={styles.icon}
              />
              <Title style={styles.title}>{item.key}</Title>
            </View>
            {!isFolder && (
              <Chip
                mode="outlined"
                compact
                style={styles.chip}
              >
                {item.published ? 'Published' : 'Draft'}
              </Chip>
            )}
          </View>
          <Paragraph style={styles.path}>{item.path}</Paragraph>
          <Paragraph style={styles.meta}>
            ID: {item.id} • Type: {item.type || 'object'}
            {item.modificationDate && (
              <> • Modified: {new Date(item.modificationDate * 1000).toLocaleDateString()}</>
            )}
          </Paragraph>
          {isFolder && (
            <Paragraph style={styles.folderHint}>
              Tap to explore folder contents →
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading && objects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>
          Loading {classDefinition.name} objects...
        </Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={objects}
        renderItem={renderObjectItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph>No objects found</Paragraph>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    flex: 1,
  },
  chip: {
    marginLeft: 8,
  },
  path: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  meta: {
    color: '#999',
    fontSize: 11,
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    margin: 0,
    marginRight: 4,
  },
  folderHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
  },
});
