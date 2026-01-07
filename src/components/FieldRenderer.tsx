/**
 * Field Renderer Component
 * Renders Pimcore data object fields based on their fieldtype
 * All field components support both view and edit modes
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { fieldRenderers, FieldWrapper } from './fields';

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
  // Edit mode props
  isEditing?: boolean;
  onFieldChange?: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}

interface TabItem {
  key: string;
  title: string;
  node: FieldDefinition;
}

// Localized fields container with language tabs
const LocalizedFieldsRenderer: React.FC<{
  field: FieldDefinition;
  value: any;
  isEditing?: boolean;
  onFieldChange?: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}> = ({ field, value, isEditing, onFieldChange, errors }) => {
  const languages = field.permissionView || ['default'];
  const [selectedLang, setSelectedLang] = useState(languages[0] || 'default');

  if (!value || typeof value !== 'object') {
    return null;
  }

  // Handle localized field changes - updates the parent localizedfields object
  const handleLocalizedFieldChange = (childFieldName: string, newValue: any) => {
    // Build the updated localizedfields object
    const updatedLocalizedFields = {
      ...value,
      [childFieldName]: {
        ...(value?.[childFieldName] || {}),
        [selectedLang]: newValue,
      },
    };
    // Call onFieldChange with the parent field name (usually 'localizedfields')
    // This ensures the data is stored correctly for the API
    onFieldChange?.(field.name, updatedLocalizedFields);
  };

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
            isEditing={isEditing}
            onFieldChange={(name, newValue) => handleLocalizedFieldChange(name, newValue)}
            errors={errors}
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
  isEditing?: boolean;
  onFieldChange?: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  tabs,
  objectData,
  onTabChange,
  fieldCollectionLayouts = {},
  objectBrickLayouts = {},
  isEditing = false,
  onFieldChange,
  errors = {},
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
          isEditing={isEditing}
          onFieldChange={onFieldChange}
          errors={errors}
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
  isEditing?: boolean;
  onFieldChange?: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}> = ({ field, objectData, level, fieldCollectionLayouts = {}, objectBrickLayouts = {}, isEditing = false, onFieldChange, errors = {} }) => {
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
          isEditing={isEditing}
          onFieldChange={onFieldChange}
          errors={errors}
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
  isEditing?: boolean;
  onFieldChange?: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}

export const LayoutNodeRenderer: React.FC<LayoutNodeRendererProps> = ({
  node,
  objectData,
  level,
  skipWrapper = false,
  fieldCollectionLayouts = {},
  objectBrickLayouts = {},
  isEditing = false,
  onFieldChange,
  errors = {},
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
        return (
          <TabPanel
            tabs={tabs}
            objectData={objectData}
            fieldCollectionLayouts={fieldCollectionLayouts}
            objectBrickLayouts={objectBrickLayouts}
            isEditing={isEditing}
            onFieldChange={onFieldChange}
            errors={errors}
          />
        );
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
                isEditing={isEditing}
                onFieldChange={onFieldChange}
                errors={errors}
              />
            ))}
          </>
        );
      }
      return (
        <PanelRenderer
          field={node}
          objectData={objectData}
          level={level}
          fieldCollectionLayouts={fieldCollectionLayouts}
          objectBrickLayouts={objectBrickLayouts}
          isEditing={isEditing}
          onFieldChange={onFieldChange}
          errors={errors}
        />
      );
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
            isEditing={isEditing}
            onFieldChange={onFieldChange}
            errors={errors}
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
        isEditing={isEditing}
        onFieldChange={onFieldChange}
        errors={errors}
      />
    );
  }

  return null;
};

// Field Collection Data Renderer - renders the data inside a field collection item
const FieldCollectionDataRenderer: React.FC<{
  data: any;
  fieldCollectionLayouts?: any;
  isEditing?: boolean;
  onFieldChange?: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}> = ({ data, fieldCollectionLayouts = {}, isEditing, onFieldChange, errors }) => {
  if (!data) return null;

  return (
    <View>
      {Object.entries(data).map(([fieldKey, fieldValue]: [string, any]) => {
        if (fieldValue === null || fieldValue === undefined) return null;

        // Create a simple field definition
        const fieldDef: FieldDefinition = {
          name: fieldKey,
          title: fieldKey,
          fieldtype: typeof fieldValue === 'boolean' ? 'checkbox' :
                     typeof fieldValue === 'number' ? 'numeric' : 'input',
          datatype: 'data',
        };

        // Use the fieldRenderers to render the field
        const FieldComponent = fieldRenderers[fieldDef.fieldtype];
        if (FieldComponent) {
          return (
            <FieldComponent
              key={fieldKey}
              value={fieldValue}
              title={fieldKey}
              mandatory={false}
              field={fieldDef}
              isEditing={isEditing}
              onFieldChange={onFieldChange ? (val) => onFieldChange(fieldKey, val) : undefined}
              error={errors?.[fieldKey]}
            />
          );
        }

        // Fallback for unknown types
        return (
          <FieldWrapper key={fieldKey} label={fieldKey}>
            <Text style={styles.textValue}>
              {typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue)}
            </Text>
          </FieldWrapper>
        );
      })}
    </View>
  );
};

// Object Brick Fallback Renderer
const ObjectBrickFallbackRenderer: React.FC<{
  data: any;
  isEditing?: boolean;
  onFieldChange?: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}> = ({ data, isEditing, onFieldChange, errors }) => {
  if (!data || typeof data !== 'object') return null;

  return (
    <FieldCollectionDataRenderer
      data={data}
      isEditing={isEditing}
      onFieldChange={onFieldChange}
      errors={errors}
    />
  );
};

// Main field renderer component
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  level = 0,
  fieldCollectionLayouts = {},
  objectBrickLayouts = {},
  isEditing = false,
  onFieldChange,
  errors = {},
}) => {
  const { fieldtype, title, name, mandatory } = field;
  const displayTitle = title || name;
  const fieldError = errors[name];

  // Handle field change - pass field name to parent
  const handleFieldChange = (newValue: any) => {
    onFieldChange?.(name, newValue);
  };

  // Special case: localized fields need custom handling
  if (fieldtype === 'localizedfields') {
    return (
      <LocalizedFieldsRenderer
        field={field}
        value={value}
        isEditing={isEditing}
        onFieldChange={onFieldChange}
        errors={errors}
      />
    );
  }

  // Special case: field collections
  if (fieldtype === 'fieldcollections') {
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
                  fcLayout.children.map((layoutChild: any, childIndex: number) => (
                    <LayoutNodeRenderer
                      key={`${layoutChild.name}-${childIndex}`}
                      node={layoutChild}
                      objectData={item.data}
                      level={level + 1}
                      fieldCollectionLayouts={fieldCollectionLayouts}
                      objectBrickLayouts={objectBrickLayouts}
                      isEditing={isEditing}
                      onFieldChange={onFieldChange}
                      errors={errors}
                    />
                  ))
                ) : item.data ? (
                  <FieldCollectionDataRenderer
                    data={item.data}
                    fieldCollectionLayouts={fieldCollectionLayouts}
                    isEditing={isEditing}
                    onFieldChange={onFieldChange}
                    errors={errors}
                  />
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
  }

  // Special case: object bricks
  if (fieldtype === 'objectbricks') {
    if (value && typeof value === 'object') {
      const brickEntries = Object.entries(value).filter(([key, val]) => val && typeof val === 'object');
      if (brickEntries.length > 0) {
        return (
          <FieldWrapper label={displayTitle} mandatory={mandatory}>
            {brickEntries.map(([brickName, brickData]: [string, any]) => {
              const capitalizedName = brickName.charAt(0).toUpperCase() + brickName.slice(1);
              const obLayoutEntry = objectBrickLayouts?.items?.[brickName]
                || objectBrickLayouts?.items?.[capitalizedName]
                || objectBrickLayouts?.[brickName]
                || objectBrickLayouts?.[capitalizedName];
              const layoutDef = obLayoutEntry?.layoutDefinition || obLayoutEntry;

              return (
                <View key={brickName} style={styles.objectBrickItem}>
                  <Text style={styles.objectBrickType}>{brickName}</Text>
                  {layoutDef?.children ? (
                    layoutDef.children.map((layoutChild: any, childIndex: number) => (
                      <LayoutNodeRenderer
                        key={`${layoutChild.name || childIndex}-${childIndex}`}
                        node={layoutChild}
                        objectData={brickData}
                        level={level + 1}
                        fieldCollectionLayouts={fieldCollectionLayouts}
                        objectBrickLayouts={objectBrickLayouts}
                        isEditing={isEditing}
                        onFieldChange={onFieldChange}
                        errors={errors}
                      />
                    ))
                  ) : (
                    <ObjectBrickFallbackRenderer
                      data={brickData}
                      isEditing={isEditing}
                      onFieldChange={onFieldChange}
                      errors={errors}
                    />
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
  }

  // Special case: block field
  if (fieldtype === 'block') {
    return (
      <FieldWrapper label={displayTitle} mandatory={mandatory}>
        <Text style={styles.textValue}>
          {Array.isArray(value) ? `${value.length} Blöcke` : '-'}
        </Text>
      </FieldWrapper>
    );
  }

  // Look up the field renderer from the registry
  const FieldComponent = fieldRenderers[fieldtype];

  if (FieldComponent) {
    // All field components now support both view and edit modes
    return (
      <FieldComponent
        value={value}
        title={displayTitle}
        mandatory={mandatory}
        field={field}
        isEditing={isEditing}
        onFieldChange={handleFieldChange}
        error={fieldError}
      />
    );
  }

  // Unknown field types (e.g. from extensions like dataQuality) are not rendered
  return null;
};

const styles = StyleSheet.create({
  // Tab styles
  tabPanel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tabHeader: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#6200ee',
  },
  tabContent: {
    padding: 16,
  },
  // Panel styles
  panelContainer: {
    marginBottom: 16,
  },
  panelNested: {
    marginLeft: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
  panelHeader: {
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // Localized fields
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
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  langTabSelected: {
    backgroundColor: '#6200ee',
  },
  langTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  langTabTextSelected: {
    color: '#fff',
  },
  // Field collection styles
  fieldCollectionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  fieldCollectionType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6200ee',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Object brick styles
  objectBrickItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  objectBrickType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff9800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Fallback text
  textValue: {
    fontSize: 15,
    color: '#333',
  },
});

export default FieldRenderer;
