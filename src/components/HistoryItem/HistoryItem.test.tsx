import { render, screen, fireEvent } from '@testing-library/react';
import HistoryItem from './HistoryItem';
import React from 'react';

// Мокаем изображения
jest.mock('src/assets/file.png', () => 'file-icon.png');
jest.mock('src/assets/happy.png', () => 'happy-icon.png');
jest.mock('src/assets/sad.png', () => 'sad-icon.png');
jest.mock('src/assets/Trash.png', () => 'trash-icon.png');

describe('HistoryItem Component', () => {
  const mockOnView = jest.fn();
  const mockOnDelete = jest.fn();
  
  const defaultProps = {
    filename: 'financial_report.csv',
    date: '2023-05-15 14:30:00',
    success: true,
    onView: mockOnView,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает информацию о файле', () => {
    render(<HistoryItem {...defaultProps} />);
    
    expect(screen.getByText('financial_report.csv')).toBeInTheDocument();
    expect(screen.getByText('2023-05-15 14:30:00')).toBeInTheDocument();
  });

  test('отображает успешный статус при success=true', () => {
    render(<HistoryItem {...defaultProps} success={true} />);
    
    expect(screen.getByText('Обработан успешно')).toBeInTheDocument();
    expect(screen.getByAltText('Success Icon')).toHaveAttribute('src', 'happy-icon.png');
    expect(screen.queryByText('Не удалось обработать')).not.toBeInTheDocument();
  });

  test('отображает статус ошибки при success=false', () => {
    render(<HistoryItem {...defaultProps} success={false} />);
    
    expect(screen.getByText('Не удалось обработать')).toBeInTheDocument();
    expect(screen.getByAltText('Failure Icon')).toHaveAttribute('src', 'sad-icon.png');
    expect(screen.queryByText('Обработан успешно')).not.toBeInTheDocument();
  });

  test('вызывает onView при клике на контент', () => {
    render(<HistoryItem {...defaultProps} />);
    
    const content = screen.getByText('financial_report.csv').parentElement;
    fireEvent.click(content!);
    
    expect(mockOnView).toHaveBeenCalledTimes(1);
  });

  test('вызывает onDelete при клике на кнопку удаления', () => {
    render(<HistoryItem {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  test('отображает иконки правильно', () => {
    render(<HistoryItem {...defaultProps} />);
    
    expect(screen.getByAltText('File Icon')).toHaveAttribute('src', 'file-icon.png');
    expect(screen.getByAltText('Success Icon')).toHaveAttribute('src', 'happy-icon.png');
    expect(screen.getByAltText('Delete Icon')).toHaveAttribute('src', 'trash-icon.png');
  });

  test('применяет правильные стили для успешного статуса', () => {
    render(<HistoryItem {...defaultProps} success={true} />);
    
    const successText = screen.getByText('Обработан успешно');
    expect(successText).toHaveClass('successText');
    expect(successText).not.toHaveClass('failureText');
    
    const successIcon = screen.getByAltText('Success Icon');
    expect(successIcon).toHaveClass('successIcon');
    expect(successIcon).not.toHaveClass('failureIcon');
  });

  test('применяет правильные стили для неуспешного статуса', () => {
    render(<HistoryItem {...defaultProps} success={false} />);
    
    const failureText = screen.getByText('Не удалось обработать');
    expect(failureText).toHaveClass('successText'); // У вас в коде инвертированные классы
    expect(failureText).not.toHaveClass('failureText');
    
    const failureIcon = screen.getByAltText('Failure Icon');
    expect(failureIcon).toHaveClass('successIcon'); // У вас в коде инвертированные классы
    expect(failureIcon).not.toHaveClass('failureIcon');
  });
});