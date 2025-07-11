import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';
import { vi } from 'vitest';

describe('ErrorMessage', () => {
  it('should not render when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render with default variant', () => {
    render(<ErrorMessage message="Test error" />);
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-label', 'Error icon');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { rerender } = render(
      <ErrorMessage message="Test error" variant="toast" />
    );
    expect(screen.getByText('Test error')).toBeInTheDocument();

    rerender(<ErrorMessage message="Test error" variant="inline" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should show dismiss button when onDismiss is provided', () => {
    const mockDismiss = vi.fn();
    render(
      <ErrorMessage message="Test error" onDismiss={mockDismiss} />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });
});