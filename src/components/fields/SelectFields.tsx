/**
 * Select/Choice field renderers
 * Supports both view and edit modes
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, Modal, TouchableOpacity } from 'react-native';
import { Checkbox } from '@ant-design/react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../config/constants';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps, FieldOption, FieldDefinition } from './types';

// Predefined options for country, language, gender fields
const COUNTRY_OPTIONS: FieldOption[] = [
  { key: 'DE', value: 'Deutschland' },
  { key: 'AT', value: 'Österreich' },
  { key: 'CH', value: 'Schweiz' },
  { key: 'FR', value: 'Frankreich' },
  { key: 'IT', value: 'Italien' },
  { key: 'ES', value: 'Spanien' },
  { key: 'GB', value: 'Großbritannien' },
  { key: 'US', value: 'USA' },
  { key: 'NL', value: 'Niederlande' },
  { key: 'BE', value: 'Belgien' },
  { key: 'PL', value: 'Polen' },
  { key: 'CZ', value: 'Tschechien' },
];

const LANGUAGE_OPTIONS: FieldOption[] = [
  { key: 'de', value: 'Deutsch' },
  { key: 'en', value: 'English' },
  { key: 'fr', value: 'Français' },
  { key: 'it', value: 'Italiano' },
  { key: 'es', value: 'Español' },
  { key: 'nl', value: 'Nederlands' },
  { key: 'pl', value: 'Polski' },
  { key: 'cs', value: 'Čeština' },
];

const GENDER_OPTIONS: FieldOption[] = [
  { key: 'male', value: 'Männlich' },
  { key: 'female', value: 'Weiblich' },
  { key: 'diverse', value: 'Divers' },
];

// Select field - supports both view and edit modes
export const SelectField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const options: FieldOption[] = field?.options || [];
  const isDisabled = field?.noteditable;

  const selectedLabel = options.find((opt) => opt.key === value)?.value || value || '-';

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Pressable
          onPress={() => !isDisabled && setModalVisible(true)}
          style={[
            styles.selectButton,
            isDisabled && styles.selectButtonDisabled,
            error && styles.selectButtonError,
          ]}
        >
          <Text style={[styles.selectButtonText, !value && styles.selectPlaceholder]}>
            {value ? selectedLabel : 'Auswählen...'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={isDisabled ? '#999' : '#666'}
          />
        </Pressable>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable style={styles.selectModalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.selectModal}>
              <View style={styles.selectModalHeader}>
                <Text style={styles.selectModalTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseButton}>Schließen</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.selectModalList} bounces={false}>
                <Pressable
                  onPress={() => {
                    onFieldChange?.(null);
                    setModalVisible(false);
                  }}
                  style={styles.selectModalItem}
                >
                  <Text style={styles.selectModalItemEmpty}>- Keine Auswahl -</Text>
                </Pressable>
                {options.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => {
                      onFieldChange?.(opt.key);
                      setModalVisible(false);
                    }}
                    style={[
                      styles.selectModalItem,
                      value === opt.key && styles.selectModalItemSelected,
                    ]}
                  >
                    {value === opt.key && (
                      <MaterialCommunityIcons name="check" size={20} color={THEME.PRIMARY_COLOR} style={{ marginRight: 12 }} />
                    )}
                    <Text style={[
                      styles.selectModalItemText,
                      value === opt.key && styles.selectModalItemTextSelected,
                    ]}>
                      {opt.value}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.selectChip}>
        <Text style={styles.selectChipText}>{selectedLabel}</Text>
      </View>
    </FieldWrapper>
  );
};

// Multiselect field - supports both view and edit modes
export const MultiselectField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelection, setTempSelection] = useState<string[]>([]);
  const options: FieldOption[] = field?.options || [];
  const isDisabled = field?.noteditable;
  const currentValue = Array.isArray(value) ? value : [];

  const openModal = () => {
    setTempSelection([...currentValue]);
    setModalVisible(true);
  };

  const toggleOption = (key: string) => {
    setTempSelection(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const confirmSelection = () => {
    onFieldChange?.(tempSelection);
    setModalVisible(false);
  };

  const selectedLabels = currentValue
    .map(key => options.find((opt) => opt.key === key)?.value || key)
    .join(', ');

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Pressable
          onPress={() => !isDisabled && openModal()}
          style={[
            styles.selectButton,
            isDisabled && styles.selectButtonDisabled,
            error && styles.selectButtonError,
          ]}
        >
          <Text
            style={[styles.selectButtonText, currentValue.length === 0 && styles.selectPlaceholder]}
            numberOfLines={2}
          >
            {currentValue.length > 0 ? selectedLabels : 'Auswählen...'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={isDisabled ? '#999' : '#666'}
          />
        </Pressable>
        {currentValue.length > 0 && (
          <Text style={styles.multiselectCount}>{currentValue.length} ausgewählt</Text>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable style={styles.selectModalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.multiselectModal}>
              <View style={styles.multiselectHeader}>
                <Text style={styles.multiselectTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseButton}>Abbrechen</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.multiselectList} bounces={false}>
                {options.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => toggleOption(opt.key)}
                    style={styles.multiselectItem}
                  >
                    <Checkbox
                      checked={tempSelection.includes(opt.key)}
                      onChange={() => toggleOption(opt.key)}
                    />
                    <Text style={styles.multiselectItemText}>{opt.value}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.multiselectFooter}>
                <TouchableOpacity onPress={() => setTempSelection([])}>
                  <Text style={styles.footerButtonText}>Alle abwählen</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
                  <Text style={styles.confirmButtonText}>
                    Übernehmen ({tempSelection.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.multiselectContainer}>
        {currentValue.length > 0 ? (
          currentValue.map((item, index) => {
            const label = options.find(opt => opt.key === item)?.value || item;
            return (
              <View key={index} style={styles.selectChip}>
                <Text style={styles.selectChipText}>{label}</Text>
              </View>
            );
          })
        ) : (
          <Text style={wrapperStyles.textValue}>-</Text>
        )}
      </View>
    </FieldWrapper>
  );
};

// Country field - uses predefined country options
export const CountryField: React.FC<FieldRendererProps> = (props) => {
  const fieldWithOptions = {
    ...props.field,
    options: COUNTRY_OPTIONS,
  } as FieldDefinition;
  return <SelectField {...props} field={fieldWithOptions} />;
};

// Language field - uses predefined language options
export const LanguageField: React.FC<FieldRendererProps> = (props) => {
  const fieldWithOptions = {
    ...props.field,
    options: LANGUAGE_OPTIONS,
  } as FieldDefinition;
  return <SelectField {...props} field={fieldWithOptions} />;
};

// Gender field - uses predefined gender options
export const GenderField: React.FC<FieldRendererProps> = (props) => {
  const fieldWithOptions = {
    ...props.field,
    options: GENDER_OPTIONS,
  } as FieldDefinition;
  return <SelectField {...props} field={fieldWithOptions} />;
};

const styles = StyleSheet.create({
  selectChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectChipText: {
    fontSize: 14,
    color: THEME.PRIMARY_COLOR,
    fontWeight: '500',
  },
  multiselectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // Edit mode styles
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  selectButtonError: {
    borderColor: '#f44336',
  },
  selectButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  selectPlaceholder: {
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  multiselectCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  // Modal styles
  selectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCloseButton: {
    fontSize: 15,
    color: THEME.PRIMARY_COLOR,
    fontWeight: '500',
  },
  selectModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  selectModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  selectModalList: {
    flexGrow: 0,
  },
  selectModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  selectModalItemSelected: {
    backgroundColor: '#f3e5f5',
  },
  selectModalItemText: {
    fontSize: 15,
    color: '#333',
  },
  selectModalItemTextSelected: {
    color: THEME.PRIMARY_COLOR,
    fontWeight: '500',
  },
  selectModalItemEmpty: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  // Multiselect modal styles
  multiselectModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  multiselectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  multiselectTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  multiselectList: {
    flexGrow: 0,
  },
  multiselectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  multiselectItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  multiselectFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  footerButtonText: {
    fontSize: 15,
    color: THEME.PRIMARY_COLOR,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: THEME.PRIMARY_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

// Register select field types
export const selectFieldTypes = {
  select: SelectField,
  multiselect: MultiselectField,
  country: CountryField,
  language: LanguageField,
  gender: GenderField,
};
