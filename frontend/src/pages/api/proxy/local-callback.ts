// src/pages/api/proxy/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

/**
 * API proxy route for user login
 * This route forwards the request body to the backend API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Determine backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    // Forward the login request to the backend API
    const response = await axios.post(
      `${backendUrl}/auth/login`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.cookie || '',
        },
        withCredentials: true,
      }
    );
console.log(`response.data: ${response.data}`);
    // Forward the response
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Login proxy error:', error);

    if (axios.isAxiosError(error) && error.response) {
      return res
        .status(error.response.status)
        .json(error.response.data);
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
