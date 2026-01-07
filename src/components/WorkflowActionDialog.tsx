/**
 * Workflow Action Dialog
 * Modal dialog for collecting workflow action inputs
 * Supports comment field and additional fields of various types
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Checkbox } from '@ant-design/react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { THEME } from '../config/constants';
import { Surface } from './ui';
import {
  WorkflowNotes,
  WorkflowAdditionalField,
  WorkflowSelectOption,
} from '../apis/workflowService';

interface WorkflowActionDialogProps {
  visible: boolean;
  title: string;
  notes: WorkflowNotes;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (data: WorkflowActionData) => void;
}

export interface WorkflowActionData {
  comment?: string;
  additionalFields: Record<string, any>;
}

// Field value state type
type FieldValues = Record<string, any>;

export function WorkflowActionDialog({
  visible,
  title,
  notes,
  loading = false,
  onCancel,
  onSubmit,
}: WorkflowActionDialogProps) {
  const [comment, setComment] = useState(notes.commentPrefill || '');
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [datePickerField, setDatePickerField] = useState<string | null>(null);
  const [selectMenuField, setSelectMenuField] = useState<string | null>(null);

  // Initialize field values when dialog opens
  useEffect(() => {
    if (visible) {
      setComment(notes.commentPrefill || '');
      const initialValues: FieldValues = {};
      notes.additionalFields?.forEach((field) => {
        switch (field.fieldType) {
          case 'checkbox':
            initialValues[field.name] = false;
            break;
          case 'numeric':
            initialValues[field.name] = '';
            break;
          case 'date':
          case 'datetime':
            initialValues[field.name] = null;
            break;
          default:
            initialValues[field.name] = '';
        }
      });
      setFieldValues(initialValues);
      setErrors({});
    }
  }, [visible, notes]);

  const updateFieldValue = (name: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when value changes
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate comment if required
    if (notes.commentRequired && !comment.trim()) {
      newErrors['_comment'] = 'Kommentar ist erforderlich';
    }

    // Validate additional fields
    notes.additionalFields?.forEach((field) => {
      if (field.required) {
        const value = fieldValues[field.name];
        if (value === undefined || value === null || value === '') {
          newErrors[field.name] = `${field.title} ist erforderlich`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data: WorkflowActionData = {
      additionalFields: { ...fieldValues },
    };

    if (notes.commentEnabled) {
      data.comment = comment;
    }

    onSubmit(data);
  };

  const formatDate = (date: Date | null, includeTime: boolean): string => {
    if (!date) return '';
    if (includeTime) {
      return date.toLocaleString('de-DE');
    }
    return date.toLocaleDateString('de-DE');
  };

  const renderField = (field: WorkflowAdditionalField) => {
    const value = fieldValues[field.name];
    const error = errors[field.name];

    switch (field.fieldType) {
      case 'input':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.title}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              value={value || ''}
              onChangeText={(text) => updateFieldValue(field.name, text)}
              style={[styles.textInput, error && styles.textInputError]}
              placeholderTextColor="#999"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'numeric':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.title}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              value={value?.toString() || ''}
              onChangeText={(text) => {
                const numValue = text.replace(/[^0-9.-]/g, '');
                updateFieldValue(field.name, numValue);
              }}
              keyboardType="numeric"
              style={[styles.textInput, error && styles.textInputError]}
              placeholderTextColor="#999"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'textarea':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.title}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              value={value || ''}
              onChangeText={(text) => updateFieldValue(field.name, text)}
              multiline
              numberOfLines={4}
              style={[styles.textInput, styles.textArea, error && styles.textInputError]}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'select':
        const options = field.fieldTypeSettings?.options || [];
        const selectedOption = options.find((opt) => opt.key === value);
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.title}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectMenuField(field.name)}
              style={[styles.selectButton, error && styles.selectButtonError]}
            >
              <Text style={selectedOption ? styles.selectText : styles.selectPlaceholder}>
                {selectedOption?.value || 'Bitte auswählen...'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
            </TouchableOpacity>
            {selectMenuField === field.name && (
              <Modal
                visible={true}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectMenuField(null)}
              >
                <Pressable style={styles.selectModalOverlay} onPress={() => setSelectMenuField(null)}>
                  <View style={styles.selectModal}>
                    <ScrollView bounces={false}>
                      {options.map((option) => (
                        <TouchableOpacity
                          key={option.key}
                          style={styles.selectModalItem}
                          onPress={() => {
                            updateFieldValue(field.name, option.key);
                            setSelectMenuField(null);
                          }}
                        >
                          <Text style={styles.selectModalItemText}>{option.value}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </Pressable>
              </Modal>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'checkbox':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateFieldValue(field.name, !value)}
            >
              <Checkbox
                checked={value}
                onChange={() => updateFieldValue(field.name, !value)}
              />
              <Text style={styles.checkboxLabel}>
                {field.title}
                {field.required && <Text style={styles.required}> *</Text>}
              </Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'date':
      case 'datetime':
        const isDateTime = field.fieldType === 'datetime';
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.title}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => setDatePickerField(field.name)}
              style={[styles.dateButton, error && styles.selectButtonError]}
            >
              <MaterialCommunityIcons
                name={isDateTime ? 'calendar-clock' : 'calendar'}
                size={20}
                color={THEME.PRIMARY_COLOR}
              />
              <Text style={value ? styles.dateText : styles.datePlaceholder}>
                {value ? formatDate(value, isDateTime) : 'Datum auswählen...'}
              </Text>
              {value && (
                <TouchableOpacity
                  onPress={() => updateFieldValue(field.name, null)}
                  style={styles.clearButton}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {datePickerField === field.name && (
              <DateTimePicker
                value={value || new Date()}
                mode={isDateTime ? 'datetime' : 'date'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setDatePickerField(null);
                  if (event.type === 'set' && date) {
                    updateFieldValue(field.name, date);
                  }
                }}
              />
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'user':
        // User field - for now render as input, could be enhanced with user picker
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.title}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={[styles.userInputContainer, error && styles.textInputError]}>
              <MaterialCommunityIcons name="account" size={20} color="#666" style={styles.userIcon} />
              <TextInput
                value={value || ''}
                onChangeText={(text) => updateFieldValue(field.name, text)}
                placeholder="User ID eingeben..."
                placeholderTextColor="#999"
                keyboardType="numeric"
                style={styles.userTextInput}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      default:
        return null;
    }
  };

  const hasFields = notes.commentEnabled || (notes.additionalFields && notes.additionalFields.length > 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Surface style={styles.dialog} elevation={5}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <MaterialCommunityIcons name="state-machine" size={24} color="#fff" />
                </View>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onCancel}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {!hasFields ? (
                  <Text style={styles.noFieldsText}>
                    Möchten Sie diese Aktion ausführen?
                  </Text>
                ) : (
                  <>
                    {/* Comment Field */}
                    {notes.commentEnabled && (
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                          Kommentar
                          {notes.commentRequired && <Text style={styles.required}> *</Text>}
                        </Text>
                        <TextInput
                          value={comment}
                          onChangeText={setComment}
                          multiline
                          numberOfLines={4}
                          placeholder="Kommentar eingeben..."
                          placeholderTextColor="#999"
                          style={[styles.textInput, styles.textArea, errors['_comment'] && styles.textInputError]}
                          textAlignVertical="top"
                        />
                        {errors['_comment'] && (
                          <Text style={styles.errorText}>{errors['_comment']}</Text>
                        )}
                      </View>
                    )}

                    {/* Additional Fields */}
                    {notes.additionalFields?.map(renderField)}
                  </>
                )}
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={onCancel}
                  disabled={loading}
                  style={[styles.cancelButton, loading && styles.buttonDisabled]}
                >
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={[styles.submitButton, loading && styles.buttonDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check" size={18} color="#fff" />
                      <Text style={styles.submitButtonText}>Ausführen</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Surface>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    margin: 0,
  },
  content: {
    maxHeight: 400,
  },
  contentContainer: {
    padding: 20,
  },
  noFieldsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textInputError: {
    borderColor: '#f44336',
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  selectButtonError: {
    borderColor: '#f44336',
  },
  selectText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  datePlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.PRIMARY_COLOR,
  },
  submitButton: {
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  selectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  selectModal: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 250,
    maxHeight: 300,
    overflow: 'hidden',
  },
  selectModalItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  selectModalItemText: {
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  userInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  userIcon: {
    marginRight: 8,
  },
  userTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
});
