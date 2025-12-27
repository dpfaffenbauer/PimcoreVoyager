/**
 * LocalizedfieldsDisplay Component
 * Displays localized field values in a read-only format
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DataTypeDisplayProps } from '../common/types';
import { LocalizedValue, LocalizedfieldsConfig } from './Localizedfields.types';

export const LocalizedfieldsDisplay: React.FC<DataTypeDisplayProps> = ({ value, config }) => {
  const typedValue = value as LocalizedValue;
  const typedConfig = config as LocalizedfieldsConfig;
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Get available languages from the value
  const languages = typedValue ? Object.keys(typedValue) : [];

  // Auto-select first language if none selected
  React.useEffect(() => {
    if (languages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages.length, selectedLanguage]);

  if (!typedValue || languages.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{typedConfig.title || typedConfig.label || typedConfig.name}</Text>
        <Text style={styles.emptyText}>Keine lokalisierten Daten vorhanden</Text>
      </View>
    );
  }

  const currentLangData = selectedLanguage ? typedValue[selectedLanguage] : null;
  const fieldDefinitions = typedConfig.fieldDefinitions || typedConfig.children || typedConfig.referencedFields || [];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{typedConfig.title || typedConfig.label || typedConfig.name}</Text>

      {/* Language Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.languageTabsContainer}
        contentContainerStyle={styles.languageTabsContent}
      >
        {languages.map(langCode => (
          <TouchableOpacity
            key={langCode}
            style={[
              styles.languageTab,
              selectedLanguage === langCode && styles.languageTabActive,
            ]}
            onPress={() => setSelectedLanguage(langCode)}
          >
            <Text
              style={[
                styles.languageTabText,
                selectedLanguage === langCode && styles.languageTabTextActive,
              ]}
            >
              {langCode.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Field Values */}
      <View style={styles.fieldsContainer}>
        {currentLangData && fieldDefinitions.length > 0 ? (
          fieldDefinitions.map(fieldDef => {
            const fieldValue = currentLangData[fieldDef.name];
            const displayValue = fieldValue !== null && fieldValue !== undefined 
              ? String(fieldValue) 
              : '-';

            return (
              <View key={fieldDef.name} style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>
                  {fieldDef.title || fieldDef.name}
                  {fieldDef.mandatory && <Text style={styles.mandatory}> *</Text>}
                </Text>
                <Text style={styles.fieldValue}>{displayValue}</Text>
              </View>
            );
          })
        ) : currentLangData ? (
          // If no field definitions, show all fields
          Object.keys(currentLangData).map(fieldName => {
            const fieldValue = currentLangData[fieldName];
            const displayValue = fieldValue !== null && fieldValue !== undefined 
              ? String(fieldValue) 
              : '-';

            return (
              <View key={fieldName} style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>{fieldName}</Text>
                <Text style={styles.fieldValue}>{displayValue}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Keine Daten für diese Sprache</Text>
        )}
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
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
  },
  languageTabActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  languageTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  languageTabTextActive: {
    color: '#fff',
  },
  fieldsContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  fieldItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  mandatory: {
    color: '#e53e3e',
  },
  fieldValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '400',
  },
});
