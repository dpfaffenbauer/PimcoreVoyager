/**
 * Placeholder Screen
 * Generic placeholder for future menu items
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

interface PlaceholderScreenProps {
  route?: {
    name?: string;
  };
}

export default function PlaceholderScreen({ route }: PlaceholderScreenProps) {
  const screenName = route?.name?.replace('Placeholder', '') || 'Feature';
  
  return (
    <View style={styles.container}>
      <View style={styles.placeholderContainer}>
        <IconButton icon="clock-outline" size={64} iconColor="#ccc" />
        <Text style={styles.placeholderTitle}>{screenName}</Text>
        <Text style={styles.placeholderText}>
          This feature will be available in a future version.
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
