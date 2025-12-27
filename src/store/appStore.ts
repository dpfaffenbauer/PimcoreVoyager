/**
 * App Store
 * Manages general app state
 */

import { create } from 'zustand';
import { PimcoreClassDefinition } from '../types/pimcore';

interface AppStore {
  classDefinitions: PimcoreClassDefinition[];
  setClassDefinitions: (definitions: PimcoreClassDefinition[]) => void;
  selectedClass: PimcoreClassDefinition | null;
  setSelectedClass: (classDefinition: PimcoreClassDefinition | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  classDefinitions: [],
  setClassDefinitions: (definitions) => set({ classDefinitions: definitions }),
  selectedClass: null,
  setSelectedClass: (classDefinition) => set({ selectedClass: classDefinition }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
