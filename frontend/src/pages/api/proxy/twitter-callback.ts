import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * API proxy route for Twitter OAuth callback
 * This route forwards the request to the backend API and returns the response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the oauth_token and oauth_verifier from the query parameters
    const { oauth_token, oauth_verifier } = req.query;

    if (!oauth_token || !oauth_verifier) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1/users', '') || 'http://localhost:5000';
    const response = await axios.get(
      `${backendUrl}/api/v1/auth/twitter/callback`,
      {
        params: {
          oauth_token,
          oauth_verifier,
        },
        withCredentials: true,
      }
    );

    // Return the response from the backend API
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Twitter callback proxy error:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}