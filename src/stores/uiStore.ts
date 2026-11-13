import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, SketchUpload, AIAnalysisResult } from '@/types';

interface UIState {
  activeTab: string;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  settings: AppSettings;
  sketchUpload: SketchUpload | null;
  aiAnalysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  notifications: Notification[];
  loadingStates: Record<string, boolean>;
  modalOpen: string | null;
  modalData: Record<string, unknown>;

  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setSketchUpload: (upload: SketchUpload | null) => void;
  setAIAnalysis: (analysis: AIAnalysisResult | null) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (key: string, loading: boolean) => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  units: 'metric',
  simulationSpeed: 100,
  cameraSensitivity: 1,
  showOrbitPath: true,
  showEarth: true,
  showStars: true,
  autoSave: true,
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      activeTab: 'dashboard',
      sidebarOpen: true,
      rightPanelOpen: true,
      settings: defaultSettings,
      sketchUpload: null,
      aiAnalysis: null,
      isAnalyzing: false,
      analysisError: null,
      notifications: [],
      loadingStates: {},
      modalOpen: null,
      modalData: {},

      setActiveTab: (tab: string) => {
        set({ activeTab: tab });
      },

      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen });
      },

      toggleRightPanel: () => {
        set({ rightPanelOpen: !get().rightPanelOpen });
      },

      updateSettings: (settings: Partial<AppSettings>) => {
        set({ settings: { ...get().settings, ...settings } });
      },

      setSketchUpload: (upload: SketchUpload | null) => {
        set({ sketchUpload: upload, aiAnalysis: null, analysisError: null });
      },

      setAIAnalysis: (analysis: AIAnalysisResult | null) => {
        set({ aiAnalysis: analysis, isAnalyzing: false });
      },

      setAnalyzing: (analyzing: boolean) => {
        set({ isAnalyzing: analyzing });
      },

      setAnalysisError: (error: string | null) => {
        set({ analysisError: error, isAnalyzing: false });
      },

      addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          duration: notification.duration ?? 5000,
        };
        set({ notifications: [...get().notifications, newNotification] });

        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set({ notifications: get().notifications.filter(n => n.id !== id) });
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      setLoading: (key: string, loading: boolean) => {
        set({ loadingStates: { ...get().loadingStates, [key]: loading } });
      },

      openModal: (modalId: string, data = {}) => {
        set({ modalOpen: modalId, modalData: data });
      },

      closeModal: () => {
        set({ modalOpen: null, modalData: {} });
      },
    }),
    {
      name: 'orbitforge-ui',
      partialize: (state) => ({
        settings: state.settings,
        sidebarOpen: state.sidebarOpen,
        rightPanelOpen: state.rightPanelOpen,
      }),
    }
  )
);