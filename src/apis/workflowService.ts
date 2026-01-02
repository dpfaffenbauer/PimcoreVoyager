/**
 * Workflow Service
 * Handles all workflow related API calls
 */

import { getApiClient } from './apiClient';

// Workflow Types
export interface WorkflowStatus {
  color: string;
  colorInverted: boolean;
  title: string;
  label: string;
  layoutId?: string;
  visibleInDetail?: boolean;
}

// Additional field types for workflow actions
export type WorkflowAdditionalFieldType =
  | 'input'
  | 'numeric'
  | 'textarea'
  | 'select'
  | 'datetime'
  | 'date'
  | 'user'
  | 'checkbox';

export interface WorkflowSelectOption {
  key: string;
  value: string;
}

export interface WorkflowAdditionalField {
  name: string;
  title: string;
  fieldType: WorkflowAdditionalFieldType;
  required?: boolean;
  setterFn?: string;
  fieldTypeSettings?: {
    options?: WorkflowSelectOption[];
    [key: string]: any;
  };
}

export interface WorkflowNotes {
  commentEnabled?: boolean;
  commentRequired?: boolean;
  commentPrefill?: string;
  type?: string;
  title?: string;
  additionalFields?: WorkflowAdditionalField[];
}

export interface WorkflowTransition {
  name: string;
  label: string;
  iconCls: string;
  objectLayout: string | boolean;
  unsavedChangesBehaviour: string;
  notes: WorkflowNotes;
}

export interface WorkflowGlobalAction {
  name: string;
  label: string;
  iconCls: string;
  objectLayout: boolean;
  notes: WorkflowNotes;
}

export interface WorkflowItem {
  workflowName: string;
  workflowLabel: string;
  workflowStatus: WorkflowStatus[];
  graph: string;
  layoutId?: string;
  allowedTransitions: WorkflowTransition[];
  globalActions: WorkflowGlobalAction[];
  additionalAttributes: any[];
}

export interface WorkflowDetails {
  items: WorkflowItem[];
  layoutId?: string;
}

export interface WorkflowActionResponse {
  workflowName: string;
  actionName: string;
  actionType: string;
}

export class WorkflowService {
  /**
   * Get workflow details for an element
   * Endpoint: GET /pimcore-studio/api/workflows/details
   */
  static async getWorkflowDetails(
    elementId: number,
    elementType: 'data-object' | 'asset' | 'document' = 'data-object'
  ): Promise<WorkflowDetails | null> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get('/workflows/details', {
        params: {
          elementId,
          elementType,
        },
      });
      console.log('Workflow details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching workflow details:', error);
      return null;
    }
  }

  /**
   * Trigger a workflow action (transition or global action)
   * Endpoint: POST /pimcore-studio/api/workflows/action
   * Note: API always uses transitionId for both transitions and global actions
   */
  static async triggerWorkflowAction(params: {
    actionType: 'transition' | 'global';
    elementId: number;
    elementType: 'data-object' | 'asset' | 'document';
    workflowId: string;
    transitionId: string;
    workflowOptions?: Record<string, any>;
  }): Promise<WorkflowActionResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.post('/workflows/action', {
        actionType: params.actionType,
        elementId: params.elementId,
        elementType: params.elementType,
        workflowId: params.workflowId,
        transitionId: params.transitionId,
        workflowOptions: params.workflowOptions || {},
      });
      console.log('Workflow action response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error triggering workflow action:', error);
      throw error;
    }
  }
}
