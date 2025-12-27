/**
 * RGBAColor Display Component
 * 
 * Displays RGBA color values in read-only mode
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DataTypeDisplayProps } from '../types';
import { RGBAColorValue } from './RGBAColor.types';
import { RGBAColorTransformer } from './RGBAColor.transformer';

export const RGBAColorDisplay: React.FC<DataTypeDisplayProps<RGBAColorValue | null>> = ({ 
  value, 
  config 
}) => {
  if (!value) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{config.label}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>-</Text>
        </View>
      </View>
    );
  }

  const rgbaString = RGBAColorTransformer.toRGBAString(value);
  const hexString = RGBAColorTransformer.toHexString(value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.label}</Text>
      
      <View style={styles.contentContainer}>
        {/* Color Preview */}
        <View style={styles.previewContainer}>
          <View 
            style={[
              styles.colorPreview, 
              { backgroundColor: rgbaString }
            ]} 
          />
        </View>

        {/* Color Values */}
        <View style={styles.valuesContainer}>
          <Text style={styles.hexText}>{hexString}</Text>
          <Text style={styles.rgbaText}>
            R: {value.r}, G: {value.g}, B: {value.b}, A: {value.a.toFixed(2)}
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewContainer: {
    marginRight: 16,
  },
  colorPreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  valuesContainer: {
    flex: 1,
  },
  hexText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  rgbaText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});
