/**
 * Assets Screen - Placeholder
 * Future implementation for asset management
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

export default function AssetsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholderContainer}>
        <IconButton icon="image-multiple" size={64} iconColor="#ccc" />
        <Text style={styles.placeholderTitle}>Assets</Text>
        <Text style={styles.placeholderText}>
          Asset management functionality will be available in a future version.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
