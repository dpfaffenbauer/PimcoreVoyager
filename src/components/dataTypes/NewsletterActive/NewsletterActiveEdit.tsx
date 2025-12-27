/**
 * Newsletter Active Edit Component
 * Editable Newsletter Active field with switch control
 */

import React from 'react';
import { View, Text, StyleSheet, Switch, Platform, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NewsletterActiveConfig } from './NewsletterActive.types';

export interface NewsletterActiveEditProps {
  value: boolean;
  onChange: (value: boolean) => void;
  config: NewsletterActiveConfig;
  error?: string;
  readonly?: boolean;
}

export const NewsletterActiveEdit: React.FC<NewsletterActiveEditProps> = ({ 
  value, 
  onChange, 
  config,
  error,
  readonly = false
}) => {
  const isActive = value === true;

  const handleToggle = () => {
    if (!readonly) {
      onChange(!isActive);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {config.label}
            {config.mandatory && <Text style={styles.required}> *</Text>}
          </Text>
          {readonly && (
            <View style={styles.readonlyBadge}>
              <MaterialCommunityIcons name="lock" size={12} color="#666" />
              <Text style={styles.readonlyText}>Read-only</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.switchContainer,
          error && styles.switchContainerError,
          readonly && styles.switchContainerDisabled
        ]}
        onPress={handleToggle}
        disabled={readonly}
        activeOpacity={0.7}
      >
        <View style={styles.statusInfo}>
          <MaterialCommunityIcons 
            name={isActive ? 'email-check' : 'email-off'}
            size={24}
            color={isActive ? '#4caf50' : '#9e9e9e'}
          />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Newsletter Status</Text>
            <Text style={[
              styles.statusValue,
              isActive ? styles.statusValueActive : styles.statusValueInactive
            ]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        <Switch
          value={isActive}
          onValueChange={handleToggle}
          disabled={readonly}
          trackColor={{ 
            false: '#e0e0e0', 
            true: Platform.OS === 'ios' ? '#4caf50' : '#81c784' 
          }}
          thumbColor={Platform.OS === 'android' ? (isActive ? '#4caf50' : '#bdbdbd') : '#fff'}
          ios_backgroundColor="#e0e0e0"
        />
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={16} color="#e53e3e" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!readonly && (
        <Text style={styles.helpText}>
          Toggle to {isActive ? 'deactivate' : 'activate'} newsletter subscription
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#e53e3e',
    fontSize: 14,
  },
  readonlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  readonlyText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  switchContainerError: {
    borderColor: '#e53e3e',
    borderWidth: 2,
  },
  switchContainerDisabled: {
    backgroundColor: '#fafafa',
    opacity: 0.7,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusValueActive: {
    color: '#4caf50',
  },
  statusValueInactive: {
    color: '#9e9e9e',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
