import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import { AuthProvider } from '../contexts/AuthContext';
import axios from 'axios';
import { vi } from 'vitest';

describe('Logout Flow', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
    vi.clearAllMocks();
  });

  it('should logout successfully and clear tokens', async () => {
    (axios.post as jest.Mock).mockResolvedValue({});

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Click logout button (assuming it exists in Dashboard)
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/logout', {
        refreshToken: 'test-refresh-token'
      });
      expect(localStorage.getItem('token')).toBeNull();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should handle logout failure gracefully', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Click logout button
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByText(/logout failed/i)).toBeInTheDocument();
    });
  });
});