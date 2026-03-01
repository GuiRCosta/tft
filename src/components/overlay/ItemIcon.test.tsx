import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemIcon } from './ItemIcon';

describe('ItemIcon', () => {
  it('renders an image with correct alt text', () => {
    render(<ItemIcon name="Infinity Edge" imageUrl="/ie.png" />);
    const img = screen.getByAltText('Infinity Edge');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/ie.png');
  });

  it('shows fallback letter on image error', () => {
    render(<ItemIcon name="Last Whisper" imageUrl="/broken.png" />);
    const img = screen.getByAltText('Last Whisper');
    fireEvent.error(img);
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.queryByAltText('Last Whisper')).not.toBeInTheDocument();
  });

  it('uses default size of 14', () => {
    const { container } = render(
      <ItemIcon name="IE" imageUrl="/ie.png" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('14px');
    expect(wrapper.style.height).toBe('14px');
  });

  it('uses custom size when provided', () => {
    const { container } = render(
      <ItemIcon name="IE" imageUrl="/ie.png" size={20} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('20px');
    expect(wrapper.style.height).toBe('20px');
  });
});
