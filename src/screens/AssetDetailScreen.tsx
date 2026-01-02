/**
 * Asset Detail Screen
 * Shows asset details:
 * - Folder: Grid/List of assets within
 * - Image: Large preview
 * - Other: Icon with metadata
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text, ActivityIndicator, IconButton, Card, Chip, Title } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PimcoreService } from '../apis/pimcoreService';
import { useInstanceStore } from '../store/instanceStore';
import { THEME } from '../config/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 48) / GRID_COLUMNS;

interface AssetItem {
  id: number;
  filename: string;
  type: string;
  mimeType?: string | null;
  fullPath: string;
  path: string;
  parentId: number;
  hasChildren: boolean;
  fileSize: number;
  creationDate?: number;
  modificationDate?: number;
}

export default function AssetDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { asset } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assetDetails, setAssetDetails] = useState<any>(null);
  const [folderAssets, setFolderAssets] = useState<AssetItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  const { activeInstance } = useInstanceStore();

  const loadAssetDetails = useCallback(async () => {
    try {
      setLoading(true);
      const details = await PimcoreService.getAsset(asset.id);
      setAssetDetails(details);

      // If folder, load contents
      if (details.type === 'folder') {
        const result = await PimcoreService.getFolderAssets(details.fullPath, 1, pageSize);
        setFolderAssets(result.items);
        setTotalItems(result.totalItems);
        setHasMore(result.items.length < result.totalItems);
        setPage(1);
      }
    } catch (error) {
      console.error('Error loading asset details:', error);
    } finally {
      setLoading(false);
    }
  }, [asset.id]);

  const loadMoreAssets = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const result = await PimcoreService.getFolderAssets(
        assetDetails.fullPath,
        nextPage,
        pageSize
      );
      setFolderAssets([...folderAssets, ...result.items]);
      setPage(nextPage);
      setHasMore(folderAssets.length + result.items.length < result.totalItems);
    } catch (error) {
      console.error('Error loading more assets:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAssetDetails();
    setRefreshing(false);
  }, [loadAssetDetails]);

  useEffect(() => {
    loadAssetDetails();
  }, [loadAssetDetails]);

  const [menuModalVisible, setMenuModalVisible] = useState(false);

  // Navigate to Properties screen
  const handlePropertiesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Properties', {
      elementType: 'asset',
      elementId: asset.id,
      elementName: asset.filename || 'Asset',
    });
  };

  // Navigate to Notes screen
  const handleNotesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Notes', {
      elementType: 'asset',
      elementId: asset.id,
      elementName: asset.filename || 'Asset',
    });
  };

  // Navigate to Dependencies screen
  const handleDependenciesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Dependencies', {
      elementType: 'asset',
      elementId: asset.id,
      elementName: asset.filename || 'Asset',
    });
  };

  useEffect(() => {
    navigation.setOptions({
      title: asset.filename || 'Asset Detail',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setMenuModalVisible(true)}
          style={{ marginRight: 16, padding: 4 }}
        >
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, asset]);

  const getPreviewUrl = (item: AssetItem | any, size: 'preview' | 'thumbnail' = 'preview'): string => {
    const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';

    // Use the Pimcore thumbnail URL pattern:
    // {baseUrl}/{folderPath}/{id}/image-thumb__{id}__pimcore-system-treepreview/{filename}
    // Note: path is the folder path (without filename), fullPath includes filename
    const thumbnailName = 'pimcore-system-treepreview';
    const folderPath = item.path || '';  // This is the folder path without filename
    const filename = item.filename || '';

    // Build the path: folder + filename for the URL
    // e.g., /Car Images/ac cars/ -> Car Images/ac cars
    const cleanFolderPath = folderPath.replace(/^\//, '').replace(/\/$/, '');

    // Encode spaces and special chars but keep slashes
    const encodedPath = cleanFolderPath.split('/').map((p: string) => encodeURIComponent(p)).join('/');

    // Final URL: baseUrl/folderPath/filename/id/image-thumb__id__thumbnail/filename
    // Actually looking at the example: https://demo.pimcore.com/Brand%20Logos/298/image-thumb__298__pimcore-system-treepreview/Dodge_black_logo@2x.jpg
    // It seems to be: baseUrl/folderPath/id/image-thumb__id__thumbnail/filename
    const url = encodedPath
      ? `${baseUrl}/${encodedPath}/${item.id}/image-thumb__${item.id}__${thumbnailName}/${encodeURIComponent(filename)}`
      : `${baseUrl}/${item.id}/image-thumb__${item.id}__${thumbnailName}/${encodeURIComponent(filename)}`;

    console.log('Preview URL:', url);
    return url;
  };

  const getNodeIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (type === 'folder') return 'folder';
    if (type === 'image') return 'image';
    if (type === 'video') return 'video';
    if (type === 'audio') return 'music-note';
    if (type === 'document') return 'file-document';
    if (type === 'text') return 'file-document-outline';
    if (type === 'archive') return 'zip-box';
    return 'file';
  };

  const getTypeGradient = (type: string): string[] => {
    if (type === 'folder') return ['#ff9500', '#ffb84d'];
    if (type === 'image') return ['#4caf50', '#81c784'];
    if (type === 'video') return ['#e91e63', '#f48fb1'];
    if (type === 'audio') return ['#9c27b0', '#ba68c8'];
    if (type === 'document') return ['#2196f3', '#64b5f6'];
    return ['#607d8b', '#90a4ae'];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssetPress = (item: AssetItem) => {
    navigation.push('AssetDetail', { asset: item });
  };

  // Menu Modal
  const renderMenuModal = () => (
    <Modal
      visible={menuModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setMenuModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setMenuModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuModal}>
              <View style={styles.modalHeader}>
                <Title style={styles.modalTitle}>Menü</Title>
                <TouchableOpacity
                  onPress={() => setMenuModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.menuItems}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handlePropertiesOpen}
                >
                  <MaterialCommunityIcons name="tag-multiple-outline" size={24} color="#6200ee" />
                  <Text style={styles.menuItemText}>Properties</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleNotesOpen}
                >
                  <MaterialCommunityIcons name="note-multiple-outline" size={24} color="#6200ee" />
                  <Text style={styles.menuItemText}>Notes</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDependenciesOpen}
                >
                  <MaterialCommunityIcons name="link-variant" size={24} color="#6200ee" />
                  <Text style={styles.menuItemText}>Dependencies</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderFolderGridItem = ({ item }: { item: AssetItem }) => {
    const isImage = item.type === 'image';
    const gradient = getTypeGradient(item.type);

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleAssetPress(item)}
      >
        {isImage ? (
          <Image
            source={{ uri: getPreviewUrl(item, 'thumbnail') }}
            style={styles.gridItemImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={gradient}
            style={styles.gridItemIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name={getNodeIcon(item.type)}
              size={32}
              color="#fff"
            />
          </LinearGradient>
        )}
        <Text style={styles.gridItemLabel} numberOfLines={2}>
          {item.filename}
        </Text>
        <Text style={styles.gridItemType}>{item.type}</Text>
      </TouchableOpacity>
    );
  };

  const renderImagePreview = () => {
    if (!assetDetails) return null;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getPreviewUrl(assetDetails, 'preview') }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.metadataContainer}>
            <Text style={styles.sectionTitle}>Details</Text>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Dateiname</Text>
              <Text style={styles.metadataValue}>{assetDetails.filename}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Pfad</Text>
              <Text style={styles.metadataValue}>{assetDetails.fullPath}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Typ</Text>
              <Chip compact style={styles.typeChip}>{assetDetails.type}</Chip>
            </View>

            {assetDetails.mimeType && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>MIME-Typ</Text>
                <Text style={styles.metadataValue}>{assetDetails.mimeType}</Text>
              </View>
            )}

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Dateigröße</Text>
              <Text style={styles.metadataValue}>{formatFileSize(assetDetails.fileSize)}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Erstellt</Text>
              <Text style={styles.metadataValue}>{formatDate(assetDetails.creationDate)}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Geändert</Text>
              <Text style={styles.metadataValue}>{formatDate(assetDetails.modificationDate)}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>ID</Text>
              <Text style={styles.metadataValue}>{assetDetails.id}</Text>
            </View>
          </View>
        </ScrollView>
        {renderMenuModal()}
      </View>
    );
  };

  const renderOtherAsset = () => {
    if (!assetDetails) return null;

    const gradient = getTypeGradient(assetDetails.type);

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.otherAssetContainer}>
            <LinearGradient
              colors={gradient}
              style={styles.largeIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons
                name={getNodeIcon(assetDetails.type)}
                size={64}
                color="#fff"
              />
            </LinearGradient>

            <Text style={styles.assetFilename}>{assetDetails.filename}</Text>
            <Chip compact style={styles.typeChipLarge}>{assetDetails.type}</Chip>
          </View>

          <View style={styles.metadataContainer}>
            <Text style={styles.sectionTitle}>Details</Text>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Pfad</Text>
              <Text style={styles.metadataValue}>{assetDetails.fullPath}</Text>
            </View>

            {assetDetails.mimeType && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>MIME-Typ</Text>
                <Text style={styles.metadataValue}>{assetDetails.mimeType}</Text>
              </View>
            )}

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Dateigröße</Text>
              <Text style={styles.metadataValue}>{formatFileSize(assetDetails.fileSize)}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Erstellt</Text>
              <Text style={styles.metadataValue}>{formatDate(assetDetails.creationDate)}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Geändert</Text>
              <Text style={styles.metadataValue}>{formatDate(assetDetails.modificationDate)}</Text>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>ID</Text>
              <Text style={styles.metadataValue}>{assetDetails.id}</Text>
            </View>
          </View>
        </ScrollView>
        {renderMenuModal()}
      </View>
    );
  };

  const renderFolderContent = () => {
    return (
      <View style={styles.container}>
        {/* Folder Header */}
        <View style={styles.folderHeader}>
          <LinearGradient
            colors={['#ff9500', '#ffb84d']}
            style={styles.folderIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="folder" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.folderInfo}>
            <Text style={styles.folderName}>{assetDetails?.filename}</Text>
            <Text style={styles.folderPath}>{assetDetails?.fullPath}</Text>
          </View>
          <Chip compact>{totalItems} Assets</Chip>
        </View>

        {/* Assets Grid */}
        <FlatList
          data={folderAssets}
          renderItem={renderFolderGridItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMoreAssets}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="folder-open-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Keine Assets in diesem Ordner</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && folderAssets.length > 0 ? (
              <ActivityIndicator style={styles.loadingMore} />
            ) : null
          }
        />
        {renderMenuModal()}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Lade Asset...</Text>
      </View>
    );
  }

  if (!assetDetails) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Asset konnte nicht geladen werden</Text>
      </View>
    );
  }

  // Render based on asset type
  if (assetDetails.type === 'folder') {
    return renderFolderContent();
  } else if (assetDetails.type === 'image') {
    return renderImagePreview();
  } else {
    return renderOtherAsset();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },

  // Folder styles
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  folderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  folderPath: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  gridContainer: {
    padding: 12,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    padding: 6,
    alignItems: 'center',
  },
  gridItemImage: {
    width: GRID_ITEM_SIZE - 12,
    height: GRID_ITEM_SIZE - 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  gridItemIcon: {
    width: GRID_ITEM_SIZE - 12,
    height: GRID_ITEM_SIZE - 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
  },
  gridItemType: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 14,
  },
  loadingMore: {
    paddingVertical: 16,
  },

  // Image preview styles
  imageContainer: {
    backgroundColor: '#f5f5f5',
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },

  // Other asset styles
  otherAssetContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#f5f5f5',
  },
  largeIcon: {
    width: 120,
    height: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetFilename: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  typeChipLarge: {
    marginTop: 12,
  },

  // Metadata styles
  metadataContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  typeChip: {
    alignSelf: 'flex-end',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 0,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 16,
  },
});
