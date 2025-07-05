import handler from './handler';
import { NextRequest, NextResponse } from 'next/server';
interface CorsOptions {
  origin?: string | string[];
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  optionsSuccessStatus?: number;
}

interface Handler {
  (req: any, res: any): any;
}

export default function corsMiddleware(options: CorsOptions): Handler {
  return async (req, res) => {
    // List of allowed origins (add your production domains)
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_BASE_URL,
      'https://yourproductiondomain.com'
    ];

    // Origin of the request
    const origin = req.headers.get('origin');

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);//how to define handler?
  };
}