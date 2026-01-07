/**
 * Notes Screen
 * Displays notes for an element (object, asset, document)
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Modal, TouchableWithoutFeedback, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NotesService, Note, NoteElementType, CreateNoteRequest } from '../apis/notesService';

const NOTE_TYPES = [
  { value: 'notice', label: 'Notice', icon: 'information-outline' },
  { value: 'info', label: 'Info', icon: 'information' },
  { value: 'comment', label: 'Comment', icon: 'comment-text-outline' },
  { value: 'warning', label: 'Warning', icon: 'alert-outline' },
  { value: 'status', label: 'Status', icon: 'flag-variant' },
];

export default function NotesScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { elementType, elementId, elementName } = route.params as {
    elementType: NoteElementType;
    elementId: number;
    elementName: string;
  };
  const [notes, setNotes] = useState<Note[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Create note modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNoteType, setNewNoteType] = useState('notice');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');

  // Delete state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Detail view state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const loadNotes = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      }
      const result = await NotesService.getNotes(elementType, elementId, pageNum, pageSize);
      if (append) {
        setNotes(prev => [...prev, ...result.items]);
      } else {
        setNotes(result.items);
      }
      setTotalItems(result.totalItems);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && notes.length < totalItems) {
      loadNotes(page + 1, true);
    }
  };

  const openCreateModal = () => {
    setNewNoteType('notice');
    setNewNoteTitle('');
    setNewNoteDescription('');
    setCreateModalVisible(true);
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;

    try {
      setCreating(true);
      const noteData: CreateNoteRequest = {
        type: newNoteType,
        title: newNoteTitle.trim(),
        description: newNoteDescription.trim(),
      };
      await NotesService.createNote(elementType, elementId, noteData);
      setCreateModalVisible(false);
      // Refresh the list
      setPage(1);
      await loadNotes(1, false);
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setCreating(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await NotesService.getNotes(elementType, elementId, 1, pageSize);
      setNotes(result.items);
      setTotalItems(result.totalItems);
      setPage(1);
    } catch (error) {
      console.error('Error refreshing notes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const confirmDelete = (note: Note) => {
    setNoteToDelete(note);
    setDeleteModalVisible(true);
  };

  const openNoteDetail = (note: Note) => {
    setSelectedNote(note);
    setDetailModalVisible(true);
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      setDeleting(true);
      await NotesService.deleteNote(noteToDelete.id);
      setDeleteModalVisible(false);
      setNoteToDelete(null);
      // Remove from local list
      setNotes(prev => prev.filter(n => n.id !== noteToDelete.id));
      setTotalItems(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [elementType, elementId]);

  useEffect(() => {
    navigation.setOptions({
      title: `Notes: ${elementName}`,
      headerRight: () => (
        <TouchableOpacity
          onPress={openCreateModal}
          style={{ marginRight: 16, padding: 4 }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, elementName]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('status')) return 'flag-variant';
    if (lowerType.includes('comment')) return 'comment-text-outline';
    if (lowerType.includes('warning')) return 'alert-outline';
    if (lowerType.includes('info')) return 'information-outline';
    return 'note-text-outline';
  };

  const getTypeColor = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('status')) return '#6200ee';
    if (lowerType.includes('comment')) return '#2196f3';
    if (lowerType.includes('warning')) return '#ff9800';
    if (lowerType.includes('info')) return '#00bcd4';
    return '#607d8b';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Lade Notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
      >
        {/* Header Info */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="note-multiple-outline"
            size={24}
            color="#6200ee"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              Notes für {
                elementType === 'data-object' ? 'Data Object' :
                elementType === 'asset' ? 'Asset' : 'Document'
              }
            </Text>
            <Text style={styles.headerSubtitle}>
              {notes.length} von {totalItems} {totalItems === 1 ? 'Note' : 'Notes'}
            </Text>
          </View>
        </View>

        {/* Notes List */}
        {notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="note-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Keine Notes vorhanden</Text>
          </View>
        ) : (
          <View style={styles.notesContainer}>
            {notes.map((note) => {
              const typeColor = getTypeColor(note.type);
              const typeIcon = getTypeIcon(note.type);
              const hasData = note.data && note.data.length > 0;

              return (
                <TouchableOpacity
                  key={note.id}
                  style={styles.noteCard}
                  onPress={() => openNoteDetail(note)}
                  activeOpacity={0.7}
                >
                  <View style={styles.noteHeader}>
                    <View style={[styles.typeIconContainer, { backgroundColor: typeColor + '20' }]}>
                      <MaterialCommunityIcons name={typeIcon} size={20} color={typeColor} />
                    </View>
                    <View style={styles.noteHeaderText}>
                      <View style={styles.noteTitleRow}>
                        <Text style={styles.noteTitle}>{note.title || 'Ohne Titel'}</Text>
                        {hasData && (
                          <View style={styles.dataIndicator}>
                            <MaterialCommunityIcons name="table" size={14} color="#6200ee" />
                            <Text style={styles.dataIndicatorText}>{note.data.length}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.noteType}>{note.type}</Text>
                    </View>
                    {note.locked && (
                      <MaterialCommunityIcons name="lock" size={16} color="#999" />
                    )}
                    {!note.locked && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          confirmDelete(note);
                        }}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons name="delete-outline" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {note.description ? (
                    <Text style={styles.noteDescription} numberOfLines={2}>{note.description}</Text>
                  ) : null}

                  <View style={styles.noteFooter}>
                    <View style={styles.noteFooterItem}>
                      <MaterialCommunityIcons name="calendar-outline" size={14} color="#666" />
                      <Text style={styles.noteFooterText}>{formatDate(note.date)}</Text>
                    </View>
                    {note.userName && (
                      <View style={styles.noteFooterItem}>
                        <MaterialCommunityIcons name="account-outline" size={14} color="#666" />
                        <Text style={styles.noteFooterText}>{note.userName}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Load More Button */}
            {notes.length < totalItems && (
              <TouchableOpacity
                onPress={loadMore}
                disabled={loadingMore}
                style={[styles.loadMoreButton, loadingMore && styles.buttonDisabled]}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color={THEME.PRIMARY_COLOR} />
                ) : (
                  <Text style={styles.loadMoreButtonText}>Mehr laden</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Note Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={() => setCreateModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.createModal}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Neue Note</Text>
                    <TouchableOpacity
                      onPress={() => setCreateModalVisible(false)}
                      style={styles.modalCloseButton}
                    >
                      <MaterialCommunityIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalContent}>
                    {/* Type Selection */}
                    <Text style={styles.inputLabel}>Typ</Text>
                    <View style={styles.typeSelector}>
                      {NOTE_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type.value}
                          style={[
                            styles.typeOption,
                            newNoteType === type.value && styles.typeOptionActive,
                          ]}
                          onPress={() => setNewNoteType(type.value)}
                        >
                          <MaterialCommunityIcons
                            name={type.icon as any}
                            size={20}
                            color={newNoteType === type.value ? '#6200ee' : '#666'}
                          />
                          <Text
                            style={[
                              styles.typeOptionText,
                              newNoteType === type.value && styles.typeOptionTextActive,
                            ]}
                          >
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Title Input */}
                    <Text style={styles.inputLabel}>Titel *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newNoteTitle}
                      onChangeText={setNewNoteTitle}
                      placeholder="Titel eingeben..."
                      placeholderTextColor="#999"
                    />

                    {/* Description Input */}
                    <Text style={styles.inputLabel}>Beschreibung</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={newNoteDescription}
                      onChangeText={setNewNoteDescription}
                      placeholder="Beschreibung eingeben..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </ScrollView>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      onPress={() => setCreateModalVisible(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Abbrechen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCreateNote}
                      disabled={creating || !newNoteTitle.trim()}
                      style={[styles.createButton, (creating || !newNoteTitle.trim()) && styles.buttonDisabled]}
                    >
                      {creating ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.createButtonText}>Erstellen</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.deleteModal}>
                <View style={styles.deleteModalIcon}>
                  <MaterialCommunityIcons name="delete-alert-outline" size={48} color="#f44336" />
                </View>
                <Text style={styles.deleteModalTitle}>Note löschen?</Text>
                <Text style={styles.deleteModalText}>
                  "{noteToDelete?.title || 'Ohne Titel'}" wird unwiderruflich gelöscht.
                </Text>
                <View style={styles.deleteModalActions}>
                  <TouchableOpacity
                    onPress={() => setDeleteModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Abbrechen</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeleteNote}
                    disabled={deleting}
                    style={[styles.deleteConfirmButton, deleting && styles.buttonDisabled]}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.deleteConfirmButtonText}>Löschen</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Note Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDetailModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.detailModal}>
                {selectedNote && (
                  <>
                    {/* Modal Header */}
                    <View style={styles.detailModalHeader}>
                      <View style={[styles.detailTypeIcon, { backgroundColor: getTypeColor(selectedNote.type) + '20' }]}>
                        <MaterialCommunityIcons
                          name={getTypeIcon(selectedNote.type)}
                          size={24}
                          color={getTypeColor(selectedNote.type)}
                        />
                      </View>
                      <View style={styles.detailHeaderText}>
                        <Text style={styles.detailTitle}>{selectedNote.title || 'Ohne Titel'}</Text>
                        <Text style={styles.detailType}>{selectedNote.type}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setDetailModalVisible(false)}
                        style={styles.modalCloseButton}
                      >
                        <MaterialCommunityIcons name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.detailContent}>
                      {/* Description */}
                      {selectedNote.description ? (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailSectionTitle}>Beschreibung</Text>
                          <Text style={styles.detailDescription} selectable>
                            {selectedNote.description}
                          </Text>
                        </View>
                      ) : null}

                      {/* Metadata */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Metadaten</Text>
                        <View style={styles.detailMetaRow}>
                          <MaterialCommunityIcons name="calendar-outline" size={16} color="#666" />
                          <Text style={styles.detailMetaLabel}>Datum:</Text>
                          <Text style={styles.detailMetaValue} selectable>{formatDate(selectedNote.date)}</Text>
                        </View>
                        {selectedNote.userName && (
                          <View style={styles.detailMetaRow}>
                            <MaterialCommunityIcons name="account-outline" size={16} color="#666" />
                            <Text style={styles.detailMetaLabel}>Benutzer:</Text>
                            <Text style={styles.detailMetaValue} selectable>{selectedNote.userName}</Text>
                          </View>
                        )}
                        <View style={styles.detailMetaRow}>
                          <MaterialCommunityIcons name="identifier" size={16} color="#666" />
                          <Text style={styles.detailMetaLabel}>Note ID:</Text>
                          <Text style={styles.detailMetaValue} selectable>{selectedNote.id}</Text>
                        </View>
                        {selectedNote.locked && (
                          <View style={styles.detailMetaRow}>
                            <MaterialCommunityIcons name="lock" size={16} color="#f59e0b" />
                            <Text style={[styles.detailMetaLabel, { color: '#f59e0b' }]}>Gesperrt</Text>
                          </View>
                        )}
                      </View>

                      {/* Data Table */}
                      {selectedNote.data && selectedNote.data.length > 0 && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailSectionTitle}>Daten</Text>
                          <View style={styles.dataTable}>
                            {/* Table Header */}
                            <View style={styles.dataTableHeader}>
                              <Text style={[styles.dataTableHeaderCell, { flex: 1 }]}>Name</Text>
                              <Text style={[styles.dataTableHeaderCell, { flex: 1.5 }]}>Wert</Text>
                              <Text style={[styles.dataTableHeaderCell, { width: 60 }]}>Typ</Text>
                            </View>
                            {/* Table Rows */}
                            {selectedNote.data.map((item: any, index: number) => (
                              <View
                                key={index}
                                style={[
                                  styles.dataTableRow,
                                  index % 2 === 0 && styles.dataTableRowEven,
                                ]}
                              >
                                <Text style={[styles.dataTableCell, { flex: 1 }]} selectable>
                                  {item.name}
                                </Text>
                                <Text style={[styles.dataTableCell, { flex: 1.5 }]} selectable>
                                  {String(item.data)}
                                </Text>
                                <View style={[styles.dataTableCell, { width: 60 }]}>
                                  <View style={styles.dataTypeBadge}>
                                    <Text style={styles.dataTypeBadgeText}>{item.type}</Text>
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  notesContainer: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  noteType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noteDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  noteFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  noteFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteFooterText: {
    fontSize: 12,
    color: '#666',
  },
  loadMoreButton: {
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.PRIMARY_COLOR,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createModal: {
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
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: '#ede7f6',
    borderColor: '#6200ee',
  },
  typeOptionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: '#6200ee',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  // Delete button on note card
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Delete modal
  deleteModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    alignItems: 'center',
  },
  deleteModalIcon: {
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteConfirmButton: {
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f44336',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  // Note title row with data indicator
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ede7f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dataIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6200ee',
  },
  // Detail Modal
  detailModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 450,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  detailTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailHeaderText: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  detailType: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  detailContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  detailDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  detailMetaLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailMetaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Data Table
  dataTable: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dataTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dataTableHeaderCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  dataTableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  dataTableRowEven: {
    backgroundColor: '#fafafa',
  },
  dataTableCell: {
    fontSize: 14,
    color: '#333',
  },
  dataTypeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dataTypeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1976d2',
  },
});
