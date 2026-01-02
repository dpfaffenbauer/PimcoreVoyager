/**
 * Instance Selection Screen
 * Allows users to select and manage Pimcore instances (Multi-Tenant)
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { useInstanceStore } from '../store/instanceStore';
import { PimcoreInstance } from '../types/instance';

interface InstanceSelectionScreenProps {
  navigation: any;
}

export default function InstanceSelectionScreen({ navigation }: InstanceSelectionScreenProps) {
  const {
    instances,
    activeInstance,
    isLoading,
    loadInstances,
    setActiveInstance,
    deleteInstance,
  } = useInstanceStore();

  useEffect(() => {
    loadInstances();
  }, []);

  const handleSelectInstance = async (instanceId: string) => {
    await setActiveInstance(instanceId);
    navigation.navigate('Login');
  };

  const handleAddInstance = () => {
    navigation.navigate('AddInstance');
  };

  const handleEditInstance = (instance: PimcoreInstance) => {
    navigation.navigate('EditInstance', { instance });
  };

  const handleDeleteInstance = (instance: PimcoreInstance) => {
    Alert.alert(
      'Delete Instance',
      `Are you sure you want to delete "${instance.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteInstance(instance.id);
          },
        },
      ]
    );
  };

  const renderInstanceItem = ({ item }: { item: PimcoreInstance }) => {
    const isActive = activeInstance?.id === item.id;

    return (
      <Card
        style={[styles.card, isActive && styles.activeCard]}
        onPress={() => handleSelectInstance(item.id)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Title style={styles.instanceName}>{item.name}</Title>
              {isActive && (
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Paragraph style={styles.activeBadgeText}>Aktiv</Paragraph>
                </View>
              )}
            </View>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEditInstance(item)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteInstance(item)}
              />
            </View>
          </View>
          <Paragraph style={styles.url}>{item.url}</Paragraph>
          {item.description && (
            <Paragraph style={styles.description}>{item.description}</Paragraph>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Loading instances...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {instances.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Title>No Pimcore Instances</Title>
          <Paragraph style={styles.emptyText}>
            Add your first Pimcore instance to get started
          </Paragraph>
          <Button
            mode="contained"
            onPress={handleAddInstance}
            style={styles.addButton}
            icon="plus"
          >
            Add Instance
          </Button>
        </View>
      ) : (
        <FlatList
          data={instances}
          renderItem={renderInstanceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {instances.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddInstance}
          label="Add Instance"
        />
      )}
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
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instanceName: {
    fontSize: 18,
    marginBottom: 0,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  activeBadgeText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 0,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  url: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
  },
  description: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  loadingText: {
    marginTop: 16,
  },
  addButton: {
    paddingVertical: 6,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
