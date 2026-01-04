/**
 * Boolean field renderers
 * Supports both view and edit modes
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps } from './types';

// Checkbox field - supports both view and edit modes
export const CheckboxField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;
  const isChecked = Boolean(value);

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Pressable
          onPress={() => !isDisabled && onFieldChange?.(!isChecked)}
          style={[styles.checkboxEditRow, isDisabled && styles.checkboxDisabled]}
        >
          <MaterialCommunityIcons
            name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={28}
            color={isDisabled ? '#999' : isChecked ? '#6200ee' : '#666'}
          />
          <Text style={[styles.checkboxLabel, isDisabled && styles.checkboxLabelDisabled]}>
            {isChecked ? 'Ja' : 'Nein'}
          </Text>
        </Pressable>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.checkboxValue}>
        <MaterialCommunityIcons
          name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={isChecked ? '#4caf50' : '#999'}
        />
        <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>
          {isChecked ? 'Ja' : 'Nein'}
        </Text>
      </View>
    </FieldWrapper>
  );
};

// Boolean Select field - toggle switch style
export const BooleanSelectField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;
  const isChecked = Boolean(value);

  // Edit mode - uses Switch component
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, isDisabled && styles.checkboxLabelDisabled]}>
            {isChecked ? 'Ja' : 'Nein'}
          </Text>
          <Switch
            value={isChecked}
            onValueChange={(newValue) => !isDisabled && onFieldChange?.(newValue)}
            disabled={isDisabled}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.checkboxValue}>
        <MaterialCommunityIcons
          name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={isChecked ? '#4caf50' : '#999'}
        />
        <Text style={[wrapperStyles.textValue, { marginLeft: 8 }]}>
          {isChecked ? 'Ja' : 'Nein'}
        </Text>
      </View>
    </FieldWrapper>
  );
};

// Consent field - specialized boolean for GDPR consent
export const ConsentField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;
  const isConsented = Boolean(value);

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Pressable
          onPress={() => !isDisabled && onFieldChange?.(!isConsented)}
          style={[styles.consentRow, isDisabled && styles.checkboxDisabled]}
        >
          <MaterialCommunityIcons
            name={isConsented ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={28}
            color={isDisabled ? '#999' : isConsented ? '#4caf50' : '#666'}
          />
          <Text style={[styles.consentLabel, isDisabled && styles.checkboxLabelDisabled]}>
            {isConsented ? 'Einwilligung erteilt' : 'Keine Einwilligung'}
          </Text>
        </Pressable>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={[styles.consentBadge, isConsented ? styles.consentGranted : styles.consentDenied]}>
        <MaterialCommunityIcons
          name={isConsented ? 'check-circle' : 'close-circle'}
          size={18}
          color={isConsented ? '#4caf50' : '#f44336'}
        />
        <Text style={[styles.consentBadgeText, isConsented ? styles.consentGrantedText : styles.consentDeniedText]}>
          {isConsented ? 'Einwilligung erteilt' : 'Keine Einwilligung'}
        </Text>
      </View>
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  checkboxValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Edit mode styles
  checkboxEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxDisabled: {
    opacity: 0.6,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  checkboxLabelDisabled: {
    color: '#999',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 15,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  // Consent field styles
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  consentLabel: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  consentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  consentGranted: {
    backgroundColor: '#e8f5e9',
  },
  consentDenied: {
    backgroundColor: '#ffebee',
  },
  consentBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  consentGrantedText: {
    color: '#2e7d32',
  },
  consentDeniedText: {
    color: '#c62828',
  },
});

// Register boolean field types
export const booleanFieldTypes = {
  checkbox: CheckboxField,
  booleanSelect: BooleanSelectField,
  consent: ConsentField,
};
