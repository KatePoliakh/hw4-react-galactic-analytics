import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';
import React from 'react';

const mockUseLocation = useLocation as jest.Mock;

describe('Header Component', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('рендерит логотип и заголовок', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'src/assets/logo.png');
    expect(screen.getByText('МЕЖГАЛАКТИЧЕСКАЯ АНАЛИТИКА')).toBeInTheDocument();
  });

  test('отображает все навигационные ссылки', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('CSV Аналитик')).toBeInTheDocument();
    expect(screen.getByText('CSV Генератор')).toBeInTheDocument();
    expect(screen.getByText('История')).toBeInTheDocument();
  });

  test('показывает активную ссылку для главной страницы', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    const analystLink = screen.getByText('CSV Аналитик');
    expect(analystLink.parentElement).toHaveClass('nav');
  });

  test('показывает активную ссылку для страницы генератора', () => {
    mockUseLocation.mockReturnValue({ pathname: '/generate' });
    
    render(
      <MemoryRouter initialEntries={['/generate']}>
        <Header />
      </MemoryRouter>
    );

    const generatorLink = screen.getByText('CSV Генератор');
    expect(generatorLink.parentElement).toHaveClass('nav');
  });

  test('показывает активную ссылку для страницы истории', () => {
    mockUseLocation.mockReturnValue({ pathname: '/history' });
    
    render(
      <MemoryRouter initialEntries={['/history']}>
        <Header />
      </MemoryRouter>
    );

    const historyLink = screen.getByText('История');
    expect(historyLink.parentElement).toHaveClass('nav');
  });

  test('отображает иконки для всех ссылок', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const icons = screen.getAllByRole('img', { name: '' });
    expect(icons).toHaveLength(4); 
    
    const navIcons = icons.slice(1); 
    expect(navIcons[0]).toHaveAttribute('src', 'src/assets/upload.png');
    expect(navIcons[1]).toHaveAttribute('src', 'src/assets/generate.png');
    expect(navIcons[2]).toHaveAttribute('src', 'src/assets/history.png');
  });
});