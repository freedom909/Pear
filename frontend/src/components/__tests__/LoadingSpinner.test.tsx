import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner).toHaveClass(expect.stringContaining('spinner-medium'));
    expect(spinner).toHaveClass(expect.stringContaining('spinner-primary'));
  });

  it('should apply different size classes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('status')).toHaveClass(expect.stringContaining('spinner-small'));

    rerender(<LoadingSpinner size="medium" />);
    expect(screen.getByRole('status')).toHaveClass(expect.stringContaining('spinner-medium'));

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('status')).toHaveClass(expect.stringContaining('spinner-large'));
  });

  it('should apply different color classes', () => {
    const { rerender } = render(<LoadingSpinner color="secondary" />);
    expect(screen.getByRole('status')).toHaveClass('spinner-secondary');

    rerender(<LoadingSpinner color="white" />);
    expect(screen.getByRole('status')).toHaveClass('spinner-white');
  });

  it('should combine custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });
});