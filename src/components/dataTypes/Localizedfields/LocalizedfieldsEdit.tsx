/**
 * LocalizedfieldsEdit Component
 * Allows editing of localized field values with language tabs
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { DataTypeEditProps } from '../common/types';
import { LocalizedValue, LocalizedfieldsConfig } from './Localizedfields.types';

// Available languages - in a real app, this should come from Pimcore configuration
const DEFAULT_LANGUAGES = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
];

export const LocalizedfieldsEdit: React.FC<DataTypeEditProps> = ({ 
  value, 
  onChange, 
  config,
  error,
  readonly 
}) => {
  const typedValue = (value || {}) as LocalizedValue;
  const typedConfig = config as LocalizedfieldsConfig;
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_LANGUAGES[0].code);

  // Initialize empty structure for languages if not exists
  const ensureLanguageStructure = useCallback((langCode: string): LocalizedValue => {
    const currentValue = { ...typedValue };
    if (!currentValue[langCode]) {
      currentValue[langCode] = {};
    }
    return currentValue;
  }, [typedValue]);

  // Handle field value change
  const handleFieldChange = useCallback((fieldName: string, fieldValue: any) => {
    const updatedValue = ensureLanguageStructure(selectedLanguage);
    updatedValue[selectedLanguage] = {
      ...updatedValue[selectedLanguage],
      [fieldName]: fieldValue,
    };
    onChange(updatedValue);
  }, [selectedLanguage, ensureLanguageStructure, onChange]);

  const currentLangData = typedValue[selectedLanguage] || {};
  const fieldDefinitions = typedConfig.fieldDefinitions || typedConfig.children || typedConfig.referencedFields || [];

  // Get available languages (combine existing languages in data with default languages)
  const existingLanguages = Object.keys(typedValue);
  const availableLanguages = DEFAULT_LANGUAGES.filter(
    lang => existingLanguages.includes(lang.code) || true // Show all default languages
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {typedConfig.title || typedConfig.label || typedConfig.name}
        {typedConfig.mandatory && <Text style={styles.mandatory}> *</Text>}
      </Text>

      {/* Language Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.languageTabsContainer}
        contentContainerStyle={styles.languageTabsContent}
      >
        {availableLanguages.map(lang => {
          const hasData = typedValue[lang.code] && Object.keys(typedValue[lang.code]).length > 0;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageTab,
                selectedLanguage === lang.code && styles.languageTabActive,
                hasData && styles.languageTabWithData,
              ]}
              onPress={() => setSelectedLanguage(lang.code)}
              disabled={readonly}
            >
              <Text
                style={[
                  styles.languageTabText,
                  selectedLanguage === lang.code && styles.languageTabTextActive,
                ]}
              >
                {lang.code.toUpperCase()}
              </Text>
              {hasData && (
                <View style={[
                  styles.dataIndicator,
                  selectedLanguage === lang.code && styles.dataIndicatorActive,
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Field Inputs */}
      <View style={styles.fieldsContainer}>
        {fieldDefinitions.length > 0 ? (
          fieldDefinitions.map(fieldDef => {
            const fieldValue = currentLangData[fieldDef.name] || '';
            const isFieldReadonly = readonly || fieldDef.noteditable;
            const fieldType = fieldDef.fieldtype || fieldDef.type || 'text';

            // Simple text input for basic types - in a real implementation,
            // this would delegate to specific field type components
            return (
              <View key={fieldDef.name} style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>
                  {fieldDef.title || fieldDef.name}
                  {fieldDef.mandatory && <Text style={styles.mandatory}> *</Text>}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    isFieldReadonly && styles.inputReadonly,
                  ]}
                  value={String(fieldValue)}
                  onChangeText={(text) => handleFieldChange(fieldDef.name, text)}
                  placeholder={`${fieldDef.title || fieldDef.name} eingeben...`}
                  editable={!isFieldReadonly}
                  multiline={fieldType === 'textarea'}
                  numberOfLines={fieldType === 'textarea' ? 4 : 1}
                />
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            Keine Felder definiert für diesen Typ
          </Text>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  mandatory: {
    color: '#e53e3e',
  },
  languageTabsContainer: {
    marginBottom: 16,
    maxHeight: 44,
  },
  languageTabsContent: {
    paddingHorizontal: 4,
  },
  languageTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageTabActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  languageTabWithData: {
    borderColor: '#4caf50',
    borderWidth: 2,
  },
  languageTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  languageTabTextActive: {
    color: '#fff',
  },
  dataIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4caf50',
    marginLeft: 6,
  },
  dataIndicatorActive: {
    backgroundColor: '#fff',
  },
  fieldsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fieldItem: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  inputReadonly: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 8,
  },
});
