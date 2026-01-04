/**
 * Search Screen
 * Global search across Documents, Assets, and Data Objects
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  ActivityIndicator,
  Divider,
  Chip,
  Menu,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';
import {
  SearchService,
  SearchResult,
  QuickSearchResult,
} from '../apis/searchService';
import { PimcoreService } from '../apis/pimcoreService';
import { useInstanceStore } from '../store/instanceStore';

type SearchTab = 'all' | 'documents' | 'assets' | 'dataObjects';

interface SearchScreenProps {
  navigation: any;
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Results for different tabs
  const [quickResults, setQuickResults] = useState<QuickSearchResult[]>([]);
  const [documentResults, setDocumentResults] = useState<SearchResult[]>([]);
  const [assetResults, setAssetResults] = useState<SearchResult[]>([]);
  const [dataObjectResults, setDataObjectResults] = useState<SearchResult[]>([]);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [classFilter, setClassFilter] = useState<string | undefined>(undefined);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [classMenuVisible, setClassMenuVisible] = useState(false);

  const { activeInstance } = useInstanceStore();

  // Load class definitions for data objects filter
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classDefinitions = await PimcoreService.getClassDefinitions();
      setClasses(classDefinitions.map((c) => ({ id: c.id, name: c.name })));
    } catch (error) {
      // Error loading classes
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setPage(1);

    try {
      switch (activeTab) {
        case 'all':
          const quickResponse = await SearchService.quickSearch(searchTerm, 1, pageSize);
          setQuickResults(quickResponse.items);
          setTotalItems(quickResponse.totalItems);
          break;

        case 'documents':
          const docResponse = await SearchService.searchDocuments(
            searchTerm,
            1,
            pageSize,
            typeFilter
          );
          setDocumentResults(docResponse.items);
          setTotalItems(docResponse.totalItems);
          break;

        case 'assets':
          const assetResponse = await SearchService.searchAssets(
            searchTerm,
            1,
            pageSize,
            typeFilter
          );
          setAssetResults(assetResponse.items);
          setTotalItems(assetResponse.totalItems);
          break;

        case 'dataObjects':
          const objResponse = await SearchService.searchDataObjects(
            searchTerm,
            1,
            pageSize,
            classFilter
          );
          setDataObjectResults(objResponse.items);
          setTotalItems(objResponse.totalItems);
          break;
      }
    } catch (error) {
      // Search error - show empty results
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, activeTab, typeFilter, classFilter]);

  const handleLoadMore = async () => {
    if (isLoading) return;

    const nextPage = page + 1;
    const maxPage = Math.ceil(totalItems / pageSize);
    if (nextPage > maxPage) return;

    setIsLoading(true);

    try {
      switch (activeTab) {
        case 'all':
          const quickResponse = await SearchService.quickSearch(searchTerm, nextPage, pageSize);
          setQuickResults([...quickResults, ...quickResponse.items]);
          break;

        case 'documents':
          const docResponse = await SearchService.searchDocuments(
            searchTerm,
            nextPage,
            pageSize,
            typeFilter
          );
          setDocumentResults([...documentResults, ...docResponse.items]);
          break;

        case 'assets':
          const assetResponse = await SearchService.searchAssets(
            searchTerm,
            nextPage,
            pageSize,
            typeFilter
          );
          setAssetResults([...assetResults, ...assetResponse.items]);
          break;

        case 'dataObjects':
          const objResponse = await SearchService.searchDataObjects(
            searchTerm,
            nextPage,
            pageSize,
            classFilter
          );
          setDataObjectResults([...dataObjectResults, ...objResponse.items]);
          break;
      }
      setPage(nextPage);
    } catch (error) {
      // Load more error
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    setTypeFilter(undefined);
    setClassFilter(undefined);
    // Re-search if there's a search term
    if (searchTerm.trim()) {
      // Trigger search after state update
      setTimeout(() => handleSearch(), 0);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setQuickResults([]);
    setDocumentResults([]);
    setAssetResults([]);
    setDataObjectResults([]);
    setTotalItems(0);
  };

  const getIconForType = (type: string, elementType?: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    // Check elementType first (from quick search)
    if (elementType === 'dataObject') {
      return 'cube-outline';
    }
    if (elementType === 'asset') {
      // Use type for asset subtype
      if (type === 'image') return 'image-outline';
      if (type === 'video') return 'video-outline';
      if (type === 'audio') return 'music-note';
      return 'file-outline';
    }
    if (elementType === 'document') {
      return 'file-document-outline';
    }

    // Fallback to type-based detection
    if (type === 'object' || type === 'dataobject') {
      return 'cube-outline';
    }
    if (type === 'folder') {
      return 'folder-outline';
    }
    // Asset types
    if (type === 'image') {
      return 'image-outline';
    }
    if (type === 'video') {
      return 'video-outline';
    }
    if (type === 'audio') {
      return 'music-note';
    }
    // Document types
    if (type === 'page') {
      return 'file-document-outline';
    }
    if (type === 'snippet') {
      return 'puzzle-outline';
    }
    if (type === 'link') {
      return 'link';
    }
    if (type === 'email') {
      return 'email-outline';
    }
    // Generic
    return 'file-outline';
  };

  const getIconColorForType = (type: string, elementType?: string): string => {
    // Check elementType first
    if (elementType === 'dataObject') return '#f57c00';
    if (elementType === 'asset') return '#4caf50';
    if (elementType === 'document') return '#2196f3';
    // Fallback to type
    if (type === 'object' || type === 'dataobject') return '#f57c00';
    if (type === 'folder') return '#ffc107';
    if (type === 'image') return '#4caf50';
    if (type === 'page') return '#2196f3';
    return THEME.TEXT_SECONDARY;
  };

  const handleItemPress = (item: SearchResult | QuickSearchResult) => {
    // Navigate to appropriate detail screen based on type
    // Quick search uses elementType, specific searches use type
    const quickItem = item as QuickSearchResult;
    const elementType = quickItem.elementType || item.type;

    if (elementType === 'dataObject' || item.type === 'object') {
      navigation.navigate('DataObjects', {
        screen: 'ObjectDetail',
        params: { objectId: item.id },
      });
    } else if (item.type === 'folder') {
      navigation.navigate('DataObjects', {
        screen: 'FolderDetail',
        params: { folderId: item.id },
      });
    } else if (elementType === 'asset' || item.type === 'image' || item.type === 'video') {
      // TODO: Navigate to asset detail
    } else if (elementType === 'document' || item.type === 'page') {
      // TODO: Navigate to document detail
    }
  };

  const renderQuickResultItem = ({ item }: { item: QuickSearchResult }) => (
    <TouchableOpacity style={styles.quickResultItem} onPress={() => handleItemPress(item)}>
      <MaterialCommunityIcons
        name={getIconForType(item.type, item.elementType)}
        size={20}
        color={getIconColorForType(item.type, item.elementType)}
        style={styles.resultIcon}
      />
      <Text style={styles.resultPath} numberOfLines={1}>
        {item.path}
      </Text>
    </TouchableOpacity>
  );

  const renderTableHeader = () => {
    if (activeTab === 'all') return null;

    const columns = getColumnsForTab();
    return (
      <View style={styles.tableHeader}>
        {columns.map((col) => (
          <View key={col.key} style={[styles.tableHeaderCell, { flex: col.flex }]}>
            <Text style={styles.tableHeaderText}>{col.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const getColumnsForTab = () => {
    switch (activeTab) {
      case 'documents':
        return [
          { key: 'type', label: 'Type', flex: 1 },
          { key: 'fullpath', label: 'Full path', flex: 3 },
          { key: 'title', label: 'Title', flex: 2 },
        ];
      case 'assets':
        return [
          { key: 'preview', label: 'Preview', flex: 1.5 },
          { key: 'type', label: 'Type', flex: 1 },
          { key: 'fullpath', label: 'Full path', flex: 3 },
        ];
      case 'dataObjects':
        return [
          { key: 'type', label: 'Type', flex: 1 },
          { key: 'fullpath', label: 'Full path', flex: 3 },
          { key: 'classname', label: 'Classname', flex: 2 },
        ];
      default:
        return [];
    }
  };

  const renderSearchResultItem = ({ item }: { item: SearchResult }) => {
    const columns = getColumnsForTab();

    return (
      <TouchableOpacity style={styles.tableRow} onPress={() => handleItemPress(item)}>
        {columns.map((col) => (
          <View key={col.key} style={[styles.tableCell, { flex: col.flex }]}>
            {col.key === 'preview' && activeTab === 'assets' ? (
              item.type === 'image' && getPreviewUrl(item) ? (
                <Image
                  source={{ uri: getPreviewUrl(item) }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <MaterialCommunityIcons
                    name={getIconForType(item.type)}
                    size={24}
                    color={THEME.TEXT_DISABLED}
                  />
                </View>
              )
            ) : (
              <Text style={styles.tableCellText} numberOfLines={1}>
                {(item as any)[col.key] || '-'}
              </Text>
            )}
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  const getPreviewUrl = (item: SearchResult): string => {
    if (!item || item.type !== 'image') return '';

    // Use the Pimcore thumbnail URL pattern:
    // {baseUrl}/{fullPath}/{id}/image-thumb__{id}__pimcore-system-treepreview/{filename}
    const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';
    const fullPath = item.fullpath || '';
    const filename = item.filename || '';

    if (!fullPath || !filename) return '';

    // Encode the path properly (but not the slashes)
    const encodedPath = encodeURIComponent(fullPath.replace(/^\//, '')).replace(/%2F/g, '/');

    return `${baseUrl}/${encodedPath}/${item.id}/image-thumb__${item.id}__pimcore-system-treepreview/${filename}`;
  };

  const getCurrentResults = (): any[] => {
    switch (activeTab) {
      case 'all':
        return quickResults;
      case 'documents':
        return documentResults;
      case 'assets':
        return assetResults;
      case 'dataObjects':
        return dataObjectResults;
      default:
        return [];
    }
  };

  const documentTypes = ['page', 'snippet', 'link', 'email', 'hardlink', 'folder'];
  const assetTypes = ['image', 'video', 'audio', 'document', 'archive', 'folder', 'text'];

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabChange('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
          onPress={() => handleTabChange('documents')}
        >
          <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>
            Documents
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assets' && styles.activeTab]}
          onPress={() => handleTabChange('assets')}
        >
          <Text style={[styles.tabText, activeTab === 'assets' && styles.activeTabText]}>
            Assets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dataObjects' && styles.activeTab]}
          onPress={() => handleTabChange('dataObjects')}
        >
          <Text style={[styles.tabText, activeTab === 'dataObjects' && styles.activeTabText]}>
            Data Objects
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters and Search Input */}
      <View style={styles.searchContainer}>
        {/* Type Filter (for Documents/Assets) */}
        {(activeTab === 'documents' || activeTab === 'assets') && (
          <Menu
            visible={typeMenuVisible}
            onDismiss={() => setTypeMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setTypeMenuVisible(true)}
              >
                <Text style={styles.filterButtonText}>
                  {typeFilter || 'All types'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={THEME.TEXT_SECONDARY} />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setTypeFilter(undefined);
                setTypeMenuVisible(false);
              }}
              title="All types"
            />
            {(activeTab === 'documents' ? documentTypes : assetTypes).map((type) => (
              <Menu.Item
                key={type}
                onPress={() => {
                  setTypeFilter(type);
                  setTypeMenuVisible(false);
                }}
                title={type}
              />
            ))}
          </Menu>
        )}

        {/* Class Filter (for Data Objects) */}
        {activeTab === 'dataObjects' && (
          <Menu
            visible={classMenuVisible}
            onDismiss={() => setClassMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setClassMenuVisible(true)}
              >
                <Text style={styles.filterButtonText}>
                  {classFilter || 'All classes'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={THEME.TEXT_SECONDARY} />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setClassFilter(undefined);
                setClassMenuVisible(false);
              }}
              title="All classes"
            />
            {classes.map((cls) => (
              <Menu.Item
                key={cls.id}
                onPress={() => {
                  setClassFilter(cls.id);
                  setClassMenuVisible(false);
                }}
                title={cls.name}
              />
            ))}
          </Menu>
        )}

        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search..."
            mode="outlined"
            dense
            right={
              searchTerm ? (
                <TextInput.Icon icon="close" onPress={clearSearch} />
              ) : undefined
            }
            onSubmitEditing={handleSearch}
          />
          <IconButton
            icon="magnify"
            mode="contained"
            containerColor={THEME.PRIMARY_COLOR}
            iconColor="#fff"
            size={20}
            onPress={handleSearch}
            style={styles.searchButton}
          />
        </View>
      </View>

      {/* Table Header (for non-All tabs) */}
      {activeTab !== 'all' && getCurrentResults().length > 0 && renderTableHeader()}

      {/* Results */}
      {isLoading && getCurrentResults().length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={getCurrentResults()}
          renderItem={activeTab === 'all' ? renderQuickResultItem : renderSearchResultItem}
          keyExtractor={(item) => `${item.id}-${item.type}`}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchTerm ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="magnify-close"
                  size={48}
                  color={THEME.TEXT_DISABLED}
                />
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={48}
                  color={THEME.TEXT_DISABLED}
                />
                <Text style={styles.emptyText}>Enter a search term</Text>
              </View>
            )
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && getCurrentResults().length > 0 ? (
              <ActivityIndicator style={styles.footerLoader} />
            ) : null
          }
        />
      )}

      {/* Footer with total count */}
      {totalItems > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Total {totalItems} items | Page {page} / {Math.ceil(totalItems / pageSize)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  },
  filterButtonText: {
    fontSize: 14,
    color: THEME.TEXT_PRIMARY,
    marginRight: 4,
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
  },
  searchButton: {
    margin: 0,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderCell: {
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.TEXT_SECONDARY,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tableCell: {
    paddingHorizontal: 4,
  },
  tableCellText: {
    fontSize: 14,
    color: THEME.TEXT_PRIMARY,
  },
  previewImage: {
    width: 60,
    height: 45,
    borderRadius: 4,
  },
  previewPlaceholder: {
    width: 60,
    height: 45,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultPath: {
    flex: 1,
    fontSize: 14,
    color: THEME.TEXT_PRIMARY,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: THEME.TEXT_DISABLED,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: THEME.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
