import { act } from '@testing-library/react';
import { HistoryItem } from '../utils/apiTypes';
import { useHistoryStore } from './history';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('historyStore', () => {
  const createTestItem = (): Omit<HistoryItem, 'id'> => ({
    filename: `file-${Date.now()}.csv`,
    date: new Date().toLocaleDateString('ru-RU'),
    success: Math.random() > 0.5,
    highlights: [
      { title: `value-${Date.now()}`, description: `desc-${Date.now()}` }
    ]
  });

  beforeEach(() => {
    useHistoryStore.getState().clearAll();
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('имеет правильное начальное состояние', () => {
    const state = useHistoryStore.getState();
    expect(state.items).toEqual([]);
  });

  test('добавляет элементы с уникальными ID', () => {
    const item1 = createTestItem();
    const item2 = createTestItem();
    
    act(() => {
      useHistoryStore.getState().addItem(item1);
      useHistoryStore.getState().addItem(item2);
    });
    
    const state = useHistoryStore.getState();
    expect(state.items).toHaveLength(2);
    
    const ids = state.items.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
    
    expect(state.items[0]).toMatchObject({
      ...item1,
      id: expect.any(String)
    });
  });

  test('удаляет элементы по ID', () => {
    const item1 = createTestItem();
    const item2 = createTestItem();
    
    act(() => {
      useHistoryStore.getState().addItem(item1);
      useHistoryStore.getState().addItem(item2);
    });
    
    const firstId = useHistoryStore.getState().items[0].id;
    
    act(() => {
      useHistoryStore.getState().removeItem(firstId);
    });
    
    const state = useHistoryStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).not.toBe(firstId);
  });

  test('полностью очищает хранилище', () => {
    act(() => {
      useHistoryStore.getState().addItem(createTestItem());
      useHistoryStore.getState().addItem(createTestItem());
      useHistoryStore.getState().clearAll();
    });
    
    const state = useHistoryStore.getState();
    expect(state.items).toEqual([]);
  });

  test('сохраняет состояние в localStorage', () => {
    const item = createTestItem();
    
    act(() => {
      useHistoryStore.getState().addItem(item);
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'analytics-history',
      expect.any(String)
    );
    
    const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(savedData.state.items).toHaveLength(1);
    expect(savedData.state.items[0]).toMatchObject({
      ...item,
      id: expect.any(String)
    });
  });

  test('восстанавливает состояние из localStorage', () => {
    const testItems = [
      { ...createTestItem(), id: 'id1' },
      { ...createTestItem(), id: 'id2' }
    ];
    
    localStorage.setItem('analytics-history', JSON.stringify({
      state: {
        items: testItems
      },
      version: 0
    }));
    
    const store = useHistoryStore;
    
    const state = store.getState();
    expect(state.items).toEqual(testItems);
  });

  test('корректно обрабатывает неверные данные в localStorage', () => {
    localStorage.setItem('analytics-history', 'invalid-json');
    
    const store = useHistoryStore;
    
    const state = store.getState();
    expect(state.items).toEqual([]);
  });

  test('сохраняет состояние после каждого изменения', () => {
    const item1 = createTestItem();
    const item2 = createTestItem();
    
    act(() => {
      useHistoryStore.getState().addItem(item1);
    });
    
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  
    act(() => {
      useHistoryStore.getState().addItem(item2);
    });
    
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    
    const firstId = useHistoryStore.getState().items[0].id;
    act(() => {
      useHistoryStore.getState().removeItem(firstId);
    });
    
    expect(localStorage.setItem).toHaveBeenCalledTimes(3);
    
    act(() => {
      useHistoryStore.getState().clearAll();
    });
    
    expect(localStorage.setItem).toHaveBeenCalledTimes(4);
    
  });
});