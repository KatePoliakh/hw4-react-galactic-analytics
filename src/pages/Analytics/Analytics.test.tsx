import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsPage } from './AnalyticsPage';
import { useAnalyticsStore } from '../../store/analytics';
import { useHistoryStore } from '../../store/history';
import { analyzeCSV } from '../../utils/api';
import React from 'react';

jest.mock('../../store/analytics');
jest.mock('../../store/history');
jest.mock('../../utils/api');
jest.mock('../../components/FileUploader/FileUploader', () => ({
  FileLoader: jest.fn(({ onFileSelect }) => (
    <div data-testid="file-loader">
      <button onClick={() => onFileSelect(new File(['content'], 'test.csv'))}>
        Simulate File Upload
      </button>
    </div>
  ))
}));

jest.mock('../../components/Highlights/Highlights', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="highlights-mock" />)
}));

const mockUseAnalyticsStore = useAnalyticsStore as jest.Mock;
const mockUseHistoryStore = useHistoryStore as jest.Mock;
const mockAnalyzeCSV = analyzeCSV as jest.Mock;

describe('AnalyticsPage Component', () => {
  const mockSetFile = jest.fn();
  const mockSetHighlights = jest.fn();
  const mockStartLoading = jest.fn();
  const mockSetError = jest.fn();
  const mockReset = jest.fn();
  const mockSetIsProcessed = jest.fn();
  const mockAddItem = jest.fn();

  const defaultAnalyticsState = {
    file: null,
    isLoading: false,
    isProcessed: false,
    error: null,
    setFile: mockSetFile,
    setHighlights: mockSetHighlights,
    startLoading: mockStartLoading,
    setError: mockSetError,
    reset: mockReset,
    setIsProcessed: mockSetIsProcessed
  };
  
  const defaultHistoryState = {
    addItem: mockAddItem
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
   
    mockUseAnalyticsStore.mockReturnValue(defaultAnalyticsState);
    mockUseHistoryStore.mockReturnValue(defaultHistoryState);
    
    mockAnalyzeCSV.mockResolvedValue({
      total_spend_galactic: 1000000,
      rows_affected: 5000,
      less_spent_at: 120,
      big_spent_at: 300,
      big_spent_value: 50000,
      average_spend_galactic: 2000,
      big_spent_civ: 'Monsters',
      less_spent_civ: 'Humans'
    });
  });

  test('отображает начальное состояние', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText(/Загрузите csv файл/i)).toBeInTheDocument();
    expect(screen.getByTestId('file-loader')).toBeInTheDocument();
    expect(screen.getByText('Отправить')).toBeInTheDocument();
    expect(screen.getByText(/Здесь появятся хайлайты/i)).toBeInTheDocument();
  });

  test('обрабатывает загрузку файла', () => {
    render(<AnalyticsPage />);
    
    const uploadButton = screen.getByText('Simulate File Upload');
    fireEvent.click(uploadButton);
    
    expect(mockSetFile).toHaveBeenCalledWith(expect.any(File));
    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  test('показывает ошибку при загрузке не CSV файла', () => {
    jest.mock('../../components/FileUploader/FileUploader', () => ({
      FileLoader: jest.fn(({ onFileSelect }) => (
        <div data-testid="file-loader">
          <button onClick={() => onFileSelect(new File(['content'], 'test.txt'))}>
            Upload Non-CSV
          </button>
        </div>
      ))
    }));
    
    render(<AnalyticsPage />);
    
    const uploadButton = screen.getByText('Upload Non-CSV');
    fireEvent.click(uploadButton);
    
    expect(mockSetFile).not.toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalledWith('Пожалуйста, загрузите CSV файл');
  });

  test('отправляет файл при нажатии кнопки "Отправить"', async () => {
    render(<AnalyticsPage />);
    
    const uploadButton = screen.getByText('Simulate File Upload');
    fireEvent.click(uploadButton);
    
    const submitButton = screen.getByText('Отправить');
    fireEvent.click(submitButton);
    
    expect(mockStartLoading).toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalledWith(null);
    expect(mockSetHighlights).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(mockAnalyzeCSV).toHaveBeenCalledWith(expect.any(File));
      expect(mockSetIsProcessed).toHaveBeenCalledWith(true);
      expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({
        filename: 'test.csv',
        success: true
      }));
    });
  });

  test('обрабатывает ошибку при анализе файла', async () => {
    mockAnalyzeCSV.mockRejectedValue(new Error('Server error'));
    
    render(<AnalyticsPage />);
    
    const uploadButton = screen.getByText('Simulate File Upload');
    fireEvent.click(uploadButton);
    
    const submitButton = screen.getByText('Отправить');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Server error');
      expect(mockUseAnalyticsStore).toHaveBeenCalledWith('Server error');
      expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({
        filename: 'test.csv',
        success: false
      }));
    });
  });

  test('очищает состояние при вызове handleClear', () => {
    mockUseAnalyticsStore.mockReturnValue({
      ...defaultAnalyticsState,
      file: new File(['content'], 'test.csv')
    });
    
    render(<AnalyticsPage />);
    
    const fileLoader = screen.getByTestId('file-loader');
    fireEvent.click(fileLoader); 
    
    expect(mockReset).toHaveBeenCalled();
    expect(mockSetError).toHaveBeenCalledWith(null);
    expect(mockSetIsProcessed).toHaveBeenCalledWith(false);
  });

  test('отображает хайлайты после успешной обработки', async () => {
    render(<AnalyticsPage />);
    
    const uploadButton = screen.getByText('Simulate File Upload');
    fireEvent.click(uploadButton);
    
    const submitButton = screen.getByText('Отправить');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const highlightsComponent = screen.getByTestId('highlights-mock');
      expect(highlightsComponent).toBeInTheDocument();
    });
  });

  test('форматирует числа и даты правильно', () => {
    expect(AnalyticsPage.prototype.formatNumber(1000000)).toBe('1,000,000');
    expect(AnalyticsPage.prototype.dayOfYearToDate(120)).toBe('30 апреля');
  });
});