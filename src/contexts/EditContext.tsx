/**
 * EditContext - Manages form state for editing data objects
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface EditContextValue {
  // State
  isEditing: boolean;
  formData: Record<string, any>;
  originalData: Record<string, any>;
  modifiedFields: Set<string>;
  errors: Record<string, string>;
  isDirty: boolean;
  isSaving: boolean;

  // Actions
  startEditing: (initialData: Record<string, any>) => void;
  stopEditing: () => void;
  setFieldValue: (fieldName: string, value: any) => void;
  setFieldError: (fieldName: string, error: string | null) => void;
  getFieldValue: (fieldName: string) => any;
  resetForm: () => void;
  getModifiedData: () => Record<string, any>;
  setSaving: (saving: boolean) => void;
  clearErrors: () => void;
  setErrors: (errors: Record<string, string>) => void;
}

const EditContext = createContext<EditContextValue | null>(null);

interface EditProviderProps {
  children: ReactNode;
}

export const EditProvider: React.FC<EditProviderProps> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [originalData, setOriginalData] = useState<Record<string, any>>({});
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(() => modifiedFields.size > 0, [modifiedFields]);

  const startEditing = useCallback((initialData: Record<string, any>) => {
    setOriginalData(initialData);
    setFormData({ ...initialData });
    setModifiedFields(new Set());
    setErrors({});
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setFormData({});
    setOriginalData({});
    setModifiedFields(new Set());
    setErrors({});
  }, []);

  const setFieldValue = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    // Track if field has been modified from original
    setModifiedFields(prev => {
      const newSet = new Set(prev);
      const originalValue = originalData[fieldName];

      // Compare values - simple equality check
      // For complex objects, we mark as modified if touched
      if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
        newSet.add(fieldName);
      } else {
        newSet.delete(fieldName);
      }

      return newSet;
    });

    // Clear error when field is modified
    setErrors(prev => {
      if (prev[fieldName]) {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, [originalData]);

  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setErrors(prev => {
      if (error === null) {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fieldName]: error };
    });
  }, []);

  const getFieldValue = useCallback((fieldName: string) => {
    return formData[fieldName];
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({ ...originalData });
    setModifiedFields(new Set());
    setErrors({});
  }, [originalData]);

  const getModifiedData = useCallback(() => {
    const modified: Record<string, any> = {};
    modifiedFields.forEach(fieldName => {
      modified[fieldName] = formData[fieldName];
    });
    return modified;
  }, [formData, modifiedFields]);

  const setSaving = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setErrorsBatch = useCallback((newErrors: Record<string, string>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  const value = useMemo<EditContextValue>(() => ({
    isEditing,
    formData,
    originalData,
    modifiedFields,
    errors,
    isDirty,
    isSaving,
    startEditing,
    stopEditing,
    setFieldValue,
    setFieldError,
    getFieldValue,
    resetForm,
    getModifiedData,
    setSaving,
    clearErrors,
    setErrors: setErrorsBatch,
  }), [
    isEditing,
    formData,
    originalData,
    modifiedFields,
    errors,
    isDirty,
    isSaving,
    startEditing,
    stopEditing,
    setFieldValue,
    setFieldError,
    getFieldValue,
    resetForm,
    getModifiedData,
    setSaving,
    clearErrors,
    setErrorsBatch,
  ]);

  return (
    <EditContext.Provider value={value}>
      {children}
    </EditContext.Provider>
  );
};

export const useEditContext = (): EditContextValue => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditContext must be used within an EditProvider');
  }
  return context;
};

// Optional hook that doesn't throw if outside provider (for view-only components)
export const useOptionalEditContext = (): EditContextValue | null => {
  return useContext(EditContext);
};
