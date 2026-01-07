/**
 * Tags Screen
 * Manages tags for an element (data-object, asset, document)
 * Shows assigned tags and allows adding/removing tags
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Text, ActivityIndicator, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';
import { TagsService, Tag, ElementType } from '../apis/tagsService';

interface TagsScreenProps {
  route: {
    params: {
      elementType: ElementType;
      elementId: number;
      elementName: string;
    };
  };
  navigation: any;
}

// Recursive component to render tag tree
const TagTreeItem: React.FC<{
  tag: Tag;
  level: number;
  assignedTagIds: Set<number>;
  onAdd: (tagId: number) => void;
  onRemove: (tagId: number) => void;
  expandedIds: Set<number>;
  toggleExpanded: (id: number) => void;
}> = ({ tag, level, assignedTagIds, onAdd, onRemove, expandedIds, toggleExpanded }) => {
  const isAssigned = assignedTagIds.has(tag.id);
  const hasChildren = tag.children && tag.children.length > 0;
  const isExpanded = expandedIds.has(tag.id);

  return (
    <View>
      <TouchableOpacity
        style={[styles.tagTreeItem, { paddingLeft: 16 + level * 20 }]}
        onPress={() => {
          if (hasChildren) {
            toggleExpanded(tag.id);
          }
        }}
      >
        {hasChildren ? (
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-down' : 'chevron-right'}
            size={20}
            color="#666"
            style={styles.expandIcon}
          />
        ) : (
          <View style={styles.expandIconPlaceholder} />
        )}

        <MaterialCommunityIcons
          name="tag-outline"
          size={18}
          color={isAssigned ? '#6200ee' : '#666'}
          style={styles.tagIcon}
        />

        <Text
          style={[
            styles.tagText,
            isAssigned && styles.tagTextAssigned,
            hasChildren && styles.tagTextParent,
          ]}
          numberOfLines={1}
        >
          {tag.text}
        </Text>

        <TouchableOpacity
          style={[
            styles.tagAction,
            isAssigned ? styles.tagActionRemove : styles.tagActionAdd,
          ]}
          onPress={() => (isAssigned ? onRemove(tag.id) : onAdd(tag.id))}
        >
          <MaterialCommunityIcons
            name={isAssigned ? 'minus' : 'plus'}
            size={18}
            color={isAssigned ? '#d32f2f' : '#4caf50'}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {hasChildren && isExpanded && (
        <View>
          {tag.children.map((child) => (
            <TagTreeItem
              key={child.id}
              tag={child}
              level={level + 1}
              assignedTagIds={assignedTagIds}
              onAdd={onAdd}
              onRemove={onRemove}
              expandedIds={expandedIds}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function TagsScreen({ route, navigation }: TagsScreenProps) {
  const { elementType, elementId, elementName } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignedTags, setAssignedTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Set header title
  useEffect(() => {
    navigation.setOptions({
      title: `Tags: ${elementName}`,
    });
  }, [elementName, navigation]);

  const loadData = useCallback(async () => {
    try {
      const [elementTagsResponse, allTagsResponse] = await Promise.all([
        TagsService.getElementTags(elementType, elementId),
        TagsService.getAllTags(),
      ]);

      setAssignedTags(elementTagsResponse.items || []);
      setAllTags(allTagsResponse.items || []);

      // Auto-expand parent tags that have assigned children
      const assignedIds = new Set((elementTagsResponse.items || []).map((t) => t.id));
      const parentsToExpand = new Set<number>();

      const findParentsWithAssignedChildren = (tags: Tag[]) => {
        for (const tag of tags) {
          if (tag.children && tag.children.length > 0) {
            const hasAssignedChild = tag.children.some((child) => assignedIds.has(child.id));
            if (hasAssignedChild) {
              parentsToExpand.add(tag.id);
            }
            findParentsWithAssignedChildren(tag.children);
          }
        }
      };

      findParentsWithAssignedChildren(allTagsResponse.items || []);
      setExpandedIds(parentsToExpand);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [elementType, elementId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddTag = async (tagId: number) => {
    setActionLoading(tagId);
    try {
      await TagsService.assignTag(elementType, elementId, tagId);
      await loadData();
    } catch (error) {
      console.error('Error adding tag:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    setActionLoading(tagId);
    try {
      await TagsService.removeTag(elementType, elementId, tagId);
      await loadData();
    } catch (error) {
      console.error('Error removing tag:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const assignedTagIds = new Set(assignedTags.map((t) => t.id));

  // Filter tags based on search
  const filterTags = (tags: Tag[], query: string): Tag[] => {
    if (!query) return tags;

    const lowerQuery = query.toLowerCase();

    return tags
      .map((tag) => {
        const matchesText = tag.text.toLowerCase().includes(lowerQuery);
        const filteredChildren = filterTags(tag.children || [], query);

        if (matchesText || filteredChildren.length > 0) {
          return {
            ...tag,
            children: filteredChildren.length > 0 ? filteredChildren : tag.children,
          };
        }
        return null;
      })
      .filter(Boolean) as Tag[];
  };

  const filteredTags = filterTags(allTags, searchQuery);

  // Expand all when searching
  useEffect(() => {
    if (searchQuery) {
      const allIds = new Set<number>();
      const collectIds = (tags: Tag[]) => {
        for (const tag of tags) {
          if (tag.hasChildren) {
            allIds.add(tag.id);
          }
          if (tag.children) {
            collectIds(tag.children);
          }
        }
      };
      collectIds(allTags);
      setExpandedIds(allIds);
    }
  }, [searchQuery, allTags]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Lade Tags...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Assigned Tags Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zugewiesene Tags</Text>
        {assignedTags.length === 0 ? (
          <Text style={styles.emptyText}>Keine Tags zugewiesen</Text>
        ) : (
          <View style={styles.chipsContainer}>
            {assignedTags.map((tag) => (
              <View key={tag.id} style={[styles.chip, actionLoading === tag.id && styles.chipDisabled]}>
                <MaterialCommunityIcons name="tag" size={16} color={THEME.PRIMARY_COLOR} />
                <Text style={styles.chipText}>{tag.text}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag.id)}
                  disabled={actionLoading === tag.id}
                  style={styles.chipCloseButton}
                >
                  <MaterialCommunityIcons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* All Tags Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verfügbare Tags</Text>

        <View style={styles.searchbar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" />
          <TextInput
            placeholder="Tags suchen..."
            placeholderTextColor="#999"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {filteredTags.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery ? 'Keine Tags gefunden' : 'Keine Tags verfügbar'}
          </Text>
        ) : (
          <View style={styles.tagTree}>
            {filteredTags.map((tag) => (
              <TagTreeItem
                key={tag.id}
                tag={tag}
                level={0}
                assignedTagIds={assignedTagIds}
                onAdd={handleAddTag}
                onRemove={handleRemoveTag}
                expandedIds={expandedIds}
                toggleExpanded={toggleExpanded}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e0f0',
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 14,
    color: THEME.PRIMARY_COLOR,
    fontWeight: '500',
  },
  chipCloseButton: {
    padding: 4,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  searchbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  tagTree: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tagTreeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expandIcon: {
    marginRight: 4,
  },
  expandIconPlaceholder: {
    width: 24,
  },
  tagIcon: {
    marginRight: 8,
  },
  tagText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  tagTextAssigned: {
    color: '#6200ee',
    fontWeight: '500',
  },
  tagTextParent: {
    fontWeight: '600',
  },
  tagAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagActionAdd: {
    backgroundColor: '#e8f5e9',
  },
  tagActionRemove: {
    backgroundColor: '#ffebee',
  },
});
