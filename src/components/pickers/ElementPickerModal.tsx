/**
 * Element Picker Modal
 * Unified picker for selecting Data Objects, Assets, and Documents
 * Similar UI to the SearchScreen with tabs and filters
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  ActivityIndicator,
  Divider,
  Button,
  Portal,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchService, SearchResult } from '../../apis/searchService';
import { PimcoreService } from '../../apis/pimcoreService';
import { useInstanceStore } from '../../store/instanceStore';

type ElementTab = 'all' | 'documents' | 'assets' | 'dataObjects';

export interface SelectedElement {
  id: number;
  type: string;
  subtype?: string;
  fullpath?: string;
  fullPath?: string;
  key?: string;
  filename?: string;
  classname?: string;
  published?: boolean;
}

interface ElementPickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (element: SelectedElement) => void;
  onMultiSelect?: (elements: SelectedElement[]) => void;
  title?: string;
  allowedTypes?: ('dataObject' | 'asset' | 'document')[];
  filterClasses?: string[];
  filterAssetTypes?: string[];
  filterDocumentTypes?: string[];
  multiSelect?: boolean;
  selectedIds?: number[];
}

const THEME = {
  PRIMARY_COLOR: '#6200ee',
  TEXT_PRIMARY: '#333',
  TEXT_SECONDARY: '#666',
  TEXT_DISABLED: '#999',
};

const documentTypes = ['page', 'snippet', 'link', 'email', 'hardlink', 'folder'];
const assetTypes = ['image', 'video', 'audio', 'document', 'archive', 'folder', 'text'];

export const ElementPickerModal: React.FC<ElementPickerModalProps> = ({
  visible,
  onDismiss,
  onSelect,
  onMultiSelect,
  title = 'Element auswählen',
  allowedTypes = ['dataObject', 'asset', 'document'],
  filterClasses,
  filterAssetTypes,
  filterDocumentTypes,
  multiSelect = false,
  selectedIds = [],
}) => {
  const getInitialTab = (): ElementTab => {
    if (allowedTypes.length === 1) {
      if (allowedTypes[0] === 'dataObject') return 'dataObjects';
      if (allowedTypes[0] === 'asset') return 'assets';
      if (allowedTypes[0] === 'document') return 'documents';
    }
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<ElementTab>(getInitialTab());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([]);
  const pageSize = 20;

  // Filters - auto-set classFilter if only one class is allowed
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<string | undefined>(
    filterClasses?.length === 1 ? filterClasses[0] : undefined
  );
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const { activeInstance } = useInstanceStore();

  // Load data when modal opens or tab changes
  useEffect(() => {
    if (visible) {
      const initialTab = getInitialTab();
      setActiveTab(initialTab);
      setSearchTerm('');
      setSelectedElements([]);
      setPage(1);
      setTotalItems(0);
      setTypeFilter(undefined);

      // Load classes first, then data (classes needed to resolve class IDs)
      const initModal = async () => {
        const loadedClasses = await loadClasses();
        loadData('', initialTab, 1, false, loadedClasses);
      };
      initModal();
    }
  }, [visible]);

  const loadClasses = async (): Promise<Array<{ id: string; name: string }>> => {
    try {
      const classDefinitions = await PimcoreService.getClassDefinitions();
      const loadedClasses = classDefinitions.map((c) => ({ id: c.id, name: c.name }));
      setClasses(loadedClasses);
      return loadedClasses;
    } catch (error) {
      // Error loading classes
      return [];
    }
  };

  const loadData = useCallback(async (
    query: string,
    tab: ElementTab,
    pageNum: number,
    append: boolean,
    loadedClasses?: Array<{ id: string; name: string }>
  ) => {
    setIsLoading(true);

    // Use passed classes or fall back to state
    const availableClasses = loadedClasses || classes;

    try {
      let response;
      const searchQuery = query.trim() || '*'; // Use wildcard for browse mode

      switch (tab) {
        case 'all':
          response = await SearchService.quickSearch(searchQuery === '*' ? '' : searchQuery, pageNum, pageSize);
          // Filter by allowed types
          const filteredItems = response.items.filter((item: any) => {
            if (allowedTypes.includes('dataObject') && item.elementType === 'dataObject') return true;
            if (allowedTypes.includes('asset') && item.elementType === 'asset') return true;
            if (allowedTypes.includes('document') && item.elementType === 'document') return true;
            return false;
          });
          if (append) {
            setResults(prev => [...prev, ...filteredItems]);
          } else {
            setResults(filteredItems);
          }
          setTotalItems(filteredItems.length);
          break;

        case 'documents':
          response = await SearchService.searchDocuments(searchQuery, pageNum, pageSize, typeFilter);
          if (append) {
            setResults(prev => [...prev, ...response.items]);
          } else {
            setResults(response.items);
          }
          setTotalItems(response.totalItems);
          break;

        case 'assets':
          // Use filterAssetTypes if provided, otherwise use typeFilter
          const assetTypeFilter = filterAssetTypes?.length === 1 ? filterAssetTypes[0] : typeFilter;
          response = await SearchService.searchAssets(searchQuery, pageNum, pageSize, assetTypeFilter);
          if (append) {
            setResults(prev => [...prev, ...response.items]);
          } else {
            setResults(response.items);
          }
          setTotalItems(response.totalItems);
          break;

        case 'dataObjects':
          // Resolve class filter: filterClasses may contain class names, but API expects class IDs
          // Look up the actual class ID if we have a class filter
          let resolvedClassId = classFilter;
          if (classFilter && availableClasses.length > 0) {
            // Check if classFilter is a name (needs lookup) or already an ID
            const matchByName = availableClasses.find(c => c.name === classFilter);
            const matchById = availableClasses.find(c => c.id === classFilter);
            if (matchByName) {
              resolvedClassId = matchByName.id;
            } else if (matchById) {
              resolvedClassId = matchById.id;
            }
          }

          try {
            response = await SearchService.searchDataObjects(searchQuery, pageNum, pageSize, resolvedClassId);
          } catch (classError) {
            // Class filter failed (class may not exist), retry without filter
            response = await SearchService.searchDataObjects(searchQuery, pageNum, pageSize, undefined);
          }
          if (append) {
            setResults(prev => [...prev, ...response.items]);
          } else {
            setResults(response.items);
          }
          setTotalItems(response.totalItems);
          break;
      }
      setPage(pageNum);
    } catch (error) {
      if (!append) {
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [allowedTypes, typeFilter, classFilter, filterAssetTypes]);

  const handleSearch = () => {
    loadData(searchTerm, activeTab, 1, false);
  };

  const handleLoadMore = () => {
    if (isLoading || results.length >= totalItems) return;
    loadData(searchTerm, activeTab, page + 1, true);
  };

  const handleTabChange = (tab: ElementTab) => {
    setActiveTab(tab);
    setTypeFilter(undefined);
    setResults([]);
    setTotalItems(0);
    loadData(searchTerm, tab, 1, false);
  };

  const handleFilterSelect = (filter: string | undefined) => {
    if (activeTab === 'dataObjects') {
      setClassFilter(filter);
    } else {
      setTypeFilter(filter);
    }
    setFilterModalVisible(false);
    // Reload with new filter
    setTimeout(() => {
      loadData(searchTerm, activeTab, 1, false);
    }, 100);
  };

  const handleItemPress = (item: SearchResult) => {
    if (item.type === 'folder') return;

    const element: SelectedElement = {
      id: item.id,
      type: (item as any).elementType || item.type,
      subtype: item.type,
      fullpath: item.fullpath,
      fullPath: item.fullpath,
      key: item.key || item.filename,
      filename: item.filename,
      classname: item.classname,
      published: item.published,
    };

    if (multiSelect) {
      setSelectedElements(prev => {
        const isSelected = prev.some(e => e.id === item.id);
        if (isSelected) {
          return prev.filter(e => e.id !== item.id);
        }
        return [...prev, element];
      });
    } else {
      onSelect(element);
    }
  };

  const handleConfirmMultiSelect = () => {
    onMultiSelect?.(selectedElements);
    onDismiss();
  };

  const isItemSelected = (item: SearchResult) => {
    if (multiSelect) {
      return selectedElements.some(e => e.id === item.id);
    }
    return selectedIds.includes(item.id);
  };

  const getIconForType = (type: string, elementType?: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (elementType === 'dataObject' || type === 'object') return 'cube-outline';
    if (elementType === 'asset' || type === 'image') return 'image-outline';
    if (type === 'video') return 'video-outline';
    if (type === 'audio') return 'music-note';
    if (elementType === 'document' || type === 'page') return 'file-document-outline';
    if (type === 'folder') return 'folder-outline';
    return 'file-outline';
  };

  const getGradientForType = (type: string, elementType?: string): string[] => {
    if (elementType === 'dataObject' || type === 'object') return ['#0084ff', '#44a3ff'];
    if (elementType === 'asset') return ['#4caf50', '#81c784'];
    if (elementType === 'document' || type === 'page') return ['#9c27b0', '#ba68c8'];
    if (type === 'folder') return ['#ff9500', '#ffb84d'];
    return ['#607d8b', '#90a4ae'];
  };

  const getPreviewUrl = (item: SearchResult): string | null => {
    if (item.type !== 'image') return null;
    const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';
    if (!item.fullpath || !item.filename) return null;
    const encodedPath = encodeURIComponent(item.fullpath.replace(/^\//, '')).replace(/%2F/g, '/');
    return `${baseUrl}/${encodedPath}/${item.id}/image-thumb__${item.id}__pimcore-system-treepreview/${item.filename}`;
  };

  const getCurrentFilterLabel = () => {
    if (activeTab === 'dataObjects') {
      if (classFilter) {
        const cls = classes.find(c => c.id === classFilter);
        return cls?.name || classFilter;
      }
      return 'Alle Klassen';
    } else {
      return typeFilter || 'Alle Typen';
    }
  };

  const getFilterOptions = () => {
    if (activeTab === 'dataObjects') {
      const availableClasses = filterClasses && filterClasses.length > 0
        ? classes.filter(c => filterClasses.includes(c.id))
        : classes;
      return [
        { key: undefined, label: 'Alle Klassen' },
        ...availableClasses.map(c => ({ key: c.id, label: c.name })),
      ];
    } else if (activeTab === 'assets') {
      const types = filterAssetTypes && filterAssetTypes.length > 0 ? filterAssetTypes : assetTypes;
      return [
        { key: undefined, label: 'Alle Typen' },
        ...types.map(t => ({ key: t, label: t })),
      ];
    } else if (activeTab === 'documents') {
      const types = filterDocumentTypes && filterDocumentTypes.length > 0 ? filterDocumentTypes : documentTypes;
      return [
        { key: undefined, label: 'Alle Typen' },
        ...types.map(t => ({ key: t, label: t })),
      ];
    }
    return [];
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    const isSelected = isItemSelected(item);
    const isFolder = item.type === 'folder';
    const elementType = (item as any).elementType;
    const previewUrl = getPreviewUrl(item);

    return (
      <Pressable
        onPress={() => handleItemPress(item)}
        style={[
          styles.resultItem,
          isSelected && styles.resultItemSelected,
          isFolder && styles.resultItemFolder,
        ]}
      >
        {previewUrl ? (
          <Image source={{ uri: previewUrl }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={getGradientForType(item.type, elementType)}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name={getIconForType(item.type, elementType)}
              size={22}
              color="#fff"
            />
          </LinearGradient>
        )}

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.key || item.filename || `Element ${item.id}`}
          </Text>
          <Text style={styles.itemPath} numberOfLines={1}>
            {item.fullpath}
          </Text>
          {item.classname && (
            <Text style={styles.itemClass}>{item.classname}</Text>
          )}
        </View>

        {!isFolder && (
          <>
            {item.published !== undefined && (
              <View style={[styles.statusDot, item.published ? styles.publishedDot : styles.draftDot]} />
            )}
            {multiSelect && (
              <MaterialCommunityIcons
                name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={isSelected ? THEME.PRIMARY_COLOR : '#999'}
                style={{ marginLeft: 8 }}
              />
            )}
            {!multiSelect && isSelected && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={THEME.PRIMARY_COLOR}
                style={{ marginLeft: 8 }}
              />
            )}
          </>
        )}
      </Pressable>
    );
  };

  // Determine which tabs to show
  const showAllTab = allowedTypes.length > 1;
  const showDocumentsTab = allowedTypes.includes('document');
  const showAssetsTab = allowedTypes.includes('asset');
  const showDataObjectsTab = allowedTypes.includes('dataObject');
  const showFilter = activeTab !== 'all';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Pressable onPress={onDismiss} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {showAllTab && (
              <Pressable
                style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                onPress={() => handleTabChange('all')}
              >
                <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                  Alle
                </Text>
              </Pressable>
            )}
            {showDocumentsTab && (
              <Pressable
                style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
                onPress={() => handleTabChange('documents')}
              >
                <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>
                  Documents
                </Text>
              </Pressable>
            )}
            {showAssetsTab && (
              <Pressable
                style={[styles.tab, activeTab === 'assets' && styles.activeTab]}
                onPress={() => handleTabChange('assets')}
              >
                <Text style={[styles.tabText, activeTab === 'assets' && styles.activeTabText]}>
                  Assets
                </Text>
              </Pressable>
            )}
            {showDataObjectsTab && (
              <Pressable
                style={[styles.tab, activeTab === 'dataObjects' && styles.activeTab]}
                onPress={() => handleTabChange('dataObjects')}
              >
                <Text style={[styles.tabText, activeTab === 'dataObjects' && styles.activeTabText]}>
                  Data Objects
                </Text>
              </Pressable>
            )}
          </View>

          {/* Filters and Search */}
          <View style={styles.searchContainer}>
            {/* Filter Button */}
            {showFilter && (
              <Pressable
                style={styles.filterButton}
                onPress={() => setFilterModalVisible(true)}
              >
                <Text style={styles.filterButtonText} numberOfLines={1}>
                  {getCurrentFilterLabel()}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color={THEME.TEXT_SECONDARY} />
              </Pressable>
            )}

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Suchen..."
                mode="outlined"
                dense
                onSubmitEditing={handleSearch}
              />
              <IconButton
                icon="magnify"
                mode="contained"
                containerColor={THEME.PRIMARY_COLOR}
                iconColor="#fff"
                size={18}
                onPress={handleSearch}
                style={styles.searchButton}
              />
            </View>
          </View>

          {/* Results count */}
          {totalItems > 0 && (
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                {totalItems} {totalItems === 1 ? 'Ergebnis' : 'Ergebnisse'}
              </Text>
            </View>
          )}

          <Divider />

          {/* Results List */}
          {isLoading && results.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Lade...</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={(item) => `${item.id}-${item.type}`}
              ItemSeparatorComponent={() => <Divider />}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={48}
                    color={THEME.TEXT_DISABLED}
                  />
                  <Text style={styles.emptyText}>
                    Keine Ergebnisse
                  </Text>
                </View>
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoading && results.length > 0 ? (
                  <ActivityIndicator style={styles.footerLoader} />
                ) : null
              }
            />
          )}

          {/* Footer for multi-select */}
          {multiSelect && (
            <>
              <Divider />
              <View style={styles.footer}>
                <Text style={styles.selectedCount}>
                  {selectedElements.length} ausgewählt
                </Text>
                <Button
                  mode="contained"
                  onPress={handleConfirmMultiSelect}
                  disabled={selectedElements.length === 0}
                >
                  Übernehmen
                </Button>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Filter Selection Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
          <View style={styles.filterModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.filterModal}>
                <View style={styles.filterModalHeader}>
                  <Text style={styles.filterModalTitle}>
                    {activeTab === 'dataObjects' ? 'Klasse auswählen' : 'Typ auswählen'}
                  </Text>
                  <Pressable onPress={() => setFilterModalVisible(false)}>
                    <MaterialCommunityIcons name="close" size={24} color="#666" />
                  </Pressable>
                </View>
                <ScrollView style={styles.filterModalList} bounces={false}>
                  {getFilterOptions().map((option) => {
                    const isSelected = activeTab === 'dataObjects'
                      ? classFilter === option.key
                      : typeFilter === option.key;
                    return (
                      <Pressable
                        key={option.key || 'all'}
                        style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
                        onPress={() => handleFilterSelect(option.key)}
                      >
                        {isSelected && (
                          <MaterialCommunityIcons
                            name="check"
                            size={20}
                            color={THEME.PRIMARY_COLOR}
                            style={{ marginRight: 12 }}
                          />
                        )}
                        <Text style={[
                          styles.filterOptionText,
                          isSelected && styles.filterOptionTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: THEME.PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
  },
  activeTabText: {
    color: THEME.PRIMARY_COLOR,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 100,
    maxWidth: 140,
  },
  filterButtonText: {
    fontSize: 13,
    color: THEME.TEXT_PRIMARY,
    marginRight: 4,
    flex: 1,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  searchButton: {
    margin: 0,
    borderRadius: 4,
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 15,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultItemSelected: {
    backgroundColor: '#f0e7ff',
  },
  resultItemFolder: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  itemPath: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemClass: {
    fontSize: 11,
    color: THEME.PRIMARY_COLOR,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  publishedDot: {
    backgroundColor: '#4caf50',
  },
  draftDot: {
    backgroundColor: '#ff9800',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
  },
  // Filter Modal styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '60%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  filterModalList: {
    maxHeight: 400,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  filterOptionSelected: {
    backgroundColor: '#f0e7ff',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#333',
  },
  filterOptionTextSelected: {
    color: THEME.PRIMARY_COLOR,
    fontWeight: '500',
  },
});

export default ElementPickerModal;
