/**
 * Settings Screen
 * App settings and user profile
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Card, Title, Paragraph, Button, Divider } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { ENV } from '../config/env';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
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
          <Title>API Configuration</Title>
          <Paragraph style={styles.configItem}>
            API URL: {ENV.PIMCORE_API_URL}
          </Paragraph>
          <Paragraph style={styles.configItem}>
            Environment: {ENV.APP_ENV}
          </Paragraph>
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
  configItem: {
    marginTop: 8,
    color: '#666',
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
