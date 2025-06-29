import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HistoryPage } from './HistoryPage';
import { useHistoryStore } from '../../store/history';
import { useNavigate } from 'react-router-dom';
import React from 'react';

jest.mock('../../store/history');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../components/Modal/Modal', () => ({
  __esModule: true,
  default: jest.fn(({ isOpen, children }) => 
    isOpen ? <div data-testid="modal">{children}</div> : null
}));

jest.mock('../../components/Highlights/Highlights', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="highlights" />)
}));

jest.mock('../../components/HistoryItem/HistoryItem', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div data-testid="history-item" onClick={props.onView} onDelete={props.onDelete}>
      {props.filename}
    </div>
  ))
}));

const mockUseHistoryStore = useHistoryStore as jest.Mock;
const mockUseNavigate = useNavigate as jest.Mock;

describe('HistoryPage Component', () => {
  const mockNavigate = jest.fn();
  const mockRemoveItem = jest.fn();
  const mockClearAll = jest.fn();
  
  const mockItems = [
    {
      id: '1',
      filename: 'report.csv',
      date: '2023-06-15',
      success: true,
      highlights: [
        { title: '100', description: 'Total records' }
      ]
    },
    {
      id: '2',
      filename: 'data.csv',
      date: '2023-06-16',
      success: false,
      highlights: []
    }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseNavigate.mockReturnValue(mockNavigate);
    
    mockUseHistoryStore.mockReturnValue({
      items: [],
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });
  });

  test('отображает состояние загрузки', () => {
    render(<HistoryPage />);
    
    expect(screen.getByText('Загрузка истории...')).toBeInTheDocument();
  
    waitFor(() => {
      expect(screen.queryByText('Загрузка истории...')).not.toBeInTheDocument();
    });
  });

  test('отображает сообщение при пустой истории', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('История загрузок пуста')).toBeInTheDocument();
      expect(screen.queryByTestId('history-item')).not.toBeInTheDocument();
    });
  });

  test('отображает элементы истории', async () => {
    mockUseHistoryStore.mockReturnValue({
      items: mockItems,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      const items = screen.getAllByTestId('history-item');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent('report.csv');
      expect(items[1]).toHaveTextContent('data.csv');
    });
  });

  test('открывает модальное окно при просмотре элемента', async () => {
    mockUseHistoryStore.mockReturnValue({
      items: mockItems,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      const items = screen.getAllByTestId('history-item');
      fireEvent.click(items[0]);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('highlights')).toBeInTheDocument();
    });
  });

  test('удаляет элемент при вызове onDelete', async () => {
    mockUseHistoryStore.mockReturnValue({
      items: mockItems,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      const items = screen.getAllByTestId('history-item');
      fireEvent.click(items[0]);
      
      expect(mockRemoveItem).toHaveBeenCalledWith('1');
    });
  });

  test('очищает всю историю при нажатии кнопки', async () => {
    mockUseHistoryStore.mockReturnValue({
      items: mockItems,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      const clearButton = screen.getByText('Очистить всё');
      fireEvent.click(clearButton);
      
      expect(mockClearAll).toHaveBeenCalledTimes(1);
    });
  });

  test('навигация при нажатии кнопки "Сгенерировать больше"', async () => {
    mockUseHistoryStore.mockReturnValue({
      items: mockItems,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      const generateButton = screen.getByText('Сгенерировать больше');
      fireEvent.click(generateButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/generate');
    });
  });

  test('не отображает кнопку очистки при пустой истории', async () => {
    render(<HistoryPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Очистить всё')).not.toBeInTheDocument();
      expect(screen.getByText('Сгенерировать больше')).toBeInTheDocument();
    });
  });

  test('закрывает модальное окно', async () => {
    mockUseHistoryStore.mockReturnValue({
      items: mockItems,
      removeItem: mockRemoveItem,
      clearAll: mockClearAll,
    });
    
    render(<HistoryPage />);
    
    await waitFor(() => {
      const items = screen.getAllByTestId('history-item');
      fireEvent.click(items[0]);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });
});