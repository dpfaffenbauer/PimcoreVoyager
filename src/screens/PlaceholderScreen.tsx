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
  title?: string;
  icon?: string;
  description?: string;
}

export default function PlaceholderScreen({ 
  route, 
  title, 
  icon = 'clock-outline',
  description = 'This feature will be available in a future version.'
}: PlaceholderScreenProps) {
  // Extract screen name from route if not provided explicitly
  // Match 'Placeholder' prefix and extract the feature name
  const routeName = route?.name || '';
  const match = routeName.match(/^Placeholder(.*)$/);
  const extractedName = match ? match[1] : routeName;
  const screenName = title || extractedName || 'Feature';
  
  return (
    <View style={styles.container}>
      <View style={styles.placeholderContainer}>
        <IconButton icon={icon} size={64} iconColor="#ccc" />
        <Text style={styles.placeholderTitle}>{screenName}</Text>
        <Text style={styles.placeholderText}>
          {description}
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
