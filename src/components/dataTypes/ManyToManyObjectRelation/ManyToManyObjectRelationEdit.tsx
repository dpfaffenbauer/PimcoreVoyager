/**
 * Edit component for Many-to-Many Object Relation
 * Allows adding, removing, and searching for related objects
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Surface, Button, IconButton, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DataTypeEditProps } from '../types';
import {
  ManyToManyObjectRelationValue,
  ManyToManyObjectRelationConfig,
  RelatedObject,
} from './ManyToManyObjectRelation.types';
import { PimcoreService } from '../../../apis/pimcoreService';
import { PimcoreDataObject } from '../../../types/pimcore';

interface ManyToManyObjectRelationEditProps
  extends DataTypeEditProps<ManyToManyObjectRelationValue> {
  config: ManyToManyObjectRelationConfig;
}

export const ManyToManyObjectRelationEdit: React.FC<ManyToManyObjectRelationEditProps> = ({
  value = [],
  onChange,
  config,
  error,
  readonly,
}) => {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PimcoreDataObject[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | undefined>(
    config.allowedClassId || config.classes?.[0]
  );

  const handleRemoveRelation = useCallback(
    (index: number) => {
      const newValue = [...value];
      newValue.splice(index, 1);
      onChange(newValue);
    },
    [value, onChange]
  );

  const handleAddRelation = useCallback(
    (object: PimcoreDataObject) => {
      // Check if already added
      if (value.some((item) => item.id === object.id)) {
        return;
      }

      const newRelation: RelatedObject = {
        id: object.id,
        key: object.key,
        path: object.path,
        fullPath: object.fullPath || object.path,
        type: object.type,
        className: object.className,
        published: object.published,
      };

      onChange([...value, newRelation]);
      setSearchModalVisible(false);
      setSearchQuery('');
      setSearchResults([]);
    },
    [value, onChange]
  );

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search for objects matching the query
      const response = await PimcoreService.getDataObjects(selectedClass, 1, 50);
      
      // Filter results based on search query
      const filtered = response.data.filter(
        (obj) =>
          obj.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          obj.path.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedClass]);

  const renderRelationItem = ({ item, index }: { item: RelatedObject; index: number }) => (
    <Surface style={styles.relationItem} elevation={1}>
      <View style={styles.relationContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={item.type === 'folder' ? 'folder' : 'file-document-outline'}
            size={24}
            color="#6200ee"
          />
        </View>
        <View style={styles.relationInfo}>
          <Text style={styles.relationKey} numberOfLines={1}>
            {item.key}
          </Text>
          <View style={styles.relationMeta}>
            <Text style={styles.relationClass}>{item.className || 'Object'}</Text>
            <Text style={styles.relationPath} numberOfLines={1}>
              #{item.id} • {item.path}
            </Text>
          </View>
        </View>
        {!readonly && (
          <IconButton
            icon="close"
            size={20}
            onPress={() => handleRemoveRelation(index)}
            style={styles.removeButton}
          />
        )}
      </View>
    </Surface>
  );

  const renderSearchResultItem = ({ item }: { item: PimcoreDataObject }) => {
    const isAdded = value.some((rel) => rel.id === item.id);

    return (
      <TouchableOpacity
        onPress={() => !isAdded && handleAddRelation(item)}
        disabled={isAdded}
        style={[styles.searchResultItem, isAdded && styles.searchResultItemDisabled]}
      >
        <View style={styles.searchResultContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={item.type === 'folder' ? 'folder' : 'file-document-outline'}
              size={24}
              color={isAdded ? '#ccc' : '#6200ee'}
            />
          </View>
          <View style={styles.searchResultInfo}>
            <Text style={[styles.searchResultKey, isAdded && styles.searchResultTextDisabled]}>
              {item.key}
            </Text>
            <Text style={[styles.searchResultMeta, isAdded && styles.searchResultTextDisabled]}>
              {item.className || 'Object'} • #{item.id}
            </Text>
          </View>
          {isAdded && (
            <Chip icon="check" compact style={styles.addedChip}>
              Hinzugefügt
            </Chip>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{config.label}</Text>
        {config.mandatory && <Text style={styles.required}>*</Text>}
      </View>

      {/* Selected Relations List */}
      <View style={styles.relationsList}>
        {value.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="link-variant-off" size={32} color="#ccc" />
            <Text style={styles.emptyText}>Keine Relationen ausgewählt</Text>
          </View>
        ) : (
          <FlatList
            data={value}
            renderItem={renderRelationItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Add Button */}
      {!readonly && (
        <Button
          mode="outlined"
          onPress={() => setSearchModalVisible(true)}
          icon="plus"
          style={styles.addButton}
        >
          Relation hinzufügen
        </Button>
      )}

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        onRequestClose={() => setSearchModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Objekt suchen</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setSearchModalVisible(false)}
            />
          </View>

          {/* Class Filter */}
          {config.classes && config.classes.length > 1 && (
            <View style={styles.classFilterContainer}>
              <Text style={styles.classFilterLabel}>Klasse:</Text>
              <View style={styles.classChipsContainer}>
                {config.classes.map((className) => (
                  <Chip
                    key={className}
                    selected={selectedClass === className}
                    onPress={() => setSelectedClass(className)}
                    style={styles.classChip}
                  >
                    {className}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Objektname oder Pfad suchen..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              autoFocus
            />
            <IconButton icon="magnify" size={24} onPress={handleSearch} />
          </View>

          <Divider />

          {/* Search Results */}
          <View style={styles.searchResultsContainer}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Suche läuft...</Text>
              </View>
            ) : searchResults.length === 0 && searchQuery ? (
              <View style={styles.noResultsContainer}>
                <MaterialCommunityIcons name="magnify-close" size={48} color="#ccc" />
                <Text style={styles.noResultsText}>Keine Ergebnisse gefunden</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <MaterialCommunityIcons name="magnify" size={48} color="#ccc" />
                <Text style={styles.noResultsText}>
                  Geben Sie einen Suchbegriff ein
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResultItem}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <Divider />}
              />
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#f44336',
    marginLeft: 4,
    fontSize: 16,
  },
  relationsList: {
    marginBottom: 12,
  },
  relationItem: {
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  relationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relationInfo: {
    flex: 1,
  },
  relationKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  relationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relationClass: {
    fontSize: 11,
    color: '#6200ee',
    fontWeight: '500',
  },
  relationPath: {
    fontSize: 10,
    color: '#999',
    flex: 1,
  },
  removeButton: {
    margin: 0,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  addButton: {
    borderColor: '#6200ee',
    borderWidth: 1,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  classFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  classFilterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  classChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classChip: {
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchResultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchResultItemDisabled: {
    opacity: 0.5,
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  searchResultMeta: {
    fontSize: 11,
    color: '#666',
  },
  searchResultTextDisabled: {
    color: '#999',
  },
  addedChip: {
    backgroundColor: '#e8f5e9',
  },
});
