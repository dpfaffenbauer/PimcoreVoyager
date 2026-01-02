/**
 * Data Objects Screen - Tree View
 * Shows hierarchical tree structure with lazy loading
 * Only loads first level initially, children load on expand
 * Long-press on non-folder items to publish/unpublish
 */

import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Pressable, Modal, Alert } from 'react-native';
import { Text, ActivityIndicator, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PimcoreService } from '../apis/pimcoreService';
import { PimcoreDataObject } from '../types/pimcore';
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
  Home: undefined;
  FolderDetail: { folder: any };
  ObjectDetail: { object: any; classDefinition?: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TreeNode extends PimcoreDataObject {
  expanded?: boolean;
  children?: TreeNode[];
  childrenLoaded?: boolean;
  level: number;
  permissions?: {
    publish?: boolean;
    unpublish?: boolean;
  };
}

export default function DataObjectsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ node: TreeNode; path: number[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRootLevel = useCallback(async () => {
    try {
      setLoading(true);
      // Load first level only (parentId = 1 is typically root)
      const items = await PimcoreService.getTreeLevel(1);
      const childNodes: TreeNode[] = items.map(item => ({
        ...item,
        expanded: false,
        children: [],
        childrenLoaded: false,
        level: 1,
      }));

      // Create Home node with ID 1 as root
      const homeNode: TreeNode = {
        id: 1,
        key: 'Datenobjekte',
        type: 'folder',
        path: '/',
        parentId: 0,
        hasChildren: childNodes.length > 0,
        expanded: true,
        children: childNodes,
        childrenLoaded: true,
        level: 0,
      };

      setTreeData([homeNode]);
    } catch (error) {
      console.error('Error loading root level:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRootLevel();
    setRefreshing(false);
  }, [loadRootLevel]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={onRefresh} style={{ marginRight: 16 }}>
          <MaterialCommunityIcons name="refresh" size={24} color="#666" />
        </Pressable>
      ),
    });
  }, [navigation, onRefresh]);

  useEffect(() => {
    loadRootLevel();
  }, [loadRootLevel]);

  const toggleExpand = async (node: TreeNode, path: number[]) => {
    if (!node.hasChildren && node.type !== 'folder') return;

    const newTreeData = [...treeData];
    let current: any = newTreeData;

    // Navigate to the node
    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        const targetNode = current[path[i]];

        if (!targetNode.expanded) {
          // Expand: load children if not loaded
          targetNode.expanded = true;

          if (!targetNode.childrenLoaded) {
            try {
              const children = await PimcoreService.getTreeLevel(targetNode.id);
              targetNode.children = children.map(child => ({
                ...child,
                expanded: false,
                children: [],
                childrenLoaded: false,
                level: targetNode.level + 1,
              }));
              targetNode.childrenLoaded = true;
            } catch (error) {
              console.error('Error loading children:', error);
              targetNode.children = [];
            }
          }
        } else {
          // Collapse
          targetNode.expanded = false;
        }
      } else {
        current = current[path[i]].children;
      }
    }

    setTreeData(newTreeData);
  };

  const handleNodeClick = (node: TreeNode) => {
    if (node.type === 'folder') {
      // Open folder detail view
      navigation.navigate('FolderDetail', { folder: node });
    } else {
      // Open object detail view
      navigation.navigate('ObjectDetail', {
        object: node,
        classDefinition: { id: node.className, name: node.className },
      });
    }
  };

  const handleLongPress = (node: TreeNode, path: number[]) => {
    // Only show action modal for non-folder items
    if (node.type === 'folder') return;
    setSelectedNode({ node, path });
    setActionModalVisible(true);
  };

  const updateNodeInTree = (path: number[], updates: Partial<TreeNode>) => {
    const newTreeData = [...treeData];
    let current: any = newTreeData;

    for (let i = 0; i < path.length; i++) {
      if (i === path.length - 1) {
        current[path[i]] = { ...current[path[i]], ...updates };
      } else {
        current = current[path[i]].children;
      }
    }

    setTreeData(newTreeData);
  };

  const handlePublishToggle = async () => {
    if (!selectedNode) return;

    const { node, path } = selectedNode;
    const newPublishState = !node.published;

    setActionLoading(true);
    try {
      await PimcoreService.setDataObjectPublishState(node.id, newPublishState);
      updateNodeInTree(path, { published: newPublishState });
      setActionModalVisible(false);
      setSelectedNode(null);
    } catch (error: any) {
      console.error('Error toggling publish state:', error);
      // Check for permission error
      const errorMessage = error?.response?.data?.message || error?.message || '';
      if (errorMessage.toLowerCase().includes('permission') || error?.response?.status === 403) {
        Alert.alert(
          'Keine Berechtigung',
          `Sie haben keine Berechtigung, dieses Objekt zu ${newPublishState ? 'veröffentlichen' : 'zurückziehen'}.`
        );
      } else {
        Alert.alert(
          'Fehler',
          `Objekt konnte nicht ${newPublishState ? 'veröffentlicht' : 'zurückgezogen'} werden.`
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getNodeIcon = (node: TreeNode): string => {
    if (node.type === 'folder') return 'folder';
    if (node.type === 'asset') return 'image';
    return 'cube';
  };

  const getNodeGradient = (node: TreeNode): string[] => {
    if (node.type === 'folder') return ['#ff9500', '#ffb84d'];
    if (node.type === 'asset') return ['#9c27b0', '#ba68c8'];
    return ['#0084ff', '#44a3ff'];
  };

  const renderTreeNode = (node: TreeNode, path: number[]) => {
    const hasExpandableChildren = node.hasChildren || node.type === 'folder';
    const gradient = getNodeGradient(node);
    const icon = getNodeIcon(node);

    return (
      <View key={`${node.id}-${path.join('-')}`}>
        <TouchableOpacity
          onPress={() => handleNodeClick(node)}
          onLongPress={() => handleLongPress(node, path)}
          delayLongPress={500}
          style={[
            styles.treeItem,
            { paddingLeft: 16 + node.level * 24 }, // Indentation based on level
          ]}
        >
          <View style={styles.treeItemContent}>
            {/* Expand/Collapse Chevron */}
            {hasExpandableChildren && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  toggleExpand(node, path);
                }}
                style={styles.chevronButton}
              >
                <IconButton
                  icon={node.expanded ? 'chevron-down' : 'chevron-right'}
                  size={20}
                  iconColor="#666"
                  style={{ margin: 0 }}
                />
              </TouchableOpacity>
            )}
            {!hasExpandableChildren && <View style={styles.chevronSpacer} />}

            {/* Node Icon with Gradient */}
            <LinearGradient
              colors={gradient}
              style={styles.nodeIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconButton icon={icon} iconColor="#fff" size={18} style={{ margin: 0 }} />
            </LinearGradient>

            {/* Node Label */}
            <Text style={styles.nodeLabel} numberOfLines={1}>
              {node.key || node.filename || `Item ${node.id}`}
            </Text>

            {/* Status Indicator */}
            {node.type !== 'folder' && (
              <View
                style={[
                  styles.statusDot,
                  node.published ? styles.publishedDot : styles.draftDot,
                ]}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Render Children if Expanded */}
        {node.expanded && node.children && node.children.length > 0 && (
          <View>
            {node.children.map((child, index) =>
              renderTreeNode(child, [...path, index])
            )}
          </View>
        )}
      </View>
    );
  };

  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node, index) => renderTreeNode(node, [index]));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Lade Baum...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {treeData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconButton icon="folder-outline" size={64} iconColor="#ccc" />
            <Text style={styles.emptyText}>Keine Daten gefunden</Text>
          </View>
        ) : (
          <View style={styles.treeContainer}>{renderTree(treeData)}</View>
        )}
      </ScrollView>

      {/* Context Menu Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setActionModalVisible(false);
          setSelectedNode(null);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setActionModalVisible(false);
            setSelectedNode(null);
          }}
        >
          <View style={styles.contextMenu}>
            {selectedNode && (
              <>
                {/* Header */}
                <View style={styles.contextMenuHeader}>
                  <LinearGradient
                    colors={getNodeGradient(selectedNode.node)}
                    style={styles.contextMenuIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name={getNodeIcon(selectedNode.node) as any}
                      size={20}
                      color="#fff"
                    />
                  </LinearGradient>
                  <View style={styles.contextMenuHeaderText}>
                    <Text style={styles.contextMenuTitle} numberOfLines={1}>
                      {selectedNode.node.key || selectedNode.node.filename}
                    </Text>
                    <Text style={styles.contextMenuSubtitle}>
                      {selectedNode.node.className || 'Objekt'}
                    </Text>
                  </View>
                </View>

                <View style={styles.contextMenuDivider} />

                {/* Menu Items */}
                <TouchableOpacity
                  style={styles.contextMenuItem}
                  onPress={handlePublishToggle}
                  disabled={actionLoading}
                >
                  <MaterialCommunityIcons
                    name={selectedNode.node.published ? 'eye-off' : 'eye'}
                    size={22}
                    color={selectedNode.node.published ? '#f44336' : '#4caf50'}
                  />
                  <Text style={[
                    styles.contextMenuItemText,
                    { color: selectedNode.node.published ? '#f44336' : '#4caf50' }
                  ]}>
                    {selectedNode.node.published ? 'Unpublish' : 'Publish'}
                  </Text>
                  {actionLoading && (
                    <ActivityIndicator size="small" style={styles.contextMenuItemLoader} />
                  )}
                </TouchableOpacity>

                {/* Placeholder for future menu items */}
                {/*
                <TouchableOpacity style={styles.contextMenuItem}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#666" />
                  <Text style={styles.contextMenuItemText}>Bearbeiten</Text>
                </TouchableOpacity>
                */}

                <View style={styles.contextMenuDivider} />

                <TouchableOpacity
                  style={styles.contextMenuItem}
                  onPress={() => {
                    setActionModalVisible(false);
                    setSelectedNode(null);
                  }}
                >
                  <MaterialCommunityIcons name="close" size={22} color="#999" />
                  <Text style={[styles.contextMenuItemText, { color: '#999' }]}>
                    Abbrechen
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
  treeContainer: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  treeItem: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  treeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronButton: {
    marginRight: 4,
  },
  chevronSpacer: {
    width: 40,
  },
  nodeIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nodeLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  publishedDot: {
    backgroundColor: '#4caf50',
  },
  draftDot: {
    backgroundColor: '#ff9800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxWidth: 340,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  contextMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  contextMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenuHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  contextMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contextMenuSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  contextMenuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  contextMenuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 14,
    flex: 1,
  },
  contextMenuItemLoader: {
    marginLeft: 8,
  },
});
