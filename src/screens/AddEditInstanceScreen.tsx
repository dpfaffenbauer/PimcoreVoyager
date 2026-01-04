/**
 * Add/Edit Instance Screen
 * Form to add or edit a Pimcore instance
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Paragraph, Card, HelperText } from 'react-native-paper';
import { useInstanceStore } from '../store/instanceStore';
import { PimcoreInstance } from '../types/instance';

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
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>
              {isEditing ? 'Edit Instance' : 'Add Pimcore Instance'}
            </Title>
            <Paragraph style={styles.subtitle}>
              {isEditing
                ? 'Update the details of your Pimcore instance'
                : 'Configure a new Pimcore instance to connect to'}
            </Paragraph>

            <TextInput
              label="Instance Name *"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: '' });
              }}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Production, Staging, Demo"
              error={!!errors.name}
              testID="instance-name-input"
              accessibilityLabel="instance-name-input"
            />
            {errors.name ? <HelperText type="error">{errors.name}</HelperText> : null}

            <TextInput
              label="Studio API URL *"
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                setErrors({ ...errors, url: '' });
              }}
              style={styles.input}
              mode="outlined"
              placeholder="https://your-pimcore.com/pimcore-studio/api"
              autoCapitalize="none"
              keyboardType="url"
              error={!!errors.url}
              testID="instance-url-input"
              accessibilityLabel="instance-url-input"
            />
            {errors.url ? (
              <HelperText type="error">{errors.url}</HelperText>
            ) : (
              <HelperText type="info">
                Enter the complete URL including /pimcore-studio/api path
              </HelperText>
            )}

            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Main production server"
              multiline
              numberOfLines={2}
            />

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
                testID="save-instance-button"
                accessibilityLabel="save-instance-button"
              >
                {isEditing ? 'Update' : 'Add Instance'}
              </Button>
            </View>
          </Card.Content>
        </Card>
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
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 6,
  },
});
