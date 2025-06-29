import { render, screen, fireEvent } from '@testing-library/react';
import { FileLoader } from './FileUploader';
import React from 'react';

describe('FileLoader Component', () => {
  const mockOnDragStart = jest.fn();
  const mockOnDragEnter = jest.fn();
  const mockOnDragLeave = jest.fn();
  const mockOnDrop = jest.fn();
  const mockOnFileSelect = jest.fn();
  const mockOnClear = jest.fn();

  const defaultProps = {
    file: null,
    error: null,
    isProcessing: false,
    isProcessed: false,
    isDragging: false,
    onDragStart: mockOnDragStart,
    onDragEnter: mockOnDragEnter,
    onDragLeave: mockOnDragLeave,
    onDrop: mockOnDrop,
    onFileSelect: mockOnFileSelect,
    onClear: mockOnClear,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('рендерит кнопку загрузки и скрытый input', () => {
    render(<FileLoader {...defaultProps} />);

    expect(screen.getByText(/Загрузить файл/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/или перетащите сюда/i)).toBeInTheDocument();

    const input = screen.getByTestId('file-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('file');
    expect(input.style.display).toBe('none');
  });

  test('клик по кнопке "Загрузить файл" вызывает click у input', () => {
    render(<FileLoader {...defaultProps} />);

    const button = screen.getByText(/Загрузить файл/i);
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    fireEvent.click(button);
    const file = new File(['content'], 'test.csv');
    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });

  test('отображает информацию о загруженном файле', () => {
    const file = new File([''], 'example.csv');

    render(
      <FileLoader
        {...defaultProps}
        file={file}
        isProcessed={true}
      />
    );

    expect(screen.getByText(file.name)).toBeInTheDocument();
    expect(screen.getByText(/готово!/i)).toBeInTheDocument();
  });

  test('отображает сообщение об ошибке при наличии error', () => {
    render(
      <FileLoader
        {...defaultProps}
        file={new File([''], 'error.csv')}
        error="Ошибка формата"
      />
    );

    expect(screen.getByText(/упс, не то.../i)).toBeInTheDocument();
  });

  test('отображает индикатор парсинга при isProcessing = true', () => {
    render(<FileLoader {...defaultProps} isProcessing={true} />);

    expect(screen.getByText(/идёт парсинг файла/i)).toBeInTheDocument();
    expect(screen.getByTestId('loading-circle')).toBeInTheDocument();
  });

  test('клик по кнопке удаления вызывает onClear', () => {
    render(
      <FileLoader
        {...defaultProps}
        file={new File([''], 'delete-me.csv')}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /удалить/i });
    fireEvent.click(deleteButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  test('вызывает onDrag события при перетаскивании файла', () => {
    render(<FileLoader {...defaultProps} />);
    const dropZone = screen.getByTestId('drop-zone');

    fireEvent.dragOver(dropZone);
    fireEvent.dragEnter(dropZone);
    fireEvent.dragLeave(dropZone);
    fireEvent.drop(dropZone);

    expect(mockOnDragStart).toHaveBeenCalled();
    expect(mockOnDragEnter).toHaveBeenCalled();
    expect(mockOnDragLeave).toHaveBeenCalled();
    expect(mockOnDrop).toHaveBeenCalled();
  });

  test('применяет класс dragging при isDragging = true', () => {
    const { container } = render(<FileLoader {...defaultProps} isDragging={true} />);
    const rootDiv = container.firstChild as HTMLElement;

    expect(rootDiv).toHaveClass('dragging');
  });

  test('применяет класс error при наличии error', () => {
    const { container } = render(<FileLoader {...defaultProps} error="Ошибка" />);
    const rootDiv = container.firstChild as HTMLElement;

    expect(rootDiv).toHaveClass('error');
  });
});