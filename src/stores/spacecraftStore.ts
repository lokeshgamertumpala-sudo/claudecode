import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SpacecraftComponent, SpacecraftConfig, Vector3, ComponentType, ComponentDimensions } from '@/types';
import { COMPONENT_DEFAULTS } from '@/constants';
import { v4 as uuidv4 } from 'uuid';

interface SpacecraftState {
  currentConfig: SpacecraftConfig | null;
  selectedComponentId: string | null;
  isEditing: boolean;
  components: SpacecraftComponent[];
  history: SpacecraftComponent[][];
  historyIndex: number;

  createNewSpacecraft: (name: string, description: string) => void;
  loadSpacecraft: (config: SpacecraftConfig) => void;
  addComponent: (type: ComponentType, position?: Vector3) => string;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<SpacecraftComponent>) => void;
  selectComponent: (id: string | null) => void;
  setEditing: (editing: boolean) => void;
  undo: () => void;
  redo: () => void;
  resetToDefaults: () => void;
  duplicateComponent: (id: string) => string | null;
  getTotalMass: () => number;
  getTotalPowerConsumption: () => number;
  getTotalPowerGeneration: () => number;
}

const defaultComponents = (): SpacecraftComponent[] => [
  {
    id: uuidv4(),
    name: 'Main Bus',
    type: 'main_body',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: COMPONENT_DEFAULTS.main_body.typicalDimensions,
    mass: 150,
    powerConsumption: 50,
    visible: true,
    metadata: { isPrimary: true },
  },
  {
    id: uuidv4(),
    name: 'Solar Array Port',
    type: 'solar_panel',
    position: { x: -3, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: COMPONENT_DEFAULTS.solar_panel.typicalDimensions,
    mass: 25,
    powerConsumption: -400,
    visible: true,
    metadata: { deploymentAngle: 0, isDeployed: true },
  },
  {
    id: uuidv4(),
    name: 'Solar Array Starboard',
    type: 'solar_panel',
    position: { x: 3, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: COMPONENT_DEFAULTS.solar_panel.typicalDimensions,
    mass: 25,
    powerConsumption: -400,
    visible: true,
    metadata: { deploymentAngle: 0, isDeployed: true },
  },
  {
    id: uuidv4(),
    name: 'High Gain Antenna',
    type: 'communication_dish',
    position: { x: 0, y: 1.2, z: 1.5 },
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: COMPONENT_DEFAULTS.communication_dish.typicalDimensions,
    mass: 15,
    powerConsumption: 150,
    visible: true,
    metadata: { diameter: 1.2, frequency: 'Ka-band' },
  },
  {
    id: uuidv4(),
    name: 'Star Tracker',
    type: 'star_tracker',
    position: { x: 0.5, y: 0.8, z: 0.5 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: COMPONENT_DEFAULTS.star_tracker.typicalDimensions,
    mass: 2.5,
    powerConsumption: 8,
    visible: true,
    metadata: { accuracy: 0.001 },
  },
  {
    id: uuidv4(),
    name: 'Reaction Wheel Assembly',
    type: 'reaction_wheel',
    position: { x: 0, y: -0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: COMPONENT_DEFAULTS.reaction_wheel.typicalDimensions,
    mass: 5,
    powerConsumption: 50,
    visible: true,
    metadata: { momentumCapacity: 50 },
  },
];

export const useSpacecraftStore = create<SpacecraftState>()(
  persist(
    (set, get) => ({
      currentConfig: null,
      selectedComponentId: null,
      isEditing: false,
      components: [],
      history: [],
      historyIndex: -1,

      createNewSpacecraft: (name: string, description: string) => {
        const components = defaultComponents();
        const config: SpacecraftConfig = {
          id: uuidv4(),
          name,
          description,
          components,
          totalMass: components.reduce((sum, c) => sum + c.mass, 0),
          totalPowerConsumption: components.reduce((sum, c) => sum + c.powerConsumption, 0),
          totalPowerGeneration: components.filter(c => c.powerConsumption < 0).reduce((sum, c) => sum - c.powerConsumption, 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({
          currentConfig: config,
          components,
          selectedComponentId: components[0].id,
          history: [components],
          historyIndex: 0,
        });
      },

      loadSpacecraft: (config: SpacecraftConfig) => {
        set({
          currentConfig: config,
          components: config.components,
          selectedComponentId: config.components[0]?.id || null,
          history: [config.components],
          historyIndex: 0,
        });
      },

      addComponent: (type: ComponentType, position = { x: 0, y: 0, z: 0 }) => {
        const defaults = COMPONENT_DEFAULTS[type];
        const newComponent: SpacecraftComponent = {
          id: uuidv4(),
          name: `${type.replace('_', ' ')} ${Date.now()}`,
          type,
          position,
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: defaults?.typicalDimensions || { width: 1, height: 1, depth: 1 },
          mass: defaults ? calculateMass(type, defaults.typicalDimensions) : 10,
          powerConsumption: defaults?.powerDensity || 0,
          visible: true,
          metadata: {},
        };

        const newComponents = [...get().components, newComponent];
        const newHistory = get().history.slice(0, get().historyIndex + 1);
        newHistory.push(newComponents);

        set({
          components: newComponents,
          currentConfig: get().currentConfig ? {
            ...get().currentConfig!,
            components: newComponents,
            updatedAt: new Date().toISOString(),
          } : null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });

        return newComponent.id;
      },

      removeComponent: (id: string) => {
        const newComponents = get().components.filter(c => c.id !== id);
        const newHistory = get().history.slice(0, get().historyIndex + 1);
        newHistory.push(newComponents);

        set({
          components: newComponents,
          selectedComponentId: get().selectedComponentId === id ? newComponents[0]?.id || null : get().selectedComponentId,
          currentConfig: get().currentConfig ? {
            ...get().currentConfig!,
            components: newComponents,
            updatedAt: new Date().toISOString(),
          } : null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      updateComponent: (id: string, updates: Partial<SpacecraftComponent>) => {
        const newComponents = get().components.map(c =>
          c.id === id ? { ...c, ...updates } : c
        );

        if (get().isEditing) {
          set({
            components: newComponents,
            currentConfig: get().currentConfig ? {
              ...get().currentConfig!,
              components: newComponents,
              updatedAt: new Date().toISOString(),
            } : null,
          });
        } else {
          const newHistory = get().history.slice(0, get().historyIndex + 1);
          newHistory.push(newComponents);
          set({
            components: newComponents,
            currentConfig: get().currentConfig ? {
              ...get().currentConfig!,
              components: newComponents,
              updatedAt: new Date().toISOString(),
            } : null,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          });
        }
      },

      selectComponent: (id: string | null) => {
        set({ selectedComponentId: id });
      },

      setEditing: (editing: boolean) => {
        set({ isEditing: editing });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({
            components: history[newIndex],
            historyIndex: newIndex,
            currentConfig: get().currentConfig ? {
              ...get().currentConfig!,
              components: history[newIndex],
              updatedAt: new Date().toISOString(),
            } : null,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({
            components: history[newIndex],
            historyIndex: newIndex,
            currentConfig: get().currentConfig ? {
              ...get().currentConfig!,
              components: history[newIndex],
              updatedAt: new Date().toISOString(),
            } : null,
          });
        }
      },

      resetToDefaults: () => {
        const components = defaultComponents();
        const newHistory = get().history.slice(0, get().historyIndex + 1);
        newHistory.push(components);
        set({
          components,
          selectedComponentId: components[0].id,
          currentConfig: get().currentConfig ? {
            ...get().currentConfig!,
            components,
            updatedAt: new Date().toISOString(),
          } : null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      duplicateComponent: (id: string) => {
        const component = get().components.find(c => c.id === id);
        if (!component) return null;

        const newComponent: SpacecraftComponent = {
          ...component,
          id: uuidv4(),
          name: `${component.name} (Copy)`,
          position: {
            x: component.position.x + 0.5,
            y: component.position.y,
            z: component.position.z + 0.5,
          },
        };

        const newComponents = [...get().components, newComponent];
        const newHistory = get().history.slice(0, get().historyIndex + 1);
        newHistory.push(newComponents);

        set({
          components: newComponents,
          currentConfig: get().currentConfig ? {
            ...get().currentConfig!,
            components: newComponents,
            updatedAt: new Date().toISOString(),
          } : null,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });

        return newComponent.id;
      },

      getTotalMass: () => {
        return get().components.reduce((sum, c) => sum + c.mass, 0);
      },

      getTotalPowerConsumption: () => {
        return get().components
          .filter(c => c.powerConsumption > 0)
          .reduce((sum, c) => sum + c.powerConsumption, 0);
      },

      getTotalPowerGeneration: () => {
        return get().components
          .filter(c => c.powerConsumption < 0)
          .reduce((sum, c) => sum - c.powerConsumption, 0);
      },
    }),
    {
      name: 'orbitforge-spacecraft',
      partialize: (state) => ({
        currentConfig: state.currentConfig,
        components: state.components,
      }),
    }
  )
);

function calculateMass(type: string, dimensions: ComponentDimensions): number {
  const defaults = COMPONENT_DEFAULTS[type];
  const density = defaults?.density || 2700;
  const volume = dimensions.width * dimensions.height * dimensions.depth;
  return volume * density;
}