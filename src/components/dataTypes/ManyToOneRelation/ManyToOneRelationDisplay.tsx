/**
 * Display Component for Many-to-One Relation
 * Shows the related object in read-only mode
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DataTypeDisplayProps } from '../types';
import { ManyToOneRelationValue, ManyToOneRelationConfig } from './ManyToOneRelation.types';

export const ManyToOneRelationDisplay: React.FC<
  DataTypeDisplayProps<ManyToOneRelationValue | null, ManyToOneRelationConfig>
> = ({ value, config, style }) => {
  if (!value) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.label}>{config.title}</Text>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="link-variant-off" size={20} color="#999" />
          <Text style={styles.emptyText}>No relation set</Text>
        </View>
      </View>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'object':
        return 'cube-outline';
      case 'asset':
        return 'file-image-outline';
      case 'document':
        return 'file-document-outline';
      default:
        return 'link-variant';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'object':
        return '#2196F3';
      case 'asset':
        return '#4CAF50';
      case 'document':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{config.title}</Text>
      <View style={styles.relationCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor(value.type)}20` }]}>
          <MaterialCommunityIcons
            name={getTypeIcon(value.type)}
            size={24}
            color={getTypeColor(value.type)}
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.keyText} numberOfLines={1}>
              {value.key || `Object #${value.id}`}
            </Text>
            {value.published === false && (
              <View style={styles.unpublishedBadge}>
                <Text style={styles.badgeText}>Draft</Text>
              </View>
            )}
          </View>
          {value.className && (
            <Text style={styles.classText} numberOfLines={1}>
              {value.className}
            </Text>
          )}
          {value.path && (
            <Text style={styles.pathText} numberOfLines={1}>
              {value.path}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  relationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  keyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  classText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  pathText: {
    fontSize: 12,
    color: '#999',
  },
  unpublishedBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});
