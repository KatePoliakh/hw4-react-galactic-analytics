import { render, screen, fireEvent, act } from '@testing-library/react';
import { generateCSV } from '../../utils/api';
import { useHistoryStore } from '../../store/history';
import React from 'react';
import { GeneratorPage } from './GeneratorPage';

jest.mock('../../utils/api', () => ({
  generateCSV: jest.fn(),
}));

jest.mock('../../store/history', () => ({
  useHistoryStore: jest.fn(),
}));

global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('GeneratorPage Component', () => {
  const mockGenerateCSV = generateCSV as jest.Mock;
  const mockAddItem = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    (useHistoryStore as jest.Mock).mockReturnValue({
      addItem: mockAddItem,
    });
  
    mockGenerateCSV.mockResolvedValue(new Blob(['test'], { type: 'text/csv' }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('отображает начальное состояние', () => {
    render(<GeneratorPage />);
    
    expect(screen.getByText(/Сгенерируйте готовый csv-файл/i)).toBeInTheDocument();
    expect(screen.getByText('Начать генерацию')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  test('начинает генерацию при клике на кнопку', () => {
    render(<GeneratorPage />);
    
    fireEvent.click(screen.getByText('Начать генерацию'));
    
    expect(screen.getByText(/идёт процесс генерации/i)).toBeInTheDocument();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('показывает прогресс генерации', async () => {
    render(<GeneratorPage />);
    
    fireEvent.click(screen.getByText('Начать генерацию'));
    
    expect(screen.getByText(/идёт процесс генерации/i)).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(screen.getByText(/идёт процесс генерации/i)).toBeInTheDocument();
  });

  test('успешно завершает генерацию и скачивает файл', async () => {
    render(<GeneratorPage />);
    
    fireEvent.click(screen.getByText('Начать генерацию'));
    
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    
    expect(screen.getByText('Done!')).toBeInTheDocument();
    expect(screen.getByText('файл сгенерирован!')).toBeInTheDocument();
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    
    expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({
      filename: expect.stringContaining('generated_data_'),
      success: true,
    }));
  });

  test('обрабатывает ошибку генерации', async () => {
    mockGenerateCSV.mockRejectedValue(new Error('Generation failed'));
    
    render(<GeneratorPage />);
    
    fireEvent.click(screen.getByText('Начать генерацию'));
    
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    
    expect(screen.getByText('упс, не то...')).toBeInTheDocument();
    expect(screen.getByText('Ошибка')).toBeInTheDocument();
    
    expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
  });

  test('сбрасывает уведомление при клике на кнопку закрытия', async () => {
    render(<GeneratorPage />);
    
    fireEvent.click(screen.getByText('Начать генерацию'));
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Done!')).not.toBeInTheDocument();
    expect(screen.queryByText('упс, не то...')).not.toBeInTheDocument();
  });

  test('отображает правильный текст при ошибке', async () => {
    mockGenerateCSV.mockRejectedValue(new Error('Test error'));
    
    render(<GeneratorPage />);
    fireEvent.click(screen.getByText('Начать генерацию'));
    
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    
    expect(screen.getByText('упс, не то...')).toBeInTheDocument();
    expect(screen.getByText('Ошибка')).toBeInTheDocument();
    expect(screen.queryByText('файл сгенерирован!')).not.toBeInTheDocument();
  });

  test('не отображает индикатор после завершения генерации', async () => {
    render(<GeneratorPage />);
    
    fireEvent.click(screen.getByText('Начать генерацию'));
  
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });
});