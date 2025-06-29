import { render, screen } from '@testing-library/react';
import React from 'react';
import { Highlights } from './Highlights'; 
import { HIGHLIGHT_TITLES } from '../../constants/highlights';
import { HighlightItem } from './Highlights'; 

describe('Highlights Component', () => {
  const mockItems: HighlightItem[] = Object.entries(HIGHLIGHT_TITLES).map(([key, value]) => ({
    title: key,
    description: value
  }));

  test('рендерит все переданные элементы с правильными заголовками', () => {
    render(<Highlights items={mockItems} />);
    
    Object.values(HIGHLIGHT_TITLES).forEach(description => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
    
    Object.keys(HIGHLIGHT_TITLES).forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  test('отображает правильное количество элементов', () => {
    render(<Highlights items={mockItems} />);
    
    const titles = screen.getAllByText(new RegExp(Object.keys(HIGHLIGHT_TITLES).join('|')));
    expect(titles).toHaveLength(Object.keys(HIGHLIGHT_TITLES).length);
  });

  test('корректно отображает конкретные значения из словаря', () => {
    render(<Highlights items={mockItems} />);
    
    expect(screen.getByText('total_spend_galactic')).toBeInTheDocument();
    expect(screen.getByText('общие расходы в галактических кредитах')).toBeInTheDocument();
    
    expect(screen.getByText('big_spent_civ')).toBeInTheDocument();
    expect(screen.getByText('цивилизация с максимальными расходами')).toBeInTheDocument();
  });

  test('сохраняет порядок элементов согласно переданному массиву', () => {
    const customItems: HighlightItem[] = [
      { title: 'first', description: 'Первый элемент' },
      { title: 'second', description: 'Второй элемент' },
      { title: 'third', description: 'Третий элемент' },
    ];
    
    render(<Highlights items={customItems} />);
    
    const titles = screen.getAllByText(/first|second|third/);
    expect(titles[0]).toHaveTextContent('first');
    expect(titles[1]).toHaveTextContent('second');
    expect(titles[2]).toHaveTextContent('third');
  });

  test('использует модальные стили, когда isModalStyle=true', () => {
    const { container } = render(<Highlights items={mockItems} isModalStyle={true} />);
    
    expect(container.firstChild).toHaveAttribute('data-is-modal', 'true');
  });
});