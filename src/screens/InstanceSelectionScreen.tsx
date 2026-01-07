/**
 * Instance Selection Screen
 * Allows users to select and manage Pimcore instances (Multi-Tenant)
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInstanceStore } from '../store/instanceStore';
import { PimcoreInstance } from '../types/instance';
import { THEME } from '../config/constants';

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
      <TouchableOpacity
        style={[styles.card, isActive && styles.activeCard]}
        onPress={() => handleSelectInstance(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.instanceName}>{item.name}</Text>
            {isActive && (
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBadgeText}>Aktiv</Text>
              </View>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleEditInstance(item)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleDeleteInstance(item)}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.url}>{item.url}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading instances...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {instances.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Pimcore Instances</Text>
          <Text style={styles.emptyText}>
            Add your first Pimcore instance to get started
          </Text>
          <TouchableOpacity
            onPress={handleAddInstance}
            style={styles.addButton}
            testID="add-instance-button"
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Instance</Text>
          </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddInstance}
          testID="add-instance-fab"
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.fabText}>Add Instance</Text>
        </TouchableOpacity>
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.PRIMARY_COLOR,
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
    fontWeight: '600',
    color: '#333',
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
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  iconButton: {
    padding: 8,
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
    color: '#666',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 4,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.PRIMARY_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
