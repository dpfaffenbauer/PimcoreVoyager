/**
 * Settings Screen
 * App settings, user profile, and instance management
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Card, Title, Paragraph, Button, Divider, Chip } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { useInstanceStore } from '../store/instanceStore';

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
      <Card style={styles.card}>
        <Card.Content>
          <Title>User Profile</Title>
          {user && (
            <>
              <Paragraph>Username: {user.username}</Paragraph>
              {user.email && <Paragraph>Email: {user.email}</Paragraph>}
              {user.name && <Paragraph>Name: {user.name}</Paragraph>}
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Pimcore Instances</Title>
          {activeInstance && (
            <View style={styles.activeInstance}>
              <Paragraph style={styles.label}>Active Instance:</Paragraph>
              <Chip icon="server" mode="flat" style={styles.chip}>
                {activeInstance.name}
              </Chip>
              <Paragraph style={styles.instanceUrl}>{activeInstance.url}</Paragraph>
            </View>
          )}
          <Paragraph style={styles.instanceCount}>
            {instances.length} instance(s) configured
          </Paragraph>
          <Button
            mode="outlined"
            onPress={handleManageInstances}
            style={styles.manageButton}
            icon="cog"
          >
            Manage Instances
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>About</Title>
          <Paragraph>
            Pimcore Voyager is a companion app for managing Pimcore data objects on the go.
          </Paragraph>
          <Paragraph style={styles.version}>Version 1.0.0</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#d32f2f"
        >
          Logout
        </Button>
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
    elevation: 2,
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
    marginBottom: 8,
  },
  instanceUrl: {
    fontSize: 12,
    color: '#666',
  },
  instanceCount: {
    marginTop: 16,
    color: '#666',
  },
  manageButton: {
    marginTop: 12,
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
    paddingVertical: 6,
  },
});
