/**
 * Assets Screen - Tree View
 * Shows hierarchical asset tree structure with lazy loading
 * Similar to Pimcore Studio asset tree
 */

import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Pressable, Image } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PimcoreService } from '../apis/pimcoreService';
import { LinearGradient } from 'expo-linear-gradient';
import { useInstanceStore } from '../store/instanceStore';

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
  icon?: { type: string; value: string };
}

interface AssetTreeNode extends AssetItem {
  expanded?: boolean;
  children?: AssetTreeNode[];
  childrenLoaded?: boolean;
  level: number;
}

export default function AssetsScreen() {
  const navigation = useNavigation<any>();
  const [treeData, setTreeData] = useState<AssetTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { activeInstance } = useInstanceStore();

  const loadRootLevel = useCallback(async () => {
    try {
      setLoading(true);
      // Load first level (parentId = 1 is root)
      const items = await PimcoreService.getAssetTreeLevel(1);
      const childNodes: AssetTreeNode[] = items.map(item => ({
        ...item,
        expanded: false,
        children: [],
        childrenLoaded: false,
        level: 1,
      }));

      // Create Home node with ID 1 as root
      const homeNode: AssetTreeNode = {
        id: 1,
        filename: 'Assets',
        type: 'folder',
        fullPath: '/',
        path: '/',
        parentId: 0,
        hasChildren: childNodes.length > 0,
        fileSize: 0,
        expanded: true,
        children: childNodes,
        childrenLoaded: true,
        level: 0,
      };

      setTreeData([homeNode]);
    } catch (error) {
      console.error('Error loading asset root level:', error);
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

  const toggleExpand = async (node: AssetTreeNode, path: number[]) => {
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
              const children = await PimcoreService.getAssetTreeLevel(targetNode.id);
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

  const handleNodeClick = (node: AssetTreeNode) => {
    // Navigate to asset detail screen for all types
    navigation.navigate('AssetDetail', { asset: node });
  };

  const getNodeIcon = (node: AssetTreeNode): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (node.type === 'folder') return 'folder';
    if (node.type === 'image') return 'image';
    if (node.type === 'video') return 'video';
    if (node.type === 'audio') return 'music-note';
    if (node.type === 'document') return 'file-document';
    if (node.type === 'text') return 'file-document-outline';
    if (node.type === 'archive') return 'zip-box';
    return 'file';
  };

  const getNodeGradient = (node: AssetTreeNode): string[] => {
    if (node.type === 'folder') return ['#ff9500', '#ffb84d'];
    if (node.type === 'image') return ['#4caf50', '#81c784'];
    if (node.type === 'video') return ['#e91e63', '#f48fb1'];
    if (node.type === 'audio') return ['#9c27b0', '#ba68c8'];
    if (node.type === 'document') return ['#2196f3', '#64b5f6'];
    return ['#607d8b', '#90a4ae'];
  };

  const getThumbnailUrl = (node: AssetTreeNode): string | null => {
    if (node.type !== 'image') return null;

    // Use the Pimcore thumbnail URL pattern:
    // {baseUrl}/{folderPath}/{id}/image-thumb__{id}__pimcore-system-treepreview/{filename}
    // Note: path is the folder path (without filename), fullPath includes filename
    const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';
    const folderPath = node.path || '';  // This is the folder path without filename
    const filename = node.filename || '';

    // Clean the folder path: /Car Images/ac cars/ -> Car Images/ac cars
    const cleanFolderPath = folderPath.replace(/^\//, '').replace(/\/$/, '');

    // Encode each path segment separately
    const encodedPath = cleanFolderPath.split('/').map(p => encodeURIComponent(p)).join('/');

    const url = encodedPath
      ? `${baseUrl}/${encodedPath}/${node.id}/image-thumb__${node.id}__pimcore-system-treepreview/${encodeURIComponent(filename)}`
      : `${baseUrl}/${node.id}/image-thumb__${node.id}__pimcore-system-treepreview/${encodeURIComponent(filename)}`;

    return url;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderTreeNode = (node: AssetTreeNode, path: number[]) => {
    const hasExpandableChildren = node.hasChildren || node.type === 'folder';
    const gradient = getNodeGradient(node);
    const icon = getNodeIcon(node);
    const thumbnailUrl = getThumbnailUrl(node);

    return (
      <View key={`${node.id}-${path.join('-')}`}>
        <TouchableOpacity
          onPress={() => handleNodeClick(node)}
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
                <IconButton
                  icon={node.expanded ? 'chevron-down' : 'chevron-right'}
                  size={20}
                  iconColor="#666"
                  style={{ margin: 0 }}
                />
              </TouchableOpacity>
            )}
            {!hasExpandableChildren && <View style={styles.chevronSpacer} />}

            {/* Node Icon or Thumbnail */}
            {thumbnailUrl && node.type === 'image' ? (
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={gradient}
                style={styles.nodeIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconButton icon={icon} iconColor="#fff" size={18} style={{ margin: 0 }} />
              </LinearGradient>
            )}

            {/* Node Label */}
            <View style={styles.labelContainer}>
              <Text style={styles.nodeLabel} numberOfLines={1}>
                {node.filename}
              </Text>
              {node.type !== 'folder' && node.fileSize > 0 && (
                <Text style={styles.fileSize}>{formatFileSize(node.fileSize)}</Text>
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

  const renderTree = (nodes: AssetTreeNode[]) => {
    return nodes.map((node, index) => renderTreeNode(node, [index]));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Lade Assets...</Text>
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
            <IconButton icon="image-off" size={64} iconColor="#ccc" />
            <Text style={styles.emptyText}>Keine Assets gefunden</Text>
          </View>
        ) : (
          <View style={styles.treeContainer}>{renderTree(treeData)}</View>
        )}
      </ScrollView>
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
  thumbnailImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  labelContainer: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  fileSize: {
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
});
