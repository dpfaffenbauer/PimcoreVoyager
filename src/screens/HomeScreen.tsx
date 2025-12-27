/**
 * Home Screen - Tree View
 * Shows hierarchical tree structure with lazy loading
 * Only loads first level initially, children load on expand
 * Matches Pimcore Studio tree design
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, IconButton, Appbar, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRootLevel();
  }, []);

  const loadRootLevel = async () => {
    try {
      setLoading(true);
      // Load first level only (parentId = 1 is typically root)
      const items = await PimcoreService.getTreeLevel(1);
      const treeNodes: TreeNode[] = items.map(item => ({
        ...item,
        expanded: false,
        children: [],
        childrenLoaded: false,
        level: 0,
      }));
      setTreeData(treeNodes);
    } catch (error) {
      console.error('Error loading root level:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRootLevel();
    setRefreshing(false);
  };

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
        <Appbar.Header>
          <Appbar.Content title="Objekt-Baum" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Lade Baum...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Objekt-Baum" />
        <Appbar.Action icon="refresh" onPress={onRefresh} />
      </Appbar.Header>

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
});
