/**
 * Login Screen
 * Handles user authentication with saved credentials support
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Checkbox } from '@ant-design/react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';

const AppLogo = require('../../assets/logo.png');
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
  const [rememberMe, setRememberMe] = useState(true);

  const { setAuthenticated, setUser, saveCredentials, loadCredentials } = useAuthStore();
  const { activeInstance } = useInstanceStore();

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, [activeInstance]);

  const loadSavedCredentials = async () => {
    const credentials = await loadCredentials(activeInstance?.id);
    if (credentials) {
      setUsername(credentials.username);
      setPassword(credentials.password);
      setRememberMe(true);
    }
  };

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
        // Save credentials if remember me is checked
        if (rememberMe) {
          await saveCredentials(username, password, activeInstance?.id);
        }

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
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Pimcore Voyager</Text>
          <Text style={styles.subtitle}>
            Sign in to access your Pimcore data
          </Text>

          {activeInstance && (
            <View style={styles.instanceInfo}>
              <View style={styles.instanceHeader}>
                <View style={styles.instanceChip}>
                  <MaterialCommunityIcons name="server" size={16} color={THEME.PRIMARY_COLOR} />
                  <Text style={styles.instanceChipText}>{activeInstance.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleChangeInstance}
                  style={styles.swapButton}
                >
                  <MaterialCommunityIcons name="swap-horizontal" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.instanceUrl}>{activeInstance.url}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor="#999"
              testID="username-input"
              accessibilityLabel="username-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#999"
              testID="password-input"
              accessibilityLabel="password-input"
            />
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
            <Checkbox
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <Text style={styles.checkboxLabel}>
              Remember my credentials
            </Text>
          </TouchableOpacity>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.button, loading && styles.buttonDisabled]}
            testID="login-button"
            accessibilityLabel="login-button"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Session-based authentication via Pimcore Studio API. Credentials are stored securely on your device.
          </Text>
        </View>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
    fontSize: 14,
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
  instanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  instanceChipText: {
    fontSize: 14,
    color: THEME.PRIMARY_COLOR,
    fontWeight: '500',
  },
  swapButton: {
    padding: 8,
  },
  instanceUrl: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  button: {
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
});
