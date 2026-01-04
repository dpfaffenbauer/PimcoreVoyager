/**
 * Instance Store
 * Manages multiple Pimcore instances (Multi-Tenant)
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { PimcoreInstance } from '../types/instance';

const INSTANCES_KEY = 'pimcore_instances';
const ACTIVE_INSTANCE_KEY = 'active_instance_id';

// Helper to generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

interface InstanceStore {
  instances: PimcoreInstance[];
  activeInstance: PimcoreInstance | null;
  isLoading: boolean;
  
  // Actions
  loadInstances: () => Promise<void>;
  addInstance: (instance: Omit<PimcoreInstance, 'id' | 'createdAt'>) => Promise<void>;
  updateInstance: (id: string, updates: Partial<PimcoreInstance>) => Promise<void>;
  deleteInstance: (id: string) => Promise<void>;
  setActiveInstance: (instanceId: string) => Promise<void>;
  getActiveInstanceUrl: () => string;
}

export const useInstanceStore = create<InstanceStore>((set, get) => ({
  instances: [],
  activeInstance: null,
  isLoading: false,

  loadInstances: async () => {
    set({ isLoading: true });
    try {
      const instancesStr = await SecureStore.getItemAsync(INSTANCES_KEY);
      const activeIdStr = await SecureStore.getItemAsync(ACTIVE_INSTANCE_KEY);

      if (instancesStr) {
        const instances: PimcoreInstance[] = JSON.parse(instancesStr);
        set({ instances });

        if (activeIdStr && instances.length > 0) {
          const active = instances.find((i) => i.id === activeIdStr);
          if (active) {
            set({ activeInstance: active });
          } else {
            // If active instance not found, use first instance
            set({ activeInstance: instances[0] });
          }
        } else if (instances.length > 0) {
          // No active instance set, use first one
          set({ activeInstance: instances[0] });
        }
      }
    } catch (error) {
      // Error loading instances
    } finally {
      set({ isLoading: false });
    }
  },

  addInstance: async (instanceData) => {
    try {
      const newInstance: PimcoreInstance = {
        ...instanceData,
        id: generateId(),
        createdAt: Date.now(),
      };

      const instances = [...get().instances, newInstance];
      await SecureStore.setItemAsync(INSTANCES_KEY, JSON.stringify(instances));
      set({ instances });

      // If this is the first instance, make it active
      if (instances.length === 1) {
        await get().setActiveInstance(newInstance.id);
      }
    } catch (error) {
      throw error;
    }
  },

  updateInstance: async (id, updates) => {
    try {
      const instances = get().instances.map((inst) =>
        inst.id === id ? { ...inst, ...updates } : inst
      );
      await SecureStore.setItemAsync(INSTANCES_KEY, JSON.stringify(instances));
      set({ instances });

      // Update active instance if it's the one being updated
      if (get().activeInstance?.id === id) {
        const updatedActive = instances.find((i) => i.id === id);
        if (updatedActive) {
          set({ activeInstance: updatedActive });
        }
      }
    } catch (error) {
      throw error;
    }
  },

  deleteInstance: async (id) => {
    try {
      const instances = get().instances.filter((inst) => inst.id !== id);
      await SecureStore.setItemAsync(INSTANCES_KEY, JSON.stringify(instances));
      set({ instances });

      // If deleted instance was active, switch to another
      if (get().activeInstance?.id === id) {
        if (instances.length > 0) {
          await get().setActiveInstance(instances[0].id);
        } else {
          set({ activeInstance: null });
          await SecureStore.deleteItemAsync(ACTIVE_INSTANCE_KEY);
        }
      }
    } catch (error) {
      throw error;
    }
  },

  setActiveInstance: async (instanceId) => {
    try {
      const instance = get().instances.find((i) => i.id === instanceId);
      if (instance) {
        await SecureStore.setItemAsync(ACTIVE_INSTANCE_KEY, instanceId);
        set({ activeInstance: instance });
      }
    } catch (error) {
      console.error('Error setting active instance:', error);
      throw error;
    }
  },

  getActiveInstanceUrl: () => {
    return get().activeInstance?.url || '';
  },
}));
