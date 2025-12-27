/**
 * Object List Screen
 * Displays list of Pimcore data objects for a specific class
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, Chip } from 'react-native-paper';
import { PimcoreService } from '../apis/pimcoreService';
import { PimcoreDataObject, PimcoreClassDefinition } from '../types/pimcore';

interface ObjectListScreenProps {
  route: {
    params: {
      classDefinition: PimcoreClassDefinition;
    };
  };
  navigation: any;
}

export default function ObjectListScreen({ route, navigation }: ObjectListScreenProps) {
  const { classDefinition } = route.params;
  const [objects, setObjects] = useState<PimcoreDataObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    setLoading(true);
    try {
      const response = await PimcoreService.getDataObjects(classDefinition.id);
      setObjects(response.data);
    } catch (error) {
      console.error('Error loading objects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleObjectPress = (object: PimcoreDataObject) => {
    navigation.navigate('ObjectDetail', { object, classDefinition });
  };

  const renderObjectItem = ({ item }: { item: PimcoreDataObject }) => (
    <Card
      style={styles.card}
      onPress={() => handleObjectPress(item)}
    >
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{item.key}</Title>
          <Chip
            mode="outlined"
            compact
            style={styles.chip}
          >
            {item.published ? 'Published' : 'Draft'}
          </Chip>
        </View>
        <Paragraph style={styles.path}>{item.path}</Paragraph>
        <Paragraph style={styles.meta}>
          ID: {item.id} • Modified:{' '}
          {new Date(item.modificationDate * 1000).toLocaleDateString()}
        </Paragraph>
      </Card.Content>
    </Card>
  );

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
});
