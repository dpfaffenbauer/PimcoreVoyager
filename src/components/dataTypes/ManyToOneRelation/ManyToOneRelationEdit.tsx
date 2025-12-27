/**
 * Edit Component for Many-to-One Relation
 * Provides search, filter and selection of related objects
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DataTypeEditProps } from '../types';
import { ManyToOneRelationValue, ManyToOneRelationConfig, RelationSearchResult } from './ManyToOneRelation.types';
import { PimcoreService } from '../../../apis/pimcoreService';

export const ManyToOneRelationEdit: React.FC<
  DataTypeEditProps<ManyToOneRelationValue | null, ManyToOneRelationConfig>
> = ({ value, onChange, config, error, readonly, style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RelationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!modalVisible || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, modalVisible, selectedClass]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Get objects based on search query and class filter
      const classId = selectedClass || config.classes?.[0];
      
      if (classId) {
        const response = await PimcoreService.getDataObjects(classId, 1, 50);
        
        // Filter results by search query (case-insensitive)
        const filtered = response.data.filter((obj) => {
          const searchLower = query.toLowerCase();
          return (
            obj.key?.toLowerCase().includes(searchLower) ||
            obj.path?.toLowerCase().includes(searchLower) ||
            obj.id?.toString().includes(searchLower)
          );
        });

        setSearchResults(
          filtered.map((obj) => ({
            id: obj.id,
            type: obj.type || 'object',
            className: obj.className,
            key: obj.key,
            path: obj.path,
            fullPath: obj.path ? `${obj.path}/${obj.key}` : obj.key,
            published: obj.published,
            modificationDate: obj.modificationDate,
          }))
        );
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = useCallback(
    (item: RelationSearchResult) => {
      onChange({
        id: item.id,
        type: item.type,
        className: item.className,
        key: item.key,
        path: item.path,
        published: item.published,
      });
      setModalVisible(false);
      setSearchQuery('');
      setSearchResults([]);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

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
        return '#4CAF50';
      case 'document':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const renderSearchResult = ({ item }: { item: RelationSearchResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
      <View
        style={[styles.resultIcon, { backgroundColor: `${getTypeColor(item.type)}20` }]}
      >
        <MaterialCommunityIcons
          name={getTypeIcon(item.type)}
          size={20}
          color={getTypeColor(item.type)}
        />
      </View>
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultKey} numberOfLines={1}>
            {item.key}
          </Text>
          {item.published === false && (
            <View style={styles.draftBadge}>
              <Text style={styles.draftText}>Draft</Text>
            </View>
          )}
        </View>
        {item.className && <Text style={styles.resultClass}>{item.className}</Text>}
        <Text style={styles.resultPath} numberOfLines={1}>
          {item.fullPath}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {config.title}
        {config.mandatory && <Text style={styles.required}> *</Text>}
      </Text>

      {value ? (
        <View style={styles.selectedContainer}>
          <View
            style={[styles.iconContainer, { backgroundColor: `${getTypeColor(value.type)}20` }]}
          >
            <MaterialCommunityIcons
              name={getTypeIcon(value.type)}
              size={24}
              color={getTypeColor(value.type)}
            />
          </View>
          <View style={styles.selectedContent}>
            <Text style={styles.selectedKey} numberOfLines={1}>
              {value.key || `Object #${value.id}`}
            </Text>
            {value.className && <Text style={styles.selectedClass}>{value.className}</Text>}
            {value.path && (
              <Text style={styles.selectedPath} numberOfLines={1}>
                {value.path}
              </Text>
            )}
          </View>
          {!readonly && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <MaterialCommunityIcons name="close-circle" size={24} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.selectButton, readonly && styles.selectButtonDisabled]}
          onPress={() => !readonly && setModalVisible(true)}
          disabled={readonly}
        >
          <MaterialCommunityIcons name="link-variant-plus" size={20} color="#6200ee" />
          <Text style={styles.selectButtonText}>Select Relation</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select {config.title}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, path or ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {config.classes && config.classes.length > 1 && (
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by class:</Text>
              <View style={styles.classChips}>
                <TouchableOpacity
                  style={[styles.classChip, !selectedClass && styles.classChipActive]}
                  onPress={() => setSelectedClass(null)}
                >
                  <Text
                    style={[
                      styles.classChipText,
                      !selectedClass && styles.classChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {config.classes.map((className) => (
                  <TouchableOpacity
                    key={className}
                    style={[
                      styles.classChip,
                      selectedClass === className && styles.classChipActive,
                    ]}
                    onPress={() => setSelectedClass(className)}
                  >
                    <Text
                      style={[
                        styles.classChipText,
                        selectedClass === className && styles.classChipTextActive,
                      ]}
                    >
                      {className}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchQuery.trim() === '' ? (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="magnify" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>Enter a search term to find objects</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="file-search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No results found</Text>
              <Text style={styles.emptyStateHint}>Try a different search term</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={renderSearchResult}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </SafeAreaView>
      </Modal>
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
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e53e3e',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6200ee',
    borderStyle: 'dashed',
  },
  selectButtonDisabled: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ee',
    marginLeft: 8,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedContent: {
    flex: 1,
  },
  selectedKey: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  selectedClass: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  selectedPath: {
    fontSize: 12,
    color: '#999',
  },
  clearButton: {
    padding: 4,
  },
  error: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  classChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  classChipActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  classChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  classChipTextActive: {
    color: '#fff',
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsList: {
    padding: 16,
    paddingTop: 0,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  resultKey: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  resultClass: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resultPath: {
    fontSize: 11,
    color: '#999',
  },
  draftBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  draftText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});
