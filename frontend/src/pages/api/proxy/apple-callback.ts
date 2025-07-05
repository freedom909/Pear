import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * API proxy route for Apple OAuth callback
 * This route forwards the request to the backend API and returns the response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the code and state from the query parameters
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1/users', '') || 'http://localhost:5000';
    const response = await axios.get(
      `${backendUrl}/api/v1/auth/apple/callback`,
      {
        params: {
          code,
          state,
        },
        withCredentials: true,
      }
    );

    // Return the response from the backend API
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Apple callback proxy error:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}