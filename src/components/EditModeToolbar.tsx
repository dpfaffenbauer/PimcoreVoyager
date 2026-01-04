/**
 * EditModeToolbar - Toolbar for toggling edit mode and saving changes
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, IconButton, Menu, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
            <Button
              mode="outlined"
              onPress={handleDiscard}
              disabled={isSaving}
              style={styles.button}
              compact
            >
              Verwerfen
            </Button>

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="contained"
                  onPress={() => isDirty ? setMenuVisible(true) : handleSave('save')}
                  disabled={isSaving || !isDirty}
                  loading={isSaving}
                  style={styles.button}
                  compact
                  icon={isDirty ? "content-save" : "check"}
                >
                  Speichern
                </Button>
              }
            >
              <Menu.Item
                onPress={() => handleSave('save')}
                title="Speichern"
                leadingIcon="content-save"
              />
              <Divider />
              <Menu.Item
                onPress={() => handleSave('publish')}
                title="Speichern & Veröffentlichen"
                leadingIcon="publish"
              />
            </Menu>

            <IconButton
              icon="close"
              mode="contained-tonal"
              size={20}
              onPress={() => {
                if (isDirty) {
                  handleDiscard();
                }
                stopEditing();
              }}
              style={styles.closeButton}
            />
          </View>
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
  button: {
    minWidth: 100,
  },
  closeButton: {
    marginLeft: 4,
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
