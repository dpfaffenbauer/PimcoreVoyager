/**
 * EditModeToolbar - Toolbar for toggling edit mode and saving changes
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text, Modal, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/constants';
import { useEditContext } from '../contexts/EditContext';

interface EditModeToolbarProps {
  onSave?: (task: 'save' | 'publish') => Promise<void>;
  onDiscard?: () => void;
  canEdit?: boolean;
}

export const EditModeToolbar: React.FC<EditModeToolbarProps> = ({
  onSave,
  onDiscard,
  canEdit = true,
}) => {
  const {
    isEditing,
    isDirty,
    isSaving,
    startEditing,
    stopEditing,
    resetForm,
    formData,
  } = useEditContext();

  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleToggleEdit = () => {
    if (isEditing) {
      if (isDirty) {
        // Could show a confirmation dialog here
        onDiscard?.();
      }
      stopEditing();
    } else {
      startEditing(formData);
    }
  };

  const handleSave = async (task: 'save' | 'publish') => {
    setMenuVisible(false);
    await onSave?.(task);
  };

  const handleDiscard = () => {
    resetForm();
    onDiscard?.();
  };

  if (!canEdit) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isEditing ? (
        // Edit mode controls
        <View style={styles.editControls}>
          <View style={styles.leftSection}>
            {isDirty && (
              <View style={styles.dirtyIndicator}>
                <MaterialCommunityIcons name="circle" size={8} color="#ff9800" />
                <Text style={styles.dirtyText}>Ungespeichert</Text>
              </View>
            )}
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={handleDiscard}
              disabled={isSaving}
              style={[styles.outlinedButton, isSaving && styles.buttonDisabled]}
            >
              <Text style={styles.outlinedButtonText}>Verwerfen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => isDirty ? setMenuVisible(true) : handleSave('save')}
              disabled={isSaving || !isDirty}
              style={[styles.containedButton, (isSaving || !isDirty) && styles.buttonDisabled]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name={isDirty ? "content-save" : "check"} size={16} color="#fff" />
                  <Text style={styles.containedButtonText}>Speichern</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (isDirty) {
                  handleDiscard();
                }
                stopEditing();
              }}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Save Menu Modal */}
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
              <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleSave('save')}>
                  <MaterialCommunityIcons name="content-save" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Speichern</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => handleSave('publish')}>
                  <MaterialCommunityIcons name="publish" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Speichern & Veröffentlichen</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </View>
      ) : (
        // View mode - show edit button
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleToggleEdit}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#6200ee" />
          <Text style={styles.editButtonText}>Bearbeiten</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Floating action button version for bottom of screen
export const EditModeFAB: React.FC<EditModeToolbarProps> = ({
  onSave,
  onDiscard,
  canEdit = true,
}) => {
  const { isEditing, isDirty, isSaving, stopEditing, resetForm } = useEditContext();

  if (!canEdit || !isEditing) {
    return null;
  }

  return (
    <View style={styles.fabContainer}>
      {isDirty && (
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => {
            resetForm();
            onDiscard?.();
          }}
          disabled={isSaving}
        >
          <MaterialCommunityIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.fab, styles.fabPrimary, !isDirty && styles.fabDisabled]}
        onPress={() => onSave?.('save')}
        disabled={isSaving || !isDirty}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dirtyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dirtyText: {
    fontSize: 13,
    color: '#ff9800',
    fontWeight: '500',
  },
  outlinedButton: {
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.PRIMARY_COLOR,
  },
  containedButton: {
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.PRIMARY_COLOR,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  containedButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  closeButton: {
    marginLeft: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 220,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f0ff',
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabPrimary: {
    backgroundColor: '#6200ee',
  },
  fabSecondary: {
    backgroundColor: '#fff',
  },
  fabDisabled: {
    backgroundColor: '#9e9e9e',
  },
});

export default EditModeToolbar;
