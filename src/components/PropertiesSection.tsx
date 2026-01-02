/**
 * Properties Section Component
 * Displays predefined properties for elements (objects, assets, documents)
 * Two-column layout: Property info | Value/Type
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ElementProperty, PropertyType } from '../apis/propertiesService';

interface PropertiesSectionProps {
  properties: ElementProperty[];
  loading?: boolean;
}

// Get icon for property type
const getPropertyTypeIcon = (type: PropertyType): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (type) {
    case 'text':
      return 'format-text';
    case 'bool':
      return 'toggle-switch-outline';
    case 'select':
      return 'form-dropdown';
    case 'document':
      return 'file-document-outline';
    case 'asset':
      return 'image-outline';
    case 'object':
      return 'cube-outline';
    default:
      return 'tag-outline';
  }
};

// Get color for property type
const getPropertyTypeColor = (type: PropertyType): string => {
  switch (type) {
    case 'text':
      return '#3b82f6';
    case 'bool':
      return '#22c55e';
    case 'select':
      return '#a855f7';
    case 'document':
      return '#f59e0b';
    case 'asset':
      return '#ec4899';
    case 'object':
      return '#06b6d4';
    default:
      return '#64748b';
  }
};

// Get type label
const getTypeLabel = (type: PropertyType): string => {
  switch (type) {
    case 'text':
      return 'Text';
    case 'bool':
      return 'Boolean';
    case 'select':
      return 'Select';
    case 'document':
      return 'Document';
    case 'asset':
      return 'Asset';
    case 'object':
      return 'Object';
    default:
      return type;
  }
};

// Get display value from property data
const getDisplayValue = (property: ElementProperty): string => {
  // For relation types (document, object, asset), show fullPath from data object
  if (['document', 'object', 'asset'].includes(property.type)) {
    if (property.data && typeof property.data === 'object' && 'fullPath' in property.data) {
      return property.data.fullPath;
    }
    return `[${getTypeLabel(property.type as PropertyType)}]`;
  }

  // For boolean, show Ja/Nein
  if (property.type === 'bool') {
    return property.data === true ? 'Ja' : property.data === false ? 'Nein' : '—';
  }

  // For text and select, show string value
  if (typeof property.data === 'string' && property.data) {
    return property.data;
  }

  // Fallback to config for select types
  if (property.config) {
    return property.config;
  }

  return '—';
};

// Get display name
const getDisplayName = (property: ElementProperty): string => {
  return property.key;
};

export function PropertiesSection({ properties, loading }: PropertiesSectionProps) {
  const navigation = useNavigation<any>();
  const [selectedProperty, setSelectedProperty] = useState<ElementProperty | null>(null);
  const [activeTab, setActiveTab] = useState<'own' | 'inherited'>('own');

  // Navigate to element detail screen
  const handleValuePress = (property: ElementProperty) => {
    if (!['document', 'object', 'asset'].includes(property.type)) return;
    if (!property.data || typeof property.data !== 'object') return;

    const { id, type, key, fullPath } = property.data;

    if (property.type === 'document') {
      navigation.navigate('DocumentDetail', {
        document: { id, type, key, fullPath, path: property.data.path },
      });
    } else if (property.type === 'asset') {
      navigation.navigate('AssetDetail', {
        asset: { id, type, key, fullPath, path: property.data.path },
      });
    } else if (property.type === 'object') {
      navigation.navigate('ObjectDetail', {
        objectId: id,
        objectKey: key,
      });
    }
  };

  // Split properties:
  // - Eigene (Own): inherited === false AND inheritable === true (custom properties set on this element)
  // - Vererbt (Inherited): inherited === true (inherited from parent)
  // - System properties (inherited === false AND inheritable === false) are excluded
  const inheritedProperties = properties.filter(p => p.inherited === true);
  const ownProperties = properties.filter(p => p.inherited === false && p.inheritable === true);
  const displayedProperties = activeTab === 'inherited' ? inheritedProperties : ownProperties;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6200ee" />
        <Text style={styles.loadingText}>Lade Properties...</Text>
      </View>
    );
  }

  if (properties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="tag-off-outline" size={32} color="#999" />
        <Text style={styles.emptyText}>Keine Properties definiert</Text>
      </View>
    );
  }

  const renderPropertyRow = (property: ElementProperty, index: number) => {
    const typeColor = getPropertyTypeColor(property.type as PropertyType);
    const typeIcon = getPropertyTypeIcon(property.type as PropertyType);
    const isEven = index % 2 === 0;

    return (
      <TouchableOpacity
        key={property.key}
        style={[styles.tableRow, isEven && styles.tableRowEven]}
        onPress={() => setSelectedProperty(property)}
        activeOpacity={0.7}
      >
        {/* Property Column: Icon + Name/Key */}
        <View style={styles.propertyColumn}>
          <View style={styles.propertyInfo}>
            {/* Icon with inheritable indicator */}
            <View style={styles.iconWrapper}>
              <View style={[styles.typeIcon, { backgroundColor: typeColor }]}>
                <MaterialCommunityIcons name={typeIcon} size={14} color="#fff" />
              </View>
              {property.inheritable && (
                <View style={styles.inheritIndicator}>
                  <MaterialCommunityIcons name="arrow-down" size={8} color="#fff" />
                </View>
              )}
            </View>

            {/* Name & Key */}
            <View style={styles.textInfo}>
              <Text style={styles.propertyName} numberOfLines={1}>
                {getDisplayName(property)}
              </Text>
              <Text style={styles.propertyKey} numberOfLines={1}>
                {property.key}
              </Text>
            </View>
          </View>
        </View>

        {/* Value Column */}
        {['document', 'object', 'asset'].includes(property.type) && property.data && typeof property.data === 'object' ? (
          <TouchableOpacity
            style={styles.valueColumn}
            onPress={(e) => {
              e.stopPropagation();
              handleValuePress(property);
            }}
          >
            <Text style={[styles.valueText, styles.valueLink]} numberOfLines={1} selectable>
              {getDisplayValue(property)}
            </Text>
            <MaterialCommunityIcons name="open-in-new" size={12} color="#6200ee" />
          </TouchableOpacity>
        ) : (
          <View style={styles.valueColumn}>
            <Text style={styles.valueText} numberOfLines={1} selectable>
              {getDisplayValue(property)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'own' && styles.tabActive]}
          onPress={() => setActiveTab('own')}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={16}
            color={activeTab === 'own' ? '#6200ee' : '#64748b'}
          />
          <Text style={[styles.tabText, activeTab === 'own' && styles.tabTextActive]}>
            Eigene ({ownProperties.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inherited' && styles.tabActive]}
          onPress={() => setActiveTab('inherited')}
        >
          <MaterialCommunityIcons
            name="arrow-down-circle-outline"
            size={16}
            color={activeTab === 'inherited' ? '#6200ee' : '#64748b'}
          />
          <Text style={[styles.tabText, activeTab === 'inherited' && styles.tabTextActive]}>
            Vererbt ({inheritedProperties.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.propertyColumn]}>Property</Text>
        <Text style={[styles.headerCell, styles.valueColumnHeader]}>Value</Text>
      </View>

      {/* Table Rows */}
      {displayedProperties.length > 0 ? (
        displayedProperties.map((property, index) => renderPropertyRow(property, index))
      ) : (
        <View style={styles.emptyTab}>
          <Text style={styles.emptyTabText}>Keine Properties in diesem Tab</Text>
        </View>
      )}

      {/* Detail Modal */}
      <Modal
        visible={selectedProperty !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedProperty(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedProperty(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.detailModal}>
                {selectedProperty && (
                  <>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                      <View style={[
                        styles.modalTypeIcon,
                        { backgroundColor: getPropertyTypeColor(selectedProperty.type as PropertyType) }
                      ]}>
                        <MaterialCommunityIcons
                          name={getPropertyTypeIcon(selectedProperty.type as PropertyType)}
                          size={24}
                          color="#fff"
                        />
                      </View>
                      <View style={styles.modalHeaderText}>
                        <Text style={styles.modalTitle}>{getDisplayName(selectedProperty)}</Text>
                        <Text style={styles.modalKey}>{selectedProperty.key}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setSelectedProperty(null)}
                        style={styles.modalCloseButton}
                      >
                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                      </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    <ScrollView style={styles.modalContent}>
                      {/* Value */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Wert</Text>
                        <Text style={styles.detailValue} selectable>{getDisplayValue(selectedProperty)}</Text>
                      </View>

                      {/* Type */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Typ</Text>
                        <View style={styles.detailRow}>
                          <View style={[
                            styles.detailTypeBadge,
                            { backgroundColor: getPropertyTypeColor(selectedProperty.type as PropertyType) }
                          ]}>
                            <MaterialCommunityIcons
                              name={getPropertyTypeIcon(selectedProperty.type as PropertyType)}
                              size={14}
                              color="#fff"
                            />
                            <Text style={styles.detailTypeBadgeText}>
                              {getTypeLabel(selectedProperty.type as PropertyType)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Inherited from parent */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Von Parent geerbt</Text>
                        <View style={styles.detailRow}>
                          <MaterialCommunityIcons
                            name={selectedProperty.inherited ? 'check-circle' : 'close-circle'}
                            size={20}
                            color={selectedProperty.inherited ? '#f59e0b' : '#64748b'}
                          />
                          <Text style={[
                            styles.detailValueInline,
                            { color: selectedProperty.inherited ? '#f59e0b' : '#64748b' }
                          ]}>
                            {selectedProperty.inherited ? 'Ja' : 'Nein'}
                          </Text>
                        </View>
                      </View>

                      {/* Inheritable to children */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Vererbbar an Kinder</Text>
                        <View style={styles.detailRow}>
                          <MaterialCommunityIcons
                            name={selectedProperty.inheritable ? 'check-circle' : 'close-circle'}
                            size={20}
                            color={selectedProperty.inheritable ? '#22c55e' : '#ef4444'}
                          />
                          <Text style={[
                            styles.detailValueInline,
                            { color: selectedProperty.inheritable ? '#22c55e' : '#ef4444' }
                          ]}>
                            {selectedProperty.inheritable ? 'Ja' : 'Nein'}
                          </Text>
                        </View>
                      </View>
                    </ScrollView>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  // Tab styles
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6200ee',
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#6200ee',
    fontWeight: '600',
  },
  emptyTab: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTabText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 56,
  },
  tableRowEven: {
    backgroundColor: '#fafbfc',
  },
  propertyColumn: {
    flex: 1,
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    position: 'relative',
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inheritIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  textInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  propertyKey: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  valueColumn: {
    maxWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  valueColumnHeader: {
    width: 140,
    textAlign: 'right',
  },
  valueText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'right',
    flexShrink: 1,
  },
  valueLink: {
    color: '#6200ee',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  modalTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalKey: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailValueInline: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  detailTypeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 13,
    color: '#475569',
  },
});
