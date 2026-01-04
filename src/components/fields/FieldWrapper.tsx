/**
 * Shared field wrapper component with label
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface FieldWrapperProps {
  label: string | any;
  mandatory?: boolean;
  children: React.ReactNode;
}

// Helper to safely convert label to string
const formatLabel = (label: any): string => {
  if (label === null || label === undefined) return '';
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);

  // Handle QuantityValue: {value, unitId}
  if (typeof label === 'object') {
    if ('value' in label && 'unitId' in label) {
      return `${label.value ?? ''} ${label.unitId ?? ''}`.trim();
    }
    if ('value' in label) return String(label.value);
    if ('name' in label) return String(label.name);
    if ('title' in label) return String(label.title);

    // Fallback: try to stringify
    try {
      return JSON.stringify(label);
    } catch {
      return '[Object]';
    }
  }

  return String(label);
};

export const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, mandatory, children }) => (
  <View style={styles.fieldWrapper}>
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>{formatLabel(label)}</Text>
      {mandatory && <Text style={styles.mandatoryIndicator}>*</Text>}
    </View>
    {children}
  </View>
);

export const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mandatoryIndicator: {
    color: '#f44336',
    marginLeft: 4,
    fontSize: 14,
  },
  textValue: {
    fontSize: 15,
    color: '#333',
  },
});

export default FieldWrapper;
