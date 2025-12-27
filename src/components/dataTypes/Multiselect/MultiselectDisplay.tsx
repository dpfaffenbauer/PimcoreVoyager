/**
 * Multiselect Display Component
 * Read-only display of multiselect values
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { DataTypeDisplayProps } from '../types';
import { MultiselectConfig } from './Multiselect.types';

export interface MultiselectDisplayProps extends DataTypeDisplayProps<(string | number)[]> {
  config: MultiselectConfig;
}

export const MultiselectDisplay: React.FC<MultiselectDisplayProps> = ({
  value,
  config,
}) => {
  const selectedOptions = React.useMemo(() => {
    if (!value || value.length === 0) {
      return [];
    }

    if (!config.options) {
      // If no options are provided, display raw values
      return value.map(v => ({ key: String(v), value: v }));
    }

    // Map selected values to their labels
    return value
      .map(selectedValue => {
        const option = config.options?.find(opt => opt.value === selectedValue);
        return option;
      })
      .filter(Boolean) as { key: string; value: string | number }[];
  }, [value, config.options]);

  if (selectedOptions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{config.label}</Text>
        <Text style={styles.emptyValue}>Keine Auswahl</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.label}</Text>
      <View style={styles.chipsContainer}>
        {selectedOptions.map((option, index) => (
          <Chip
            key={`${option.value}-${index}`}
            style={styles.chip}
            textStyle={styles.chipText}
            mode="outlined"
          >
            {option.key}
          </Chip>
        ))}
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
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
    backgroundColor: '#f0e7ff',
    borderColor: '#6200ee',
  },
  chipText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  emptyValue: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
