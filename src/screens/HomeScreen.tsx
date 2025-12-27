/**
 * Home Screen
 * Displays available Pimcore class definitions
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { PimcoreService } from '../apis/pimcoreService';
import { PimcoreClassDefinition } from '../types/pimcore';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { classDefinitions, setClassDefinitions, isLoading, setIsLoading } = useAppStore();

  useEffect(() => {
    loadClassDefinitions();
  }, []);

  const loadClassDefinitions = async () => {
    setIsLoading(true);
    try {
      const definitions = await PimcoreService.getClassDefinitions();
      setClassDefinitions(definitions);
    } catch (error) {
      console.error('Error loading class definitions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassPress = (classDefinition: PimcoreClassDefinition) => {
    navigation.navigate('ObjectList', { classDefinition });
  };

  const renderClassItem = ({ item }: { item: PimcoreClassDefinition }) => (
    <Card
      style={styles.card}
      onPress={() => handleClassPress(item)}
    >
      <Card.Content>
        <Title>{item.name}</Title>
        {item.description && <Paragraph>{item.description}</Paragraph>}
        <Paragraph style={styles.fieldCount}>
          {item.fields.length} fields
        </Paragraph>
      </Card.Content>
    </Card>
  );

  if (isLoading && classDefinitions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Loading class definitions...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={classDefinitions}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadClassDefinitions}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph>No class definitions available</Paragraph>
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
  fieldCount: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
});
