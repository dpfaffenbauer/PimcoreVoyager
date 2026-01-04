/**
 * Relation field renderers
 * Supports both view and edit modes
 */

import React, { useState, useMemo } from 'react';
import { View, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInstanceStore } from '../../store/instanceStore';
import { FieldWrapper, styles as wrapperStyles } from './FieldWrapper';
import { FieldRendererProps } from './types';
import { ElementPickerModal, SelectedElement } from '../pickers/ElementPickerModal';

// Get image URL for an asset
const getAssetImageUrl = (baseUrl: string, id: number | undefined, path: string | undefined): string | null => {
  if (path) {
    return `${baseUrl}${decodeURIComponent(path)}`;
  } else if (id) {
    return `${baseUrl}/pimcore-studio/api/assets/${id}/image/stream/preview`;
  }
  return null;
};

interface RelationFieldProps extends FieldRendererProps {
  single?: boolean;
}

// Relation field - shows list of related objects with ID and path
export const RelationField: React.FC<RelationFieldProps> = ({
  value,
  title,
  mandatory,
  single,
  isEditing,
  onFieldChange,
  field,
  error,
}) => {
  const { activeInstance } = useInstanceStore();
  const [pickerVisible, setPickerVisible] = useState(false);
  const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';
  const isDisabled = field?.noteditable;

  // Determine what types of objects are allowed
  const allowedClasses = field?.classes?.map((c: any) => c.classes) || [];
  const objectsAllowed = field?.objectsAllowed !== false;
  const assetsAllowed = field?.assetsAllowed === true;
  const documentsAllowed = field?.documentsAllowed === true;

  // Build allowedTypes for ElementPickerModal
  const allowedTypes = useMemo(() => {
    const types: ('dataObject' | 'asset' | 'document')[] = [];
    if (objectsAllowed) types.push('dataObject');
    if (assetsAllowed) types.push('asset');
    if (documentsAllowed) types.push('document');
    // Default to dataObject if nothing is explicitly allowed
    if (types.length === 0) types.push('dataObject');
    return types;
  }, [objectsAllowed, assetsAllowed, documentsAllowed]);

  // Normalize value to array
  const items = Array.isArray(value) ? value : (value ? [value] : []);

  const handleSelect = (element: SelectedElement) => {
    // Map element type to Pimcore type format
    const type = element.type === 'dataObject' ? 'object' : element.type;

    if (single) {
      onFieldChange?.({
        id: element.id,
        type: type,
        fullPath: element.fullpath || element.fullPath,
        classname: element.classname,
      });
    } else {
      const newItems = [...items, {
        id: element.id,
        type: type,
        fullPath: element.fullpath || element.fullPath,
        classname: element.classname,
      }];
      onFieldChange?.(newItems);
    }
    setPickerVisible(false);
  };

  const handleMultiSelect = (elements: SelectedElement[]) => {
    // Map new elements to the correct format
    const newElements = elements.map(element => {
      const type = element.type === 'dataObject' ? 'object' : element.type;
      return {
        id: element.id,
        type: type,
        fullPath: element.fullpath || element.fullPath,
        classname: element.classname,
      };
    });

    // Filter out elements that are already in the list
    const existingIds = new Set(items.map((i: any) => i?.id || i?.element?.id));
    const uniqueNewElements = newElements.filter(el => !existingIds.has(el.id));

    // Append new elements to existing items
    const combinedItems = [...items, ...uniqueNewElements];
    onFieldChange?.(combinedItems);
    setPickerVisible(false);
  };

  const handleRemove = (index: number) => {
    if (single) {
      onFieldChange?.(null);
    } else {
      const newItems = [...items];
      newItems.splice(index, 1);
      onFieldChange?.(newItems);
    }
  };

  const handleClear = () => {
    onFieldChange?.(single ? null : []);
  };

  // Check if all items are assets (potential images)
  const allAssets = items.every((item: any) => {
    const type = item?.type || item?.element?.type;
    return type === 'asset';
  });

  // Edit mode
  if (isEditing) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        {items.length > 0 ? (
          <View style={styles.editRelationList}>
            {items.map((item: any, index: number) => {
              const id = item?.id || item?.element?.id;
              const path = item?.fullPath || item?.path || item?.element?.fullPath || item?.element?.path;
              const type = item?.type || item?.element?.type || 'object';
              const classname = item?.classname || item?.element?.classname;

              // Show inline image preview for asset types
              if (type === 'asset') {
                const imageUrl = getAssetImageUrl(baseUrl, id, path);
                return (
                  <View key={`${id}-${index}`} style={styles.editRelationItem}>
                    {imageUrl && (
                      <Image source={{ uri: imageUrl }} style={styles.editRelationImage} resizeMode="cover" />
                    )}
                    <View style={styles.editRelationInfo}>
                      <Text style={styles.editRelationId}>ID: {id}</Text>
                      {path && <Text style={styles.editRelationPath} numberOfLines={1}>{path}</Text>}
                    </View>
                    {!isDisabled && (
                      <Pressable onPress={() => handleRemove(index)} style={styles.editRelationRemove}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#f44336" />
                      </Pressable>
                    )}
                  </View>
                );
              }

              return (
                <View key={`${id}-${index}`} style={styles.editRelationItem}>
                  <View style={styles.editRelationIcon}>
                    <MaterialCommunityIcons
                      name={type === 'document' ? 'file-document' : 'cube'}
                      size={18}
                      color="#6200ee"
                    />
                  </View>
                  <View style={styles.editRelationInfo}>
                    <Text style={styles.editRelationId}>ID: {id}</Text>
                    {classname && <Text style={styles.editRelationClass}>{classname}</Text>}
                    {path && <Text style={styles.editRelationPath} numberOfLines={1}>{path}</Text>}
                  </View>
                  {!isDisabled && (
                    <Pressable onPress={() => handleRemove(index)} style={styles.editRelationRemove}>
                      <MaterialCommunityIcons name="close-circle" size={22} color="#f44336" />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        ) : null}

        {!isDisabled && (
          <View style={styles.editRelationActions}>
            <Pressable
              onPress={() => setPickerVisible(true)}
              style={styles.editRelationAddButton}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#6200ee" />
              <Text style={styles.editRelationAddText}>
                {single ? 'Objekt auswählen' : 'Objekt hinzufügen'}
              </Text>
            </Pressable>
            {items.length > 0 && !single && (
              <Pressable onPress={handleClear} style={styles.editRelationClearButton}>
                <Text style={styles.editRelationClearText}>Alle entfernen</Text>
              </Pressable>
            )}
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <ElementPickerModal
          visible={pickerVisible}
          onDismiss={() => setPickerVisible(false)}
          onSelect={handleSelect}
          onMultiSelect={handleMultiSelect}
          title={single ? 'Element auswählen' : 'Elemente auswählen'}
          allowedTypes={allowedTypes}
          filterClasses={allowedClasses.length > 0 ? allowedClasses : undefined}
          multiSelect={!single}
          selectedIds={items.map((i: any) => i?.id || i?.element?.id).filter(Boolean)}
        />
      </FieldWrapper>
    );
  }

  // View mode - no items
  if (!value || items.length === 0) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={wrapperStyles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  // View mode - render as image gallery if all are assets
  if (allAssets) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relationImageGallery}>
          {items.map((item: any, index: number) => {
            const path = item?.fullPath || item?.path || item?.element?.fullPath || item?.element?.path;
            const id = item?.id || item?.element?.id;
            const imageUrl = getAssetImageUrl(baseUrl, id, path);
            if (!imageUrl) return null;
            return (
              <View key={`${id}-${index}`} style={styles.relationImageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.relationImage} resizeMode="cover" />
                <Text style={styles.relationImageId}>ID: {id}</Text>
              </View>
            );
          })}
        </ScrollView>
        {!single && items.length > 0 && (
          <Text style={styles.relationCount}>{items.length} Bild{items.length !== 1 ? 'er' : ''}</Text>
        )}
      </FieldWrapper>
    );
  }

  // View mode - regular relation list
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.relationList}>
        {items.map((item: any, index: number) => {
          const id = item?.id || item?.element?.id;
          const path = item?.fullPath || item?.path || item?.element?.fullPath || item?.element?.path;
          const type = item?.type || item?.element?.type || 'object';

          if (!id) return null;

          // Show inline image preview for asset types
          if (type === 'asset') {
            const imageUrl = getAssetImageUrl(baseUrl, id, path);
            if (imageUrl) {
              return (
                <View key={`${id}-${index}`} style={styles.relationItemWithImage}>
                  <Image source={{ uri: imageUrl }} style={styles.relationInlineImage} resizeMode="cover" />
                  <View style={styles.relationInfo}>
                    <Text style={styles.relationId}>ID: {id}</Text>
                    {path && <Text style={styles.relationPath} numberOfLines={1}>{path}</Text>}
                  </View>
                </View>
              );
            }
          }

          return (
            <View key={`${id}-${index}`} style={styles.relationItem}>
              <View style={styles.relationIcon}>
                <MaterialCommunityIcons
                  name={type === 'asset' ? 'image' : type === 'document' ? 'file-document' : 'cube'}
                  size={16}
                  color="#6200ee"
                />
              </View>
              <View style={styles.relationInfo}>
                <Text style={styles.relationId}>ID: {id}</Text>
                {path && <Text style={styles.relationPath} numberOfLines={1}>{path}</Text>}
              </View>
            </View>
          );
        })}
      </View>
      {!single && items.length > 0 && (
        <Text style={styles.relationCount}>{items.length} Verknüpfung{items.length !== 1 ? 'en' : ''}</Text>
      )}
    </FieldWrapper>
  );
};

// ManyToOne wrapper
export const ManyToOneRelationField: React.FC<FieldRendererProps> = (props) => (
  <RelationField {...props} value={props.value ? [props.value] : []} single />
);

// ManyToMany wrapper
export const ManyToManyRelationField: React.FC<FieldRendererProps> = (props) => (
  <RelationField {...props} value={Array.isArray(props.value) ? props.value : []} />
);

const styles = StyleSheet.create({
  // View mode styles
  relationList: {
    gap: 8,
  },
  relationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  relationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  relationInfo: {
    flex: 1,
  },
  relationId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  relationPath: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  relationCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  relationImageGallery: {
    marginHorizontal: -4,
  },
  relationImageContainer: {
    marginHorizontal: 4,
    alignItems: 'center',
  },
  relationImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  relationImageId: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  relationItemWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  relationInlineImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  // Edit mode styles
  editRelationList: {
    gap: 8,
    marginBottom: 12,
  },
  editRelationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editRelationIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  editRelationImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  editRelationInfo: {
    flex: 1,
  },
  editRelationId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  editRelationClass: {
    fontSize: 11,
    color: '#6200ee',
    marginTop: 2,
  },
  editRelationPath: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  editRelationRemove: {
    padding: 4,
  },
  editRelationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editRelationAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#6200ee',
    borderRadius: 8,
    gap: 8,
  },
  editRelationAddText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
  },
  editRelationClearButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editRelationClearText: {
    fontSize: 14,
    color: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
});

// Register relation field types
export const relationFieldTypes = {
  manyToOneRelation: ManyToOneRelationField,
  manyToManyRelation: ManyToManyRelationField,
  manyToManyObjectRelation: ManyToManyRelationField,
  advancedManyToManyRelation: ManyToManyRelationField,
  advancedManyToManyObjectRelation: ManyToManyRelationField,
};
