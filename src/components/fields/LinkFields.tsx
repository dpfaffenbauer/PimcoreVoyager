/**
 * Link field renderers
 * Supports both view and edit modes
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, TextInput, Button, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps, FieldOption } from './types';

// Target options for links
const TARGET_OPTIONS: FieldOption[] = [
  { key: '', value: 'Standard' },
  { key: '_blank', value: 'Neues Fenster (_blank)' },
  { key: '_self', value: 'Gleiches Fenster (_self)' },
  { key: '_parent', value: 'Elternfenster (_parent)' },
  { key: '_top', value: 'Oberstes Fenster (_top)' },
];

// Link field - supports both view and edit modes
export const LinkField: React.FC<FieldRendererProps> = ({
  value,
  title,
  mandatory,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const isDisabled = field?.noteditable;

  // Normalize link value
  const linkValue = value || {};
  const linkType = linkValue.type || 'external';
  const linkText = linkValue.text || '';
  const linkPath = linkValue.path || linkValue.href || '';
  const linkTarget = linkValue.target || '';
  const linkParameters = linkValue.parameters || '';
  const linkAnchor = linkValue.anchor || '';

  const handleFieldUpdate = (key: string, val: string) => {
    onFieldChange?.({
      ...linkValue,
      [key]: val,
    });
  };

  const selectedTargetLabel = TARGET_OPTIONS.find(t => t.key === linkTarget)?.value || 'Standard';

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <View style={styles.linkEditContainer}>
          {/* Link Text */}
          <View style={styles.linkEditRow}>
            <Text style={styles.linkEditLabel}>Link-Text:</Text>
            <TextInput
              value={linkText}
              onChangeText={(text) => handleFieldUpdate('text', text)}
              mode="outlined"
              dense
              disabled={isDisabled}
              style={styles.linkEditInput}
              placeholder="Anzeigetext"
            />
          </View>

          {/* Link Path/URL */}
          <View style={styles.linkEditRow}>
            <Text style={styles.linkEditLabel}>URL / Pfad:</Text>
            <TextInput
              value={linkPath}
              onChangeText={(text) => handleFieldUpdate('path', text)}
              mode="outlined"
              dense
              disabled={isDisabled}
              style={styles.linkEditInput}
              placeholder="https://... oder /pfad"
              keyboardType="url"
            />
          </View>

          {/* Expand for more options */}
          <Pressable onPress={() => setExpanded(!expanded)} style={styles.linkExpandButton}>
            <Text style={styles.linkExpandText}>
              {expanded ? 'Weniger Optionen' : 'Mehr Optionen'}
            </Text>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#6200ee"
            />
          </Pressable>

          {expanded && (
            <>
              {/* Target */}
              <View style={styles.linkEditRow}>
                <Text style={styles.linkEditLabel}>Ziel:</Text>
                <Pressable
                  onPress={() => !isDisabled && setTargetModalVisible(true)}
                  style={[styles.linkTargetButton, isDisabled && styles.linkTargetButtonDisabled]}
                >
                  <Text style={styles.linkTargetButtonText}>{selectedTargetLabel}</Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
                </Pressable>
              </View>

              {/* Parameters */}
              <View style={styles.linkEditRow}>
                <Text style={styles.linkEditLabel}>Parameter:</Text>
                <TextInput
                  value={linkParameters}
                  onChangeText={(text) => handleFieldUpdate('parameters', text)}
                  mode="outlined"
                  dense
                  disabled={isDisabled}
                  style={styles.linkEditInput}
                  placeholder="param=value&..."
                />
              </View>

              {/* Anchor */}
              <View style={styles.linkEditRow}>
                <Text style={styles.linkEditLabel}>Anker:</Text>
                <TextInput
                  value={linkAnchor}
                  onChangeText={(text) => handleFieldUpdate('anchor', text)}
                  mode="outlined"
                  dense
                  disabled={isDisabled}
                  style={styles.linkEditInput}
                  placeholder="#section"
                />
              </View>
            </>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Portal>
          <Modal
            visible={targetModalVisible}
            onDismiss={() => setTargetModalVisible(false)}
            contentContainerStyle={styles.targetModalContainer}
          >
            <View style={styles.targetModal}>
              <View style={styles.targetModalHeader}>
                <Text style={styles.targetModalTitle}>Ziel auswählen</Text>
                <Button onPress={() => setTargetModalVisible(false)}>Schließen</Button>
              </View>
              <ScrollView style={styles.targetModalList} bounces={false}>
                {TARGET_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => {
                      handleFieldUpdate('target', opt.key);
                      setTargetModalVisible(false);
                    }}
                    style={[
                      styles.targetModalItem,
                      linkTarget === opt.key && styles.targetModalItemSelected,
                    ]}
                  >
                    {linkTarget === opt.key && (
                      <MaterialCommunityIcons name="check" size={20} color="#6200ee" style={{ marginRight: 12 }} />
                    )}
                    <Text style={[
                      styles.targetModalItemText,
                      linkTarget === opt.key && styles.targetModalItemTextSelected,
                    ]}>
                      {opt.value}
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

  // View mode - no value
  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  // View mode - with value
  const displayText = linkText || linkPath || '-';
  const displayPath = linkPath || '';

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.linkContainer}>
        <MaterialCommunityIcons name="link" size={18} color="#2196f3" style={styles.linkIcon} />
        <Text style={styles.linkText} numberOfLines={2} selectable>
          {typeof displayText === 'string' ? displayText : JSON.stringify(displayText)}
        </Text>
      </View>
      {linkText && displayPath && linkText !== displayPath && (
        <Text style={styles.linkPath} selectable>{displayPath}</Text>
      )}
      {linkTarget && (
        <Text style={styles.linkTarget}>Ziel: {selectedTargetLabel}</Text>
      )}
    </FieldWrapper>
  );
};

const styles = StyleSheet.create({
  // View mode styles
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginRight: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#2196f3',
    flex: 1,
  },
  linkPath: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 26,
  },
  linkTarget: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 26,
  },
  // Edit mode styles
  linkEditContainer: {
    gap: 12,
  },
  linkEditRow: {
    gap: 4,
  },
  linkEditLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  linkEditInput: {
    backgroundColor: '#fff',
  },
  linkExpandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  linkExpandText: {
    fontSize: 13,
    color: '#6200ee',
  },
  linkTargetButton: {
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
  linkTargetButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  linkTargetButtonText: {
    fontSize: 15,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  // Target modal styles
  targetModalContainer: {
    paddingTop: '20%',
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'flex-start',
  },
  targetModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '50%',
    overflow: 'hidden',
  },
  targetModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  targetModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  targetModalList: {
    flexGrow: 0,
  },
  targetModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  targetModalItemSelected: {
    backgroundColor: '#f3e5f5',
  },
  targetModalItemText: {
    fontSize: 15,
    color: '#333',
  },
  targetModalItemTextSelected: {
    color: '#6200ee',
    fontWeight: '500',
  },
});

// Register link field types
export const linkFieldTypes = {
  link: LinkField,
  externalLink: LinkField,
};
