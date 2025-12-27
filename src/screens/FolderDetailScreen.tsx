/**
 * Folder Detail Screen
 * Shows classes and objects within a folder
 * Uses /class/folder/:id to get classes
 * Uses /data-object/grid/configuration/:id/:classId to get grid data
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Card, Chip, IconButton, Appbar, Surface } from 'react-native-paper';
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
  const [classes, setClasses] = useState<string[]>([]);
  const [gridData, setGridData] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    loadFolderData();
  }, [folder.id]);

  const loadFolderData = async () => {
    try {
      setLoading(true);
      
      // Get classes in this folder
      const folderClasses = await PimcoreService.getFolderClasses(folder.id);
      setClasses(folderClasses);

      // If only one class, automatically load its data
      if (folderClasses.length === 1) {
        loadGridData(folderClasses[0]);
      }
    } catch (error) {
      console.error('Error loading folder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGridData = async (classId: string) => {
    try {
      setSelectedClass(classId);
      const data = await PimcoreService.getGridConfiguration(folder.id, classId, 1, 10);
      setGridData(data);
    } catch (error) {
      console.error('Error loading grid data:', error);
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

    if (classes.length > 1 && !selectedClass) {
      return (
        <View style={styles.classSelectionContainer}>
          <Text style={styles.sectionTitle}>Klasse auswählen:</Text>
          {classes.map((classId) => (
            <TouchableOpacity
              key={classId}
              onPress={() => loadGridData(classId)}
              style={styles.classOption}
            >
              <Surface style={styles.classCard} elevation={2}>
                <LinearGradient
                  colors={['#6200ee', '#9d4edd']}
                  style={styles.classIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <IconButton icon="cube-outline" iconColor="#fff" size={32} />
                </LinearGradient>
                <Text style={styles.className}>{classId}</Text>
                <IconButton icon="chevron-right" size={24} />
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  const renderGridData = () => {
    if (!gridData) return null;

    const items = gridData.items || gridData.data || [];

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
            {selectedClass} ({items.length} Objekte)
          </Text>
          {classes.length > 1 && (
            <IconButton
              icon="arrow-left"
              size={20}
              onPress={() => {
                setSelectedClass(null);
                setGridData(null);
              }}
            />
          )}
        </View>

        {items.map((item: any, index: number) => (
          <TouchableOpacity
            key={item.id || index}
            onPress={() =>
              navigation.navigate('ObjectDetail', {
                object: item,
                classDefinition: { id: selectedClass, name: selectedClass },
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
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Folder Header */}
        <LinearGradient
          colors={['#ff9500', '#ffb84d']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconButton icon="folder" iconColor="#fff" size={48} />
          <Text style={styles.headerTitle}>{folder.key || folder.filename || 'Ordner'}</Text>
          <Text style={styles.headerSubtitle}>{folder.fullPath}</Text>
        </LinearGradient>

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
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
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
  classSelectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  classOption: {
    marginBottom: 12,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  classIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  className: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
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
