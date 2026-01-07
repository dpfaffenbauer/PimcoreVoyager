/**
 * Add/Edit Instance Screen
 * Form to add or edit a Pimcore instance
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useInstanceStore } from '../store/instanceStore';
import { PimcoreInstance } from '../types/instance';
import { THEME } from '../config/constants';

interface AddEditInstanceScreenProps {
  route: {
    params?: {
      instance?: PimcoreInstance;
    };
  };
  navigation: any;
}

export default function AddEditInstanceScreen({ route, navigation }: AddEditInstanceScreenProps) {
  const { addInstance, updateInstance } = useInstanceStore();
  const existingInstance = route.params?.instance;
  const isEditing = !!existingInstance;

  const [name, setName] = useState(existingInstance?.name || '');
  const [url, setUrl] = useState(existingInstance?.url || '');
  const [description, setDescription] = useState(existingInstance?.description || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', url: '' });

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { name: '', url: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
      isValid = false;
    } else if (!validateUrl(url.trim())) {
      newErrors.url = 'Please enter a valid URL (e.g., https://your-pimcore.com/studio/api)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const instanceData = {
        name: name.trim(),
        url: url.trim(),
        description: description.trim(),
      };

      if (isEditing && existingInstance) {
        await updateInstance(existingInstance.id, instanceData);
      } else {
        await addInstance(instanceData);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving instance:', error);
      alert('Failed to save instance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Instance' : 'Add Pimcore Instance'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? 'Update the details of your Pimcore instance'
              : 'Configure a new Pimcore instance to connect to'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Instance Name *</Text>
            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: '' });
              }}
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g., Production, Staging, Demo"
              placeholderTextColor="#999"
              testID="instance-name-input"
              accessibilityLabel="instance-name-input"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Studio API URL *</Text>
            <TextInput
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                setErrors({ ...errors, url: '' });
              }}
              style={[styles.input, errors.url && styles.inputError]}
              placeholder="https://your-pimcore.com/pimcore-studio/api"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="url"
              testID="instance-url-input"
              accessibilityLabel="instance-url-input"
            />
            {errors.url ? (
              <Text style={styles.errorText}>{errors.url}</Text>
            ) : (
              <Text style={styles.helperText}>
                Enter the complete URL including /pimcore-studio/api path
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Main production server"
              placeholderTextColor="#999"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.cancelButton, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              disabled={loading}
              testID="save-instance-button"
              accessibilityLabel="save-instance-button"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{isEditing ? 'Update' : 'Add Instance'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
    marginBottom: 24,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
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
  inputError: {
    borderColor: '#f44336',
  },
  textArea: {
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.PRIMARY_COLOR,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
