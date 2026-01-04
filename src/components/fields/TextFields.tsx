/**
 * Text-based field renderers
 * Supports both view and edit modes
 */

import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import RenderHtml from 'react-native-render-html';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps } from './types';

// Helper to safely format any value as a string for display
const formatDisplayValue = (val: any): string => {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'string') return val || '-';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);

  // Handle QuantityValue: {value, unitId}
  if (typeof val === 'object') {
    if ('value' in val && 'unitId' in val) {
      return `${val.value ?? ''} ${val.unitId ?? ''}`.trim() || '-';
    }
    if ('value' in val) return String(val.value) || '-';

    // Fallback: stringify
    try {
      return JSON.stringify(val);
    } catch {
      return '[Object]';
    }
  }

  return String(val) || '-';
};

// Input field (text) - supports both view and edit modes
export const InputField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <TextInput
          value={value || ''}
          onChangeText={(text) => onFieldChange?.(text)}
          mode="outlined"
          dense
          disabled={isDisabled}
          error={!!error}
          style={styles.textInput}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Text style={wrapperStyles.textValue}>{formatDisplayValue(value)}</Text>
    </FieldWrapper>
  );
};

// Textarea field - supports both view and edit modes
export const TextareaField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const isDisabled = field?.noteditable;

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <TextInput
          value={value || ''}
          onChangeText={(text) => onFieldChange?.(text)}
          mode="outlined"
          multiline
          numberOfLines={4}
          disabled={isDisabled}
          error={!!error}
          style={styles.textareaInput}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Text style={styles.textareaValue}>{formatDisplayValue(value)}</Text>
    </FieldWrapper>
  );
};

// WYSIWYG field (rich text with HTML rendering) - supports both view and edit modes
export const WysiwygField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const { width } = useWindowDimensions();
  const contentWidth = width - 64;
  const [showPreview, setShowPreview] = useState(false);
  const isDisabled = field?.noteditable;

  // Edit mode - textarea with HTML preview toggle
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.wysiwygToolbar}>
          <Pressable
            onPress={() => setShowPreview(!showPreview)}
            style={[styles.wysiwygToggle, showPreview && styles.wysiwygToggleActive]}
          >
            <Text style={[styles.wysiwygToggleText, showPreview && styles.wysiwygToggleTextActive]}>
              {showPreview ? 'Bearbeiten' : 'Vorschau'}
            </Text>
          </Pressable>
        </View>
        {showPreview ? (
          <View style={styles.wysiwygPreview}>
            {value ? (
              <RenderHtml
                contentWidth={contentWidth - 24}
                source={{ html: value }}
                baseStyle={styles.htmlContent}
                tagsStyles={htmlTagStyles}
              />
            ) : (
              <Text style={styles.wysiwygPlaceholder}>Keine Inhalte</Text>
            )}
          </View>
        ) : (
          <TextInput
            value={value || ''}
            onChangeText={(text) => onFieldChange?.(text)}
            mode="outlined"
            multiline
            numberOfLines={8}
            disabled={isDisabled}
            error={!!error}
            style={styles.wysiwygInput}
            placeholder="HTML-Inhalt eingeben..."
          />
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html: value }}
        baseStyle={styles.htmlContent}
        tagsStyles={htmlTagStyles}
      />
    </FieldWrapper>
  );
};

// Password field - always masked in view mode
export const PasswordField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isDisabled = field?.noteditable;

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <TextInput
          value={value || ''}
          onChangeText={(text) => onFieldChange?.(text)}
          mode="outlined"
          dense
          secureTextEntry={!showPassword}
          disabled={isDisabled}
          error={!!error}
          style={styles.textInput}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </FieldWrapper>
    );
  }

  // View mode - masked
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <Text style={wrapperStyles.textValue}>{value ? '••••••••' : '-'}</Text>
    </FieldWrapper>
  );
};

// Calculated value field - read-only
export const CalculatedValueField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
}) => {
  // Always read-only, even in edit mode
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={isEditing ? styles.calculatedContainer : undefined}>
        <Text style={[wrapperStyles.textValue, isEditing && styles.calculatedValue]}>
          {formatDisplayValue(value)}
        </Text>
        {isEditing && (
          <Text style={styles.calculatedHint}>Berechneter Wert (nur lesen)</Text>
        )}
      </View>
    </FieldWrapper>
  );
};

// HTML tag styles for WYSIWYG renderer
const htmlTagStyles = {
  p: { marginVertical: 8, lineHeight: 22 },
  h1: { fontSize: 24, fontWeight: '700' as const, marginVertical: 12, color: '#333' },
  h2: { fontSize: 20, fontWeight: '600' as const, marginVertical: 10, color: '#333' },
  h3: { fontSize: 18, fontWeight: '600' as const, marginVertical: 8, color: '#333' },
  ul: { marginVertical: 8 },
  ol: { marginVertical: 8 },
  li: { marginVertical: 4 },
  a: { color: '#2196f3' },
  strong: { fontWeight: '600' as const },
  em: { fontStyle: 'italic' as const },
};

const styles = StyleSheet.create({
  textareaValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  htmlContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  // Edit mode styles
  textInput: {
    backgroundColor: '#fff',
  },
  textareaInput: {
    backgroundColor: '#fff',
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  // WYSIWYG edit styles
  wysiwygToolbar: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  wysiwygToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  wysiwygToggleActive: {
    backgroundColor: '#e3f2fd',
  },
  wysiwygToggleText: {
    fontSize: 13,
    color: '#666',
  },
  wysiwygToggleTextActive: {
    color: '#1976d2',
  },
  wysiwygPreview: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#fafafa',
    minHeight: 150,
  },
  wysiwygPlaceholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  wysiwygInput: {
    backgroundColor: '#fff',
    minHeight: 200,
  },
  // Calculated field styles
  calculatedContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calculatedValue: {
    color: '#666',
  },
  calculatedHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

// Register text field types
export const textFieldTypes = {
  input: InputField,
  firstname: InputField,
  lastname: InputField,
  email: InputField,
  textarea: TextareaField,
  wysiwyg: WysiwygField,
  password: PasswordField,
  calculatedValue: CalculatedValueField,
};
