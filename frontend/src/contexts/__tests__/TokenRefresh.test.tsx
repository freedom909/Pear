import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';
import { vi } from 'vitest';

describe('Token Refresh', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should refresh token when expired', async () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('refreshToken', 'valid-refresh-token');
    
    // First request fails with 401
    (axios.get as jest.Mock).mockRejectedValueOnce({
      response: { status: 401 }
    });
    
    // Refresh token succeeds
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { token: 'new-token', refreshToken: 'new-refresh-token' }
    });
    
    // Second request succeeds with new token
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Test User' } }
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { 
      wrapper: AuthProvider 
    });

    await waitForNextUpdate();
    
    expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', {
      refreshToken: 'valid-refresh-token'
    });
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(result.current.user).toEqual({ id: 1, name: 'Test User' });
  });

  it('should logout when refresh fails', async () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('refreshToken', 'invalid-refresh-token');
    
    // First request fails with 401
    (axios.get as jest.Mock).mockRejectedValueOnce({
      response: { status: 401 }
    });
    
    // Refresh token fails
    (axios.post as jest.Mock).mockRejectedValueOnce({
      response: { status: 401 }
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { 
      wrapper: AuthProvider 
    });

    await waitForNextUpdate();
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Session expired');
  });
});