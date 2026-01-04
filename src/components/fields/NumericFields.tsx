/**
 * Numeric field renderers
 * Supports both view and edit modes
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, TextInput, Button, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps, FieldOption } from './types';

// Numeric field - supports both view and edit modes
export const NumericField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;
  const minValue = field?.minValue;
  const maxValue = field?.maxValue;
  const decimalPrecision = field?.decimalPrecision ?? 2;

  const formatValue = (val: any): string => {
    if (val === null || val === undefined || val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return decimalPrecision > 0 ? num.toFixed(decimalPrecision) : num.toString();
  };

  const handleChange = (text: string) => {
    // Allow empty string for clearing
    if (text === '' || text === '-') {
      onFieldChange?.(text === '' ? null : text);
      return;
    }
    // Allow decimal input in progress
    if (text.endsWith('.') || text.endsWith(',')) {
      onFieldChange?.(text);
      return;
    }
    // Parse and validate
    const normalized = text.replace(',', '.');
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      // Apply min/max constraints
      let constrainedValue = num;
      if (minValue !== undefined && num < minValue) constrainedValue = minValue;
      if (maxValue !== undefined && num > maxValue) constrainedValue = maxValue;
      onFieldChange?.(constrainedValue);
    }
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <TextInput
          value={formatValue(value)}
          onChangeText={handleChange}
          mode="outlined"
          dense
          keyboardType="decimal-pad"
          disabled={isDisabled}
          error={!!error}
          style={styles.numericInput}
          placeholder={minValue !== undefined && maxValue !== undefined
            ? `${minValue} - ${maxValue}`
            : 'Zahl eingeben...'}
        />
        {(minValue !== undefined || maxValue !== undefined) && (
          <Text style={styles.numericHint}>
            {minValue !== undefined && maxValue !== undefined
              ? `Bereich: ${minValue} - ${maxValue}`
              : minValue !== undefined
              ? `Min: ${minValue}`
              : `Max: ${maxValue}`}
          </Text>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Text style={wrapperStyles.textValue}>
        {value !== null && value !== undefined ? formatValue(value) : '-'}
      </Text>
    </FieldWrapper>
  );
};

// Quantity Value field - numeric with unit selector
export const QuantityValueField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const isDisabled = field?.noteditable;
  const units: FieldOption[] = field?.validUnits || field?.units || [];
  const defaultUnit = field?.defaultUnit || (units.length > 0 ? units[0].key : '');

  // Value structure: { value: number, unit: string }
  const currentValue = value?.value ?? value;
  const currentUnit = value?.unit || defaultUnit;

  const handleValueChange = (text: string) => {
    if (text === '') {
      onFieldChange?.({ value: null, unit: currentUnit });
      return;
    }
    const normalized = text.replace(',', '.');
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      onFieldChange?.({ value: num, unit: currentUnit });
    }
  };

  const handleUnitChange = (unit: string) => {
    onFieldChange?.({ value: currentValue, unit });
    setUnitModalVisible(false);
  };

  const selectedUnitLabel = units.find(u => u.key === currentUnit)?.value || currentUnit;

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.quantityRow}>
          <TextInput
            value={currentValue !== null && currentValue !== undefined ? String(currentValue) : ''}
            onChangeText={handleValueChange}
            mode="outlined"
            dense
            keyboardType="decimal-pad"
            disabled={isDisabled}
            error={!!error}
            style={styles.quantityInput}
            placeholder="Wert"
          />
          {units.length > 0 && (
            <Pressable
              onPress={() => !isDisabled && setUnitModalVisible(true)}
              style={[styles.unitButton, isDisabled && styles.unitButtonDisabled]}
            >
              <Text style={styles.unitButtonText}>{selectedUnitLabel}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
            </Pressable>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Portal>
          <Modal
            visible={unitModalVisible}
            onDismiss={() => setUnitModalVisible(false)}
            contentContainerStyle={styles.unitModalContainer}
          >
            <View style={styles.unitModal}>
              <View style={styles.unitModalHeader}>
                <Text style={styles.unitModalTitle}>Einheit wählen</Text>
                <Button onPress={() => setUnitModalVisible(false)}>Schließen</Button>
              </View>
              <ScrollView style={styles.unitModalList} bounces={false}>
                {units.map((unit) => (
                  <Pressable
                    key={unit.key}
                    onPress={() => handleUnitChange(unit.key)}
                    style={[
                      styles.unitModalItem,
                      currentUnit === unit.key && styles.unitModalItemSelected,
                    ]}
                  >
                    {currentUnit === unit.key && (
                      <MaterialCommunityIcons name="check" size={20} color="#6200ee" style={{ marginRight: 12 }} />
                    )}
                    <Text style={[
                      styles.unitModalItemText,
                      currentUnit === unit.key && styles.unitModalItemTextSelected,
                    ]}>
                      {unit.value}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Modal>
        </Portal>
      </FieldWrapper>
    );
  }

  // View mode
  const displayValue = currentValue !== null && currentValue !== undefined
    ? `${currentValue} ${selectedUnitLabel}`
    : '-';

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Text style={wrapperStyles.textValue}>{displayValue}</Text>
    </FieldWrapper>
  );
};

// Slider field - numeric with visual slider
export const SliderField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;
  const minValue = field?.minValue ?? 0;
  const maxValue = field?.maxValue ?? 100;
  const increment = field?.increment ?? 1;

  const currentValue = value ?? minValue;

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.sliderContainer}>
          <Slider
            value={currentValue}
            onValueChange={(val) => !isDisabled && onFieldChange?.(val)}
            minimumValue={minValue}
            maximumValue={maxValue}
            step={increment}
            disabled={isDisabled}
            minimumTrackTintColor="#6200ee"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#6200ee"
            style={styles.slider}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMinMax}>{minValue}</Text>
            <Text style={styles.sliderValue}>{currentValue}</Text>
            <Text style={styles.sliderMinMax}>{maxValue}</Text>
          </View>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.sliderViewContainer}>
        <View style={styles.sliderViewTrack}>
          <View
            style={[
              styles.sliderViewProgress,
              { width: `${((currentValue - minValue) / (maxValue - minValue)) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.sliderViewValue}>
          {currentValue} / {maxValue}
        </Text>
      </View>
    </FieldWrapper>
  );
};

// Numeric Range field - min/max values
export const NumericRangeField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;

  // Value structure: { min: number, max: number }
  const minVal = value?.min ?? '';
  const maxVal = value?.max ?? '';

  const handleMinChange = (text: string) => {
    const num = text === '' ? null : parseFloat(text.replace(',', '.'));
    onFieldChange?.({ ...value, min: isNaN(num as number) ? null : num });
  };

  const handleMaxChange = (text: string) => {
    const num = text === '' ? null : parseFloat(text.replace(',', '.'));
    onFieldChange?.({ ...value, max: isNaN(num as number) ? null : num });
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.rangeRow}>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeLabel}>Min:</Text>
            <TextInput
              value={minVal !== null && minVal !== undefined ? String(minVal) : ''}
              onChangeText={handleMinChange}
              mode="outlined"
              dense
              keyboardType="decimal-pad"
              disabled={isDisabled}
              style={styles.rangeInput}
            />
          </View>
          <View style={styles.rangeSeparator}>
            <Text style={styles.rangeSeparatorText}>-</Text>
          </View>
          <View style={styles.rangeItem}>
            <Text style={styles.rangeLabel}>Max:</Text>
            <TextInput
              value={maxVal !== null && maxVal !== undefined ? String(maxVal) : ''}
              onChangeText={handleMaxChange}
              mode="outlined"
              dense
              keyboardType="decimal-pad"
              disabled={isDisabled}
              style={styles.rangeInput}
            />
          </View>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  const rangeText = minVal !== '' && maxVal !== ''
    ? `${minVal} - ${maxVal}`
    : minVal !== ''
    ? `Ab ${minVal}`
    : maxVal !== ''
    ? `Bis ${maxVal}`
    : '-';

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Text style={wrapperStyles.textValue}>{rangeText}</Text>
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  // Numeric input styles
  numericInput: {
    backgroundColor: '#fff',
  },
  numericHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  // Quantity value styles
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    backgroundColor: '#fff',
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    gap: 4,
  },
  unitButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  unitButtonText: {
    fontSize: 14,
    color: '#333',
  },
  // Unit modal styles
  unitModalContainer: {
    paddingTop: '20%',
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'flex-start',
  },
  unitModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '60%',
    overflow: 'hidden',
  },
  unitModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unitModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  unitModalList: {
    flexGrow: 0,
  },
  unitModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  unitModalItemSelected: {
    backgroundColor: '#f3e5f5',
  },
  unitModalItemText: {
    fontSize: 15,
    color: '#333',
  },
  unitModalItemTextSelected: {
    color: '#6200ee',
    fontWeight: '500',
  },
  // Slider styles
  sliderContainer: {
    paddingVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sliderMinMax: {
    fontSize: 12,
    color: '#999',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
  // Slider view mode styles
  sliderViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderViewTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderViewProgress: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 4,
  },
  sliderViewValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  // Range styles
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeItem: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  rangeInput: {
    backgroundColor: '#fff',
  },
  rangeSeparator: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  rangeSeparatorText: {
    fontSize: 16,
    color: '#999',
  },
});

// Register numeric field types
export const numericFieldTypes = {
  numeric: NumericField,
  quantityValue: QuantityValueField,
  slider: SliderField,
  numericRange: NumericRangeField,
};
