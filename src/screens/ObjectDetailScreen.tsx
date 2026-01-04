/**
 * Object Detail Screen
 * Displays detailed information about a Pimcore data object
 * Uses Pimcore layout API to render fields dynamically
 * Features sticky tab headers for quick navigation
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Card, Title, Paragraph, Chip, Surface, ActivityIndicator, Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PimcoreService, WorkflowItem, WorkflowTransition, WorkflowGlobalAction, WorkflowNotes } from '../apis/pimcoreService';
import { LayoutNodeRenderer } from '../components/FieldRenderer';
import { WorkflowSection } from '../components/WorkflowSection';
import { WorkflowActionData } from '../components/WorkflowActionDialog';
import { EditProvider, useEditContext } from '../contexts/EditContext';
import { EditModeToolbar } from '../components/EditModeToolbar';

interface ObjectDetailScreenProps {
  route: any;
  navigation: any;
}

interface TabItem {
  key: string;
  title: string;
  node: any;
}

// Extract tabs from layout structure
const extractTabs = (layout: any): TabItem[] => {
  if (!layout?.children) return [];

  // Check if root children are panels (tabs at top level)
  const topLevelPanels = layout.children.filter(
    (c: any) => c.datatype === 'layout' && (c.fieldtype === 'panel' || c.fieldtype === 'tabpanel')
  );

  if (topLevelPanels.length > 1) {
    return topLevelPanels.map((c: any, idx: number) => ({
      key: `${c.name || 'tab'}-${idx}`,
      title: c.title || c.name || `Tab ${idx + 1}`,
      node: c,
    }));
  }

  // Look for tabpanel container
  for (const child of layout.children) {
    if (child.datatype === 'layout' && child.fieldtype === 'tabpanel' && child.children?.length > 0) {
      return child.children
        .filter((c: any) => c.title || c.name)
        .map((c: any, idx: number) => ({
          key: `${c.name || 'tab'}-${idx}`,
          title: c.title || c.name || `Tab ${idx + 1}`,
          node: c,
        }));
    }

    // Look for region with multiple children (tabs)
    if (child.datatype === 'layout' && child.fieldtype === 'region' && child.children?.length > 1) {
      return child.children
        .filter((c: any) => c.title || c.name)
        .map((c: any, idx: number) => ({
          key: `${c.name || 'tab'}-${idx}`,
          title: c.title || c.name || `Tab ${idx + 1}`,
          node: c,
        }));
    }

    // Recursively check children
    const nestedTabs = extractTabs(child);
    if (nestedTabs.length > 0) return nestedTabs;
  }

  return [];
};

// Inner component that uses EditContext
function ObjectDetailScreenInner({ route, navigation }: ObjectDetailScreenProps) {
  const { object: initialObject } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [objectData, setObjectData] = useState<any>(null);
  const [layout, setLayout] = useState<any>(null);
  const [fieldCollectionLayouts, setFieldCollectionLayouts] = useState<any>({});
  const [objectBrickLayouts, setObjectBrickLayouts] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [activeMenuSection, setActiveMenuSection] = useState<'info' | 'permissions' | 'workflows' | 'action-form' | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);

  // Edit context
  const {
    isEditing,
    startEditing,
    stopEditing,
    isDirty,
    isSaving,
    setSaving,
    formData,
    setFieldValue,
    getFieldValue,
    errors,
    getModifiedData,
  } = useEditContext();

  // State for workflow action form (within menu modal)
  const [pendingAction, setPendingAction] = useState<{
    type: 'transition' | 'global';
    workflow: WorkflowItem;
    action: WorkflowTransition | WorkflowGlobalAction;
    notes: WorkflowNotes;
    title: string;
  } | null>(null);
  const [actionFormData, setActionFormData] = useState<{
    comment: string;
    additionalFields: Record<string, any>;
  }>({ comment: '', additionalFields: {} });

  // Use fetched data or fall back to initial object
  const object = objectData || initialObject;

  // Start editing - initialize form with current object data
  const handleStartEditing = useCallback(() => {
    if (objectData?.objectData) {
      startEditing(objectData.objectData);
    }
  }, [objectData, startEditing]);

  // Set up header right button with edit toggle
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
          {!isEditing && object?.type !== 'folder' && (
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
  }, [navigation, isEditing, object, handleStartEditing]);

  const loadData = async () => {
    try {
      setError(null);
      const [fullObject, objectLayout, fcLayouts, obLayouts] = await Promise.all([
        PimcoreService.getDataObjectFull(initialObject.id),
        PimcoreService.getDataObjectLayout(initialObject.id),
        PimcoreService.getFieldCollectionLayouts(initialObject.id),
        PimcoreService.getObjectBrickLayouts(initialObject.id),
      ]);
      setObjectData(fullObject);
      setLayout(objectLayout);
      setFieldCollectionLayouts(fcLayouts || {});
      setObjectBrickLayouts(obLayouts || {});

      // Load workflow details if available
      if (fullObject?.hasWorkflowAvailable) {
        const workflowDetails = await PimcoreService.getWorkflowDetails(
          initialObject.id,
          'data-object'
        );
        if (workflowDetails?.items) {
          setWorkflows(workflowDetails.items);
        }
      } else {
        setWorkflows([]);
      }
    } catch (err) {
      console.error('Error loading object data:', err);
      setError('Fehler beim Laden der Objektdaten');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Save changes
  const handleSave = async (task: 'save' | 'publish') => {
    if (!isDirty) return;

    setSaving(true);
    setError(null);
    try {
      const modifiedData = getModifiedData();
      console.log('Saving modified data:', modifiedData);

      // Call API to save data
      await PimcoreService.saveDataObject(initialObject.id, modifiedData, { task });

      // Reload data after save
      await loadData();
      stopEditing();
    } catch (err: any) {
      console.error('Error saving:', err);
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    stopEditing();
  };

  // Check if action requires dialog (has comment or additional fields)
  const actionRequiresDialog = (notes: WorkflowNotes): boolean => {
    return !!(notes.commentEnabled || (notes.additionalFields && notes.additionalFields.length > 0));
  };

  const handleWorkflowTransition = async (workflow: WorkflowItem, transition: WorkflowTransition) => {
    const notes = transition.notes || {};

    // If action requires input, show form in menu
    if (actionRequiresDialog(notes)) {
      setPendingAction({
        type: 'transition',
        workflow,
        action: transition,
        notes,
        title: transition.label,
      });
      // Initialize form data
      const initialFields: Record<string, any> = {};
      notes.additionalFields?.forEach((field) => {
        initialFields[field.name] = field.fieldType === 'checkbox' ? false : '';
      });
      setActionFormData({
        comment: notes.commentPrefill || '',
        additionalFields: initialFields,
      });
      setActiveMenuSection('action-form');
      return;
    }

    // Otherwise execute directly
    await executeWorkflowAction('transition', workflow, transition.name);
  };

  const handleWorkflowGlobalAction = async (workflow: WorkflowItem, action: WorkflowGlobalAction) => {
    const notes = action.notes || {};

    // If action requires input, show form in menu
    if (actionRequiresDialog(notes)) {
      setPendingAction({
        type: 'global',
        workflow,
        action,
        notes,
        title: action.label,
      });
      // Initialize form data
      const initialFields: Record<string, any> = {};
      notes.additionalFields?.forEach((field) => {
        initialFields[field.name] = field.fieldType === 'checkbox' ? false : '';
      });
      setActionFormData({
        comment: notes.commentPrefill || '',
        additionalFields: initialFields,
      });
      setActiveMenuSection('action-form');
      return;
    }

    // Otherwise execute directly (use action.name as transitionId)
    await executeWorkflowAction('global', workflow, action.name);
  };

  // Execute workflow action with optional collected data
  const executeWorkflowAction = async (
    actionType: 'transition' | 'global',
    workflow: WorkflowItem,
    transitionId: string,
    actionData?: WorkflowActionData
  ) => {
    setWorkflowActionLoading(true);
    try {
      // Build workflow options from action data
      // Structure: { notes: "comment", additional: { fieldName: value, ... } }
      const workflowOptions: Record<string, any> = {};

      if (actionData) {
        if (actionData.comment) {
          workflowOptions.notes = actionData.comment;
        }
        if (actionData.additionalFields && Object.keys(actionData.additionalFields).length > 0) {
          workflowOptions.additional = actionData.additionalFields;
        }
      }

      await PimcoreService.triggerWorkflowAction({
        actionType,
        elementId: initialObject.id,
        elementType: 'data-object',
        workflowId: workflow.workflowName,
        transitionId,
        workflowOptions: Object.keys(workflowOptions).length > 0 ? workflowOptions : undefined,
      });

      setMenuModalVisible(false);
      setActiveMenuSection(null);
      setPendingAction(null);
      await loadData();
    } catch (error) {
      console.error('Error executing workflow action:', error);
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  // Handle action form submission
  const handleActionFormSubmit = async () => {
    if (!pendingAction) return;

    const { type, workflow, action, notes } = pendingAction;

    // Validate required fields
    if (notes.commentRequired && !actionFormData.comment.trim()) {
      return; // TODO: Show error
    }

    const data: WorkflowActionData = {
      comment: notes.commentEnabled ? actionFormData.comment : undefined,
      additionalFields: actionFormData.additionalFields,
    };

    // Use action.name as transitionId for both transition and global actions
    const transitionId = type === 'transition'
      ? (action as WorkflowTransition).name
      : (action as WorkflowGlobalAction).name;

    await executeWorkflowAction(type, workflow, transitionId, data);
  };

  // Handle back from action form to workflows
  const handleActionFormBack = () => {
    setActiveMenuSection('workflows');
    setPendingAction(null);
  };

  // Navigate to Properties screen
  const handlePropertiesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Properties', {
      elementType: 'data-object',
      elementId: initialObject.id,
      elementName: object.key || object.filename || 'Object',
    });
  };

  // Navigate to Notes screen
  const handleNotesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Notes', {
      elementType: 'data-object',
      elementId: initialObject.id,
      elementName: object.key || object.filename || 'Object',
    });
  };

  // Navigate to Dependencies screen
  const handleDependenciesOpen = () => {
    setMenuModalVisible(false);
    navigation.navigate('Dependencies', {
      elementType: 'data-object',
      elementId: initialObject.id,
      elementName: object.key || object.filename || 'Object',
    });
  };

  // Update form field value
  const updateFormField = (name: string, value: any) => {
    setActionFormData((prev) => ({
      ...prev,
      additionalFields: { ...prev.additionalFields, [name]: value },
    }));
  };

  useEffect(() => {
    loadData();
  }, [initialObject.id]);

  // Extract tabs from layout
  const tabs = useMemo(() => {
    if (!layout) return [];
    console.log('Layout structure:', JSON.stringify(layout, null, 2));
    const extractedTabs = extractTabs(layout);
    console.log('Extracted tabs:', extractedTabs.map(t => t.title));
    return extractedTabs;
  }, [layout]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString('de-DE');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Lade Objektdaten...</Text>
      </View>
    );
  }

  const hasTabs = tabs.length > 1;

  return (
    <View style={styles.container}>
      {/* Sticky Header Area */}
      <View style={styles.stickyHeader}>
        {/* Object Header */}
        <Surface style={styles.headerCard} elevation={2}>
          <LinearGradient
            colors={object.type === 'folder' ? ['#FFB300', '#FF6F00'] : ['#2196F3', '#1565C0']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons
                  name={object.type === 'folder' ? 'folder' : 'cube'}
                  size={36}
                  color="#fff"
                />
              </View>
              <View style={styles.headerText}>
                <Title style={styles.headerTitle} numberOfLines={1}>
                  {object.key || object.filename}
                </Title>
                <View style={styles.headerMeta}>
                  <Paragraph style={styles.headerSubtitle}>
                    {object.className || 'Data Object'}
                  </Paragraph>
                  <Chip
                    icon={object.published ? 'check-circle' : 'clock-outline'}
                    style={[
                      styles.statusChip,
                      object.published ? styles.publishedChip : styles.draftChip,
                    ]}
                    textStyle={styles.statusChipText}
                    compact
                  >
                    {object.published ? 'Published' : 'Draft'}
                  </Chip>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Surface>

        {/* Sticky Tab Bar */}
        {hasTabs && (
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tabs.map((tab, index) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(index)}
                  style={[styles.tab, activeTab === index && styles.tabActive]}
                >
                  <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                    {tab.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Edit Mode Toolbar */}
      {isEditing && (
        <EditModeToolbar
          onSave={handleSave}
          onDiscard={handleDiscard}
          canEdit={object?.type !== 'folder'}
        />
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Error Message */}
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <View style={styles.errorContent}>
                <MaterialCommunityIcons name="alert-circle" size={24} color="#f44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Workflow Section */}
        {workflows.length > 0 && (
          <WorkflowSection workflows={workflows} />
        )}

        {/* Object Data - Tab Content or Full Layout */}
        {objectData?.objectData && layout && (
          <Card style={styles.card}>
            <Card.Content>
              {hasTabs ? (
                // Render active tab content
                <LayoutNodeRenderer
                  node={tabs[activeTab].node}
                  objectData={isEditing ? formData : objectData.objectData}
                  level={0}
                  skipWrapper
                  fieldCollectionLayouts={fieldCollectionLayouts}
                  objectBrickLayouts={objectBrickLayouts}
                  isEditing={isEditing}
                  onFieldChange={setFieldValue}
                  errors={errors}
                />
              ) : (
                // Render full layout if no tabs
                <>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="form-textbox" size={24} color="#6200ee" />
                    <Title style={styles.sectionTitle}>Objektdaten</Title>
                  </View>
                  {layout.children?.map((child: any, index: number) => (
                    <LayoutNodeRenderer
                      key={`${child.name}-${index}`}
                      node={child}
                      objectData={isEditing ? formData : objectData.objectData}
                      level={0}
                      fieldCollectionLayouts={fieldCollectionLayouts}
                      objectBrickLayouts={objectBrickLayouts}
                      isEditing={isEditing}
                      onFieldChange={setFieldValue}
                      errors={errors}
                    />
                  ))}
                </>
              )}
            </Card.Content>
          </Card>
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
                {/* Menu Header */}
                <View style={styles.modalHeader}>
                  <Title style={styles.modalTitle}>
                    {activeMenuSection === 'info' ? 'Objektinformationen' :
                     activeMenuSection === 'permissions' ? 'Berechtigungen' :
                     activeMenuSection === 'workflows' ? 'Workflow Aktionen' :
                     activeMenuSection === 'action-form' ? pendingAction?.title || 'Aktion' : 'Menü'}
                  </Title>
                  <TouchableOpacity
                    onPress={() => {
                      if (activeMenuSection === 'action-form') {
                        handleActionFormBack();
                      } else if (activeMenuSection) {
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

                {/* Menu Content */}
                {!activeMenuSection ? (
                  // Menu Items
                  <View style={styles.menuItems}>
                    {workflows.length > 0 && (
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setActiveMenuSection('workflows')}
                      >
                        <MaterialCommunityIcons name="state-machine" size={24} color="#6200ee" />
                        <Text style={styles.menuItemText}>Workflow Aktionen</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => setActiveMenuSection('info')}
                    >
                      <MaterialCommunityIcons name="information-outline" size={24} color="#6200ee" />
                      <Text style={styles.menuItemText}>Objektinformationen</Text>
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
                  </View>
                ) : activeMenuSection === 'workflows' ? (
                  // Workflow Actions Content
                  <ScrollView style={styles.modalContent}>
                    {workflowActionLoading ? (
                      <View style={styles.workflowLoading}>
                        <ActivityIndicator size="large" color="#6200ee" />
                        <Text style={styles.workflowLoadingText}>Aktion wird ausgeführt...</Text>
                      </View>
                    ) : (
                      workflows.map((workflow, wfIndex) => (
                        <View key={`wf-${wfIndex}`} style={styles.workflowActionSection}>
                          <Text style={styles.workflowActionTitle}>{workflow.workflowLabel}</Text>

                          {/* All Actions (Transitions + Global) */}
                          <View style={styles.workflowActionGroup}>
                            {/* Transitions */}
                            {workflow.allowedTransitions?.map((transition, tIndex) => (
                              <TouchableOpacity
                                key={`t-${tIndex}`}
                                style={styles.workflowActionButton}
                                onPress={() => handleWorkflowTransition(workflow, transition)}
                              >
                                <MaterialCommunityIcons name="play-circle-outline" size={22} color="#fff" />
                                <Text style={styles.workflowActionButtonText}>{transition.label}</Text>
                              </TouchableOpacity>
                            ))}

                            {/* Global Actions */}
                            {workflow.globalActions?.map((action, aIndex) => (
                              <TouchableOpacity
                                key={`a-${aIndex}`}
                                style={styles.workflowActionButton}
                                onPress={() => handleWorkflowGlobalAction(workflow, action)}
                              >
                                <MaterialCommunityIcons name="play-circle-outline" size={22} color="#fff" />
                                <Text style={styles.workflowActionButtonText}>{action.label}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                ) : activeMenuSection === 'action-form' && pendingAction ? (
                  // Action Form Content
                  <ScrollView style={styles.modalContent}>
                    {workflowActionLoading ? (
                      <View style={styles.workflowLoading}>
                        <ActivityIndicator size="large" color="#6200ee" />
                        <Text style={styles.workflowLoadingText}>Aktion wird ausgeführt...</Text>
                      </View>
                    ) : (
                      <View style={styles.actionFormContainer}>
                        {/* Comment Field */}
                        {pendingAction.notes.commentEnabled && (
                          <View style={styles.actionFormField}>
                            <Text style={styles.actionFormLabel}>
                              Kommentar
                              {pendingAction.notes.commentRequired && <Text style={styles.required}> *</Text>}
                            </Text>
                            <TextInput
                              mode="outlined"
                              value={actionFormData.comment}
                              onChangeText={(text) => setActionFormData((prev) => ({ ...prev, comment: text }))}
                              multiline
                              numberOfLines={4}
                              placeholder="Kommentar eingeben..."
                              style={styles.actionFormTextArea}
                            />
                          </View>
                        )}

                        {/* Additional Fields */}
                        {pendingAction.notes.additionalFields?.map((field) => (
                          <View key={field.name} style={styles.actionFormField}>
                            <Text style={styles.actionFormLabel}>
                              {field.title}
                              {field.required && <Text style={styles.required}> *</Text>}
                            </Text>
                            {field.fieldType === 'textarea' ? (
                              <TextInput
                                mode="outlined"
                                value={actionFormData.additionalFields[field.name] || ''}
                                onChangeText={(text) => updateFormField(field.name, text)}
                                multiline
                                numberOfLines={4}
                                style={styles.actionFormTextArea}
                              />
                            ) : field.fieldType === 'numeric' ? (
                              <TextInput
                                mode="outlined"
                                value={actionFormData.additionalFields[field.name] || ''}
                                onChangeText={(text) => updateFormField(field.name, text.replace(/[^0-9.-]/g, ''))}
                                keyboardType="numeric"
                                style={styles.actionFormInput}
                              />
                            ) : (
                              <TextInput
                                mode="outlined"
                                value={actionFormData.additionalFields[field.name] || ''}
                                onChangeText={(text) => updateFormField(field.name, text)}
                                style={styles.actionFormInput}
                              />
                            )}
                          </View>
                        ))}

                        {/* Submit Button */}
                        <Button
                          mode="contained"
                          onPress={handleActionFormSubmit}
                          loading={workflowActionLoading}
                          disabled={workflowActionLoading}
                          icon="check"
                          style={styles.actionFormSubmitButton}
                        >
                          Ausführen
                        </Button>
                      </View>
                    )}
                  </ScrollView>
                ) : activeMenuSection === 'info' ? (
                  // Info Content
                  <ScrollView style={styles.modalContent}>
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="#6200ee" />
                        <Text style={styles.modalSectionTitle}>Allgemein</Text>
                      </View>

                      <View style={styles.modalInfoRow}>
                        <MaterialCommunityIcons name="pound" size={18} color="#6200ee" />
                        <Text style={styles.modalInfoLabel}>ID</Text>
                        <Text style={styles.modalInfoValue}>{object.id?.toString()}</Text>
                      </View>

                      <View style={styles.modalInfoRow}>
                        <MaterialCommunityIcons name="tag-outline" size={18} color="#6200ee" />
                        <Text style={styles.modalInfoLabel}>Typ</Text>
                        <Text style={styles.modalInfoValue}>{object.type}</Text>
                      </View>

                      <View style={styles.modalInfoRow}>
                        <MaterialCommunityIcons name="folder-open-outline" size={18} color="#6200ee" />
                        <Text style={styles.modalInfoLabel}>Pfad</Text>
                        <Text style={styles.modalInfoValue} numberOfLines={2}>
                          {object.fullPath || object.path}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#6200ee" />
                        <Text style={styles.modalSectionTitle}>Metadaten</Text>
                      </View>

                      {object.creationDate && (
                        <View style={styles.modalInfoRow}>
                          <MaterialCommunityIcons name="calendar-plus" size={18} color="#4caf50" />
                          <Text style={styles.modalInfoLabel}>Erstellt</Text>
                          <Text style={styles.modalInfoValue}>{formatDate(object.creationDate)}</Text>
                        </View>
                      )}

                      {object.modificationDate && (
                        <View style={styles.modalInfoRow}>
                          <MaterialCommunityIcons name="calendar-edit" size={18} color="#ff9800" />
                          <Text style={styles.modalInfoLabel}>Geändert</Text>
                          <Text style={styles.modalInfoValue}>{formatDate(object.modificationDate)}</Text>
                        </View>
                      )}

                      {object.userOwner !== undefined && (
                        <View style={styles.modalInfoRow}>
                          <MaterialCommunityIcons name="account-outline" size={18} color="#2196f3" />
                          <Text style={styles.modalInfoLabel}>Eigentümer</Text>
                          <Text style={styles.modalInfoValue}>User #{object.userOwner}</Text>
                        </View>
                      )}

                      {object.userModification !== undefined && (
                        <View style={styles.modalInfoRow}>
                          <MaterialCommunityIcons name="account-edit-outline" size={18} color="#9c27b0" />
                          <Text style={styles.modalInfoLabel}>Letzte Änderung</Text>
                          <Text style={styles.modalInfoValue}>User #{object.userModification}</Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                ) : activeMenuSection === 'permissions' ? (
                  // Permissions Content
                  <ScrollView style={styles.modalContent}>
                    {object.permissions ? (
                      <View style={styles.permissionsGrid}>
                        {Object.entries(object.permissions).map(([key, value]) => {
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
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },
  errorCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#ffebee',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 12,
    color: '#f44336',
    fontSize: 15,
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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    padding: 8,
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItemFull: {
    width: '100%',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
  },
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
  noPermissionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
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
  // Workflow styles
  workflowLoading: {
    padding: 40,
    alignItems: 'center',
  },
  workflowLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  workflowActionSection: {
    marginBottom: 20,
  },
  workflowActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  workflowActionGroup: {
    marginBottom: 16,
  },
  workflowActionGroupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  workflowActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
  },
  workflowActionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Action Form Styles
  actionFormContainer: {
    paddingBottom: 16,
  },
  actionFormField: {
    marginBottom: 20,
  },
  actionFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  actionFormInput: {
    backgroundColor: '#fff',
  },
  actionFormTextArea: {
    backgroundColor: '#fff',
    minHeight: 100,
  },
  actionFormSubmitButton: {
    marginTop: 8,
  },
});

// Wrapper component that provides EditContext
export default function ObjectDetailScreen(props: ObjectDetailScreenProps) {
  return (
    <EditProvider>
      <ObjectDetailScreenInner {...props} />
    </EditProvider>
  );
}
