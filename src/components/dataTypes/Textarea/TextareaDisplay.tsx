/**
 * Textarea Data Type - Display Component
 * Read-only display of textarea values
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { TextareaConfig } from './Textarea.types';

export interface TextareaDisplayProps {
  value: string;
  config: TextareaConfig;
}

/**
 * TextareaDisplay Component
 * Displays textarea value in read-only mode
 */
export const TextareaDisplay: React.FC<TextareaDisplayProps> = ({
  value,
  config,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {config.label && (
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {config.label}
          {config.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <Card style={styles.valueCard}>
        <Card.Content>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>
            {value || '-'}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: '#e53e3e',
  },
  valueCard: {
    backgroundColor: '#f8f9fa',
    elevation: 0,
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
  },
});
