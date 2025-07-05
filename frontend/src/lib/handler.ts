// pages/api/your-endpoint.ts
import corsMiddleware from '@/lib/handler';

const handler = (req, res) => {
  res.status(200).json({ message: 'Hello, world!' });
};

export default corsMiddleware({})(handler);
