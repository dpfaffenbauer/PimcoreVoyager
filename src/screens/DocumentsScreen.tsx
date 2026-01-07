/**
 * Documents Screen - Tree View
 * Shows hierarchical document tree structure with lazy loading
 * Similar to Pimcore Studio document tree
 * Long-press on non-folder items to publish/unpublish
 */

import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Pressable, Modal, Alert, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';
import { PimcoreService } from '../apis/pimcoreService';
import { LinearGradient } from 'expo-linear-gradient';

interface DocumentItem {
  id: number;
  key: string;
  type: string;
  fullPath: string;
  path: string;
  parentId: number;
  hasChildren: boolean;
  published?: boolean;
  icon?: { type: string; value: string };
}

interface DocumentTreeNode extends DocumentItem {
  expanded?: boolean;
  children?: DocumentTreeNode[];
  childrenLoaded?: boolean;
  level: number;
}

export default function DocumentsScreen() {
  const navigation = useNavigation<any>();
  const [treeData, setTreeData] = useState<DocumentTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ node: DocumentTreeNode; path: number[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRootLevel = useCallback(async () => {
    try {
      setLoading(true);
      // Load first level (parentId = 1 is root)
      const items = await PimcoreService.getDocumentTreeLevel(1);
      const childNodes: DocumentTreeNode[] = items.map(item => ({
        ...item,
        expanded: false,
        children: [],
        childrenLoaded: false,
        level: 1,
      }));

      // Create Home node with ID 1 as root
      const homeNode: DocumentTreeNode = {
        id: 1,
        key: 'Documents',
        type: 'folder',
        fullPath: '/',
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
      console.error('Error loading document root level:', error);
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

  const toggleExpand = async (node: DocumentTreeNode, path: number[]) => {
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
              const children = await PimcoreService.getDocumentTreeLevel(targetNode.id);
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

  const handleNodeClick = (node: DocumentTreeNode) => {
    // Navigate to document detail screen
    navigation.navigate('DocumentDetail', { document: node });
  };

  const handleLongPress = (node: DocumentTreeNode, path: number[]) => {
    // Only show action modal for non-folder items
    if (node.type === 'folder') return;
    setSelectedNode({ node, path });
    setActionModalVisible(true);
  };

  const updateNodeInTree = (path: number[], updates: Partial<DocumentTreeNode>) => {
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
      await PimcoreService.setDocumentPublishState(node.id, newPublishState);
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
          `Sie haben keine Berechtigung, dieses Dokument zu ${newPublishState ? 'veröffentlichen' : 'zurückziehen'}.`
        );
      } else {
        Alert.alert(
          'Fehler',
          `Dokument konnte nicht ${newPublishState ? 'veröffentlicht' : 'zurückgezogen'} werden.`
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getNodeIcon = (node: DocumentTreeNode): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (node.type === 'folder') return 'folder';
    if (node.type === 'page') return 'file-document';
    if (node.type === 'snippet') return 'puzzle';
    if (node.type === 'link') return 'link';
    if (node.type === 'hardlink') return 'link-variant';
    if (node.type === 'email') return 'email';
    if (node.type === 'printpage') return 'printer';
    if (node.type === 'printcontainer') return 'folder-multiple';
    return 'file';
  };

  const getNodeGradient = (node: DocumentTreeNode): string[] => {
    if (node.type === 'folder') return ['#ff9500', '#ffb84d'];
    if (node.type === 'page') return ['#2196f3', '#64b5f6'];
    if (node.type === 'snippet') return ['#9c27b0', '#ba68c8'];
    if (node.type === 'link') return ['#00bcd4', '#4dd0e1'];
    if (node.type === 'hardlink') return ['#009688', '#4db6ac'];
    if (node.type === 'email') return ['#f44336', '#e57373'];
    if (node.type === 'printpage') return ['#795548', '#a1887f'];
    if (node.type === 'printcontainer') return ['#607d8b', '#90a4ae'];
    return ['#607d8b', '#90a4ae'];
  };

  const renderTreeNode = (node: DocumentTreeNode, path: number[]) => {
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
            { paddingLeft: 16 + node.level * 24 },
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
                <MaterialCommunityIcons
                  name={node.expanded ? 'chevron-down' : 'chevron-right'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            )}
            {!hasExpandableChildren && <View style={styles.chevronSpacer} />}

            {/* Node Icon */}
            <LinearGradient
              colors={gradient}
              style={styles.nodeIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name={icon} size={18} color="#fff" />
            </LinearGradient>

            {/* Node Label */}
            <View style={styles.labelContainer}>
              <Text style={styles.nodeLabel} numberOfLines={1}>
                {node.key}
              </Text>
              {node.fullPath && node.fullPath !== '/' && (
                <Text style={styles.nodePath} numberOfLines={1}>
                  {node.fullPath}
                </Text>
              )}
            </View>

            {/* Type Badge */}
            {node.type !== 'folder' && (
              <View style={[styles.typeBadge, { backgroundColor: gradient[0] + '20' }]}>
                <Text style={[styles.typeBadgeText, { color: gradient[0] }]}>
                  {node.type}
                </Text>
              </View>
            )}

            {/* Published Status */}
            {node.type !== 'folder' && (
              <View style={[
                styles.publishedBadge,
                { backgroundColor: node.published ? '#4caf5020' : '#f4433620' }
              ]}>
                <MaterialCommunityIcons
                  name={node.published ? 'check-circle' : 'close-circle'}
                  size={16}
                  color={node.published ? '#4caf50' : '#f44336'}
                />
              </View>
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

  const renderTree = (nodes: DocumentTreeNode[]) => {
    return nodes.map((node, index) => renderTreeNode(node, [index]));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Lade Dokumente...</Text>
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
            <MaterialCommunityIcons name="file-document-multiple-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Keine Dokumente gefunden</Text>
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
                      {selectedNode.node.key}
                    </Text>
                    <Text style={styles.contextMenuSubtitle}>
                      {selectedNode.node.type}
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
  labelContainer: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  nodePath: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  publishedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
