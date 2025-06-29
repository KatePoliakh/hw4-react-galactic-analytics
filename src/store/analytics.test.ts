import { act } from '@testing-library/react';
import { useAnalyticsStore } from './analytics';

describe('analyticsStore', () => {
  beforeEach(() => {
    useAnalyticsStore.getState().reset();
  });

  test('имеет правильное начальное состояние', () => {
    const state = useAnalyticsStore.getState();
    
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.highlights).toEqual([]);
    expect(state.file).toBeNull();
    expect(state.isProcessed).toBe(false);
  });

  test('обновляет файл с помощью setFile', () => {
    const file = new File(['content'], 'test.csv');
    
    act(() => {
      useAnalyticsStore.getState().setFile(file);
    });
    
    const state = useAnalyticsStore.getState();
    expect(state.file).toBe(file);
  });

  test('сбрасывает состояние с помощью reset', () => {
    const file = new File(['content'], 'test.csv');
    
    act(() => {
      useAnalyticsStore.getState().setFile(file);
      useAnalyticsStore.getState().setHighlights([{ title: 'Test', description: 'Value' }]);
      useAnalyticsStore.getState().setError('Error');
      useAnalyticsStore.getState().startLoading();
      useAnalyticsStore.getState().reset();
    });
    
    const state = useAnalyticsStore.getState();
    expect(state.file).toBeNull();
    expect(state.highlights).toEqual([]);
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
    // reset не должен сбрасывать isProcessed
    expect(state.isProcessed).toBe(false);
  });

  test('запускает загрузку с помощью startLoading', () => {
    act(() => {
      useAnalyticsStore.getState().setError('Previous error');
      useAnalyticsStore.getState().startLoading();
    });
    
    const state = useAnalyticsStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('устанавливает ошибку с помощью setError', () => {
    act(() => {
      useAnalyticsStore.getState().startLoading();
      useAnalyticsStore.getState().setError('Test error');
    });
    
    const state = useAnalyticsStore.getState();
    expect(state.error).toBe('Test error');
    expect(state.isLoading).toBe(false);
  });

  test('устанавливает хайлайты с помощью setHighlights', () => {
    const highlights = [
      { title: '42', description: 'Answer' },
      { title: '100', description: 'Percent' }
    ];
    
    act(() => {
      useAnalyticsStore.getState().startLoading();
      useAnalyticsStore.getState().setHighlights(highlights);
    });
    
    const state = useAnalyticsStore.getState();
    expect(state.highlights).toEqual(highlights);
    expect(state.isLoading).toBe(false);
  });

  test('устанавливает флаг обработки с помощью setIsProcessed', () => {
    act(() => {
      useAnalyticsStore.getState().setIsProcessed();
    });
    
    const state = useAnalyticsStore.getState();
    expect(state.isProcessed).toBe(true);
  });

  test('сохраняет isProcessed при сбросе', () => {
    act(() => {
      useAnalyticsStore.getState().setIsProcessed();
      useAnalyticsStore.getState().reset();
    });
    
    const state = useAnalyticsStore.getState();
    expect(state.isProcessed).toBe(true);
  });

  test('независимые обновления состояния', () => {
    // Устанавливаем файл
    act(() => {
      useAnalyticsStore.getState().setFile(new File([''], 'test.csv'));
    });
    
    // Устанавливаем ошибку в другом "действии"
    act(() => {
      useAnalyticsStore.getState().setError('File error');
    });
    
    const state = useAnalyticsStore.getState();
    expect(state.file?.name).toBe('test.csv');
    expect(state.error).toBe('File error');
  });
});