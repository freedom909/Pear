import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isLoading).toBe(true);
  });

  it('should set loading to false when no token exists', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { 
      wrapper: AuthProvider 
    });
    
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
  });

  it('should maintain loading state while fetching user with valid token', async () => {
    localStorage.setItem('token', 'test-token');
    (axios.get as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        data: { user: { id: 1, name: 'Test User' } } 
      }), 100))
    );

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { 
      wrapper: AuthProvider 
    });

    // After token load but before user fetch
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual({ id: 1, name: 'Test User' });
  });

  it('should handle token verification error', async () => {
    localStorage.setItem('token', 'invalid-token');
    (axios.get as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { 
      wrapper: AuthProvider 
    });

    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Unauthorized');
    expect(result.current.user).toBeNull();
  });
});