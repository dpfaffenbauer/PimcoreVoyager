/**
 * Folder Detail Screen
 * Shows classes and objects within a folder
 * Uses /class/folder/:id to get classes
 * Uses /data-object/grid/configuration/:id/:classId to get grid data
 *
 * Features responsive split layout:
 * - Tablet (width > 768): Side-by-side view with classes left, objects right
 * - Phone (width <= 768): Stacked view with dropdown class selection
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, useWindowDimensions, Modal, TouchableWithoutFeedback, Pressable } from 'react-native';
import { Text, ActivityIndicator, Card, Chip, IconButton, Appbar, Surface, Button, Title, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PimcoreService } from '../apis/pimcoreService';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Breakpoint for split layout (tablet vs phone)
const SPLIT_LAYOUT_BREAKPOINT = 768;

type RootStackParamList = {
  Home: undefined;
  FolderDetail: { folder: any };
  ObjectDetail: { object: any; classDefinition?: any };
  ObjectList: { classDefinition: any };
};

type FolderDetailScreenRouteProp = RouteProp<RootStackParamList, 'FolderDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FolderDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FolderDetailScreenRouteProp>();
  const { folder } = route.params;
  const { width } = useWindowDimensions();

  // Determine if we should use split layout (tablet mode)
  const isSplitLayout = width > SPLIT_LAYOUT_BREAKPOINT;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [classes, setClasses] = useState<Array<{id: string, name: string}>>([]);
  const [gridData, setGridData] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<{id: string, name: string} | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [propertiesMenuVisible, setPropertiesMenuVisible] = useState(false);

  // Navigate to Properties screen
  const handlePropertiesOpen = () => {
    setPropertiesMenuVisible(false);
    (navigation as any).navigate('Properties', {
      elementType: 'data-object',
      elementId: folder.id,
      elementName: folder.key || folder.filename || 'Folder',
    });
  };

  // Navigate to Notes screen
  const handleNotesOpen = () => {
    setPropertiesMenuVisible(false);
    (navigation as any).navigate('Notes', {
      elementType: 'data-object',
      elementId: folder.id,
      elementName: folder.key || folder.filename || 'Folder',
    });
  };

  // Navigate to Dependencies screen
  const handleDependenciesOpen = () => {
    setPropertiesMenuVisible(false);
    (navigation as any).navigate('Dependencies', {
      elementType: 'data-object',
      elementId: folder.id,
      elementName: folder.key || folder.filename || 'Folder',
    });
  };

  useEffect(() => {
    loadFolderData();
  }, [folder.id]);

  const loadFolderData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading folder data for folder:', folder);
      
      // Get classes in this folder
      const folderClasses = await PimcoreService.getFolderClasses(folder.id);
      console.log('Folder classes:', folderClasses);
      setClasses(folderClasses);

      // If only one class, automatically load its data
      if (folderClasses.length === 1) {
        console.log('Auto-loading grid for single class:', folderClasses[0]);
        await loadGridData(folderClasses[0]);
      } else if (folderClasses.length === 0) {
        console.log('No classes found, showing empty state');
      } else {
        console.log('Multiple classes found, showing selection');
      }
    } catch (error) {
      console.error('Error loading folder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGridData = async (classObj: {id: string, name: string}, page: number = 1, append: boolean = false) => {
    try {
      console.log('Loading grid data for class:', classObj, 'in folder:', folder.id, 'page:', page);
      setLoadingGrid(true);
      setSelectedClass(classObj);
      setMenuVisible(false);

      const data = await PimcoreService.getGridConfiguration(folder.id, classObj.id, page, 10);
      console.log('Grid data received:', JSON.stringify(data, null, 2));

      // Handle different response structures
      let items = [];
      let totalCount = 0;

      if (data.items && Array.isArray(data.items)) {
        items = data.items;
        totalCount = data.totalItems || data.total || items.length;
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
        totalCount = data.totalItems || data.total || items.length;
      } else if (Array.isArray(data)) {
        items = data;
        totalCount = items.length;
      }

      // Log first item structure for debugging
      if (items.length > 0) {
        console.log('First item structure:', JSON.stringify(items[0], null, 2));
      }

      if (append && gridData) {
        setGridData({ items: [...gridData.items, ...items], total: totalCount, currentPage: page });
      } else {
        setGridData({ items, total: totalCount, currentPage: page });
      }
    } catch (error) {
      console.error('Error loading grid data:', error);
      // Set empty grid data to show error state
      setGridData({ items: [], total: 0, currentPage: 1 });
    } finally {
      setLoadingGrid(false);
    }
  };

  const loadMore = () => {
    if (selectedClass && gridData && gridData.items.length < gridData.total) {
      const nextPage = (gridData.currentPage || 1) + 1;
      loadGridData(selectedClass, nextPage, true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFolderData();
    if (selectedClass) {
      await loadGridData(selectedClass);
    }
    setRefreshing(false);
  };

  // Render class list for split layout sidebar
  const renderClassListSidebar = () => {
    return (
      <View style={styles.sidebarContainer}>
        <View style={styles.sidebarHeader}>
          <LinearGradient
            colors={['#6200ee', '#9d4edd']}
            style={styles.sidebarHeaderGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconButton icon="cube-outline" iconColor="#fff" size={24} />
            <Text style={styles.sidebarHeaderText}>Klassen</Text>
          </LinearGradient>
        </View>
        <ScrollView style={styles.sidebarScroll}>
          {classes.length === 0 ? (
            <View style={styles.sidebarEmpty}>
              <Text style={styles.sidebarEmptyText}>Keine Klassen gefunden</Text>
            </View>
          ) : (
            classes.map((classObj) => (
              <TouchableOpacity
                key={classObj.id}
                onPress={() => loadGridData(classObj)}
                style={[
                  styles.sidebarItem,
                  selectedClass?.id === classObj.id && styles.sidebarItemActive,
                ]}
              >
                <LinearGradient
                  colors={selectedClass?.id === classObj.id ? ['#6200ee', '#9d4edd'] : ['#e0e0e0', '#e0e0e0']}
                  style={styles.sidebarItemIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <IconButton
                    icon="cube"
                    iconColor={selectedClass?.id === classObj.id ? '#fff' : '#666'}
                    size={18}
                  />
                </LinearGradient>
                <Text
                  style={[
                    styles.sidebarItemText,
                    selectedClass?.id === classObj.id && styles.sidebarItemTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {classObj.name}
                </Text>
                {selectedClass?.id === classObj.id && (
                  <IconButton icon="chevron-right" size={20} iconColor="#6200ee" />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  // Render dropdown class selection for stacked layout (phones)
  const renderClassSelection = () => {
    if (classes.length === 0) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text>Keine Klassen in diesem Ordner gefunden.</Text>
          </Card.Content>
        </Card>
      );
    }

    // Show dropdown for class selection (uses Modal instead of Menu for better touch handling)
    if (classes.length > 1) {
      return (
        <View style={styles.classDropdownContainer}>
          <Text style={styles.dropdownLabel}>Klasse auswählen:</Text>
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={styles.dropdownButton}
          >
            <Surface style={styles.dropdownSurface} elevation={2}>
              <View style={styles.dropdownContent}>
                <LinearGradient
                  colors={['#6200ee', '#9d4edd']}
                  style={styles.dropdownIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <IconButton icon="cube-outline" iconColor="#fff" size={20} />
                </LinearGradient>
                <Text style={styles.dropdownText}>
                  {selectedClass ? selectedClass.name : 'Wählen Sie eine Klasse aus'}
                </Text>
                <MaterialCommunityIcons
                  name={menuVisible ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#666"
                />
              </View>
            </Surface>
          </Pressable>

          {/* Class Selection Modal */}
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.classSelectionModal}>
                    <View style={styles.classModalHeader}>
                      <Text style={styles.classModalTitle}>Klasse auswählen</Text>
                      <Button onPress={() => setMenuVisible(false)}>Schließen</Button>
                    </View>
                    <Divider />
                    <ScrollView style={styles.classModalList}>
                      {classes.map((classObj) => (
                        <Pressable
                          key={classObj.id}
                          onPress={() => {
                            loadGridData(classObj);
                            setMenuVisible(false);
                          }}
                          style={[
                            styles.classModalItem,
                            selectedClass?.id === classObj.id && styles.classModalItemSelected,
                          ]}
                        >
                          <LinearGradient
                            colors={selectedClass?.id === classObj.id ? ['#6200ee', '#9d4edd'] : ['#e0e0e0', '#e0e0e0']}
                            style={styles.classModalItemIcon}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <MaterialCommunityIcons
                              name="cube"
                              size={18}
                              color={selectedClass?.id === classObj.id ? '#fff' : '#666'}
                            />
                          </LinearGradient>
                          <Text
                            style={[
                              styles.classModalItemText,
                              selectedClass?.id === classObj.id && styles.classModalItemTextSelected,
                            ]}
                          >
                            {classObj.name}
                          </Text>
                          {selectedClass?.id === classObj.id && (
                            <MaterialCommunityIcons name="check" size={20} color="#6200ee" />
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      );
    }

    return null;
  };

  // Helper to extract a value from grid item (handles {value: x} structure)
  const extractValue = (field: any): any => {
    if (field === null || field === undefined) return undefined;
    if (typeof field === 'object' && 'value' in field) return field.value;
    return field;
  };

  // Helper to extract display name from item
  const getItemDisplayName = (item: any): string => {
    // Grid API returns values as {value: x} objects
    const key = extractValue(item.key);
    const filename = extractValue(item.filename);
    const name = extractValue(item.name);
    const fullpath = extractValue(item.fullpath);

    if (key) return key;
    if (filename) return filename;
    if (name) return name;
    if (fullpath) return fullpath;

    // Fallback
    const itemId = extractValue(item.id) || 'unknown';
    return `Objekt ${itemId}`;
  };

  // Helper to extract ID from item
  const getItemId = (item: any): number | string => {
    return extractValue(item.id) || '';
  };

  // Helper to check if item is published
  const isPublished = (item: any): boolean => {
    return extractValue(item.published) === true;
  };

  const renderGridData = () => {
    if (!selectedClass) return null;

    if (loadingGrid && (!gridData || gridData.items.length === 0)) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Lade Objekte...</Text>
        </View>
      );
    }

    if (!gridData) return null;

    const items = gridData.items || [];

    if (items.length === 0) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text>Keine Objekte gefunden.</Text>
          </Card.Content>
        </Card>
      );
    }

    const hasMore = items.length < gridData.total;

    return (
      <View style={styles.gridContainer}>
        <View style={styles.gridHeader}>
          <Text style={styles.sectionTitle}>
            {selectedClass.name} ({items.length} von {gridData.total} Objekten)
          </Text>
        </View>

        {items.map((item: any, index: number) => {
          const itemId = getItemId(item);
          const displayName = getItemDisplayName(item);

          return (
            <TouchableOpacity
              key={itemId || index}
              onPress={() =>
                navigation.navigate('ObjectDetail', {
                  object: { ...item, id: itemId },
                  classDefinition: selectedClass,
                })
              }
            >
              <Surface style={styles.gridItem} elevation={1}>
                <LinearGradient
                  colors={['#0084ff', '#44a3ff']}
                  style={styles.objectIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <IconButton icon="cube" iconColor="#fff" size={20} />
                </LinearGradient>

                <View style={styles.objectInfo}>
                  <Text style={styles.objectName}>{displayName}</Text>
                  <View style={styles.objectMeta}>
                    <Chip icon="key-variant" style={styles.metaChip} textStyle={styles.metaChipText}>
                      {displayName}
                    </Chip>
                    <View style={[styles.statusDot, isPublished(item) ? styles.publishedDot : styles.draftDot]} />
                  </View>
                </View>

              <IconButton icon="chevron-right" size={20} />
            </Surface>
          </TouchableOpacity>
          );
        })}

        {hasMore && (
          <Button
            mode="outlined"
            onPress={loadMore}
            loading={loadingGrid}
            disabled={loadingGrid}
            style={styles.loadMoreButton}
          >
            Mehr laden
          </Button>
        )}
      </View>
    );
  };

  // Render content area (grid data) for split layout
  const renderContentArea = () => {
    if (loadingGrid && (!gridData || gridData.items.length === 0)) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Lade Objekte...</Text>
        </View>
      );
    }

    if (!selectedClass) {
      return (
        <View style={styles.contentPlaceholder}>
          <IconButton icon="cube-outline" size={64} iconColor="#ccc" />
          <Text style={styles.contentPlaceholderText}>
            Wählen Sie eine Klasse aus der Liste
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.contentScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderGridData()}
      </ScrollView>
    );
  };

  // Menu Modal
  const renderPropertiesModal = () => (
    <Modal
      visible={propertiesMenuVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPropertiesMenuVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setPropertiesMenuVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuModal}>
              <View style={styles.modalHeader}>
                <Title style={styles.modalTitle}>Menü</Title>
                <TouchableOpacity
                  onPress={() => setPropertiesMenuVisible(false)}
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

  // Split layout for tablets
  if (isSplitLayout) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title={folder.key || folder.filename || 'Ordner'} />
          <Appbar.Action icon="refresh" onPress={onRefresh} />
          <Appbar.Action icon="dots-vertical" onPress={() => setPropertiesMenuVisible(true)} />
        </Appbar.Header>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Lade Daten...</Text>
          </View>
        ) : (
          <View style={styles.splitContainer}>
            {renderClassListSidebar()}
            <View style={styles.splitDivider} />
            <View style={styles.contentContainer}>
              {renderContentArea()}
            </View>
          </View>
        )}
        {renderPropertiesModal()}
      </View>
    );
  }

  // Stacked layout for phones
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={folder.key || folder.filename || 'Ordner'} />
        <Appbar.Action icon="refresh" onPress={loadFolderData} />
        <Appbar.Action icon="dots-vertical" onPress={() => setPropertiesMenuVisible(true)} />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Lade Daten...</Text>
          </View>
        ) : (
          <>
            {renderClassSelection()}
            {renderGridData()}
          </>
        )}
      </ScrollView>
      {renderPropertiesModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  // Split layout styles (tablet)
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  splitDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  contentContainer: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  contentPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  contentPlaceholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Sidebar styles
  sidebarContainer: {
    width: 280,
    backgroundColor: '#fff',
  },
  sidebarHeader: {
    overflow: 'hidden',
  },
  sidebarHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 8,
  },
  sidebarHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarEmpty: {
    padding: 24,
    alignItems: 'center',
  },
  sidebarEmptyText: {
    fontSize: 14,
    color: '#999',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sidebarItemActive: {
    backgroundColor: '#f0e7ff',
  },
  sidebarItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  sidebarItemTextActive: {
    color: '#6200ee',
    fontWeight: '600',
  },
  // Stacked layout styles (phone)
  card: {
    margin: 16,
    borderRadius: 16,
  },
  classDropdownContainer: {
    padding: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  dropdownButton: {
    marginBottom: 16,
  },
  dropdownSurface: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  gridContainer: {
    padding: 16,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  objectIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  objectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  objectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  objectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaChip: {
    height: 24,
    backgroundColor: '#f0f0f0',
  },
  metaChipText: {
    fontSize: 11,
    marginVertical: 0,
    marginHorizontal: 8,
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
  loadMoreButton: {
    marginTop: 16,
    marginBottom: 8,
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
  // Class Selection Modal styles
  classSelectionModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  classModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
  },
  classModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  classModalList: {
    maxHeight: 400,
  },
  classModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  classModalItemSelected: {
    backgroundColor: '#f0e7ff',
  },
  classModalItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classModalItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  classModalItemTextSelected: {
    color: '#6200ee',
    fontWeight: '600',
  },
});
