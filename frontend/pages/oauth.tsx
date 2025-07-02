import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import React from 'react';

const OAuthHandler: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token: string | null = params.get('token');

    if (token) {
      try {
        // Store token locally
        localStorage.setItem('token', token);
        // Redirect wherever you want
        router.push('/');
      } catch (err) {
        setError('Failed to process authentication token');
        console.error('Token processing error:', err);
      }
    } else {
      setError('No authentication token found');
      console.error('No token in URL');
    }
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-600">Processing login...</p>
    </div>
  );
};

export default OAuthHandler;
