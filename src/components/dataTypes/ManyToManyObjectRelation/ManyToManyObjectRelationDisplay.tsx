/**
 * Display component for Many-to-Many Object Relation
 * Shows related objects in a read-only view
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Chip, Surface, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DataTypeDisplayProps } from '../types';
import {
  ManyToManyObjectRelationValue,
  ManyToManyObjectRelationConfig,
  RelatedObject,
} from './ManyToManyObjectRelation.types';

interface ManyToManyObjectRelationDisplayProps
  extends DataTypeDisplayProps<ManyToManyObjectRelationValue> {
  config: ManyToManyObjectRelationConfig;
  onObjectPress?: (object: RelatedObject) => void;
}

export const ManyToManyObjectRelationDisplay: React.FC<
  ManyToManyObjectRelationDisplayProps
> = ({ value, config, onObjectPress }) => {
  if (!value || value.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{config.label}</Text>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="link-variant-off" size={32} color="#ccc" />
          <Text style={styles.emptyText}>Keine Relationen</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{config.label}</Text>
        <Chip
          icon="link-variant"
          style={styles.countChip}
          textStyle={styles.countChipText}
          compact
        >
          {value.length}
        </Chip>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.relationsContainer}>
          {value.map((object, index) => (
            <TouchableOpacity
              key={`${object.id}-${index}`}
              onPress={() => onObjectPress?.(object)}
              disabled={!onObjectPress}
              activeOpacity={0.7}
            >
              <Surface style={styles.objectCard} elevation={1}>
                <View style={styles.objectHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={object.type === 'folder' ? 'folder' : 'file-document-outline'}
                      size={24}
                      color="#6200ee"
                    />
                  </View>
                  <View style={styles.objectInfo}>
                    <Text style={styles.objectKey} numberOfLines={1}>
                      {object.key}
                    </Text>
                    {object.className && (
                      <Text style={styles.objectClass} numberOfLines={1}>
                        {object.className}
                      </Text>
                    )}
                  </View>
                  {!object.published && (
                    <MaterialCommunityIcons name="eye-off" size={16} color="#ff9800" />
                  )}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.objectFooter}>
                  <View style={styles.idBadge}>
                    <MaterialCommunityIcons name="pound" size={12} color="#666" />
                    <Text style={styles.objectId}>{object.id}</Text>
                  </View>
                  <Text style={styles.objectPath} numberOfLines={1}>
                    {object.path || object.fullPath}
                  </Text>
                </View>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  countChip: {
    backgroundColor: '#e8f5e9',
    height: 28,
  },
  countChipText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  scrollView: {
    marginHorizontal: -8,
  },
  relationsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 12,
  },
  objectCard: {
    width: 220,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  objectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  objectInfo: {
    flex: 1,
  },
  objectKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  objectClass: {
    fontSize: 11,
    color: '#6200ee',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  objectFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  objectId: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  objectPath: {
    fontSize: 10,
    color: '#999',
    flex: 1,
  },
});
