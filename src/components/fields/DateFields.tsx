/**
 * Date/Time field renderers
 * Supports both view and edit modes
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps } from './types';

// Format a Unix timestamp to a readable date/time
const formatDateTime = (timestamp: number): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (timestamp: number): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('de-DE');
};

const formatTime = (timestamp: number): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};

// Datetime field - supports both view and edit modes
export const DatetimeField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const isDisabled = field?.noteditable;
  const currentDate = value ? new Date(value * 1000) : null;

  const handlePress = () => {
    if (isDisabled) return;
    setTempDate(currentDate || new Date());
    setPickerMode('date');
    setShowPicker(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (selectedDate) {
      if (pickerMode === 'date') {
        // After selecting date, show time picker
        setTempDate(selectedDate);
        setPickerMode('time');
        if (Platform.OS === 'android') {
          setShowPicker(true);
        }
      } else {
        // Final selection - combine date and time
        const finalDate = tempDate
          ? new Date(
              tempDate.getFullYear(),
              tempDate.getMonth(),
              tempDate.getDate(),
              selectedDate.getHours(),
              selectedDate.getMinutes()
            )
          : selectedDate;
        onFieldChange?.(Math.floor(finalDate.getTime() / 1000));
        setShowPicker(false);
      }
    }
  };

  const handleClear = () => {
    onFieldChange?.(null);
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.dateEditorRow}>
          <Pressable
            onPress={handlePress}
            style={[
              styles.dateButton,
              isDisabled && styles.dateButtonDisabled,
              error && styles.dateButtonError,
            ]}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={isDisabled ? '#999' : '#666'}
              style={styles.dateButtonIcon}
            />
            <Text style={[styles.dateButtonText, !currentDate && styles.datePlaceholder]}>
              {currentDate ? formatDateTime(value) : 'Datum & Zeit wählen...'}
            </Text>
          </Pressable>
          {currentDate && !isDisabled && (
            <Pressable onPress={handleClear} style={styles.dateClearButton}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
            </Pressable>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {showPicker && (
          <DateTimePicker
            value={tempDate || new Date()}
            mode={pickerMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            locale="de-DE"
          />
        )}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.dateValue}>
        <MaterialCommunityIcons name="calendar" size={18} color="#666" style={styles.dateIcon} />
        <Text style={wrapperStyles.textValue}>{formatDateTime(value)}</Text>
      </View>
    </FieldWrapper>
  );
};

// Date field (without time) - supports both view and edit modes
export const DateField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const isDisabled = field?.noteditable;
  const currentDate = value ? new Date(value * 1000) : null;

  const handlePress = () => {
    if (isDisabled) return;
    setShowPicker(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      onFieldChange?.(Math.floor(selectedDate.getTime() / 1000));
    }
  };

  const handleClear = () => {
    onFieldChange?.(null);
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.dateEditorRow}>
          <Pressable
            onPress={handlePress}
            style={[
              styles.dateButton,
              isDisabled && styles.dateButtonDisabled,
              error && styles.dateButtonError,
            ]}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={isDisabled ? '#999' : '#666'}
              style={styles.dateButtonIcon}
            />
            <Text style={[styles.dateButtonText, !currentDate && styles.datePlaceholder]}>
              {currentDate ? formatDate(value) : 'Datum wählen...'}
            </Text>
          </Pressable>
          {currentDate && !isDisabled && (
            <Pressable onPress={handleClear} style={styles.dateClearButton}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
            </Pressable>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {showPicker && (
          <DateTimePicker
            value={currentDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            locale="de-DE"
          />
        )}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.dateValue}>
        <MaterialCommunityIcons name="calendar" size={18} color="#666" style={styles.dateIcon} />
        <Text style={wrapperStyles.textValue}>{formatDate(value)}</Text>
      </View>
    </FieldWrapper>
  );
};

// Time field - supports both view and edit modes
export const TimeField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const isDisabled = field?.noteditable;
  const currentDate = value ? new Date(value * 1000) : null;

  const handlePress = () => {
    if (isDisabled) return;
    setShowPicker(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      onFieldChange?.(Math.floor(selectedDate.getTime() / 1000));
    }
  };

  const handleClear = () => {
    onFieldChange?.(null);
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.dateEditorRow}>
          <Pressable
            onPress={handlePress}
            style={[
              styles.dateButton,
              isDisabled && styles.dateButtonDisabled,
              error && styles.dateButtonError,
            ]}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={isDisabled ? '#999' : '#666'}
              style={styles.dateButtonIcon}
            />
            <Text style={[styles.dateButtonText, !currentDate && styles.datePlaceholder]}>
              {currentDate ? formatTime(value) : 'Zeit wählen...'}
            </Text>
          </Pressable>
          {currentDate && !isDisabled && (
            <Pressable onPress={handleClear} style={styles.dateClearButton}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
            </Pressable>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {showPicker && (
          <DateTimePicker
            value={currentDate || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            locale="de-DE"
          />
        )}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.dateValue}>
        <MaterialCommunityIcons name="clock-outline" size={18} color="#666" style={styles.dateIcon} />
        <Text style={wrapperStyles.textValue}>{value || '-'}</Text>
      </View>
    </FieldWrapper>
  );
};

// Date range field - supports both view and edit modes
export const DateRangeField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const isDisabled = field?.noteditable;

  // Value structure: { start: timestamp, end: timestamp }
  const startDate = value?.start ? new Date(value.start * 1000) : null;
  const endDate = value?.end ? new Date(value.end * 1000) : null;

  const handleStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      onFieldChange?.({
        ...value,
        start: Math.floor(selectedDate.getTime() / 1000),
      });
    }
  };

  const handleEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      onFieldChange?.({
        ...value,
        end: Math.floor(selectedDate.getTime() / 1000),
      });
    }
  };

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.dateRangeContainer}>
          <View style={styles.dateRangeItem}>
            <Text style={styles.dateRangeLabel}>Von:</Text>
            <Pressable
              onPress={() => !isDisabled && setShowStartPicker(true)}
              style={[styles.dateButton, styles.dateRangeButton, isDisabled && styles.dateButtonDisabled]}
            >
              <Text style={[styles.dateButtonText, !startDate && styles.datePlaceholder]}>
                {startDate ? formatDate(value.start) : 'Startdatum'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.dateRangeItem}>
            <Text style={styles.dateRangeLabel}>Bis:</Text>
            <Pressable
              onPress={() => !isDisabled && setShowEndPicker(true)}
              style={[styles.dateButton, styles.dateRangeButton, isDisabled && styles.dateButtonDisabled]}
            >
              <Text style={[styles.dateButtonText, !endDate && styles.datePlaceholder]}>
                {endDate ? formatDate(value.end) : 'Enddatum'}
              </Text>
            </Pressable>
          </View>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartChange}
            locale="de-DE"
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndChange}
            locale="de-DE"
          />
        )}
      </FieldWrapper>
    );
  }

  // View mode
  const rangeText = startDate && endDate
    ? `${formatDate(value.start)} - ${formatDate(value.end)}`
    : startDate
    ? `Ab ${formatDate(value.start)}`
    : endDate
    ? `Bis ${formatDate(value.end)}`
    : '-';

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.dateValue}>
        <MaterialCommunityIcons name="calendar-range" size={18} color="#666" style={styles.dateIcon} />
        <Text style={wrapperStyles.textValue}>{rangeText}</Text>
      </View>
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  dateValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  // Edit mode styles
  dateEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  dateButtonError: {
    borderColor: '#f44336',
  },
  dateButtonIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  datePlaceholder: {
    color: '#999',
  },
  dateClearButton: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  // Date range styles
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateRangeItem: {
    flex: 1,
  },
  dateRangeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateRangeButton: {
    flex: 0,
  },
});

// Register date field types
export const dateFieldTypes = {
  datetime: DatetimeField,
  date: DateField,
  time: TimeField,
  dateRange: DateRangeField,
};
