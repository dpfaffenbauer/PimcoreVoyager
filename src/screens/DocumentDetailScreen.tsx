/**
 * Document Detail Screen
 * Shows document metadata only
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text, ActivityIndicator, IconButton, Divider, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PimcoreService } from '../apis/pimcoreService';
import { useNavigation } from '@react-navigation/native';

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
  controller?: string;
  template?: string;
  title?: string;
  description?: string;
  prettyUrl?: string;
}

export default function DocumentDetailScreen({ route }: any) {
  const { document: initialDocument } = route.params;
  const navigation = useNavigation<any>();
  const [document, setDocument] = useState<DocumentItem>(initialDocument);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);

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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setMenuModalVisible(true)}
          style={{ marginRight: 16, padding: 4 }}
        >
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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

  const getNodeGradient = (type: string): string[] => {
    if (type === 'folder') return ['#ff9500', '#ffb84d'];
    if (type === 'page') return ['#2196f3', '#64b5f6'];
    if (type === 'snippet') return ['#9c27b0', '#ba68c8'];
    if (type === 'link') return ['#00bcd4', '#4dd0e1'];
    if (type === 'hardlink') return ['#009688', '#4db6ac'];
    if (type === 'email') return ['#f44336', '#e57373'];
    if (type === 'printpage') return ['#795548', '#a1887f'];
    if (type === 'printcontainer') return ['#607d8b', '#90a4ae'];
    return ['#607d8b', '#90a4ae'];
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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Lade Dokument...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Icon */}
        <View style={styles.header}>
          <LinearGradient
            colors={gradient}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconButton icon={icon} iconColor="#fff" size={48} style={{ margin: 0 }} />
          </LinearGradient>
          <Text style={styles.documentName}>{document.key}</Text>
          <View style={styles.typeRow}>
            <View style={[styles.typeBadge, { backgroundColor: gradient[0] + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: gradient[0] }]}>
                {document.type}
              </Text>
            </View>
            {document.type !== 'folder' && (
              <View style={[
                styles.publishedBadge,
                { backgroundColor: document.published ? '#4caf5020' : '#f4433620' }
              ]}>
                <MaterialCommunityIcons
                  name={document.published ? 'check-circle' : 'close-circle'}
                  size={18}
                  color={document.published ? '#4caf50' : '#f44336'}
                />
                <Text style={[
                  styles.publishedText,
                  { color: document.published ? '#4caf50' : '#f44336' }
                ]}>
                  {document.published ? 'Veröffentlicht' : 'Unveröffentlicht'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Metadata Section */}
        <View style={styles.metadataSection}>
          <Text style={styles.sectionTitle}>Metadaten</Text>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>ID</Text>
            <Text style={styles.metadataValue}>{document.id}</Text>
          </View>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Pfad</Text>
            <Text style={styles.metadataValue}>{document.fullPath || document.path}</Text>
          </View>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Parent ID</Text>
            <Text style={styles.metadataValue}>{document.parentId}</Text>
          </View>

          {document.title && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Titel</Text>
              <Text style={styles.metadataValue}>{document.title}</Text>
            </View>
          )}

          {document.description && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Beschreibung</Text>
              <Text style={styles.metadataValue}>{document.description}</Text>
            </View>
          )}

          {document.prettyUrl && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Pretty URL</Text>
              <Text style={styles.metadataValue}>{document.prettyUrl}</Text>
            </View>
          )}

          {document.controller && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Controller</Text>
              <Text style={styles.metadataValue}>{document.controller}</Text>
            </View>
          )}

          {document.template && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Template</Text>
              <Text style={styles.metadataValue}>{document.template}</Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Dates Section */}
        <View style={styles.metadataSection}>
          <Text style={styles.sectionTitle}>Zeitstempel</Text>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Erstellt</Text>
            <Text style={styles.metadataValue}>{formatDate(document.creationDate)}</Text>
          </View>

          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Geändert</Text>
            <Text style={styles.metadataValue}>{formatDate(document.modificationDate)}</Text>
          </View>

          {document.userOwner !== undefined && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Eigentümer (User ID)</Text>
              <Text style={styles.metadataValue}>{document.userOwner}</Text>
            </View>
          )}

          {document.userModification !== undefined && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Letzte Änderung (User ID)</Text>
              <Text style={styles.metadataValue}>{document.userModification}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={menuModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuModal}>
                <View style={styles.modalHeader}>
                  <Title style={styles.modalTitle}>Menü</Title>
                  <TouchableOpacity
                    onPress={() => setMenuModalVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <MaterialCommunityIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.menuItems}>
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
                </View>
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
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  publishedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  publishedText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    marginHorizontal: 16,
  },
  metadataSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  metadataLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  metadataValue: {
    flex: 2,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
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
});
