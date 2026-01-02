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
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Checkbox,
  ActivityIndicator,
  IconButton,
  Menu,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
              mode="outlined"
              value={value || ''}
              onChangeText={(text) => updateFieldValue(field.name, text)}
              error={!!error}
              style={styles.textInput}
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
              mode="outlined"
              value={value?.toString() || ''}
              onChangeText={(text) => {
                const numValue = text.replace(/[^0-9.-]/g, '');
                updateFieldValue(field.name, numValue);
              }}
              keyboardType="numeric"
              error={!!error}
              style={styles.textInput}
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
              mode="outlined"
              value={value || ''}
              onChangeText={(text) => updateFieldValue(field.name, text)}
              multiline
              numberOfLines={4}
              error={!!error}
              style={[styles.textInput, styles.textArea]}
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
            <Menu
              visible={selectMenuField === field.name}
              onDismiss={() => setSelectMenuField(null)}
              anchor={
                <TouchableOpacity
                  onPress={() => setSelectMenuField(field.name)}
                  style={[styles.selectButton, error && styles.selectButtonError]}
                >
                  <Text style={selectedOption ? styles.selectText : styles.selectPlaceholder}>
                    {selectedOption?.value || 'Bitte auswählen...'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                </TouchableOpacity>
              }
            >
              {options.map((option) => (
                <Menu.Item
                  key={option.key}
                  title={option.value}
                  onPress={() => {
                    updateFieldValue(field.name, option.key);
                    setSelectMenuField(null);
                  }}
                />
              ))}
            </Menu>
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
              <Checkbox status={value ? 'checked' : 'unchecked'} />
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
                color="#6200ee"
              />
              <Text style={value ? styles.dateText : styles.datePlaceholder}>
                {value ? formatDate(value, isDateTime) : 'Datum auswählen...'}
              </Text>
              {value && (
                <IconButton
                  icon="close"
                  size={18}
                  onPress={() => updateFieldValue(field.name, null)}
                />
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
            <TextInput
              mode="outlined"
              value={value || ''}
              onChangeText={(text) => updateFieldValue(field.name, text)}
              placeholder="User ID eingeben..."
              keyboardType="numeric"
              error={!!error}
              style={styles.textInput}
              left={<TextInput.Icon icon="account" />}
            />
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
                <IconButton
                  icon="close"
                  size={24}
                  onPress={onCancel}
                  style={styles.closeButton}
                />
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
                          mode="outlined"
                          value={comment}
                          onChangeText={setComment}
                          multiline
                          numberOfLines={4}
                          placeholder="Kommentar eingeben..."
                          error={!!errors['_comment']}
                          style={[styles.textInput, styles.textArea]}
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
                <Button
                  mode="outlined"
                  onPress={onCancel}
                  disabled={loading}
                  style={styles.cancelButton}
                >
                  Abbrechen
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                  icon="check"
                >
                  Ausführen
                </Button>
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
  },
  submitButton: {
    minWidth: 120,
  },
});
