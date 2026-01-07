/**
 * Settings Screen
 * App settings, user profile, and instance management
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useInstanceStore } from '../store/instanceStore';
import { THEME } from '../config/constants';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user, logout } = useAuthStore();
  const { activeInstance, instances } = useInstanceStore();

  const handleLogout = async () => {
    await logout();
  };

  const handleManageInstances = () => {
    navigation.navigate('InstanceSelection');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>User Profile</Text>
        {user && (
          <>
            <Text style={styles.paragraph}>Username: {user.username}</Text>
            {user.email && <Text style={styles.paragraph}>Email: {user.email}</Text>}
            {user.name && <Text style={styles.paragraph}>Name: {user.name}</Text>}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pimcore Instances</Text>
        {activeInstance && (
          <View style={styles.activeInstance}>
            <Text style={styles.label}>Active Instance:</Text>
            <View style={styles.chip}>
              <MaterialCommunityIcons name="server" size={16} color={THEME.PRIMARY_COLOR} />
              <Text style={styles.chipText}>{activeInstance.name}</Text>
            </View>
            <Text style={styles.instanceUrl}>{activeInstance.url}</Text>
          </View>
        )}
        <Text style={styles.instanceCount}>
          {instances.length} instance(s) configured
        </Text>
        <TouchableOpacity
          onPress={handleManageInstances}
          style={styles.manageButton}
        >
          <MaterialCommunityIcons name="cog" size={18} color={THEME.PRIMARY_COLOR} />
          <Text style={styles.manageButtonText}>Manage Instances</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.paragraph}>
          Pimcore Voyager is a companion app for managing Pimcore data objects on the go.
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  activeInstance: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    color: THEME.PRIMARY_COLOR,
    fontWeight: '500',
  },
  instanceUrl: {
    fontSize: 12,
    color: '#666',
  },
  instanceCount: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  manageButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    gap: 8,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.PRIMARY_COLOR,
  },
  version: {
    marginTop: 16,
    color: '#999',
    fontSize: 12,
  },
  actions: {
    padding: 16,
  },
  logoutButton: {
    paddingVertical: 12,
    backgroundColor: '#d32f2f',
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
