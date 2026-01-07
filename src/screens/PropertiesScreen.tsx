/**
 * Properties Screen
 * Displays predefined properties for an element (object, asset, document)
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PimcoreService, ElementProperty, PropertyElementType } from '../apis/pimcoreService';
import { PropertiesSection } from '../components/PropertiesSection';

export default function PropertiesScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { elementType, elementId, elementName } = route.params as {
    elementType: PropertyElementType;
    elementId: number;
    elementName: string;
  };
  const [properties, setProperties] = useState<ElementProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProperties = async () => {
    try {
      const result = await PimcoreService.getElementProperties(elementType, elementId);
      setProperties(result);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProperties();
  }, [elementType, elementId]);

  useEffect(() => {
    navigation.setOptions({
      title: `Properties: ${elementName}`,
    });
  }, [navigation, elementName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Lade Properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Info */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name={
              elementType === 'data-object' ? 'cube-outline' :
              elementType === 'asset' ? 'image-outline' : 'file-document-outline'
            }
            size={24}
            color="#6200ee"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              Vordefinierte Properties für {
                elementType === 'data-object' ? 'Data Objects' :
                elementType === 'asset' ? 'Assets' : 'Documents'
              }
            </Text>
            <Text style={styles.headerSubtitle}>
              {properties.length} Properties verfügbar
            </Text>
          </View>
        </View>

        {/* Properties List */}
        <View style={styles.propertiesContainer}>
          <PropertiesSection properties={properties} loading={false} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  propertiesContainer: {
    flex: 1,
  },
});
