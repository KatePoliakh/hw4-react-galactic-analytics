import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Modal from './Modal';

beforeAll(() => {
  const modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
});

afterAll(() => {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    document.body.removeChild(modalRoot);
  }
});

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    children: <div data-testid="modal-content">Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = '';
  });

  test('не рендерится когда isOpen=false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  test('рендерится в портале когда isOpen=true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(document.getElementById('modal-root')).toContainElement(
      screen.getByTestId('modal-content')
    );
  });

  test('блокирует прокрутку body при открытии', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('восстанавливает прокрутку body после закрытия', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });

  test('вызывает onClose при клике на оверлей', () => {
    render(<Modal {...defaultProps} />);
    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('вызывает onClose при клике на кнопку закрытия', () => {
    render(<Modal {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('не вызывает onClose при клике на контент', () => {
    render(<Modal {...defaultProps} />);
    const content = screen.getByTestId('modal-content');
    fireEvent.click(content);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('вызывает onClose при нажатии Escape', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('не вызывает onClose при нажатии других клавиш', () => {
    render(<Modal {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('удаляет обработчики событий при размонтировании', () => {
    const { unmount } = render(<Modal {...defaultProps} />);
    unmount();
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).not.toHaveBeenCalled();
    
    expect(document.body.style.overflow).toBe('unset');
  });

  test('отображает переданные children', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });
});