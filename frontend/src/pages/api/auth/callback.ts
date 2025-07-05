// pages/api/auth/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Remove this line:
// import { cookies } from 'next/headers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Access cookies from req.headers.cookie
  const cookieHeader = req.headers.cookie; // raw cookie string, parse if needed

  // You can parse cookies if needed, e.g.:
  const cookies = parseCookies(cookieHeader);

  // your logic here

  res.status(200).json({ message: 'Success' });
}

// Simple cookie parser (optional)
function parseCookies(cookieHeader: string | undefined) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((cookie) => {
      const [key, ...v] = cookie.trim().split('=');
      return [key, decodeURIComponent(v.join('='))];
    }),
  );
}