// src/pages/api/proxy/facebook-callback.ts

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Facebook callback proxy called');

  try {
    const { code, state } = req.query;

    console.log('Query params:', req.query);

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing required parameters: code or state' });
    }

    // Use a non-public env var
    const backendUrl = process.env.API_URL || 'http://localhost:5000';
    const provider = 'facebook';

    // Forward the request to your backend
    const response = await axios.get(
      `${backendUrl}/api/v1/auth/${provider}/callback`,
      {
        params: { code, state },
        withCredentials: true,
      }
    );

    console.log('Backend response:', response.data);

    // Return data to the browser
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Facebook callback proxy error:', error);

    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json(
        error.response?.data || { error: 'Unknown Axios error' }
      );
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
