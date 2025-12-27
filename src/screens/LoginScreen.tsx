/**
 * Login Screen
 * Handles user authentication
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Paragraph, Card, IconButton, Chip } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { useInstanceStore } from '../store/instanceStore';
import { AuthService } from '../apis/authService';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setAuthenticated, setUser } = useAuthStore();
  const { activeInstance } = useInstanceStore();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await AuthService.login(username, password);
      
      if (success) {
        // Session is established via cookies
        setAuthenticated(true);
        
        // Set user data
        setUser({
          id: '1',
          username,
          email: `${username}@example.com`,
          name: username,
        });
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeInstance = () => {
    navigation.navigate('InstanceSelection');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Pimcore Voyager</Title>
            <Paragraph style={styles.subtitle}>
              Sign in to access your Pimcore data
            </Paragraph>

            {activeInstance && (
              <View style={styles.instanceInfo}>
                <View style={styles.instanceHeader}>
                  <Chip icon="server" mode="outlined" compact>
                    {activeInstance.name}
                  </Chip>
                  <IconButton
                    icon="swap-horizontal"
                    size={20}
                    onPress={handleChangeInstance}
                  />
                </View>
                <Paragraph style={styles.instanceUrl}>{activeInstance.url}</Paragraph>
              </View>
            )}

            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
            />

            {error ? (
              <Paragraph style={styles.error}>{error}</Paragraph>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Sign In
            </Button>

            <Paragraph style={styles.hint}>
              Session-based authentication via Pimcore Studio API. Falls back to mock if backend unavailable.
            </Paragraph>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  instanceInfo: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  instanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  instanceUrl: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
});
