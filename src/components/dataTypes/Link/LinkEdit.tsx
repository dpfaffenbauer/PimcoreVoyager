/**
 * Link Edit Component
 * Allows editing of a Pimcore Link field
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, SegmentedButtons } from 'react-native-paper';
import { LinkEditProps, LinkValue } from './Link.types';

export const LinkEdit: React.FC<LinkEditProps> = ({
  value,
  onChange,
  config,
  error,
  readonly = false,
}) => {
  const [linkType, setLinkType] = useState<'direct' | 'internal'>(
    value?.linktype || 'direct'
  );

  /**
   * Update a specific field in the link value
   */
  const updateField = (field: keyof LinkValue, fieldValue: any) => {
    const newValue: LinkValue = {
      text: value?.text || '',
      linktype: linkType,
      direct: linkType === 'direct' ? value?.direct || null : null,
      internal: linkType === 'internal' ? value?.internal || null : null,
      internalType: value?.internalType || null,
      fullPath: value?.fullPath || '',
      target: value?.target || null,
      parameters: value?.parameters || '',
      anchor: value?.anchor || '',
      title: value?.title || '',
      accesskey: value?.accesskey || '',
      rel: value?.rel || '',
      tabindex: value?.tabindex || '',
      class: value?.class || '',
      ...value,
      [field]: fieldValue,
    };

    onChange(newValue);
  };

  /**
   * Handle link type change
   */
  const handleLinkTypeChange = (type: string) => {
    const newType = type as 'direct' | 'internal';
    setLinkType(newType);
    
    const newValue: LinkValue = {
      ...value,
      text: value?.text || '',
      linktype: newType,
      direct: newType === 'direct' ? value?.direct || null : null,
      internal: newType === 'internal' ? value?.internal || null : null,
      internalType: value?.internalType || null,
      fullPath: value?.fullPath || '',
      target: value?.target || null,
      parameters: value?.parameters || '',
      anchor: value?.anchor || '',
      title: value?.title || '',
      accesskey: value?.accesskey || '',
      rel: value?.rel || '',
      tabindex: value?.tabindex || '',
      class: value?.class || '',
    };

    onChange(newValue);
  };

  /**
   * Clear the link value
   */
  const handleClear = () => {
    onChange(null);
  };

  /**
   * Check if a field is disabled
   */
  const isFieldDisabled = (fieldName: string): boolean => {
    return (
      readonly ||
      !!config.noteditable ||
      !!(config.disabledFields && config.disabledFields.includes(fieldName))
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {config.label}
          {config.required && <Text style={styles.required}> *</Text>}
        </Text>
        
        {value && !readonly && !config.noteditable && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="close-circle" size={20} color="#f44336" />
          </TouchableOpacity>
        )}
      </View>

      <Surface style={styles.formContainer} elevation={1}>
        {/* Link Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Link Type</Text>
          <SegmentedButtons
            value={linkType}
            onValueChange={handleLinkTypeChange}
            buttons={[
              {
                value: 'direct',
                label: 'Direct URL',
                icon: 'link',
                disabled: readonly || !!config.noteditable,
              },
              {
                value: 'internal',
                label: 'Internal',
                icon: 'file-document',
                disabled: readonly || !!config.noteditable,
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Link Text */}
        {!isFieldDisabled('text') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Link Text</Text>
            <TextInput
              style={[styles.input, isFieldDisabled('text') && styles.inputDisabled]}
              value={value?.text || ''}
              onChangeText={(text) => updateField('text', text)}
              placeholder="Enter link text"
              editable={!isFieldDisabled('text')}
            />
          </View>
        )}

        {/* Direct URL Input */}
        {linkType === 'direct' && !isFieldDisabled('direct') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>URL</Text>
            <TextInput
              style={[styles.input, isFieldDisabled('direct') && styles.inputDisabled]}
              value={value?.direct || ''}
              onChangeText={(text) => updateField('direct', text)}
              placeholder="https://example.com"
              editable={!isFieldDisabled('direct')}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Internal Link Selection */}
        {linkType === 'internal' && !isFieldDisabled('internal') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Internal Object</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                isFieldDisabled('internal') && styles.selectButtonDisabled,
              ]}
              disabled={isFieldDisabled('internal')}
              onPress={() => {
                // TODO: Implement object selection modal
                alert('Object selection will be implemented');
              }}
            >
              <View style={styles.selectContent}>
                <MaterialCommunityIcons name="folder-search" size={20} color="#666" />
                <Text style={styles.selectText}>
                  {value?.internal
                    ? `ID: ${value.internal}${value.fullPath ? ` (${value.fullPath})` : ''}`
                    : 'Select an internal object'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Advanced Options */}
        {!isFieldDisabled('target') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Target</Text>
            <TextInput
              style={[styles.input, isFieldDisabled('target') && styles.inputDisabled]}
              value={value?.target || ''}
              onChangeText={(text) => updateField('target', text)}
              placeholder="_blank, _self, etc."
              editable={!isFieldDisabled('target')}
            />
          </View>
        )}

        {!isFieldDisabled('title') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Title</Text>
            <TextInput
              style={[styles.input, isFieldDisabled('title') && styles.inputDisabled]}
              value={value?.title || ''}
              onChangeText={(text) => updateField('title', text)}
              placeholder="Link title"
              editable={!isFieldDisabled('title')}
            />
          </View>
        )}

        {!isFieldDisabled('anchor') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Anchor</Text>
            <TextInput
              style={[styles.input, isFieldDisabled('anchor') && styles.inputDisabled]}
              value={value?.anchor || ''}
              onChangeText={(text) => updateField('anchor', text)}
              placeholder="#section"
              editable={!isFieldDisabled('anchor')}
            />
          </View>
        )}

        {!isFieldDisabled('parameters') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Parameters</Text>
            <TextInput
              style={[styles.input, isFieldDisabled('parameters') && styles.inputDisabled]}
              value={value?.parameters || ''}
              onChangeText={(text) => updateField('parameters', text)}
              placeholder="param1=value1&param2=value2"
              editable={!isFieldDisabled('parameters')}
            />
          </View>
        )}

        {!isFieldDisabled('rel') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Rel Attribute</Text>
            <TextInput
              style={[styles.input, isFieldDisabled('rel') && styles.inputDisabled]}
              value={value?.rel || ''}
              onChangeText={(text) => updateField('rel', text)}
              placeholder="nofollow, noopener, etc."
              editable={!isFieldDisabled('rel')}
            />
          </View>
        )}
      </Surface>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#f44336',
  },
  clearButton: {
    padding: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentedButtons: {
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  selectContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  error: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
});
