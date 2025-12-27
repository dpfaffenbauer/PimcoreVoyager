/**
 * RGBAColor Edit Component
 * 
 * Allows editing of RGBA color values with mobile-optimized UI
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Slider } from 'react-native';
import { DataTypeEditProps } from '../types';
import { RGBAColorValue, DEFAULT_RGBA_VALUE } from './RGBAColor.types';
import { RGBAColorTransformer } from './RGBAColor.transformer';

export const RGBAColorEdit: React.FC<DataTypeEditProps<RGBAColorValue | null>> = ({ 
  value, 
  onChange, 
  config,
  error,
  readonly 
}) => {
  // Initialize with value or default
  const [colorValue, setColorValue] = useState<RGBAColorValue>(
    value || DEFAULT_RGBA_VALUE
  );

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setColorValue(value);
    }
  }, [value]);

  const handleChannelChange = (channel: 'r' | 'g' | 'b' | 'a', newValue: number) => {
    const updatedValue = { ...colorValue, [channel]: newValue };
    setColorValue(updatedValue);
    onChange(updatedValue);
  };

  const handleTextInputChange = (channel: 'r' | 'g' | 'b' | 'a', text: string) => {
    let numValue = parseFloat(text);
    
    // Validate and constrain values
    if (channel === 'a') {
      numValue = isNaN(numValue) ? 0 : Math.max(0, Math.min(1, numValue));
    } else {
      numValue = isNaN(numValue) ? 0 : Math.round(Math.max(0, Math.min(255, numValue)));
    }
    
    handleChannelChange(channel, numValue);
  };

  const rgbaString = RGBAColorTransformer.toRGBAString(colorValue);
  const hexString = RGBAColorTransformer.toHexString(colorValue);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {config.label}
        {config.mandatory && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Color Preview */}
      <View style={styles.previewSection}>
        <View 
          style={[
            styles.colorPreview, 
            { backgroundColor: rgbaString }
          ]} 
        />
        <View style={styles.previewText}>
          <Text style={styles.hexText}>{hexString}</Text>
          <Text style={styles.rgbaText}>
            RGBA({colorValue.r}, {colorValue.g}, {colorValue.b}, {colorValue.a.toFixed(2)})
          </Text>
        </View>
      </View>

      {/* Red Channel */}
      <View style={styles.channelContainer}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelLabel}>Rot (R)</Text>
          <TextInput
            style={styles.channelInput}
            value={colorValue.r.toString()}
            onChangeText={(text) => handleTextInputChange('r', text)}
            keyboardType="number-pad"
            editable={!readonly}
            maxLength={3}
          />
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={colorValue.r}
          onValueChange={(val) => handleChannelChange('r', Math.round(val))}
          minimumTrackTintColor="#ff4444"
          maximumTrackTintColor="#ddd"
          disabled={readonly}
        />
      </View>

      {/* Green Channel */}
      <View style={styles.channelContainer}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelLabel}>Grün (G)</Text>
          <TextInput
            style={styles.channelInput}
            value={colorValue.g.toString()}
            onChangeText={(text) => handleTextInputChange('g', text)}
            keyboardType="number-pad"
            editable={!readonly}
            maxLength={3}
          />
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={colorValue.g}
          onValueChange={(val) => handleChannelChange('g', Math.round(val))}
          minimumTrackTintColor="#44ff44"
          maximumTrackTintColor="#ddd"
          disabled={readonly}
        />
      </View>

      {/* Blue Channel */}
      <View style={styles.channelContainer}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelLabel}>Blau (B)</Text>
          <TextInput
            style={styles.channelInput}
            value={colorValue.b.toString()}
            onChangeText={(text) => handleTextInputChange('b', text)}
            keyboardType="number-pad"
            editable={!readonly}
            maxLength={3}
          />
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={colorValue.b}
          onValueChange={(val) => handleChannelChange('b', Math.round(val))}
          minimumTrackTintColor="#4444ff"
          maximumTrackTintColor="#ddd"
          disabled={readonly}
        />
      </View>

      {/* Alpha Channel */}
      <View style={styles.channelContainer}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelLabel}>Transparenz (A)</Text>
          <TextInput
            style={styles.channelInput}
            value={colorValue.a.toFixed(2)}
            onChangeText={(text) => handleTextInputChange('a', text)}
            keyboardType="decimal-pad"
            editable={!readonly}
            maxLength={4}
          />
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={colorValue.a}
          onValueChange={(val) => handleChannelChange('a', val)}
          minimumTrackTintColor="#666"
          maximumTrackTintColor="#ddd"
          disabled={readonly}
        />
      </View>

      {/* Error Message */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  required: {
    color: '#e53e3e',
  },
  previewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  colorPreview: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginRight: 16,
  },
  previewText: {
    flex: 1,
  },
  hexText: {
    fontSize: 20,
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
  channelContainer: {
    marginBottom: 20,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
  channelInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    minWidth: 60,
    textAlign: 'center',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  error: {
    color: '#e53e3e',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },
});
