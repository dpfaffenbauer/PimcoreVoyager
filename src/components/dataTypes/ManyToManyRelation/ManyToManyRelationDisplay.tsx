/**
 * Display component for Many-to-Many Relation data type
 * Shows a read-only list of related objects
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ManyToManyRelationValue,
  ManyToManyRelationConfig,
  ManyToManyRelationItem,
} from './ManyToManyRelation.types';
import { ManyToManyRelationTransformer } from './ManyToManyRelation.transformer';

export interface ManyToManyRelationDisplayProps {
  value: ManyToManyRelationValue;
  config: ManyToManyRelationConfig;
}

export const ManyToManyRelationDisplay: React.FC<ManyToManyRelationDisplayProps> = ({
  value,
  config,
}) => {
  if (ManyToManyRelationTransformer.isEmpty(value)) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{config.title}</Text>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="link-variant-off" size={32} color="#999" />
          <Text style={styles.emptyText}>Keine Relationen</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.title}</Text>
      <View style={styles.relationsList}>
        {value!.map((item, index) => (
          <RelationItemDisplay key={`${item.type}-${item.id}-${index}`} item={item} />
        ))}
      </View>
      <Text style={styles.count}>
        {value!.length} {value!.length === 1 ? 'Relation' : 'Relationen'}
      </Text>
    </View>
  );
};

interface RelationItemDisplayProps {
  item: ManyToManyRelationItem;
}

const RelationItemDisplay: React.FC<RelationItemDisplayProps> = ({ item }) => {
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
        return '#FF9800';
      case 'document':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  return (
    <Surface style={styles.relationItem} elevation={1}>
      <View style={styles.relationItemHeader}>
        <View
          style={[
            styles.typeIconContainer,
            { backgroundColor: getTypeColor(item.type) + '20' },
          ]}
        >
          <MaterialCommunityIcons
            name={getTypeIcon(item.type)}
            size={20}
            color={getTypeColor(item.type)}
          />
        </View>
        <View style={styles.relationItemContent}>
          <Text style={styles.relationItemTitle}>
            {ManyToManyRelationTransformer.getDisplayText(item)}
          </Text>
          <Text style={styles.relationItemPath} numberOfLines={1}>
            {item.path}
          </Text>
        </View>
      </View>
      <View style={styles.relationItemFooter}>
        <Chip
          icon="pound"
          style={styles.idChip}
          textStyle={styles.chipText}
          compact
        >
          {item.id}
        </Chip>
        {item.className && (
          <Chip
            icon="label-outline"
            style={styles.classChip}
            textStyle={styles.chipText}
            compact
          >
            {item.className}
          </Chip>
        )}
        {item.published !== undefined && (
          <Chip
            icon={item.published ? 'check-circle' : 'clock-outline'}
            style={[
              styles.statusChip,
              item.published ? styles.publishedChip : styles.unpublishedChip,
            ]}
            textStyle={styles.chipText}
            compact
          >
            {item.published ? 'Published' : 'Draft'}
          </Chip>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  relationsList: {
    gap: 12,
  },
  relationItem: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  relationItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relationItemContent: {
    flex: 1,
  },
  relationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  relationItemPath: {
    fontSize: 12,
    color: '#666',
  },
  relationItemFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  idChip: {
    backgroundColor: '#f0f0f0',
    height: 28,
  },
  classChip: {
    backgroundColor: '#e3f2fd',
    height: 28,
  },
  statusChip: {
    height: 28,
  },
  publishedChip: {
    backgroundColor: '#e8f5e9',
  },
  unpublishedChip: {
    backgroundColor: '#fff3e0',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  count: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
