/**
 * Folder Detail Screen
 * Shows classes and objects within a folder
 * Uses /class/folder/:id to get classes
 * Uses /data-object/grid/configuration/:id/:classId to get grid data
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Card, Chip, IconButton, Appbar, Surface, Menu, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PimcoreService } from '../apis/pimcoreService';
import { LinearGradient } from 'expo-linear-gradient';

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

  const [loading, setLoading] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [classes, setClasses] = useState<Array<{id: string, name: string}>>([]);
  const [gridData, setGridData] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<{id: string, name: string} | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

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

  const loadGridData = async (classObj: {id: string, name: string}) => {
    try {
      console.log('Loading grid data for class:', classObj, 'in folder:', folder.id);
      setLoadingGrid(true);
      setSelectedClass(classObj);
      setMenuVisible(false);
      
      const data = await PimcoreService.getGridConfiguration(folder.id, classObj.id, 1, 10);
      console.log('Grid data received:', data);
      
      // Handle different response structures
      let items = [];
      if (data.items && Array.isArray(data.items)) {
        items = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data)) {
        items = data;
      }
      
      console.log('Extracted items:', items);
      setGridData({ items, total: items.length });
    } catch (error) {
      console.error('Error loading grid data:', error);
      // Set empty grid data to show error state
      setGridData({ items: [], total: 0 });
    } finally {
      setLoadingGrid(false);
    }
  };

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

    // Show dropdown menu for class selection
    if (classes.length > 1) {
      return (
        <View style={styles.classDropdownContainer}>
          <Text style={styles.dropdownLabel}>Klasse auswählen:</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
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
                    <IconButton 
                      icon={menuVisible ? "chevron-up" : "chevron-down"} 
                      size={24} 
                    />
                  </View>
                </Surface>
              </TouchableOpacity>
            }
          >
            {classes.map((classObj) => (
              <Menu.Item
                key={classObj.id}
                onPress={() => loadGridData(classObj)}
                title={classObj.name}
                leadingIcon="cube-outline"
              />
            ))}
          </Menu>
        </View>
      );
    }

    return null;
  };

  const renderGridData = () => {
    if (!selectedClass) return null;

    if (loadingGrid) {
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

    return (
      <View style={styles.gridContainer}>
        <View style={styles.gridHeader}>
          <Text style={styles.sectionTitle}>
            {selectedClass.name} ({items.length} Objekte)
          </Text>
        </View>

        {items.map((item: any, index: number) => (
          <TouchableOpacity
            key={item.id || index}
            onPress={() =>
              navigation.navigate('ObjectDetail', {
                object: item,
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
                <Text style={styles.objectName}>{item.key || item.filename || `Objekt ${item.id}`}</Text>
                <View style={styles.objectMeta}>
                  <Chip icon="identifier" style={styles.metaChip} textStyle={styles.metaChipText}>
                    ID: {item.id}
                  </Chip>
                  {item.published && (
                    <View style={[styles.statusDot, styles.publishedDot]} />
                  )}
                  {!item.published && (
                    <View style={[styles.statusDot, styles.draftDot]} />
                  )}
                </View>
              </View>

              <IconButton icon="chevron-right" size={20} />
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={folder.key || folder.filename || 'Ordner'} />
        <Appbar.Action icon="refresh" onPress={loadFolderData} />
      </Appbar.Header>

      <ScrollView style={styles.content}>

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
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
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
});
