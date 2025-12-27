/**
 * Multiselect Edit Component
 * Mobile-optimized edit component with search functionality
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Chip, Button, Searchbar, Checkbox, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DataTypeEditProps } from '../types';
import { MultiselectConfig } from './Multiselect.types';

export interface MultiselectEditProps extends DataTypeEditProps<(string | number)[]> {
  config: MultiselectConfig;
}

export const MultiselectEdit: React.FC<MultiselectEditProps> = ({
  value = [],
  onChange,
  config,
  error,
  readonly = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!config.options) {
      return [];
    }

    if (!searchQuery.trim()) {
      return config.options;
    }

    const query = searchQuery.toLowerCase();
    return config.options.filter(option =>
      option.key.toLowerCase().includes(query)
    );
  }, [config.options, searchQuery]);

  // Get selected option labels for display
  const selectedLabels = useMemo(() => {
    if (!value || value.length === 0) {
      return [];
    }

    if (!config.options) {
      return value.map(v => ({ key: String(v), value: v }));
    }

    return value
      .map(selectedValue => {
        const option = config.options?.find(opt => opt.value === selectedValue);
        return option;
      })
      .filter(Boolean) as { key: string; value: string | number }[];
  }, [value, config.options]);

  const handleToggleOption = (optionValue: string | number) => {
    const currentValues = value || [];
    const isSelected = currentValues.includes(optionValue);

    let newValues: (string | number)[];
    if (isSelected) {
      // Remove the value
      newValues = currentValues.filter(v => v !== optionValue);
    } else {
      // Check max items limit
      if (config.maxItems && currentValues.length >= config.maxItems) {
        // Don't add more if limit reached
        return;
      }
      // Add the value
      newValues = [...currentValues, optionValue];
    }

    onChange(newValues);
  };

  const handleRemoveChip = (optionValue: string | number) => {
    const newValues = (value || []).filter(v => v !== optionValue);
    onChange(newValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleOpenModal = () => {
    if (!readonly && !config.noteditable) {
      setModalVisible(true);
      setSearchQuery('');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const isMaxItemsReached = config.maxItems ? (value?.length || 0) >= config.maxItems : false;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {config.label}
          {config.mandatory && <Text style={styles.required}> *</Text>}
        </Text>
        {config.maxItems && (
          <Text style={styles.maxItems}>
            {value?.length || 0}/{config.maxItems}
          </Text>
        )}
      </View>

      {/* Selected values display */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          error ? styles.selectButtonError : undefined,
          readonly || config.noteditable ? styles.selectButtonReadonly : undefined,
        ]}
        onPress={handleOpenModal}
        disabled={readonly || config.noteditable}
        activeOpacity={0.7}
      >
        <View style={styles.selectButtonContent}>
          {selectedLabels.length === 0 ? (
            <Text style={styles.placeholder}>
              {config.placeholder || 'Auswählen...'}
            </Text>
          ) : (
            <View style={styles.chipsContainer}>
              {selectedLabels.map((option, index) => (
                <Chip
                  key={`${option.value}-${index}`}
                  style={styles.chip}
                  textStyle={styles.chipText}
                  onClose={
                    readonly || config.noteditable
                      ? undefined
                      : () => handleRemoveChip(option.value)
                  }
                  closeIcon="close"
                >
                  {option.key}
                </Chip>
              ))}
            </View>
          )}
          {!readonly && !config.noteditable && (
            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
          )}
        </View>
      </TouchableOpacity>

      {/* Clear all button */}
      {selectedLabels.length > 0 && config.allowClear !== false && !readonly && !config.noteditable && (
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Alle entfernen</Text>
        </TouchableOpacity>
      )}

      {/* Error message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{config.label}</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {config.options && config.options.length > 5 && (
              <Searchbar
                placeholder="Suchen..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
              />
            )}

            {/* Max items warning */}
            {isMaxItemsReached && (
              <View style={styles.warningContainer}>
                <MaterialCommunityIcons name="alert" size={20} color="#ff9800" />
                <Text style={styles.warningText}>
                  Maximale Anzahl erreicht ({config.maxItems})
                </Text>
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = (value || []).includes(item.value);
                const isDisabled = isMaxItemsReached && !isSelected;

                return (
                  <>
                    <List.Item
                      title={item.key}
                      onPress={() => !isDisabled && handleToggleOption(item.value)}
                      disabled={isDisabled}
                      left={() => (
                        <Checkbox
                          status={isSelected ? 'checked' : 'unchecked'}
                          onPress={() => !isDisabled && handleToggleOption(item.value)}
                          disabled={isDisabled}
                        />
                      )}
                      style={[
                        styles.listItem,
                        isDisabled && styles.listItemDisabled,
                      ]}
                      titleStyle={[
                        styles.listItemTitle,
                        isDisabled && styles.listItemTitleDisabled,
                      ]}
                    />
                    <Divider />
                  </>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="magnify" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Keine Ergebnisse gefunden' : 'Keine Optionen verfügbar'}
                  </Text>
                </View>
              }
              style={styles.optionsList}
            />

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={handleCloseModal}
                style={styles.doneButton}
              >
                Fertig ({selectedLabels.length} ausgewählt)
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
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
    color: '#e53e3e',
  },
  maxItems: {
    fontSize: 12,
    color: '#666',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 56,
  },
  selectButtonError: {
    borderColor: '#e53e3e',
  },
  selectButtonReadonly: {
    backgroundColor: '#f5f5f5',
  },
  selectButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    color: '#999',
    fontSize: 16,
  },
  chipsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginRight: 8,
  },
  chip: {
    marginBottom: 4,
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  chipText: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  clearButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: '#6200ee',
    fontSize: 13,
    fontWeight: '500',
  },
  error: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchBar: {
    margin: 16,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    color: '#e65100',
    fontSize: 13,
    flex: 1,
  },
  optionsList: {
    flex: 1,
  },
  listItem: {
    paddingVertical: 12,
  },
  listItemDisabled: {
    opacity: 0.5,
  },
  listItemTitle: {
    fontSize: 15,
  },
  listItemTitleDisabled: {
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  modalFooter: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  doneButton: {
    borderRadius: 8,
  },
});
