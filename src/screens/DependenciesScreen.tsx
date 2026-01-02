/**
 * Dependencies Screen
 * Displays dependencies for an element (requires and required_by)
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DependenciesService, Dependency, DependencyElementType, DependencyMode } from '../apis/dependenciesService';

export default function DependenciesScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { elementType, elementId, elementName } = route.params as {
    elementType: DependencyElementType;
    elementId: number;
    elementName: string;
  };

  const [activeTab, setActiveTab] = useState<DependencyMode>('requires');
  const [requires, setRequires] = useState<Dependency[]>([]);
  const [requiredBy, setRequiredBy] = useState<Dependency[]>([]);
  const [requiresTotal, setRequiresTotal] = useState(0);
  const [requiredByTotal, setRequiredByTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [requiresPage, setRequiresPage] = useState(1);
  const [requiredByPage, setRequiredByPage] = useState(1);
  const pageSize = 20;

  const loadDependencies = async () => {
    try {
      const [reqResult, reqByResult] = await Promise.all([
        DependenciesService.getDependencies(elementType, elementId, 'requires', 1, pageSize),
        DependenciesService.getDependencies(elementType, elementId, 'required_by', 1, pageSize),
      ]);
      setRequires(reqResult.items);
      setRequiresTotal(reqResult.totalItems);
      setRequiresPage(1);
      setRequiredBy(reqByResult.items);
      setRequiredByTotal(reqByResult.totalItems);
      setRequiredByPage(1);
    } catch (error) {
      console.error('Error loading dependencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore) return;

    const currentItems = activeTab === 'requires' ? requires : requiredBy;
    const total = activeTab === 'requires' ? requiresTotal : requiredByTotal;
    const page = activeTab === 'requires' ? requiresPage : requiredByPage;

    if (currentItems.length >= total) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const result = await DependenciesService.getDependencies(
        elementType,
        elementId,
        activeTab,
        nextPage,
        pageSize
      );

      if (activeTab === 'requires') {
        setRequires(prev => [...prev, ...result.items]);
        setRequiresPage(nextPage);
      } else {
        setRequiredBy(prev => [...prev, ...result.items]);
        setRequiredByPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more dependencies:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDependencies();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDependencies();
  }, [elementType, elementId]);

  useEffect(() => {
    navigation.setOptions({
      title: `Dependencies: ${elementName}`,
    });
  }, [navigation, elementName]);

  const getTypeIcon = (type: string, subType: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (type === 'dataObject') {
      if (subType === 'folder') return 'folder';
      return 'cube';
    }
    if (type === 'asset') {
      if (subType === 'folder') return 'folder';
      if (subType === 'image') return 'image';
      return 'file';
    }
    if (type === 'document') {
      if (subType === 'folder') return 'folder';
      if (subType === 'page') return 'file-document';
      if (subType === 'snippet') return 'puzzle';
      if (subType === 'link') return 'link';
      return 'file-document-outline';
    }
    return 'file';
  };

  const getTypeColor = (type: string): string => {
    if (type === 'dataObject') return '#0084ff';
    if (type === 'asset') return '#4caf50';
    if (type === 'document') return '#ff9500';
    return '#607d8b';
  };

  const handleDependencyPress = (dep: Dependency) => {
    // Navigate to the correct tab and screen
    // Need to use full navigation path for nested navigators
    if (dep.type === 'dataObject') {
      navigation.navigate('MainTabs', {
        screen: 'DataObjects',
        params: {
          screen: 'ObjectDetail',
          params: {
            object: { id: dep.id, key: dep.path.split('/').pop() },
          },
        },
      });
    } else if (dep.type === 'asset') {
      navigation.navigate('MainTabs', {
        screen: 'Assets',
        params: {
          screen: 'AssetDetail',
          params: {
            asset: { id: dep.id, filename: dep.path.split('/').pop(), fullPath: dep.path, type: dep.subType },
          },
        },
      });
    } else if (dep.type === 'document') {
      navigation.navigate('MainTabs', {
        screen: 'Documents',
        params: {
          screen: 'DocumentDetail',
          params: {
            document: { id: dep.id, key: dep.path.split('/').pop(), fullPath: dep.path, type: dep.subType },
          },
        },
      });
    }
  };

  const displayedItems = activeTab === 'requires' ? requires : requiredBy;
  const displayedTotal = activeTab === 'requires' ? requiresTotal : requiredByTotal;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Lade Dependencies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requires' && styles.tabActive]}
          onPress={() => setActiveTab('requires')}
        >
          <MaterialCommunityIcons
            name="arrow-right-circle-outline"
            size={18}
            color={activeTab === 'requires' ? '#6200ee' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'requires' && styles.tabTextActive]}>
            Requires ({requiresTotal})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'required_by' && styles.tabActive]}
          onPress={() => setActiveTab('required_by')}
        >
          <MaterialCommunityIcons
            name="arrow-left-circle-outline"
            size={18}
            color={activeTab === 'required_by' ? '#6200ee' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'required_by' && styles.tabTextActive]}>
            Required by ({requiredByTotal})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
      >
        {/* Info Header */}
        <View style={styles.infoHeader}>
          <MaterialCommunityIcons
            name={activeTab === 'requires' ? 'arrow-right-circle' : 'arrow-left-circle'}
            size={20}
            color="#6200ee"
          />
          <Text style={styles.infoText}>
            {activeTab === 'requires'
              ? 'Elemente, die dieses Element benötigt'
              : 'Elemente, die dieses Element benötigen'}
          </Text>
        </View>

        {/* Dependencies List */}
        {displayedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="link-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'requires'
                ? 'Keine Abhängigkeiten'
                : 'Wird nicht benötigt'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {displayedItems.map((dep) => {
              const typeColor = getTypeColor(dep.type);
              const typeIcon = getTypeIcon(dep.type, dep.subType);

              return (
                <TouchableOpacity
                  key={`${dep.type}-${dep.id}`}
                  style={styles.depCard}
                  onPress={() => handleDependencyPress(dep)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.depIcon, { backgroundColor: typeColor + '20' }]}>
                    <MaterialCommunityIcons name={typeIcon} size={20} color={typeColor} />
                  </View>
                  <View style={styles.depInfo}>
                    <Text style={styles.depPath} numberOfLines={2} selectable>
                      {dep.path}
                    </Text>
                    <View style={styles.depMeta}>
                      <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                          {dep.subType}
                        </Text>
                      </View>
                      <View style={[
                        styles.publishedBadge,
                        { backgroundColor: dep.published ? '#4caf5020' : '#f4433620' }
                      ]}>
                        <MaterialCommunityIcons
                          name={dep.published ? 'check-circle' : 'close-circle'}
                          size={12}
                          color={dep.published ? '#4caf50' : '#f44336'}
                        />
                        <Text style={[
                          styles.publishedText,
                          { color: dep.published ? '#4caf50' : '#f44336' }
                        ]}>
                          {dep.published ? 'Published' : 'Draft'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              );
            })}

            {/* Load More Button */}
            {displayedItems.length < displayedTotal && (
              <Button
                mode="outlined"
                onPress={loadMore}
                loading={loadingMore}
                disabled={loadingMore}
                style={styles.loadMoreButton}
              >
                Mehr laden
              </Button>
            )}
          </View>
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
  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#6200ee',
    fontWeight: '600',
  },
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ede7f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#6200ee',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  listContainer: {
    gap: 8,
  },
  depCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  depIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  depInfo: {
    flex: 1,
    marginLeft: 12,
  },
  depPath: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  depMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  publishedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  publishedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  loadMoreButton: {
    marginTop: 8,
  },
});
