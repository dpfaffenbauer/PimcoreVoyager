/**
 * Edit component for Many-to-Many Relation data type
 * Allows adding, removing, and reordering related objects
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { Surface, Button, IconButton, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ManyToManyRelationValue,
  ManyToManyRelationConfig,
  ManyToManyRelationItem,
  RelationSearchResult,
} from './ManyToManyRelation.types';
import { ManyToManyRelationTransformer } from './ManyToManyRelation.transformer';
import {
  canAddItem,
  isItemInRelation,
} from './ManyToManyRelation.validator';
import { PimcoreService } from '../../../apis/pimcoreService';

export interface ManyToManyRelationEditProps {
  value: ManyToManyRelationValue;
  onChange: (value: ManyToManyRelationValue) => void;
  config: ManyToManyRelationConfig;
  error?: string;
  readonly?: boolean;
}

export const ManyToManyRelationEdit: React.FC<ManyToManyRelationEditProps> = ({
  value,
  onChange,
  config,
  error,
  readonly = false,
}) => {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RelationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState<'object' | 'asset' | 'document'>('object');

  const handleAddItem = (item: RelationSearchResult) => {
    const addCheck = canAddItem(value, config);
    if (!addCheck.canAdd) {
      Alert.alert('Nicht möglich', addCheck.reason || 'Element kann nicht hinzugefügt werden');
      return;
    }

    if (isItemInRelation(item, value)) {
      Alert.alert('Bereits vorhanden', 'Diese Relation existiert bereits');
      return;
    }

    const newItem: ManyToManyRelationItem = {
      id: item.id,
      type: item.type,
      subtype: item.subtype,
      path: item.path,
      key: item.key,
      className: item.className,
      published: item.published,
    };

    const newValue = value ? [...value, newItem] : [newItem];
    onChange(newValue);
    setSearchModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveItem = (index: number) => {
    if (!value) return;
    
    Alert.alert(
      'Relation entfernen',
      'Möchten Sie diese Relation wirklich entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: () => {
            const newValue = value.filter((_, i) => i !== index);
            onChange(newValue.length > 0 ? newValue : null);
          },
        },
      ]
    );
  };

  const handleMoveItem = (fromIndex: number, direction: 'up' | 'down') => {
    if (!value) return;

    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= value.length) return;

    const newValue = [...value];
    [newValue[fromIndex], newValue[toIndex]] = [newValue[toIndex], newValue[fromIndex]];
    onChange(newValue);
  };

  const handleClearAll = () => {
    if (!config.allowToClearRelation) return;

    Alert.alert(
      'Alle Relationen entfernen',
      'Möchten Sie wirklich alle Relationen entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Alle entfernen',
          style: 'destructive',
          onPress: () => onChange(null),
        },
      ]
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search for data objects
      if (selectedType === 'object') {
        const response = await PimcoreService.getDataObjects(
          config.classes?.[0], // Use first allowed class if specified
          1,
          20
        );
        
        // Filter results by search query
        const filtered = response.data
          .filter((obj) => {
            const searchLower = searchQuery.toLowerCase();
            return (
              obj.key?.toLowerCase().includes(searchLower) ||
              obj.path?.toLowerCase().includes(searchLower) ||
              obj.id?.toString().includes(searchQuery)
            );
          })
          .map((obj): RelationSearchResult => ({
            id: obj.id,
            type: 'object',
            path: obj.path || '',
            key: obj.key,
            className: obj.className,
            published: obj.published,
          }));

        setSearchResults(filtered);
      }
    } catch (err) {
      console.error('Search error:', err);
      Alert.alert('Fehler', 'Suche fehlgeschlagen');
    } finally {
      setIsSearching(false);
    }
  };

  const availableTypes = config.types || ['object', 'asset', 'document'];
  const maxItemsReached = config.maxItems && value && value.length >= config.maxItems;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {config.title}
        {config.mandatory && <Text style={styles.mandatory}> *</Text>}
      </Text>

      {/* Current Relations */}
      {value && value.length > 0 ? (
        <View style={styles.relationsList}>
          {value.map((item, index) => (
            <RelationItemEdit
              key={`${item.type}-${item.id}-${index}`}
              item={item}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < value.length - 1}
              onRemove={() => handleRemoveItem(index)}
              onMoveUp={() => handleMoveItem(index, 'up')}
              onMoveDown={() => handleMoveItem(index, 'down')}
              readonly={readonly}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="link-variant-off" size={32} color="#999" />
          <Text style={styles.emptyText}>Keine Relationen</Text>
        </View>
      )}

      {/* Actions */}
      {!readonly && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => setSearchModalVisible(true)}
            disabled={!!maxItemsReached}
            style={styles.addButton}
          >
            Relation hinzufügen
          </Button>
          {config.allowToClearRelation && value && value.length > 0 && (
            <Button
              mode="outlined"
              icon="delete-outline"
              onPress={handleClearAll}
              style={styles.clearButton}
              textColor="#f44336"
            >
              Alle entfernen
            </Button>
          )}
        </View>
      )}

      {/* Info */}
      {config.maxItems && (
        <Text style={styles.info}>
          {value ? value.length : 0} / {config.maxItems} Elemente
        </Text>
      )}

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Relation hinzufügen</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setSearchModalVisible(false)}
            />
          </View>

          {/* Type Filter */}
          {availableTypes.length > 1 && (
            <View style={styles.typeFilter}>
              {availableTypes.map((type) => (
                <Chip
                  key={type}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                  style={styles.typeChip}
                >
                  {type === 'object' ? 'Objekte' : type === 'asset' ? 'Assets' : 'Dokumente'}
                </Chip>
              ))}
            </View>
          )}

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Suchen nach Name, Pfad oder ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <IconButton icon="magnify" size={24} onPress={handleSearch} />
          </View>

          {/* Search Results */}
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleAddItem(item)}
                  disabled={isItemInRelation(item, value)}
                >
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultTitle}>
                      {ManyToManyRelationTransformer.getDisplayText(item as ManyToManyRelationItem)}
                    </Text>
                    <Text style={styles.searchResultPath}>{item.path}</Text>
                  </View>
                  {isItemInRelation(item, value) ? (
                    <Chip icon="check" compact>
                      Hinzugefügt
                    </Chip>
                  ) : (
                    <IconButton icon="plus-circle-outline" size={24} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.searchResultsList}
            />
          ) : searchQuery ? (
            <View style={styles.noResultsContainer}>
              <MaterialCommunityIcons name="magnify" size={48} color="#999" />
              <Text style={styles.noResultsText}>Keine Ergebnisse gefunden</Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
};

interface RelationItemEditProps {
  item: ManyToManyRelationItem;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  readonly?: boolean;
}

const RelationItemEdit: React.FC<RelationItemEditProps> = ({
  item,
  canMoveUp,
  canMoveDown,
  onRemove,
  onMoveUp,
  onMoveDown,
  readonly,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'object':
        return 'cube-outline';
      case 'asset':
        return 'file-image-outline';
      case 'document':
        return 'file-document-outline';
      default:
        return 'link-variant';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'object':
        return '#2196F3';
      case 'asset':
        return '#FF9800';
      case 'document':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  return (
    <Surface style={styles.relationItemEdit} elevation={1}>
      <View style={styles.relationItemEditHeader}>
        <View
          style={[
            styles.typeIconContainer,
            { backgroundColor: getTypeColor(item.type) + '20' },
          ]}
        >
          <MaterialCommunityIcons
            name={getTypeIcon(item.type)}
            size={20}
            color={getTypeColor(item.type)}
          />
        </View>
        <View style={styles.relationItemEditContent}>
          <Text style={styles.relationItemEditTitle}>
            {ManyToManyRelationTransformer.getDisplayText(item)}
          </Text>
          <Text style={styles.relationItemEditPath} numberOfLines={1}>
            {item.path}
          </Text>
        </View>
        {!readonly && (
          <View style={styles.relationItemEditActions}>
            <IconButton
              icon="arrow-up"
              size={20}
              onPress={onMoveUp}
              disabled={!canMoveUp}
            />
            <IconButton
              icon="arrow-down"
              size={20}
              onPress={onMoveDown}
              disabled={!canMoveDown}
            />
            <IconButton icon="delete-outline" size={20} onPress={onRemove} />
          </View>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  mandatory: {
    color: '#f44336',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  relationsList: {
    gap: 12,
  },
  relationItemEdit: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  relationItemEditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relationItemEditContent: {
    flex: 1,
  },
  relationItemEditTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  relationItemEditPath: {
    fontSize: 12,
    color: '#666',
  },
  relationItemEditActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    marginTop: 12,
    gap: 8,
  },
  addButton: {
    borderRadius: 8,
  },
  clearButton: {
    borderRadius: 8,
    borderColor: '#f44336',
  },
  info: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  error: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  typeFilter: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  typeChip: {
    marginRight: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsList: {
    padding: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  searchResultPath: {
    fontSize: 12,
    color: '#666',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
