/**
 * Field Renderer Component
 * Renders Pimcore data object fields based on their fieldtype
 * Supports tabs, HTML rendering for WYSIWYG, and localized fields
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { useInstanceStore } from '../store/instanceStore';

interface FieldDefinition {
  name: string;
  title: string;
  fieldtype: string;
  tooltip?: string;
  mandatory?: boolean;
  noteditable?: boolean;
  children?: FieldDefinition[];
  permissionView?: string[];
  permissionEdit?: string[];
  datatype?: string;
  [key: string]: any;
}

interface FieldRendererProps {
  field: FieldDefinition;
  value: any;
  level?: number;
  fieldCollectionLayouts?: any;
  objectBrickLayouts?: any;
}

interface TabItem {
  key: string;
  title: string;
  node: FieldDefinition;
}

// Format a Unix timestamp to a readable date
const formatDateTime = (timestamp: number): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Simple field wrapper with label
const FieldWrapper: React.FC<{
  label: string;
  mandatory?: boolean;
  children: React.ReactNode;
}> = ({ label, mandatory, children }) => (
  <View style={styles.fieldWrapper}>
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {mandatory && <Text style={styles.mandatoryIndicator}>*</Text>}
    </View>
    {children}
  </View>
);

// Input field (text)
const InputField: React.FC<{ value: string; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <Text style={styles.textValue}>{value || '-'}</Text>
  </FieldWrapper>
);

// Textarea field
const TextareaField: React.FC<{ value: string; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <Text style={styles.textareaValue}>{value || '-'}</Text>
  </FieldWrapper>
);

// WYSIWYG field (rich text with HTML rendering)
const WysiwygField: React.FC<{ value: string; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => {
  const { width } = useWindowDimensions();
  const contentWidth = width - 64; // Account for padding

  if (!value) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={styles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html: value }}
        baseStyle={styles.htmlContent}
        tagsStyles={{
          p: { marginVertical: 8, lineHeight: 22 },
          h1: { fontSize: 24, fontWeight: '700', marginVertical: 12, color: '#333' },
          h2: { fontSize: 20, fontWeight: '600', marginVertical: 10, color: '#333' },
          h3: { fontSize: 18, fontWeight: '600', marginVertical: 8, color: '#333' },
          ul: { marginVertical: 8 },
          ol: { marginVertical: 8 },
          li: { marginVertical: 4 },
          a: { color: '#2196f3' },
          strong: { fontWeight: '600' },
          em: { fontStyle: 'italic' },
        }}
      />
    </FieldWrapper>
  );
};

// Datetime field
const DatetimeField: React.FC<{ value: number; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <View style={styles.dateValue}>
      <MaterialCommunityIcons name="calendar" size={18} color="#666" style={styles.dateIcon} />
      <Text style={styles.textValue}>{formatDateTime(value)}</Text>
    </View>
  </FieldWrapper>
);

// Date field (without time)
const DateField: React.FC<{ value: number; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => {
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('de-DE');
  };

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.dateValue}>
        <MaterialCommunityIcons name="calendar" size={18} color="#666" style={styles.dateIcon} />
        <Text style={styles.textValue}>{formatDate(value)}</Text>
      </View>
    </FieldWrapper>
  );
};

// Checkbox/Boolean field
const CheckboxField: React.FC<{ value: boolean; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <View style={styles.checkboxValue}>
      <MaterialCommunityIcons
        name={value ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={24}
        color={value ? '#4caf50' : '#999'}
      />
      <Text style={[styles.textValue, { marginLeft: 8 }]}>{value ? 'Ja' : 'Nein'}</Text>
    </View>
  </FieldWrapper>
);

// Numeric field
const NumericField: React.FC<{ value: number; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <Text style={styles.textValue}>{value !== null && value !== undefined ? value.toString() : '-'}</Text>
  </FieldWrapper>
);

// Select field
const SelectField: React.FC<{ value: string; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <Chip style={styles.selectChip}>{value || '-'}</Chip>
  </FieldWrapper>
);

// Multiselect field
const MultiselectField: React.FC<{ value: string[]; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => (
  <FieldWrapper label={title} mandatory={mandatory}>
    <View style={styles.multiselectContainer}>
      {Array.isArray(value) && value.length > 0 ? (
        value.map((item, index) => (
          <Chip key={index} style={styles.selectChip}>
            {item}
          </Chip>
        ))
      ) : (
        <Text style={styles.textValue}>-</Text>
      )}
    </View>
  </FieldWrapper>
);

// Image field
const ImageField: React.FC<{ value: any; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => {
  const { activeInstance } = useInstanceStore();

  // Debug: log the value structure
  console.log('ImageField value:', JSON.stringify(value, null, 2));

  if (!value || (!value.id && !value.fullPath && !value.path)) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={styles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';

  // Try different possible path structures
  const path = value.fullPath || value.path || value.fullpath || value.src || value.filename;
  const imageId = value.id;

  // If we have an ID but no path, try to construct the thumbnail URL
  let imageUrl = null;
  if (path) {
    imageUrl = `${baseUrl}${decodeURIComponent(path)}`;
  } else if (imageId) {
    // Fallback: use Pimcore's thumbnail endpoint
    imageUrl = `${baseUrl}/pimcore-studio/api/assets/${imageId}/image/stream/preview`;
  }

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      {imageUrl ? (
        <View>
          <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
          {imageId && <Text style={styles.imageIdLabel}>ID: {imageId}</Text>}
        </View>
      ) : (
        <Text style={styles.textValue}>Bild ID: {imageId}</Text>
      )}
    </FieldWrapper>
  );
};

// Image Gallery field
const ImageGalleryField: React.FC<{ value: any[]; title: string; mandatory?: boolean }> = ({
  value,
  title,
  mandatory,
}) => {
  const { activeInstance } = useInstanceStore();

  if (!Array.isArray(value) || value.length === 0) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={styles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';

  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
        {value.map((item, index) => {
          const image = item.image;
          if (!image || !image.fullPath) return null;
          const imageUrl = `${baseUrl}${decodeURIComponent(image.fullPath)}`;
          return (
            <Image
              key={index}
              source={{ uri: imageUrl }}
              style={styles.galleryImage}
              resizeMode="cover"
            />
          );
        })}
      </ScrollView>
    </FieldWrapper>
  );
};

// Object Brick Fallback Renderer - renders brick data using same style as regular fields
const ObjectBrickFallbackRenderer: React.FC<{ data: any }> = ({ data }) => {
  if (!data || typeof data !== 'object') return null;

  return (
    <View>
      {Object.entries(data).map(([fieldKey, fieldValue]: [string, any]) => {
        if (fieldValue === null || fieldValue === undefined) return null;

        // Handle quantityValue fields (value + unitId)
        if (typeof fieldValue === 'object' && 'value' in fieldValue && 'unitId' in fieldValue) {
          const displayValue = `${fieldValue.value}${fieldValue.unitId ? ` ${fieldValue.unitId}` : ''}`;
          return (
            <FieldWrapper key={fieldKey} label={fieldKey}>
              <Text style={styles.textValue}>{displayValue}</Text>
            </FieldWrapper>
          );
        }

        // Handle simple values
        if (typeof fieldValue !== 'object') {
          return (
            <FieldWrapper key={fieldKey} label={fieldKey}>
              <Text style={styles.textValue}>{String(fieldValue)}</Text>
            </FieldWrapper>
          );
        }

        // Handle other objects
        return (
          <FieldWrapper key={fieldKey} label={fieldKey}>
            <Text style={styles.textValue}>{JSON.stringify(fieldValue)}</Text>
          </FieldWrapper>
        );
      })}
    </View>
  );
};

// Check if a path is an image
const isImagePath = (path: string): boolean => {
  if (!path) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerPath = path.toLowerCase();
  return imageExtensions.some(ext => lowerPath.endsWith(ext));
};

// Get image URL for an asset (with fallback to thumbnail API)
const getAssetImageUrl = (baseUrl: string, id: number | undefined, path: string | undefined): string | null => {
  if (path) {
    return `${baseUrl}${decodeURIComponent(path)}`;
  } else if (id) {
    // Fallback: use Pimcore's thumbnail endpoint
    return `${baseUrl}/pimcore-studio/api/assets/${id}/image/stream/preview`;
  }
  return null;
};

// Relation field - shows list of related objects with ID and path
const RelationField: React.FC<{
  value: any[];
  title: string;
  mandatory?: boolean;
  single?: boolean;
}> = ({ value, title, mandatory, single }) => {
  const { activeInstance } = useInstanceStore();
  const baseUrl = activeInstance?.url?.replace('/pimcore-studio/api', '') || '';

  // Debug: log the value structure
  console.log('RelationField value:', JSON.stringify(value, null, 2));

  if (!value || value.length === 0) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <Text style={styles.textValue}>-</Text>
      </FieldWrapper>
    );
  }

  // Check if all items are assets (potential images)
  const allAssets = value.every(item => {
    const type = item?.type || item?.element?.type;
    return type === 'asset';
  });

  // Render as image gallery if all are assets
  if (allAssets) {
    return (
      <FieldWrapper label={title} mandatory={mandatory}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relationImageGallery}>
          {value.map((item, index) => {
            const path = item?.fullPath || item?.path || item?.element?.fullPath || item?.element?.path;
            const id = item?.id || item?.element?.id;
            const imageUrl = getAssetImageUrl(baseUrl, id, path);
            if (!imageUrl) return null;
            return (
              <View key={`${id}-${index}`} style={styles.relationImageContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.relationImage}
                  resizeMode="cover"
                />
                <Text style={styles.relationImageId}>ID: {id}</Text>
              </View>
            );
          })}
        </ScrollView>
        {!single && value.length > 0 && (
          <Text style={styles.relationCount}>{value.length} Bild{value.length !== 1 ? 'er' : ''}</Text>
        )}
      </FieldWrapper>
    );
  }

  // Regular relation list
  return (
    <FieldWrapper label={title} mandatory={mandatory}>
      <View style={styles.relationList}>
        {value.map((item, index) => {
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
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.relationInlineImage}
                    resizeMode="cover"
                  />
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
      {!single && value.length > 0 && (
        <Text style={styles.relationCount}>{value.length} Verknüpfung{value.length !== 1 ? 'en' : ''}</Text>
      )}
    </FieldWrapper>
  );
};

// Localized fields container with language tabs
const LocalizedFieldsRenderer: React.FC<{
  field: FieldDefinition;
  value: any;
}> = ({ field, value }) => {
  const languages = field.permissionView || ['default'];
  const [selectedLang, setSelectedLang] = useState(languages[0] || 'default');

  if (!value || typeof value !== 'object') {
    return null;
  }

  return (
    <View style={styles.localizedContainer}>
      {/* Language tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langTabs}>
        {languages.map((lang) => (
          <Pressable
            key={lang}
            onPress={() => setSelectedLang(lang)}
            style={[styles.langTab, selectedLang === lang && styles.langTabSelected]}
          >
            <Text style={[styles.langTabText, selectedLang === lang && styles.langTabTextSelected]}>
              {lang.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Render child fields for selected language */}
      {field.children?.map((childField) => {
        const fieldValue = value[childField.name];
        const localizedValue = fieldValue?.[selectedLang];

        return (
          <FieldRenderer
            key={childField.name}
            field={childField}
            value={localizedValue}
          />
        );
      })}
    </View>
  );
};

// Tab Panel - renders children as tabs with sticky header
interface TabPanelProps {
  tabs: TabItem[];
  objectData: any;
  onTabChange?: (index: number) => void;
  fieldCollectionLayouts?: any;
  objectBrickLayouts?: any;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  tabs,
  objectData,
  onTabChange,
  fieldCollectionLayouts = {},
  objectBrickLayouts = {},
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
    onTabChange?.(index);
  }, [onTabChange]);

  if (tabs.length === 0) return null;

  return (
    <View style={styles.tabPanel}>
      {/* Tab Header - Sticky */}
      <View style={styles.tabHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab, index) => (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(index)}
              style={[styles.tab, activeTab === index && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                {tab.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        <LayoutNodeRenderer
          node={tabs[activeTab].node}
          objectData={objectData}
          level={1}
          skipWrapper
          fieldCollectionLayouts={fieldCollectionLayouts}
          objectBrickLayouts={objectBrickLayouts}
        />
      </View>
    </View>
  );
};

// Panel/Region layout container
const PanelRenderer: React.FC<{
  field: FieldDefinition;
  objectData: any;
  level: number;
  fieldCollectionLayouts?: any;
  objectBrickLayouts?: any;
}> = ({ field, objectData, level, fieldCollectionLayouts = {}, objectBrickLayouts = {} }) => {
  const title = field.title || field.name;
  const showTitle = title && title !== '' && title !== 'Layout' && level > 0;

  return (
    <View style={[styles.panelContainer, level > 1 && styles.panelNested]}>
      {showTitle && (
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>{title}</Text>
        </View>
      )}
      {field.children?.map((child, index) => (
        <LayoutNodeRenderer
          key={`${child.name}-${index}`}
          node={child}
          objectData={objectData}
          level={level + 1}
          fieldCollectionLayouts={fieldCollectionLayouts}
          objectBrickLayouts={objectBrickLayouts}
        />
      ))}
    </View>
  );
};

// Layout node renderer - handles layout containers and data fields
interface LayoutNodeRendererProps {
  node: FieldDefinition;
  objectData: any;
  level: number;
  skipWrapper?: boolean;
  fieldCollectionLayouts?: any;
  objectBrickLayouts?: any;
}

export const LayoutNodeRenderer: React.FC<LayoutNodeRendererProps> = ({
  node,
  objectData,
  level,
  skipWrapper = false,
  fieldCollectionLayouts = {},
  objectBrickLayouts = {},
}) => {
  const { datatype, fieldtype } = node;

  // Layout containers
  if (datatype === 'layout') {
    // Check if this should be rendered as tabs (region with multiple named children)
    if (fieldtype === 'region' && node.children && node.children.length > 1) {
      const tabs: TabItem[] = node.children
        .filter(child => child.title || child.name)
        .map((child, idx) => ({
          key: `${child.name}-${idx}`,
          title: child.title || child.name || `Tab ${idx + 1}`,
          node: child,
        }));

      if (tabs.length > 1) {
        return <TabPanel tabs={tabs} objectData={objectData} fieldCollectionLayouts={fieldCollectionLayouts} objectBrickLayouts={objectBrickLayouts} />;
      }
    }

    // Regular panel
    if (fieldtype === 'panel' || fieldtype === 'region' || fieldtype === 'tabpanel') {
      if (skipWrapper) {
        return (
          <>
            {node.children?.map((child, index) => (
              <LayoutNodeRenderer
                key={`${child.name}-${index}`}
                node={child}
                objectData={objectData}
                level={level}
                fieldCollectionLayouts={fieldCollectionLayouts}
                objectBrickLayouts={objectBrickLayouts}
              />
            ))}
          </>
        );
      }
      return <PanelRenderer field={node} objectData={objectData} level={level} fieldCollectionLayouts={fieldCollectionLayouts} objectBrickLayouts={objectBrickLayouts} />;
    }

    // For other layout types, just render children
    return (
      <>
        {node.children?.map((child, index) => (
          <LayoutNodeRenderer
            key={`${child.name}-${index}`}
            node={child}
            objectData={objectData}
            level={level}
            fieldCollectionLayouts={fieldCollectionLayouts}
            objectBrickLayouts={objectBrickLayouts}
          />
        ))}
      </>
    );
  }

  // Data fields
  if (datatype === 'data') {
    const value = objectData?.[node.name];
    return (
      <FieldRenderer
        field={node}
        value={value}
        level={level}
        fieldCollectionLayouts={fieldCollectionLayouts}
        objectBrickLayouts={objectBrickLayouts}
      />
    );
  }

  return null;
};

// Main field renderer component
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  level = 0,
  fieldCollectionLayouts = {},
  objectBrickLayouts = {},
}) => {
  const { fieldtype, title, name, mandatory } = field;
  const displayTitle = title || name;

  switch (fieldtype) {
    case 'input':
      return <InputField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'textarea':
      return <TextareaField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'wysiwyg':
      return <WysiwygField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'datetime':
      return <DatetimeField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'date':
      return <DateField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'checkbox':
    case 'booleanSelect':
      return <CheckboxField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'numeric':
    case 'quantityValue':
      return <NumericField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'select':
      return <SelectField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'multiselect':
      return <MultiselectField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'image':
      return <ImageField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'imageGallery':
      return <ImageGalleryField value={value} title={displayTitle} mandatory={mandatory} />;

    case 'localizedfields':
      return <LocalizedFieldsRenderer field={field} value={value} />;

    case 'fieldcollections':
      // Render field collections with their layout
      if (Array.isArray(value) && value.length > 0) {
        return (
          <FieldWrapper label={displayTitle} mandatory={mandatory}>
            {value.map((item, index) => {
              const fcType = item.type;
              const fcLayout = fieldCollectionLayouts?.items?.[fcType] || fieldCollectionLayouts?.[fcType];

              return (
                <View key={index} style={styles.fieldCollectionItem}>
                  <Text style={styles.fieldCollectionType}>{fcType}</Text>
                  {item.data && fcLayout?.children ? (
                    // Render with layout
                    fcLayout.children.map((layoutChild: any, childIndex: number) => (
                      <LayoutNodeRenderer
                        key={`${layoutChild.name}-${childIndex}`}
                        node={layoutChild}
                        objectData={item.data}
                        level={level + 1}
                        fieldCollectionLayouts={fieldCollectionLayouts}
                        objectBrickLayouts={objectBrickLayouts}
                      />
                    ))
                  ) : item.data ? (
                    // Fallback: render data without layout
                    <FieldCollectionDataRenderer data={item.data} fieldCollectionLayouts={fieldCollectionLayouts} />
                  ) : null}
                </View>
              );
            })}
          </FieldWrapper>
        );
      }
      return (
        <FieldWrapper label={displayTitle} mandatory={mandatory}>
          <Text style={styles.textValue}>-</Text>
        </FieldWrapper>
      );

    case 'objectbricks':
      // Render object bricks with their layout
      console.log('ObjectBricks value:', JSON.stringify(value, null, 2));
      console.log('ObjectBricks layouts:', JSON.stringify(objectBrickLayouts, null, 2));

      if (value && typeof value === 'object') {
        const brickEntries = Object.entries(value).filter(([key, val]) => val && typeof val === 'object');
        if (brickEntries.length > 0) {
          return (
            <FieldWrapper label={displayTitle} mandatory={mandatory}>
              {brickEntries.map(([brickName, brickData]: [string, any]) => {
                // Try to find the layout - check various possible structures
                // The API returns: { items: { BrickName: { layoutDefinition: {...} } } }
                const capitalizedName = brickName.charAt(0).toUpperCase() + brickName.slice(1);
                const obLayoutEntry = objectBrickLayouts?.items?.[brickName]
                  || objectBrickLayouts?.items?.[capitalizedName]
                  || objectBrickLayouts?.[brickName]
                  || objectBrickLayouts?.[capitalizedName];

                console.log(`ObjectBrick "${brickName}" layout entry:`, obLayoutEntry);

                // Extract the actual layout definition
                const layoutDef = obLayoutEntry?.layoutDefinition || obLayoutEntry;

                return (
                  <View key={brickName} style={styles.objectBrickItem}>
                    <Text style={styles.objectBrickType}>{brickName}</Text>
                    {layoutDef?.children ? (
                      // Render with layout - same as other fields
                      layoutDef.children.map((layoutChild: any, childIndex: number) => (
                        <LayoutNodeRenderer
                          key={`${layoutChild.name || childIndex}-${childIndex}`}
                          node={layoutChild}
                          objectData={brickData}
                          level={level + 1}
                          fieldCollectionLayouts={fieldCollectionLayouts}
                          objectBrickLayouts={objectBrickLayouts}
                        />
                      ))
                    ) : (
                      // Fallback: render fields from data
                      <ObjectBrickFallbackRenderer data={brickData} />
                    )}
                  </View>
                );
              })}
            </FieldWrapper>
          );
        }
      }
      return (
        <FieldWrapper label={displayTitle} mandatory={mandatory}>
          <Text style={styles.textValue}>-</Text>
        </FieldWrapper>
      );

    case 'block':
      return (
        <FieldWrapper label={displayTitle} mandatory={mandatory}>
          <Text style={styles.textValue}>
            {Array.isArray(value) ? `${value.length} Blöcke` : '-'}
          </Text>
        </FieldWrapper>
      );

    // Relations
    case 'manyToOneRelation':
      return <RelationField value={value ? [value] : []} title={displayTitle} mandatory={mandatory} single />;

    case 'manyToManyRelation':
    case 'manyToManyObjectRelation':
    case 'advancedManyToManyRelation':
      return <RelationField value={Array.isArray(value) ? value : []} title={displayTitle} mandatory={mandatory} />;

    default:
      // Fallback for unknown field types
      if (value !== null && value !== undefined) {
        if (typeof value === 'string' || typeof value === 'number') {
          return (
            <FieldWrapper label={`${displayTitle}`} mandatory={mandatory}>
              <Text style={styles.textValue}>{String(value)}</Text>
            </FieldWrapper>
          );
        }
      }
      return null;
  }
};

// Field Collection Data Renderer - renders the data inside a field collection item
const FieldCollectionDataRenderer: React.FC<{ data: any; fieldCollectionLayouts?: any }> = ({ data, fieldCollectionLayouts = {} }) => {
  const { width } = useWindowDimensions();

  if (!data) return null;

  // Handle localized fields in field collections
  if (data.localizedfields) {
    const localizedData = data.localizedfields;
    const languages = Object.keys(localizedData[Object.keys(localizedData)[0]] || {});
    const [selectedLang, setSelectedLang] = useState(languages[0] || 'default');

    return (
      <View style={styles.fcLocalizedContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langTabs}>
          {languages.filter(l => l !== 'default').map((lang) => (
            <Pressable
              key={lang}
              onPress={() => setSelectedLang(lang)}
              style={[styles.langTab, selectedLang === lang && styles.langTabSelected]}
            >
              <Text style={[styles.langTabText, selectedLang === lang && styles.langTabTextSelected]}>
                {lang.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {Object.entries(localizedData).map(([fieldName, fieldValues]: [string, any]) => {
          const localizedValue = fieldValues?.[selectedLang];
          if (!localizedValue) return null;

          // Check if it's HTML content
          if (typeof localizedValue === 'string' && localizedValue.includes('<')) {
            return (
              <View key={fieldName} style={styles.fcField}>
                <RenderHtml
                  contentWidth={width - 80}
                  source={{ html: localizedValue }}
                  baseStyle={styles.htmlContent}
                  tagsStyles={{
                    p: { marginVertical: 8, lineHeight: 22 },
                    h1: { fontSize: 24, fontWeight: '700', marginVertical: 12, color: '#333' },
                    h2: { fontSize: 20, fontWeight: '600', marginVertical: 10, color: '#333' },
                    h3: { fontSize: 18, fontWeight: '600', marginVertical: 8, color: '#333' },
                    ul: { marginVertical: 8 },
                    ol: { marginVertical: 8 },
                    li: { marginVertical: 4 },
                    a: { color: '#2196f3' },
                  }}
                />
              </View>
            );
          }

          return (
            <View key={fieldName} style={styles.fcField}>
              <Text style={styles.textValue}>{localizedValue}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  return null;
};

// Export layout renderer for use in ObjectDetailScreen
export const ObjectLayoutRenderer: React.FC<{
  layout: FieldDefinition;
  objectData: any;
}> = ({ layout, objectData }) => {
  return (
    <View style={styles.layoutContainer}>
      {layout.children?.map((child, index) => (
        <LayoutNodeRenderer
          key={`${child.name}-${index}`}
          node={child}
          objectData={objectData}
          level={0}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mandatoryIndicator: {
    color: '#f44336',
    marginLeft: 4,
    fontSize: 14,
  },
  textValue: {
    fontSize: 15,
    color: '#333',
  },
  textareaValue: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  htmlContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  dateValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  checkboxValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectChip: {
    alignSelf: 'flex-start',
  },
  multiselectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imageIdLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  galleryScroll: {
    marginHorizontal: -4,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  localizedContainer: {
    marginBottom: 16,
  },
  langTabs: {
    marginBottom: 12,
  },
  langTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  langTabSelected: {
    backgroundColor: '#2196f3',
  },
  langTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  langTabTextSelected: {
    color: '#fff',
  },
  // Tab Panel styles
  tabPanel: {
    flex: 1,
  },
  tabHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2196f3',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#2196f3',
  },
  tabContent: {
    flex: 1,
  },
  panelContainer: {
    marginBottom: 16,
  },
  panelNested: {
    paddingLeft: 0,
  },
  panelHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // Field Collection styles
  fieldCollectionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  fieldCollectionType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196f3',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Object Brick styles
  objectBrickItem: {
    marginBottom: 16,
  },
  objectBrickType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  brickField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  brickFieldLabel: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  brickFieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  fcLocalizedContainer: {
    marginTop: 4,
  },
  fcField: {
    marginBottom: 8,
  },
  // Relation styles
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
  // Relation image styles
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
});

export default FieldRenderer;
