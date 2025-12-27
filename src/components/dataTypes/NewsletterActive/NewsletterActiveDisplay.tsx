/**
 * Newsletter Active Display Component
 * Read-only display of Newsletter Active field
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NewsletterActiveConfig } from './NewsletterActive.types';

export interface NewsletterActiveDisplayProps {
  value: boolean;
  config: NewsletterActiveConfig;
}

export const NewsletterActiveDisplay: React.FC<NewsletterActiveDisplayProps> = ({ 
  value, 
  config 
}) => {
  const isActive = value === true;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.label}</Text>
      <View style={styles.valueContainer}>
        <View style={[
          styles.statusIndicator,
          isActive ? styles.statusActive : styles.statusInactive
        ]}>
          <MaterialCommunityIcons 
            name={isActive ? 'check-circle' : 'close-circle'}
            size={20}
            color="#fff"
          />
          <Text style={styles.statusText}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  statusActive: {
    backgroundColor: '#4caf50',
  },
  statusInactive: {
    backgroundColor: '#9e9e9e',
  },
  statusText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
