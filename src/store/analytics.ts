import { create } from 'zustand';
import type { HighlightItem } from '../utils/apiTypes';

interface AnalyticsState {
  isLoading: boolean;
  error: string | null;
  highlights: HighlightItem[];
  file: File | null;
  setFile: (file: File | null) => void;
  startLoading: () => void;
  setError: (error: string | null) => void;
  setHighlights: (highlights: HighlightItem[]) => void;
  reset: () => void;
  isProcessed: boolean;
  setIsProcessed: (isProcessed: boolean) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  isLoading: false,
  error: null,
  highlights: [],
  file: null,
  isProcessed: false,
  setFile: (file) => set({ file }),
  startLoading: () => set({ isLoading: true, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  setHighlights: (highlights) => set({ highlights, isLoading: false }),
  reset: () => set({
    isLoading: false,
    error: null,
    highlights: [],
    file: null
  }),
  setIsProcessed: () => set({ isProcessed: true }),
}));