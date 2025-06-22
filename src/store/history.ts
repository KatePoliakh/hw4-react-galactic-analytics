import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { HistoryItem } from '../utils/apiTypes';

interface HistoryState {
  items: HistoryItem[];
  addItem: (item: Omit<HistoryItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: Date.now().toString() }]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'analytics-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
);