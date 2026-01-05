/**
 * Document Detail Screen
 * Shows document metadata and edit functionality for different document types
 * Design matches ObjectDetailScreen with gradient header and edit mode
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Text, ActivityIndicator, IconButton, Title, Button, Card, Surface, Chip, Paragraph, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PimcoreService } from '../apis/pimcoreService';
import { SearchService } from '../apis/searchService';
import { useNavigation } from '@react-navigation/native';
import { EditProvider, useEditContext } from '../contexts/EditContext';
import { EditModeToolbar } from '../components/EditModeToolbar';
import { useInstanceStore } from '../store/instanceStore';

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

interface DocumentItem {
  id: number;
  key: string;
  type: string;
  fullPath: string;
  path: string;
  parentId: number;
  hasChildren: boolean;
  published?: boolean;
  creationDate?: number;
  modificationDate?: number;
  userOwner?: number;
  userModification?: number;
  // Navigation at root level
  navigationExclude?: boolean;
  // Settings data contains most configuration
  settingsData?: LinkSettingsData | HardlinkSettingsData | PageSettingsData | any;
  permissions?: Record<string, boolean>;
}

interface PageSettingsData {
  title?: string;
  description?: string;
  prettyUrl?: string | null;
  controller?: string;
  template?: string;
  contentMainDocumentId?: number | null;
  contentMainDocumentPath?: string | null;
  supportsContentMain?: boolean;
  staticGeneratorEnabled?: boolean;
  staticGeneratorLifetime?: number | null;
  staticLastGenerated?: string | null;
  url?: string;
}

interface EmailSettingsData {
  subject?: string;
  from?: string;
  replyTo?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  controller?: string;
  template?: string;
}

interface LinkSettingsData {
  linkType: 'internal' | 'direct';
  internal?: number | null;
  internalType?: string | null;
  direct?: string | null;
  href?: string | null;
  rawHref?: string | null;
}

interface HardlinkSettingsData {
  sourceId?: number | null;
  sourcePath?: string | null;
  propertiesFromSource?: boolean;
  childrenFromSource?: boolean;
}

interface SearchResultDocument {
  id: number;
  key: string;
  fullPath: string;
  type: string;
}

// Inner component that uses EditContext
function DocumentDetailScreenInner({ route }: any) {
  const { document: initialDocument } = route.params;
  const navigation = useNavigation<any>();
  const [document, setDocument] = useState<DocumentItem>(initialDocument);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [activeMenuSection, setActiveMenuSection] = useState<'info' | 'permissions' | null>(null);

  // Edit context
  const {
    isEditing,
    startEditing,
    stopEditing,
    isDirty,
    isSaving,
    setSaving,
    setFieldValue,
    getFieldValue,
    formData,
  } = useEditContext();

  // Document Picker State
  const [documentPickerVisible, setDocumentPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultDocument[]>([]);
  const [searching, setSearching] = useState(false);
  const [initialDocuments, setInitialDocuments] = useState<SearchResultDocument[]>([]);


  // Get Pimcore base URL (strip /pimcore-studio/api suffix if present)
  const { activeInstance } = useInstanceStore();
  const getBaseUrl = (): string => {
    if (!activeInstance?.url) return '';
    // Remove /pimcore-studio/api suffix to get the base domain
    return activeInstance.url.replace(/\/pimcore-studio\/api\/?$/, '');
  };
  const pimcoreBaseUrl = getBaseUrl();

  // Check if document type supports preview/editor
  const isEditableDocumentType = ['page', 'snippet', 'email', 'newsletter'].includes(document.type);

  // Get preview URL (Pimcore Studio preview mode)
  const getPreviewUrl = (): string => {
    if (!pimcoreBaseUrl || !document.fullPath) return '';
    const cacheBuster = Date.now();
    return `${pimcoreBaseUrl}${document.fullPath}?pimcore_preview=true&pimcore_studio_preview=true&_cb=${cacheBuster}`;
  };

  // Open document preview in WebView screen
  const handleOpenPreview = () => {
    const url = getPreviewUrl();
    if (url) {
      navigation.navigate('WebView', {
        url: url,
        title: `Vorschau: ${document.key || 'Document'}`,
      });
    }
  };

  // Navigate to Properties screen
  const handlePropertiesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Properties', {
      elementType: 'document',
      elementId: initialDocument.id,
      elementName: initialDocument.key || 'Document',
    });
  };

  // Navigate to Notes screen
  const handleNotesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Notes', {
      elementType: 'document',
      elementId: initialDocument.id,
      elementName: initialDocument.key || 'Document',
    });
  };

  // Navigate to Dependencies screen
  const handleDependenciesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Dependencies', {
      elementType: 'document',
      elementId: initialDocument.id,
      elementName: initialDocument.key || 'Document',
    });
  };

  // Navigate to Tags screen
  const handleTagsOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Tags', {
      elementType: 'document',
      elementId: initialDocument.id,
      elementName: initialDocument.key || 'Document',
    });
  };

  // Start editing
  const handleStartEditing = useCallback(() => {
    if (document.type === 'link' && document.settingsData) {
      const settings = document.settingsData;
      startEditing({
        linkType: settings.linkType || 'direct',
        direct: settings.direct || '',
        internal: settings.internal || null,
        internalType: settings.internalType || null,
        rawHref: settings.rawHref || '',
      });
    } else if (document.type === 'hardlink') {
      const settings = document.settingsData || {};
      startEditing({
        sourceId: settings.sourceId || null,
        sourcePath: settings.sourcePath || '',
        propertiesFromSource: settings.propertiesFromSource || false,
        childrenFromSource: settings.childrenFromSource || false,
      });
    }
  }, [document, startEditing]);

  // Set up header right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
          {!isEditing && (document.type === 'link' || document.type === 'hardlink') && (
            <TouchableOpacity
              onPress={handleStartEditing}
              style={{ padding: 8 }}
            >
              <MaterialCommunityIcons name="pencil" size={22} color="#6200ee" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setMenuModalVisible(true)}
            style={{ padding: 8 }}
          >
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, isEditing, document, handleStartEditing]);

  const loadDocumentDetails = async () => {
    try {
      const details = await PimcoreService.getDocument(initialDocument.id);
      setDocument({ ...initialDocument, ...details });
    } catch (error) {
      console.error('Error loading document details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocumentDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDocumentDetails();
  }, [initialDocument.id]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const response = await SearchService.searchDocuments(query);
        // Transform results to match our interface
        const results = response.items.map((item: any) => ({
          id: item.id,
          key: item.filename || item.title || `Document ${item.id}`,
          fullPath: item.fullpath,
          type: item.type || 'document',
        }));
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  // Load initial documents when picker opens
  const loadInitialDocuments = async () => {
    if (initialDocuments.length > 0) return; // Already loaded

    setSearching(true);
    try {
      const docs = await PimcoreService.getDocumentTreeLevel(1);
      const results = docs.map((doc: any) => ({
        id: doc.id,
        key: doc.key || doc.filename || `Document ${doc.id}`,
        fullPath: doc.fullPath || doc.path,
        type: doc.type || 'document',
      }));
      setInitialDocuments(results);
    } catch (error) {
      console.error('Error loading initial documents:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleOpenDocumentPicker = () => {
    setDocumentPickerVisible(true);
    loadInitialDocuments();
  };

  const handleSelectInternalDocument = (doc: SearchResultDocument) => {
    setFieldValue('internal', doc.id);
    setFieldValue('internalType', 'document');
    setFieldValue('rawHref', doc.fullPath);
    setDocumentPickerVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClearInternalDocument = () => {
    setFieldValue('internal', null);
    setFieldValue('internalType', null);
    setFieldValue('rawHref', '');
  };

  const handleLinkTypeChange = (value: 'internal' | 'direct') => {
    setFieldValue('linkType', value);
  };

  const handleDirectUrlChange = (text: string) => {
    setFieldValue('direct', text);
  };

  // Hardlink handlers
  const handleSelectSourceDocument = (doc: SearchResultDocument) => {
    setFieldValue('sourceId', doc.id);
    setFieldValue('sourcePath', doc.fullPath);
    setDocumentPickerVisible(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClearSourceDocument = () => {
    setFieldValue('sourceId', null);
    setFieldValue('sourcePath', '');
  };

  const handlePropertiesFromSourceChange = (value: boolean) => {
    setFieldValue('propertiesFromSource', value);
  };

  const handleChildrenFromSourceChange = (value: boolean) => {
    setFieldValue('childrenFromSource', value);
  };

  // Save changes
  const handleSave = async (task: 'save' | 'publish') => {
    if (!isDirty) return;

    setSaving(true);
    try {
      if (document.type === 'link') {
        const linkType = getFieldValue('linkType') || 'direct';
        const rawHref = linkType === 'internal' ? getFieldValue('rawHref') : getFieldValue('direct');
        const linkData = {
          linkType: linkType as 'internal' | 'direct',
          internal: linkType === 'internal' ? getFieldValue('internal') : null,
          internalType: linkType === 'internal' ? 'document' : null,
          direct: linkType === 'direct' ? getFieldValue('direct') : '',
          rawHref: rawHref || '',
        };
        await PimcoreService.updateLinkDocument(document.id, linkData, task);
      } else if (document.type === 'hardlink') {
        const hardlinkData = {
          sourceId: getFieldValue('sourceId') || null,
          sourcePath: getFieldValue('sourcePath') || '',
          propertiesFromSource: getFieldValue('propertiesFromSource') || false,
          childrenFromSource: getFieldValue('childrenFromSource') || false,
        };
        await PimcoreService.updateHardlinkDocument(document.id, hardlinkData, task);
      }

      await loadDocumentDetails();
      stopEditing();
      Alert.alert('Erfolg', 'Dokument wurde gespeichert.');
    } catch (error: any) {
      console.error('Error saving document:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unbekannter Fehler';
      if (errorMessage.toLowerCase().includes('permission') || error?.response?.status === 403) {
        Alert.alert('Keine Berechtigung', 'Sie haben keine Berechtigung, dieses Dokument zu bearbeiten.');
      } else {
        Alert.alert('Fehler', `Dokument konnte nicht gespeichert werden: ${errorMessage}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    stopEditing();
  };

  const getNodeIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (type === 'folder') return 'folder';
    if (type === 'page') return 'file-document';
    if (type === 'snippet') return 'puzzle';
    if (type === 'link') return 'link';
    if (type === 'hardlink') return 'link-variant';
    if (type === 'email') return 'email';
    if (type === 'printpage') return 'printer';
    if (type === 'printcontainer') return 'folder-multiple';
    return 'file';
  };

  const getNodeGradient = (type: string): readonly [string, string] => {
    if (type === 'folder') return ['#FFB300', '#FF6F00'] as const;
    if (type === 'page') return ['#2196f3', '#1565C0'] as const;
    if (type === 'snippet') return ['#9c27b0', '#7B1FA2'] as const;
    if (type === 'link') return ['#00bcd4', '#0097A7'] as const;
    if (type === 'hardlink') return ['#009688', '#00796B'] as const;
    if (type === 'email') return ['#f44336', '#D32F2F'] as const;
    if (type === 'printpage') return ['#795548', '#5D4037'] as const;
    if (type === 'printcontainer') return ['#607d8b', '#455A64'] as const;
    return ['#607d8b', '#455A64'] as const;
  };

  const formatDate = (timestamp: number | undefined): string => {
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

  const gradient = getNodeGradient(document.type);
  const icon = getNodeIcon(document.type);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Lade Dokument...</Text>
      </View>
    );
  }

  // Get values from edit context when editing, otherwise from document
  const linkType = isEditing ? (getFieldValue('linkType') || 'direct') : (document.settingsData?.linkType || 'direct');
  const directUrl = isEditing ? (getFieldValue('direct') || '') : (document.settingsData?.direct || '');
  const internalDocumentId = isEditing ? getFieldValue('internal') : document.settingsData?.internal;
  const internalDocumentPath = isEditing ? (getFieldValue('rawHref') || '') : (document.settingsData?.rawHref || '');

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <Surface style={styles.headerCard} elevation={2}>
          <LinearGradient
            colors={gradient}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name={icon} size={36} color="#fff" />
              </View>
              <View style={styles.headerText}>
                <Title style={styles.headerTitle} numberOfLines={1}>
                  {document.key}
                </Title>
                <View style={styles.headerMeta}>
                  <Paragraph style={styles.headerSubtitle}>
                    {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                  </Paragraph>
                  {document.type !== 'folder' && (
                    <Chip
                      icon={document.published ? 'check-circle' : 'clock-outline'}
                      style={[
                        styles.statusChip,
                        document.published ? styles.publishedChip : styles.draftChip,
                      ]}
                      textStyle={styles.statusChipText}
                      compact
                    >
                      {document.published ? 'Published' : 'Draft'}
                    </Chip>
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>
        </Surface>
      </View>

      {/* Edit Mode Toolbar */}
      {isEditing && (
        <EditModeToolbar
          onSave={handleSave}
          onDiscard={handleDiscard}
          canEdit={document.type === 'link' || document.type === 'hardlink'}
        />
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Link Edit Section - Only for link documents */}
        {document.type === 'link' && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="link" size={24} color="#6200ee" />
                <Title style={styles.sectionTitle}>Link-Ziel</Title>
              </View>

              {/* Link Type Selector */}
              <View style={styles.linkTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.linkTypeButton,
                    linkType === 'internal' && styles.linkTypeButtonActive,
                  ]}
                  onPress={() => isEditing && handleLinkTypeChange('internal')}
                  disabled={!isEditing}
                >
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={20}
                    color={linkType === 'internal' ? '#fff' : '#666'}
                  />
                  <Text style={[
                    styles.linkTypeButtonText,
                    linkType === 'internal' && styles.linkTypeButtonTextActive,
                  ]}>
                    Internes Dokument
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.linkTypeButton,
                    linkType === 'direct' && styles.linkTypeButtonActive,
                  ]}
                  onPress={() => isEditing && handleLinkTypeChange('direct')}
                  disabled={!isEditing}
                >
                  <MaterialCommunityIcons
                    name="web"
                    size={20}
                    color={linkType === 'direct' ? '#fff' : '#666'}
                  />
                  <Text style={[
                    styles.linkTypeButtonText,
                    linkType === 'direct' && styles.linkTypeButtonTextActive,
                  ]}>
                    Externe URL
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Link Input */}
              {linkType === 'direct' ? (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>URL</Text>
                  <TextInput
                    style={[styles.textInput, !isEditing && styles.textInputDisabled]}
                    value={directUrl}
                    onChangeText={handleDirectUrlChange}
                    placeholder="https://example.com"
                    placeholderTextColor="#999"
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={isEditing}
                  />
                </View>
              ) : (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Verlinktes Dokument</Text>
                  <TouchableOpacity
                    style={[styles.documentSelector, !isEditing && styles.documentSelectorDisabled]}
                    onPress={() => isEditing && handleOpenDocumentPicker()}
                    disabled={!isEditing}
                  >
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={24}
                      color={internalDocumentId ? '#6200ee' : '#999'}
                    />
                    <Text
                      style={[
                        styles.documentSelectorText,
                        !internalDocumentPath && styles.documentSelectorPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {internalDocumentPath || 'Dokument auswählen...'}
                    </Text>
                    {isEditing && internalDocumentId && (
                      <TouchableOpacity
                        onPress={handleClearInternalDocument}
                        style={styles.clearButton}
                      >
                        <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                    {isEditing && (
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    )}
                  </TouchableOpacity>
                </View>
              )}

            </Card.Content>
          </Card>
        )}

        {/* Hardlink Edit Section - Only for hardlink documents */}
        {document.type === 'hardlink' && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="link-variant" size={24} color="#6200ee" />
                <Title style={styles.sectionTitle}>Hardlink-Einstellungen</Title>
              </View>

              {/* Source Document */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Quell-Dokument</Text>
                <TouchableOpacity
                  style={[styles.documentSelector, !isEditing && styles.documentSelectorDisabled]}
                  onPress={() => isEditing && handleOpenDocumentPicker()}
                  disabled={!isEditing}
                >
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={24}
                    color={getFieldValue('sourceId') ? '#6200ee' : '#999'}
                  />
                  <Text
                    style={[
                      styles.documentSelectorText,
                      !getFieldValue('sourcePath') && styles.documentSelectorPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {(isEditing ? getFieldValue('sourcePath') : document.settingsData?.sourcePath) || 'Dokument auswählen...'}
                  </Text>
                  {isEditing && getFieldValue('sourceId') && (
                    <TouchableOpacity
                      onPress={handleClearSourceDocument}
                      style={styles.clearButton}
                    >
                      <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                  {isEditing && (
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Properties from Source */}
              <View style={styles.switchContainer}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchLabelText}>Properties vom Quell-Dokument verwenden</Text>
                </View>
                <Switch
                  value={isEditing ? getFieldValue('propertiesFromSource') : document.settingsData?.propertiesFromSource}
                  onValueChange={handlePropertiesFromSourceChange}
                  disabled={!isEditing}
                />
              </View>

              {/* Children from Source */}
              <View style={styles.switchContainer}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchLabelText}>Kinder vom Quell-Dokument verwenden</Text>
                </View>
                <Switch
                  value={isEditing ? getFieldValue('childrenFromSource') : document.settingsData?.childrenFromSource}
                  onValueChange={handleChildrenFromSourceChange}
                  disabled={!isEditing}
                />
              </View>

            </Card.Content>
          </Card>
        )}

        {/* Page/Snippet/Email Preview Section */}
        {isEditableDocumentType && (
          <>
            {/* Preview Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="eye" size={24} color="#6200ee" />
                  <Title style={styles.sectionTitle}>Vorschau</Title>
                </View>

                {/* Preview WebView */}
                <View style={styles.previewContainer}>
                  {pimcoreBaseUrl ? (
                    <WebView
                      source={{ uri: getPreviewUrl() }}
                      style={styles.previewWebView}
                      scalesPageToFit={true}
                      scrollEnabled={false}
                      nestedScrollEnabled={false}
                    />
                  ) : (
                    <View style={styles.previewPlaceholder}>
                      <MaterialCommunityIcons name="web-off" size={48} color="#ccc" />
                      <Text style={styles.previewPlaceholderText}>
                        Keine Vorschau verfügbar
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={handleOpenPreview}
                >
                  <MaterialCommunityIcons name="fullscreen" size={20} color="#fff" />
                  <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                    Vorschau öffnen
                  </Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>

            {/* Content Settings Card - for page/snippet */}
            {(document.type === 'page' || document.type === 'snippet') && (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="file-document-edit" size={24} color="#6200ee" />
                    <Title style={styles.sectionTitle}>Content Settings</Title>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Title</Text>
                    <Text style={styles.settingValue}>{document.settingsData?.title || '-'}</Text>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Description</Text>
                    <Text style={styles.settingValue} numberOfLines={3}>
                      {document.settingsData?.description || '-'}
                    </Text>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Pretty URL</Text>
                    <Text style={styles.settingValue}>{document.settingsData?.prettyUrl || '-'}</Text>
                  </View>

                  {document.settingsData?.contentMainDocumentPath && (
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Content-Main Document</Text>
                      <Text style={styles.settingValue}>{document.settingsData.contentMainDocumentPath}</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Email Settings Card - for email/newsletter */}
            {(document.type === 'email' || document.type === 'newsletter') && (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="email-edit" size={24} color="#6200ee" />
                    <Title style={styles.sectionTitle}>Email Settings</Title>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Subject</Text>
                    <Text style={styles.settingValue} numberOfLines={2}>
                      {document.settingsData?.subject || '-'}
                    </Text>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>From</Text>
                    <Text style={styles.settingValue}>{document.settingsData?.from || '-'}</Text>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Reply To</Text>
                    <Text style={styles.settingValue}>{document.settingsData?.replyTo || '-'}</Text>
                  </View>

                  <View style={styles.settingSubheader}>
                    <Text style={styles.settingSubheaderText}>Recipients</Text>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>To</Text>
                    <Text style={styles.settingValue}>{document.settingsData?.to || '-'}</Text>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Cc</Text>
                    <Text style={styles.settingValue}>{document.settingsData?.cc || '-'}</Text>
                  </View>

                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Bcc</Text>
                    <Text style={styles.settingValue}>{document.settingsData?.bcc || '-'}</Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Document Configuration Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="cog" size={24} color="#6200ee" />
                  <Title style={styles.sectionTitle}>Document Configuration</Title>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Controller</Text>
                  <Text style={styles.settingValue} numberOfLines={2}>
                    {document.settingsData?.controller || '-'}
                  </Text>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Template</Text>
                  <Text style={styles.settingValue}>{document.settingsData?.template || '-'}</Text>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Static Generator</Text>
                  <Text style={styles.settingValue}>
                    {document.settingsData?.staticGeneratorEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>

                {document.settingsData?.staticGeneratorEnabled && (
                  <>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Lifetime (min)</Text>
                      <Text style={styles.settingValue}>
                        {document.settingsData?.staticGeneratorLifetime || '-'}
                      </Text>
                    </View>
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Last Generated</Text>
                      <Text style={styles.settingValue}>
                        {document.settingsData?.staticLastGenerated || 'never'}
                      </Text>
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>

            {/* Navigation Settings Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="navigation" size={24} color="#6200ee" />
                  <Title style={styles.sectionTitle}>Navigation</Title>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Exclude from Navigation</Text>
                  <Text style={styles.settingValue}>
                    {document.navigationExclude ? 'Ja' : 'Nein'}
                  </Text>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>URL</Text>
                  <Text style={styles.settingValue} numberOfLines={2}>
                    {document.settingsData?.url || document.fullPath || '-'}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={menuModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setMenuModalVisible(false);
          setActiveMenuSection(null);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setMenuModalVisible(false);
          setActiveMenuSection(null);
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuModal}>
                <View style={styles.modalHeader}>
                  <Title style={styles.modalTitle}>
                    {activeMenuSection === 'info' ? 'Dokumentinformationen' :
                     activeMenuSection === 'permissions' ? 'Berechtigungen' : 'Menü'}
                  </Title>
                  <TouchableOpacity
                    onPress={() => {
                      if (activeMenuSection) {
                        setActiveMenuSection(null);
                      } else {
                        setMenuModalVisible(false);
                      }
                    }}
                    style={styles.modalCloseButton}
                  >
                    <MaterialCommunityIcons
                      name={activeMenuSection ? 'arrow-left' : 'close'}
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                {!activeMenuSection ? (
                  <View style={styles.menuItems}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => setActiveMenuSection('info')}
                    >
                      <MaterialCommunityIcons name="information-outline" size={24} color="#6200ee" />
                      <Text style={styles.menuItemText}>Dokumentinformationen</Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => setActiveMenuSection('permissions')}
                    >
                      <MaterialCommunityIcons name="shield-check-outline" size={24} color="#6200ee" />
                      <Text style={styles.menuItemText}>Berechtigungen</Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handlePropertiesOpen}
                    >
                      <MaterialCommunityIcons name="tag-multiple-outline" size={24} color="#6200ee" />
                      <Text style={styles.menuItemText}>Properties</Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleNotesOpen}
                    >
                      <MaterialCommunityIcons name="note-multiple-outline" size={24} color="#6200ee" />
                      <Text style={styles.menuItemText}>Notes</Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleDependenciesOpen}
                    >
                      <MaterialCommunityIcons name="link-variant" size={24} color="#6200ee" />
                      <Text style={styles.menuItemText}>Dependencies</Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleTagsOpen}
                    >
                      <MaterialCommunityIcons name="tag-outline" size={24} color="#6200ee" />
                      <Text style={styles.menuItemText}>Tags</Text>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>
                  </View>
                ) : activeMenuSection === 'info' ? (
                  <ScrollView style={styles.modalContent}>
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="#6200ee" />
                        <Text style={styles.modalSectionTitle}>Allgemein</Text>
                      </View>

                      <View style={styles.modalInfoRow}>
                        <MaterialCommunityIcons name="pound" size={18} color="#6200ee" />
                        <Text style={styles.modalInfoLabel}>ID</Text>
                        <Text style={styles.modalInfoValue}>{document.id?.toString()}</Text>
                      </View>

                      <View style={styles.modalInfoRow}>
                        <MaterialCommunityIcons name="tag-outline" size={18} color="#6200ee" />
                        <Text style={styles.modalInfoLabel}>Typ</Text>
                        <Text style={styles.modalInfoValue}>{document.type}</Text>
                      </View>

                      <View style={styles.modalInfoRow}>
                        <MaterialCommunityIcons name="folder-open-outline" size={18} color="#6200ee" />
                        <Text style={styles.modalInfoLabel}>Pfad</Text>
                        <Text style={styles.modalInfoValue} numberOfLines={2}>
                          {document.fullPath || document.path}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#6200ee" />
                        <Text style={styles.modalSectionTitle}>Metadaten</Text>
                      </View>

                      {document.creationDate && (
                        <View style={styles.modalInfoRow}>
                          <MaterialCommunityIcons name="calendar-plus" size={18} color="#4caf50" />
                          <Text style={styles.modalInfoLabel}>Erstellt</Text>
                          <Text style={styles.modalInfoValue}>{formatDate(document.creationDate)}</Text>
                        </View>
                      )}

                      {document.modificationDate && (
                        <View style={styles.modalInfoRow}>
                          <MaterialCommunityIcons name="calendar-edit" size={18} color="#ff9800" />
                          <Text style={styles.modalInfoLabel}>Geändert</Text>
                          <Text style={styles.modalInfoValue}>{formatDate(document.modificationDate)}</Text>
                        </View>
                      )}

                      {document.userOwner !== undefined && (
                        <View style={styles.modalInfoRow}>
                          <MaterialCommunityIcons name="account-outline" size={18} color="#2196f3" />
                          <Text style={styles.modalInfoLabel}>Eigentümer</Text>
                          <Text style={styles.modalInfoValue}>User #{document.userOwner}</Text>
                        </View>
                      )}

                      {document.userModification !== undefined && (
                        <View style={styles.modalInfoRow}>
                          <MaterialCommunityIcons name="account-edit-outline" size={18} color="#9c27b0" />
                          <Text style={styles.modalInfoLabel}>Letzte Änderung</Text>
                          <Text style={styles.modalInfoValue}>User #{document.userModification}</Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                ) : activeMenuSection === 'permissions' ? (
                  <ScrollView style={styles.modalContent}>
                    {document.permissions ? (
                      <View style={styles.permissionsGrid}>
                        {Object.entries(document.permissions).map(([key, value]) => {
                          if (typeof value === 'boolean') {
                            return (
                              <Surface
                                key={key}
                                style={[
                                  styles.permissionCard,
                                  value ? styles.permissionEnabled : styles.permissionDisabled,
                                ]}
                                elevation={0}
                              >
                                <MaterialCommunityIcons
                                  name={value ? 'check-circle' : 'close-circle'}
                                  size={20}
                                  color={value ? '#4caf50' : '#f44336'}
                                />
                                <Paragraph style={styles.permissionText}>{key}</Paragraph>
                              </Surface>
                            );
                          }
                          return null;
                        })}
                      </View>
                    ) : (
                      <Text style={styles.noPermissionsText}>Keine Berechtigungen verfügbar</Text>
                    )}
                  </ScrollView>
                ) : null}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Document Picker Modal */}
      <Modal
        visible={documentPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setDocumentPickerVisible(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <View style={styles.pickerModalContainer}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Title style={styles.pickerTitle}>Dokument auswählen</Title>
              <TouchableOpacity
                onPress={() => {
                  setDocumentPickerVisible(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={24} color="#999" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Dokument suchen..."
                placeholderTextColor="#999"
                autoFocus
              />
              {searching && <ActivityIndicator size="small" />}
            </View>

            {(() => {
              const displayData = searchQuery.length >= 2 ? searchResults : initialDocuments;
              const showNoResults = searchQuery.length >= 2 && searchResults.length === 0 && !searching;

              if (showNoResults) {
                return (
                  <View style={styles.noResultsContainer}>
                    <MaterialCommunityIcons name="file-search-outline" size={48} color="#ccc" />
                    <Text style={styles.noResultsText}>Keine Dokumente gefunden</Text>
                  </View>
                );
              }

              return (
                <FlatList
                  data={displayData}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => document.type === 'hardlink' ? handleSelectSourceDocument(item) : handleSelectInternalDocument(item)}
                    >
                      <MaterialCommunityIcons
                        name={getNodeIcon(item.type)}
                        size={24}
                        color="#6200ee"
                      />
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultName}>{item.key}</Text>
                        <Text style={styles.searchResultPath}>{item.fullPath}</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>
                  )}
                  style={styles.searchResultsList}
                  ListEmptyComponent={
                    searching ? (
                      <View style={styles.noResultsContainer}>
                        <ActivityIndicator size="large" color="#6200ee" />
                        <Text style={styles.noResultsText}>Lade Dokumente...</Text>
                      </View>
                    ) : null
                  }
                />
              );
            })()}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  stickyHeader: {
    backgroundColor: '#f8f9fa',
    zIndex: 10,
  },
  headerCard: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 0,
  },
  statusChip: {
    height: 26,
    marginVertical: 0,
  },
  statusChipText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
    marginVertical: 0,
    lineHeight: 14,
  },
  publishedChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  draftChip: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },
  card: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0e7ff',
  },
  sectionTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  // Link Edit Styles
  linkTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  linkTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  linkTypeButtonActive: {
    backgroundColor: '#6200ee',
  },
  linkTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  linkTypeButtonTextActive: {
    color: '#fff',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textInputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  documentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  documentSelectorDisabled: {
    backgroundColor: '#f5f5f5',
  },
  documentSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  documentSelectorPlaceholder: {
    color: '#999',
  },
  clearButton: {
    marginRight: 8,
    padding: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchLabelText: {
    fontSize: 15,
    color: '#333',
  },
  bottomPadding: {
    height: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 0,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e7ff',
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6200ee',
    marginLeft: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 2,
    textAlign: 'right',
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 16,
  },
  // Permissions
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
  },
  permissionEnabled: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  permissionDisabled: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  permissionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  noPermissionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Document Picker Modal Styles
  pickerModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    paddingVertical: 8,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  searchResultPath: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  // Preview Styles
  previewContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
    position: 'relative',
  },
  previewWebView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  previewPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  previewPlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  previewLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  actionButtonPrimary: {
    backgroundColor: '#6200ee',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ee',
  },
  actionButtonTextPrimary: {
    color: '#fff',
  },
  // Settings Styles
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  settingSubheader: {
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e7ff',
  },
  settingSubheaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ee',
  },
  noSettingsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Editor Modal Styles
  editorModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  editorCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    marginBottom: 0,
  },
  editorExternalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorWebViewContainer: {
    flex: 1,
    position: 'relative',
  },
  editorWebView: {
    flex: 1,
  },
  editorLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  editorLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

// Wrapper component that provides EditContext
export default function DocumentDetailScreen(props: any) {
  return (
    <EditProvider>
      <DocumentDetailScreenInner {...props} />
    </EditProvider>
  );
}
