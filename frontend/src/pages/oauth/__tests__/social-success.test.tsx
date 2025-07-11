import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SocialSuccess from '../social-success';
import { AuthProvider } from '../../../contexts/AuthContext';
import { vi } from 'vitest';

describe('SocialSuccess', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should show loading spinner initially', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/oauth/success']}>
          <Routes>
            <Route path="/oauth/success" element={<SocialSuccess />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should redirect to dashboard with valid token', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/oauth/success?token=test-token']}>
          <Routes>
            <Route path="/oauth/success" element={<SocialSuccess />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('should show error and redirect to login when token is missing', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/oauth/success']}>
          <Routes>
            <Route path="/oauth/success" element={<SocialSuccess />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No authentication token received')).toBeInTheDocument();
    });
  });
});