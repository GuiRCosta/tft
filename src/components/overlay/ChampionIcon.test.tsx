import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChampionIcon } from './ChampionIcon';

describe('ChampionIcon', () => {
  it('renders an image with correct alt text', () => {
    render(<ChampionIcon name="Ahri" imageUrl="/ahri.png" cost={4} />);
    const img = screen.getByAltText('Ahri');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/ahri.png');
  });

  it('shows fallback letter on image error', () => {
    render(<ChampionIcon name="Jinx" imageUrl="/broken.png" cost={3} />);
    const img = screen.getByAltText('Jinx');
    fireEvent.error(img);
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.queryByAltText('Jinx')).not.toBeInTheDocument();
  });

  it('uses default size of 24', () => {
    const { container } = render(
      <ChampionIcon name="Vi" imageUrl="/vi.png" cost={1} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('24px');
    expect(wrapper.style.height).toBe('24px');
  });

  it('uses custom size when provided', () => {
    const { container } = render(
      <ChampionIcon name="Vi" imageUrl="/vi.png" cost={1} size={32} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('32px');
    expect(wrapper.style.height).toBe('32px');
  });
});
